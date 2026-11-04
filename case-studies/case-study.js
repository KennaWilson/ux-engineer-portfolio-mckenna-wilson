function initCaseStudyHomeTransition() {
  const overlay = document.createElement('div');
  overlay.className = 'home-transition';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML = [
    '<div class="home-transition-card">',
    '<span class="home-transition-spinner" aria-hidden="true"></span>',
    '<span>Returning home</span>',
    '</div>',
  ].join('');
  document.body.appendChild(overlay);

  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (typeof event.button === 'number' && event.button !== 0) return;

    const url = new URL(link.getAttribute('href'), window.location.href);
    const isHomeReturn = url.pathname.endsWith('/index.html') && url.searchParams.has('skipLoader');
    if (!isHomeReturn) return;

    event.preventDefault();
    document.body.classList.add('home-transitioning');
    overlay.classList.add('show');

    requestAnimationFrame(() => {
      window.setTimeout(() => {
        window.location.href = url.href;
      }, 900);
    });
  }, true);
}

function initCaseStudyNavScore() {
  const scoreEl = document.getElementById('scoreVal');
  if (!scoreEl) return;

  const XP_STORAGE_KEY = 'mckenna_claimed_projects';
  const XP_BY_PROJECT = {
    p1: 3000,
    p2: 2600,
    p3: 2400,
    p4: 1600,
    p5: 1800,
    p6: 2100,
    p7: 2100,
    p8: 2100,
    p9: 2800
  };

  let claimed = [];
  try {
    const raw = sessionStorage.getItem(XP_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    claimed = Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    claimed = [];
  }

  const total = claimed.reduce((sum, id) => sum + (XP_BY_PROJECT[id] || 0), 0);
  scoreEl.textContent = String(total);
}

function initCaseStudies() {
  initCaseStudyHomeTransition();
  initCaseStudyNavScore();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCaseStudies);
} else {
  initCaseStudies();
}
