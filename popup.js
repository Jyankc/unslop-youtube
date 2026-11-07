"use strict";
const toggle = document.querySelector("#enabled");
const status = document.querySelector("#status");
function render(enabled) {
  toggle.checked = enabled;
  status.textContent = enabled
    ? "Only search, your results, and the video you choose."
    : "Quiet mode is off. YouTube is back to normal.";
}
chrome.storage.local.get({ enabled: true }).then(settings => {
  render(settings.enabled !== false);
  toggle.disabled = false;
}).catch(() => { status.textContent = "Could not load your setting. Reopen this popup to retry."; });
toggle.addEventListener("change", async () => {
  toggle.disabled = true;
  try {
    await chrome.storage.local.set({ enabled: toggle.checked });
    render(toggle.checked);
  } catch {
    toggle.checked = !toggle.checked;
    status.textContent = "Could not save. Please try again.";
  } finally {
    toggle.disabled = false;
  }
});
