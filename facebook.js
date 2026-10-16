// Friends Only, Facebook part: keeps facebook.com on the Friends feed and
// hides anything that isn't from your friends. Runs only in your own tab; it
// never reads your password or calls Facebook's API.

// Stored under this key in chrome.storage.sync; must match popup.js.
const STORAGE_KEY = 'facebook';

const DEFAULTS = {
  enabled: true,
  friendsFeed: true,
  hideVideo: true,
  hideSuggested: true,
  hideAds: true,
};

// Feeds tab, filtered to Friends, most recent first.
const FRIENDS_URL = '/?filter=friends&sk=h_chr';

// Facebook's web UI labels, in English, Portuguese and Spanish (lowercased).
const JOIN_FOLLOW_LABELS = ['follow', 'join', 'join group', 'seguir', 'participar', 'participar do grupo', 'unirte', 'unirse'];
const SUGGESTED_LABELS = [
  'suggested for you', 'people you may know', 'reels and short videos',
  'suggested groups', 'suggested pages',
  'sugestões para você', 'pessoas que você talvez conheça', 'reels e vídeos curtos',
  'grupos sugeridos', 'páginas sugeridas',
  'sugerencias para ti', 'personas que quizás conozcas', 'reels y videos cortos',
  'grupos sugeridos para ti',
];
const SPONSORED_LABELS = ['sponsored', 'patrocinado', 'publicidad'];

let settings = { ...DEFAULTS };
let lastHref = location.href;

const text = (el) => (el.textContent || '').trim().toLowerCase();

// --- Navigation -------------------------------------------------------------

// Only the Watch and Reels tabs themselves; a single video a friend posted
// (/watch/?v=… or /reel/<id>) stays reachable.
function blockedPath(url) {
  if (!settings.hideVideo) return false;
  const p = url.pathname.replace(/\/$/, '');
  return (p === '/watch' && !url.searchParams.has('v')) || p === '/reels' || p === '/reel';
}

function isPlainHome(url) {
  return url.pathname === '/' && !url.searchParams.has('filter') && !url.searchParams.has('sk');
}

// Returns true when it sent the tab somewhere else.
function route() {
  if (settings.friendsFeed && isPlainHome(new URL(location.href))) {
    location.replace(FRIENDS_URL);
    return true;
  }
  if (blockedPath(new URL(location.href))) {
    location.replace(settings.friendsFeed ? FRIENDS_URL : '/');
    return true;
  }
  return false;
}

// Facebook is a single-page app, so clicking the logo or Home doesn't load a
// new page. Catch those clicks and send them to the Friends feed instead.
document.addEventListener('click', (event) => {
  const link = event.target.closest && event.target.closest('a[href]');
  if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
  const url = new URL(link.href, location.origin);
  if (url.origin !== location.origin) return;
  if ((settings.friendsFeed && isPlainHome(url)) || blockedPath(url)) {
    event.preventDefault();
    event.stopImmediatePropagation();
    location.assign(settings.friendsFeed ? FRIENDS_URL : '/');
  }
}, true);

// --- Hiding -----------------------------------------------------------------

function hide(el) {
  if (el && !el.hasAttribute('data-fbf-hidden')) el.setAttribute('data-fbf-hidden', '');
}

function hasLabel(root, labels) {
  return [...root.querySelectorAll('span, h2, h3, h4, a, div')]
    .some((el) => el.children.length === 0 && labels.includes(text(el)));
}

function hasJoinOrFollowButton(root) {
  return [...root.querySelectorAll('div[role="button"], button, a[role="button"]')]
    .some((b) => JOIN_FOLLOW_LABELS.includes(text(b)));
}

// Letters only, lowercased: "Pa-tro ci·na do" -> "patrocinado".
const lettersOnly = (s) => (s || '').toLowerCase().replace(/[^\p{L}]/gu, '');
const isSponsoredWord = (s) => SPONSORED_LABELS.includes(lettersOnly(s));

