# Instagram Friends Only

A small Chrome/Brave extension that makes instagram.com show only the people you follow.

- Always opens the **Following** feed (newest first, no algorithm)
- Hides the **Reels** tab and **Explore**
- Hides **suggested** posts and "Suggested for you" accounts
- Hides **sponsored** posts

Each option can be switched on or off from the extension's toolbar popup.

It only changes what your own browser tab shows. It never asks for your password and never calls Instagram's API.

## Install

1. Download or clone this repo.
2. Open `chrome://extensions` (or `brave://extensions`).
3. Turn on **Developer mode**.
4. Click **Load unpacked** and select this folder.

## Limitations

- Works on instagram.com in the browser only, not the phone app.
- Instagram has no stable markers for suggested posts, so they're detected by their "Follow" button and headings (English, Portuguese and Spanish). Layout changes on Instagram's side can break this.
- Relies on `instagram.com/?variant=following` for the Following feed.
