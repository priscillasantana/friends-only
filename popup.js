// Each site's settings live under one storage key ("instagram", "facebook"),
// matching STORAGE_KEY in instagram.js and facebook.js. Every option defaults
// to on, including the site itself.

// Shown at the bottom so it's easy to tell which version is installed.
document.getElementById('version').textContent = `Version ${chrome.runtime.getManifest().version}`;

for (const section of document.querySelectorAll('section[data-site]')) {
  const site = section.dataset.site;
  const boxes = [...section.querySelectorAll('input[data-key]')];
  const options = section.querySelector('.options');
  const defaults = Object.fromEntries(boxes.map((b) => [b.dataset.key, true]));

  chrome.storage.sync.get({ [site]: defaults }, (stored) => {
    const settings = { ...defaults, ...stored[site] };
    const render = () => options.classList.toggle('off', !settings.enabled);

    for (const box of boxes) {
      box.checked = settings[box.dataset.key];
      box.addEventListener('change', () => {
        settings[box.dataset.key] = box.checked;
        chrome.storage.sync.set({ [site]: settings });
        render();
      });
    }
    render();
  });
}
