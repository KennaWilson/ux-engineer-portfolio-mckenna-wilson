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

function initVibeContinuePlayer() {
  const persist = window.VibePersist;
  if (!persist) return;

  const state = persist.loadState();
  if (!state || !state.loaded) return;

  const track = persist.TRACKS[state.index];
  if (!track) return;

  const root = document.createElement('div');
  root.className = 'vibe-continue';
  root.id = 'vibeContinue';
  root.innerHTML = [
    '<audio id="vibeContinueAudio" preload="auto"></audio>',
    '<button type="button" class="vibe-continue-toggle" id="vibeContinueToggle" aria-label="Pause vibe">❚❚</button>',
    '<div class="vibe-continue-copy">',
    '<span class="vibe-continue-label">Now playing</span>',
    `<strong class="vibe-continue-title" id="vibeContinueTitle">${track.title}</strong>`,
    '</div>',
    '<button type="button" class="vibe-continue-next" id="vibeContinueNext" aria-label="Next tape">⏭</button>',
    '<button type="button" class="vibe-continue-stop" id="vibeContinueStop" aria-label="Stop vibe">✕</button>',
  ].join('');
  document.body.appendChild(root);

  const audio = root.querySelector('#vibeContinueAudio');
  const toggleBtn = root.querySelector('#vibeContinueToggle');
  const nextBtn = root.querySelector('#vibeContinueNext');
  const stopBtn = root.querySelector('#vibeContinueStop');
  const titleEl = root.querySelector('#vibeContinueTitle');
  let index = state.index;

  function srcFor(i) {
    return persist.trackSrc(persist.TRACKS[i], '../assets/vibes');
  }

  function persistNow(overrides = {}) {
    persist.saveState({
      index,
      time: audio.currentTime || 0,
      playing: !audio.paused,
      loaded: true,
      ...overrides
    });
  }

  function setToggleUI(playing) {
    toggleBtn.textContent = playing ? '❚❚' : '▶';
    toggleBtn.setAttribute('aria-label', playing ? 'Pause vibe' : 'Play vibe');
    root.classList.toggle('is-playing', playing);
  }

  function loadTrack(i, { autoplay = true, startAt = 0 } = {}) {
    index = (i + persist.TRACKS.length) % persist.TRACKS.length;
    const nextTrack = persist.TRACKS[index];
    titleEl.textContent = nextTrack.title;
    audio.src = srcFor(index);
    audio.load();

    const finish = () => {
      if (startAt > 0 && isFinite(audio.duration)) {
        audio.currentTime = Math.min(startAt, Math.max(0, audio.duration - 0.25));
      }
      if (autoplay) {
        audio.play().then(() => {
          setToggleUI(true);
          root.classList.remove('needs-gesture');
          const label = root.querySelector('.vibe-continue-label');
          if (label) label.textContent = 'Now playing';
          persistNow({ playing: true });
        }).catch(() => {
          setToggleUI(false);
          root.classList.add('needs-gesture');
          const label = root.querySelector('.vibe-continue-label');
          if (label) label.textContent = 'Tap play to continue';
          persistNow({ playing: true }); // keep intent so home can resume
        });
      } else {
        setToggleUI(false);
        persistNow({ playing: false, time: startAt || 0 });
      }
    };

    if (audio.readyState >= 1) finish();
    else audio.addEventListener('loadedmetadata', finish, { once: true });
  }

  toggleBtn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().then(() => {
        setToggleUI(true);
        persistNow({ playing: true });
      }).catch(() => setToggleUI(false));
    } else {
      audio.pause();
      setToggleUI(false);
      persistNow({ playing: false });
    }
  });

  nextBtn.addEventListener('click', () => {
    loadTrack(index + 1, { autoplay: true, startAt: 0 });
  });

  stopBtn.addEventListener('click', () => {
    audio.pause();
    persist.clearState();
    root.remove();
  });

  audio.addEventListener('ended', () => {
    loadTrack(index + 1, { autoplay: true, startAt: 0 });
  });
  audio.addEventListener('timeupdate', () => {
    if (!audio.paused) persistNow();
  });
  window.addEventListener('pagehide', () => {
    persistNow({
      playing: !audio.paused || root.classList.contains('is-playing'),
      loaded: true
    });
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      persistNow({
        playing: !audio.paused || root.classList.contains('is-playing'),
        loaded: true
      });
    }
  });

  // Keep music going when jumping home or to another case study.
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (!link) return;
    const wasPlaying = !audio.paused || root.classList.contains('is-playing');
    persistNow({ playing: wasPlaying, loaded: true, time: audio.currentTime || 0 });
  }, true);

  loadTrack(index, { autoplay: !!state.playing, startAt: state.time || 0 });
  requestAnimationFrame(() => root.classList.add('is-visible'));
}

function initCaseStudies() {
  initCaseStudyHomeTransition();
  initCaseStudyNavMenu();
  initStoryReel();
  initVibeContinuePlayer();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCaseStudies);
} else {
  initCaseStudies();
}
