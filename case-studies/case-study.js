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

function initCaseStudyNavMenu() {
  const nav = document.getElementById('caseNav');
  const toggle = document.getElementById('navToggle');
  const backdrop = document.getElementById('navBackdrop');
  const menu = document.getElementById('navMenu');
  if (!nav || !toggle) return;

  function setOpen(open) {
    nav.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (backdrop) {
      backdrop.classList.toggle('show', open);
      backdrop.setAttribute('aria-hidden', open ? 'false' : 'true');
    }
    document.body.style.overflow = open ? 'hidden' : '';
  }

  toggle.addEventListener('click', () => {
    setOpen(!nav.classList.contains('menu-open'));
  });

  if (backdrop) {
    backdrop.addEventListener('click', () => setOpen(false));
  }

  if (menu) {
    menu.addEventListener('click', event => {
      if (event.target.closest('a')) setOpen(false);
    });
  }

  window.addEventListener('keydown', event => {
    if (event.key === 'Escape') setOpen(false);
  });
}

function initCaseStudies() {
  initCaseStudyHomeTransition();
  initCaseStudyNavMenu();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCaseStudies);
} else {
  initCaseStudies();
}
