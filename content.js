(() => {
  "use strict";

  const root = document.documentElement;
  let enabled = true;
  let lastLocation = "";
  let host;
  let input;

  function route() {
    if (location.pathname === "/results") return "search";
    if (location.pathname === "/watch") return "watch";
    return "quiet";
  }

  function mountSearch() {
    if (!document.body || host?.isConnected) return;
    host = document.createElement("div");
    host.id = "unslop-search";
    const shadow = host.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = `
        :host { position: fixed; inset: 0 0 auto; z-index: 2147483646; }
        header { box-sizing: border-box; height: 80px; display: flex; align-items: center;
          justify-content: center; padding: 16px 24px; background: #0f0f0f;
          font-family: system-ui, sans-serif; }
        .reminder { box-sizing: border-box; max-width: 688px; margin: 0 auto;
          padding: 0 24px 18px; color: #969696; text-align: center;
          font: 13px/1.6 system-ui, sans-serif; }
        form { display: flex; width: min(100%, 640px); height: 46px; border: 1px solid #383838;
          border-radius: 24px; overflow: hidden; background: #161616; }
        form:focus-within { border-color: #8d9dff; box-shadow: 0 0 0 1px #8d9dff; }
        input { min-width: 0; flex: 1; border: 0; outline: 0; padding: 0 20px;
          background: transparent; color: #f1f1f1; font: 16px system-ui, sans-serif; }
        input::placeholder { color: #969696; }
        button { width: 62px; border: 0; border-left: 1px solid #383838; background: #242424;
          color: #f1f1f1; cursor: pointer; display: grid; place-items: center; }
        button:hover { background: #343434; }
        button:focus-visible { outline: 2px solid #8d9dff; outline-offset: -4px; }
        svg { width: 21px; height: 21px; }
        @media (max-width: 480px) { header { padding-inline: 14px; } }
    `;
    const header = document.createElement("header");
    const form = document.createElement("form");
    form.setAttribute("role", "search");
    form.action = "https://www.youtube.com/results";
    form.method = "get";
    form.acceptCharset = "UTF-8";
    input = document.createElement("input");
    input.type = "search";
    input.name = "search_query";
    input.setAttribute("aria-label", "Search YouTube");
    input.placeholder = "Search YouTube";
    input.autocomplete = "off";
    input.required = true;
    const button = document.createElement("button");
    button.type = "submit";
    button.setAttribute("aria-label", "Search");
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    for (const [key, value] of Object.entries({ viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "1.8", "aria-hidden": "true" })) {
      svg.setAttribute(key, value);
    }
    const circle = document.createElementNS(svg.namespaceURI, "circle");
    for (const [key, value] of Object.entries({ cx: "10.5", cy: "10.5", r: "6.5" })) circle.setAttribute(key, value);
    const path = document.createElementNS(svg.namespaceURI, "path");
    path.setAttribute("d", "m16 16 5 5");
    svg.append(circle, path);
    button.append(svg);
    form.append(input, button);
    header.append(form);
    const reminder = document.createElement("p");
    reminder.className = "reminder";
    reminder.textContent = "You are using unslop extension so you don't get derailed by addictive thumbnails and interesting topics that will distract you";
    shadow.append(style, header, reminder);
    document.body.append(host);
    syncLocation(true);
  }

  function syncLocation(force = false) {
    if (!force && lastLocation === location.href) return;
    lastLocation = location.href;
    root.dataset.unslopRoute = route();
    if (host) {
      // Reserve the real header height, including wrapped reminder text.
      root.style.setProperty("--unslop-header-height", `${Math.ceil(host.getBoundingClientRect().height)}px`);
    }
    if (input) input.value = new URL(location.href).searchParams.get("search_query") || "";
  }

  function apply(value) {
    enabled = value !== false;
    root.dataset.unslop = enabled ? "on" : "off";
    syncLocation(true);
    enforcePlayback();
  }

  function enforcePlayback() {
    if (!enabled) return;
    if (route() === "quiet") {
      document.querySelectorAll("video, audio").forEach(media => {
        if (!media.paused) media.pause();
      });
    }
    // Disable the actual next-video switch as well as hiding its control.
    if (route() === "watch") {
      const autoplay = document.querySelector(".ytp-autonav-toggle-button[aria-checked='true']");
      if (autoplay instanceof HTMLElement) autoplay.click();
    }
  }

  apply(true);
  chrome.storage.local.get({ enabled: true }).then(settings => apply(settings.enabled)).catch(() => {});
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.enabled) apply(changes.enabled.newValue);
  });
  document.addEventListener("DOMContentLoaded", mountSearch, { once: true });
  if (document.body) mountSearch();
  document.addEventListener("yt-navigate-finish", () => { mountSearch(); syncLocation(true); enforcePlayback(); });
  document.addEventListener("play", enforcePlayback, true);
  window.addEventListener("popstate", () => syncLocation(true));
  window.addEventListener("resize", () => syncLocation(true));
  // Also cover mobile navigation and controls created after navigation finishes.
  window.setInterval(() => { mountSearch(); syncLocation(); enforcePlayback(); }, 1000);
})();