// Ad call-to-action buttons. Posts from friends don't have these.
const AD_BUTTON_LABELS = [
  'learn more', 'shop now', 'sign up', 'book now', 'install now', 'send message',
  'get offer', 'order now', 'apply now', 'get quote', 'contact us', 'subscribe', 'watch more',
  'saiba mais', 'comprar agora', 'cadastre-se', 'reservar agora', 'instalar agora',
  'enviar mensagem', 'obter oferta', 'pedir agora', 'peça agora', 'candidatar-se agora',
  'solicitar orçamento', 'fale conosco', 'assinar', 'assistir mais',
  'más información', 'comprar', 'registrarte', 'reservar', 'instalar ahora', 'enviar mensaje',
];

// Facebook disguises the "Sponsored" label, so look for it several ways.
function isAd(unit) {
  // 1. Plain text, or text split up with junk letters hidden in between
  //    (innerText skips the hidden ones).
  for (const el of unit.querySelectorAll('a, span')) {
    const len = (el.textContent || '').length;
    if (len >= 9 && len <= 80 && (isSponsoredWord(el.textContent) || isSponsoredWord(el.innerText))) return true;
  }
  // 2. The word kept in an accessibility label, or elsewhere in the page and
  //    pointed to by id (aria-labelledby, or an SVG <use> reference).
  for (const el of unit.querySelectorAll('[aria-label]')) {
    if (isSponsoredWord(el.getAttribute('aria-label'))) return true;
  }
  for (const el of unit.querySelectorAll('[aria-labelledby], use')) {
    const ref = el.getAttribute('aria-labelledby') || el.getAttribute('href') || el.getAttribute('xlink:href') || '';
    for (const id of ref.replace(/^#/, '').split(/\s+/)) {
      const target = id && document.getElementById(id);
      if (target && isSponsoredWord(target.textContent)) return true;
    }
  }
  // 3. An ad call-to-action button ("Saiba mais", "Comprar agora", ...).
  return [...unit.querySelectorAll('[role="button"], [role="link"], button, a')]
    .some((el) => el.children.length <= 3 && AD_BUTTON_LABELS.includes(text(el)));
}

// Facebook has used several wrappers for one post over time; check them all.
// Current layout (2026): each post sits in a div[data-virtualized].
const FEED_UNITS = 'div[data-virtualized], [role="feed"] > div, div[aria-posinset], [data-pagelet^="FeedUnit"]';

function sweep() {
  if (!document.body) return;

  for (const unit of document.querySelectorAll(FEED_UNITS)) {
    if (unit.closest('[data-fbf-hidden]')) continue;
    if (settings.hideAds && isAd(unit)) hide(unit);
    else if (settings.hideSuggested && (hasLabel(unit, SUGGESTED_LABELS) || hasJoinOrFollowButton(unit))) hide(unit);
  }
}

function applySettings() {
  document.documentElement.classList.toggle('fbf-hide-video', settings.hideVideo);
  // Start clean so turning a setting off brings its content back.
  for (const el of document.querySelectorAll('[data-fbf-hidden]')) el.removeAttribute('data-fbf-hidden');
  if (!route()) sweep();
}

// --- Startup ----------------------------------------------------------------

let sweepTimer = null;
const observer = new MutationObserver(() => {
  clearTimeout(sweepTimer);
  sweepTimer = setTimeout(sweep, 150);
});

// With the site switched off, every option counts as off.
function loadSettings(stored) {
  const s = { ...DEFAULTS, ...stored };
  settings = s.enabled ? s : Object.fromEntries(Object.keys(s).map((k) => [k, false]));
}

chrome.storage.sync.get({ [STORAGE_KEY]: DEFAULTS }, (stored) => {
  loadSettings(stored[STORAGE_KEY]);
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
  if (area !== 'sync' || !changes[STORAGE_KEY]) return;
  loadSettings(changes[STORAGE_KEY].newValue);
  applySettings();
});
