function initCaseStudyHomeTransition() {
  const homeLinks = Array.from(document.querySelectorAll('a[href]')).filter(link => {
    const url = new URL(link.getAttribute('href'), window.location.href);
    return url.pathname.endsWith('/index.html') && url.searchParams.has('skipLoader');
  });
  if (!homeLinks.length) return;

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

  homeLinks.forEach(link => {
    link.addEventListener('click', event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;

      event.preventDefault();
      document.body.classList.add('home-transitioning');
      overlay.classList.add('show');

      requestAnimationFrame(() => {
        window.setTimeout(() => {
          window.location.href = link.href;
        }, 650);
      });
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCaseStudyHomeTransition);
} else {
  initCaseStudyHomeTransition();
}
