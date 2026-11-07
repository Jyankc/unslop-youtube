# Unslop YouTube

A small Chrome / Chromium extension that makes YouTube intentional: open the site, search for what you need, choose a video, and leave without getting pulled into the recommendation feed.

YouTube's thumbnails and endless interesting topics make it easy to get sidetracked. Unslop hides the feed and recommendations, leaving a search bar and a reminder of why you opened a quieter version of YouTube:

> You are using unslop extension so you don't get derailed by addictive thumbnails and interesting topics that will distract you

Built for personal use and shared publicly so anyone can load it locally. No account, build step, analytics, or remote code.

![YouTube with Unslop enabled](preview.png)

## Install

1. Download this repository using **Code → Download ZIP** and extract it, or clone it with `git clone https://github.com/Jyankc/unslop-youtube.git`.
2. Open `chrome://extensions` (or `edge://extensions` / `brave://extensions`).
3. Turn on **Developer mode**.
4. Click **Load unpacked** and select the extracted folder containing `manifest.json`.
5. Refresh any open YouTube tabs. Pin **Unslop YouTube** from the browser's extensions menu if you want its toggle handy.

## Behavior

- Homepage, subscriptions, channel pages, and Shorts: a search bar and the focus reminder on a dark background. Hidden media is paused.
- Search: results for your query remain available. Shorts shelves and promoted result cards are hidden.
- Watch: the video you choose remains available, with no recommendation sidebar, comments, live chat, or end-screen suggestion cards. The next-video autoplay switch is turned off when available.
- The popup's **Quiet mode** switch restores the ordinary page immediately, across open YouTube tabs.
- Your preference is saved locally. The only extension permission is `storage`; content scripts run only on YouTube. No information is sent anywhere by the extension. Submitting a search uses YouTube normally.

This hides page elements; it does not block video ads or YouTube's network requests. Some YouTube experiments may require future selector updates. Use the toggle temporarily if you need a hidden channel page, sign-in control, consent dialog, or other native UI. Turning quiet mode off does not restore YouTube's previous autoplay setting.

To update after editing files, click **Reload** on the extension card, then refresh YouTube. To uninstall, click **Remove** on the extension card.

Implementation follows Chrome's static content-script model: https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts
