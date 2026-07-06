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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCaseStudyHomeTransition);
} else {
  initCaseStudyHomeTransition();
}
