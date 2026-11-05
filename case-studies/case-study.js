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

function initStoryReel() {
  const reel = document.getElementById('storyReel');
  if (!reel) return;

  const tabs = Array.from(reel.querySelectorAll('.story-tab'));
  const scenes = Array.from(reel.querySelectorAll('.story-scene'));
  const progress = document.getElementById('storyProgressBar');
  const pauseBtn = document.getElementById('storyPauseBtn');
  const pauseLabel = pauseBtn ? pauseBtn.querySelector('.pause-label') : null;
  const pauseIcon = pauseBtn ? pauseBtn.querySelector('.pause-icon') : null;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const STEP_MS = 4200;
  let step = 0;
  let timer = null;
  let playing = false;
  let paused = false;
  let resumeTimer = null;
  let inView = false;

  function setPausedUI(isPaused) {
    if (!pauseBtn) return;
    pauseBtn.classList.toggle('is-paused', isPaused);
    pauseBtn.setAttribute('aria-pressed', isPaused ? 'true' : 'false');
    pauseBtn.setAttribute('aria-label', isPaused ? 'Play story' : 'Pause story');
    if (pauseLabel) pauseLabel.textContent = isPaused ? 'Play' : 'Pause';
    if (pauseIcon) pauseIcon.textContent = isPaused ? '▶' : '❚❚';
  }

  function setStep(next, { restartProgress = true } = {}) {
    step = ((next % scenes.length) + scenes.length) % scenes.length;

    tabs.forEach((tab, i) => {
      const on = i === step;
      tab.classList.toggle('is-active', on);
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
    });

    scenes.forEach((scene, i) => {
      const on = i === step;
      scene.classList.toggle('is-active', on);
      if (on) scene.removeAttribute('hidden');
      else scene.setAttribute('hidden', '');
    });

    if (progress) {
      const pct = ((step + 1) / scenes.length) * 100;
      if (restartProgress && !paused) {
        progress.style.transition = 'none';
        progress.style.width = ((step / scenes.length) * 100) + '%';
        void progress.offsetWidth;
        progress.style.transition = 'width ' + (STEP_MS / 1000) + 's linear';
        progress.style.width = pct + '%';
      } else {
        progress.style.transition = 'width 0.35s ease';
        progress.style.width = pct + '%';
      }
    }
  }

  function stop() {
    playing = false;
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    if (resumeTimer) {
      clearTimeout(resumeTimer);
      resumeTimer = null;
    }
  }

  function play() {
    if (reduceMotion || playing || paused || !inView) return;
    playing = true;
    setStep(step, { restartProgress: true });
    timer = setInterval(() => {
      setStep(step + 1, { restartProgress: true });
    }, STEP_MS);
  }

  function pauseStory() {
    paused = true;
    stop();
    setPausedUI(true);
    if (progress) progress.style.transition = 'none';
  }

  function resumeStory() {
    paused = false;
    setPausedUI(false);
    play();
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      stop();
      setStep(Number(tab.dataset.step), { restartProgress: false });
      if (paused) return;
      resumeTimer = window.setTimeout(play, 1600);
    });
  });

  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      if (paused) resumeStory();
      else pauseStory();
    });
  }

  setStep(0, { restartProgress: false });
  setPausedUI(false);

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        inView = entry.isIntersecting;
        if (inView) play();
        else stop();
      });
    }, { threshold: 0.35 });
    io.observe(reel);
  } else {
    inView = true;
    play();
  }
}

function initCaseStudies() {
  initCaseStudyHomeTransition();
  initCaseStudyNavMenu();
  initStoryReel();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCaseStudies);
} else {
  initCaseStudies();
}
