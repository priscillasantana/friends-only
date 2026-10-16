// Instagram Friends Only: keeps instagram.com on the Following feed and hides
// anything that isn't from accounts you follow. Runs only in your own tab; it
// never reads your password or calls Instagram's API.

const DEFAULTS = {
  followingFeed: true,
  hideReels: true,
  hideExplore: true,
  hideSuggested: true,
  hideAds: true,
};

const FOLLOWING_URL = '/?variant=following';

// Instagram's web UI labels, in English, Portuguese and Spanish (lowercased).
const FOLLOW_LABELS = ['follow', 'seguir'];
const SUGGESTED_LABELS = [
  'suggested for you', 'suggested posts', 'suggestions for you',
  'sugestões para você', 'publicações sugeridas', 'sugeridos para você',
  'sugerencias para ti', 'publicaciones sugeridas', 'sugerencias',
];
const SPONSORED_LABELS = ['sponsored', 'patrocinado', 'publicidad'];

let settings = { ...DEFAULTS };
let lastHref = location.href;

const text = (el) => (el.textContent || '').trim().toLowerCase();

// --- Navigation -------------------------------------------------------------

function blockedPath(pathname) {
  if (settings.hideReels && pathname.startsWith('/reels/')) return true;
  if (settings.hideExplore && pathname === '/explore/') return true;
  return false;
}

// Returns true when it sent the tab somewhere else.
function route() {
  const { pathname, search } = location;
  const homeTarget = settings.followingFeed ? FOLLOWING_URL : '/';
  if (settings.followingFeed && pathname === '/' && !new URLSearchParams(search).has('variant')) {
    location.replace(FOLLOWING_URL);
    return true;
  }
  if (blockedPath(pathname)) {
    location.replace(homeTarget);
    return true;
  }
  return false;
}

// Instagram is a single-page app, so clicking the logo or Home doesn't load a
// new page. Catch those clicks and send them to the Following feed instead.
document.addEventListener('click', (event) => {
  const link = event.target.closest && event.target.closest('a[href]');
  if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
  const url = new URL(link.href, location.origin);
  if (url.origin !== location.origin) return;
  const toHome = settings.followingFeed && url.pathname === '/' && !url.searchParams.has('variant');
  if (toHome || blockedPath(url.pathname)) {
    event.preventDefault();
    event.stopImmediatePropagation();
    location.assign(settings.followingFeed ? FOLLOWING_URL : '/');
  }
}, true);

// --- Hiding -----------------------------------------------------------------

function hide(el) {
  if (el && !el.hasAttribute('data-igf-hidden')) el.setAttribute('data-igf-hidden', '');
}

function followButtons(root) {
  return [...root.querySelectorAll('button, div[role="button"]')]
    .filter((b) => FOLLOW_LABELS.includes(text(b)));
}

function hasLabel(root, labels) {
  return [...root.querySelectorAll('span, a, div')]
    .some((el) => el.children.length === 0 && labels.includes(text(el)));
}

// From a "Suggested for you" heading, climb to the smallest block that holds
// the suggestion list (several Follow buttons), without swallowing real posts.
function hideSuggestionBlock(heading) {
  const post = heading.closest('article');
  if (post) return hide(post);
  let node = heading.parentElement;
  for (let i = 0; i < 8 && node && node !== document.body; i++) {
    if (node.matches('main, [role="main"], nav, [role="navigation"]') || node.querySelector('article')) return;
    if (followButtons(node).length >= 2) return hide(node);
    node = node.parentElement;
  }
}

function sweep() {
  if (!document.body) return;

  for (const post of document.querySelectorAll('article:not([data-igf-hidden])')) {
    // Posts from accounts you already follow have no Follow button in their header.
    const header = post.querySelector('header') || post;
    if (settings.hideSuggested && followButtons(header).length > 0) hide(post);
    else if (settings.hideAds && hasLabel(header, SPONSORED_LABELS)) hide(post);
  }

  if (settings.hideSuggested) {
    for (const el of document.querySelectorAll('span, h2, h3, h4, div')) {
      if (el.children.length === 0 && SUGGESTED_LABELS.includes(text(el)) && !el.closest('[data-igf-hidden]')) {
        hideSuggestionBlock(el);
      }
    }
  }
}

function applySettings() {
  const root = document.documentElement;
  root.classList.toggle('igf-hide-reels', settings.hideReels);
  root.classList.toggle('igf-hide-explore', settings.hideExplore);
  // Start clean so turning a setting off brings its content back.
  for (const el of document.querySelectorAll('[data-igf-hidden]')) el.removeAttribute('data-igf-hidden');
  if (!route()) sweep();
}

// --- Startup ----------------------------------------------------------------

let sweepTimer = null;
const observer = new MutationObserver(() => {
  clearTimeout(sweepTimer);
  sweepTimer = setTimeout(sweep, 150);
});

chrome.storage.sync.get(DEFAULTS, (stored) => {
  settings = { ...DEFAULTS, ...stored };
  if (route()) return;
  applySettings();
  observer.observe(document.documentElement, { childList: true, subtree: true });

  // Watch for in-app navigation (pushState) that the click handler didn't catch.
  setInterval(() => {
    if (location.href !== lastHref) {
      lastHref = location.href;
      route();
    }
  }, 400);
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'sync') return;
  for (const [key, { newValue }] of Object.entries(changes)) settings[key] = newValue;
  applySettings();
});
