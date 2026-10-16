# Friends Only

**English** · [Português](README.pt-BR.md)

A small Chrome/Brave extension that makes Instagram and Facebook show only the people you follow.

**Instagram**
- Always opens the **Following** feed (newest first, no algorithm)
- Hides the **Reels** tab and **Explore** (your friends' reels still show)
- Hides **suggested** posts and "Suggested for you" accounts
- Hides **sponsored** posts

**Facebook**
- Always opens the **Friends** feed (most recent first, no algorithm)
- Hides **Reels** and **Watch** (your friends' videos still show)
- Hides **suggested** posts, groups, pages and "People you may know"
- Hides **sponsored** posts

Each site has its own on/off switch in the toolbar popup, and every option can be switched on or off separately.

It only changes what your own browser tab shows. It never asks for your password and never calls Instagram's or Facebook's API.

## Install

1. Download or clone this repo. To download, click **Code → Download ZIP** here on GitHub and unzip the file.
2. Open `chrome://extensions` (or `brave://extensions`) by typing it in the address bar.
3. Turn on **Developer mode** (top right).
4. Click **Load unpacked** and select this folder.

After pulling an update, click the reload icon (↻) on the extension's card and refresh the site. The installed version is shown at the bottom of the popup and on the extension's card.

## Versions

The version lives in `manifest.json`; bump it with every change.

- **2.0.1** Show the version number in the popup.
- **2.0.0** Instagram and Facebook combined into one extension, with an on/off switch per site. Facebook support added. Instagram fixes: suggested posts are hidden whole, and only the Reels tab link is hidden so feed videos stay visible.
- **1.0.0** Instagram only.

## How it's organised

- `instagram.js` / `instagram.css` only run on instagram.com
- `facebook.js` / `facebook.css` only run on facebook.com
- `popup.html` / `popup.js` are the settings popup

## Limitations

- Works in the browser only, not the phone apps.
- Neither site has stable markers for suggested posts or ads, so they're detected by labels and "Follow"/"Join" buttons (English, Portuguese and Spanish). Facebook also scrambles its "Sponsored" label. Layout changes on either site can break detection.
- Relies on `instagram.com/?variant=following` and `facebook.com/?filter=friends&sk=h_chr` for the friends-only feeds.
