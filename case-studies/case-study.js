document.addEventListener('DOMContentLoaded', () => {
  const homeLinks = document.querySelectorAll('a[href="../index.html?skipLoader=1#projects"]');
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

      window.setTimeout(() => {
        window.location.href = link.href;
      }, 420);
    });
  });
});
