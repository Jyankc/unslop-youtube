const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', 'content.js'), 'utf8');

async function page(url, enabled = true) {
  const listeners = {};
  const dataset = {};
  const replacements = [];
  let pauses = 0;
  let storageListener;
  const location = {
    get pathname() { return new URL(this.href).pathname; },
    href: url,
    replace(value) { replacements.push(value); },
  };
  const media = { paused: false, pause() { pauses++; } };
  const context = {
    URL, HTMLElement: class {}, location,
    document: {
      documentElement: { dataset, style: { setProperty() {} } },
      body: null,
      querySelectorAll: () => [media],
      querySelector: () => null,
      addEventListener(name, fn) { listeners[name] = fn; },
    },
    chrome: { storage: {
      local: { get: async () => ({ enabled }) },
      onChanged: { addListener(fn) { storageListener = fn; } },
    } },
    window: { addEventListener() {}, setInterval() {} },
  };
  vm.runInNewContext(source, context);
  await Promise.resolve();
  return { dataset, location, replacements, listeners,
    get pauses() { return pauses; },
    toggle(value) { storageListener({ enabled: { newValue: value } }, 'local'); },
  };
}

test('homepage media is paused while deliberate search results stay available', async () => {
  const home = await page('https://www.youtube.com/');
  assert.equal(home.dataset.unslopRoute, 'quiet');
  assert.ok(home.pauses > 0);
  const search = await page('https://www.youtube.com/results?search_query=music');
  assert.equal(search.dataset.unslopRoute, 'search');
  assert.equal(search.pauses, 0);
});

test('normal videos are never paused, including before SPA navigation finishes', async () => {
  const current = await page('https://www.youtube.com/results?search_query=music');
  current.location.href = 'https://www.youtube.com/watch?v=chosen';
  current.listeners.play();
  assert.equal(current.pauses, 0);
  current.listeners['yt-navigate-finish']();
  assert.equal(current.dataset.unslopRoute, 'watch');
  assert.equal(current.pauses, 0);
});

test('chosen Shorts open the same video in the normal player without pausing it', async () => {
  const current = await page('https://www.youtube.com/shorts/chosen?t=12');
  assert.equal(current.pauses, 0);
  assert.ok(current.replacements.length > 0);
  for (const value of current.replacements) {
    const target = new URL(value);
    assert.equal(target.pathname, '/watch');
    assert.equal(target.searchParams.get('v'), 'chosen');
    assert.equal(target.searchParams.get('t'), '12');
  }
});

test('switching quiet mode off restores the page', async () => {
  const current = await page('https://www.youtube.com/watch?v=chosen');
  current.toggle(false);
  assert.equal(current.dataset.unslop, 'off');
  current.listeners.play();
  assert.equal(current.pauses, 0);
});

test('Shorts are left alone when the stored setting is off', async () => {
  const current = await page('https://www.youtube.com/shorts/chosen', false);
  assert.equal(current.dataset.unslop, 'off');
  assert.deepEqual(current.replacements, []);
  assert.equal(current.pauses, 0);
});
