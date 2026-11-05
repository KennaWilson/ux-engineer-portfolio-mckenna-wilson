(function (root) {
  const STORAGE_KEY = 'mckenna_vibe_state';
  const ASSET_VERSION = '20261105d';

  const TRACKS = [
    {
      title: 'Focus Flow',
      meta: 'Concentration · Kevin MacLeod · calm focus',
      file: 'concentration.mp3',
      color: 'var(--coral)'
    },
    {
      title: 'Creative Spark',
      meta: 'Wallpaper · Kevin MacLeod · bright energy',
      file: 'creative-spark.mp3',
      color: 'var(--lemon)'
    },
    {
      title: 'Late Night Code',
      meta: 'Lobby Time · Kevin MacLeod · after-dark groove',
      file: 'late-night-code.mp3',
      color: 'var(--lilac)'
    },
    {
      title: 'Sunny Build',
      meta: 'George Street Shuffle · Kevin MacLeod · upbeat',
      file: 'sunny-build.mp3',
      color: 'var(--mint)'
    }
  ];

  function trackSrc(track, basePath) {
    const base = basePath.replace(/\/?$/, '/');
    return base + track.file + '?v=' + ASSET_VERSION;
  }

  function loadState() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const state = JSON.parse(raw);
      if (!state || typeof state.index !== 'number') return null;
      if (state.index < 0 || state.index >= TRACKS.length) return null;
      return {
        index: state.index,
        time: Math.max(0, Number(state.time) || 0),
        playing: !!state.playing,
        loaded: state.loaded !== false
      };
    } catch {
      return null;
    }
  }

  function saveState(partial) {
    try {
      const prev = loadState() || { index: 0, time: 0, playing: false, loaded: false };
      const next = Object.assign({}, prev, partial, { updatedAt: Date.now() });
      if (!next.loaded || next.index < 0) {
        sessionStorage.removeItem(STORAGE_KEY);
        return null;
      }
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    } catch {
      return null;
    }
  }

  function clearState() {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {}
  }

  // Resume playback after a cross-page navigation when autoplay is blocked.
  function armGestureResume(audio, onPlaying) {
    if (!audio) return function () {};
    let done = false;

    function resume() {
      if (done) return;
      done = true;
      cleanup();
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.then(function () {
          if (typeof onPlaying === 'function') onPlaying();
        }).catch(function () {});
      }
    }

    function cleanup() {
      document.removeEventListener('pointerdown', resume, true);
      document.removeEventListener('keydown', resume, true);
      document.removeEventListener('touchstart', resume, true);
      window.removeEventListener('focus', resume);
    }

    document.addEventListener('pointerdown', resume, true);
    document.addEventListener('keydown', resume, true);
    document.addEventListener('touchstart', resume, true);
    window.addEventListener('focus', resume);

    // Extra attempt shortly after load — works when MEI allows autoplay.
    window.setTimeout(function () {
      if (done || !audio.paused) return;
      audio.play().then(function () {
        done = true;
        cleanup();
        if (typeof onPlaying === 'function') onPlaying();
      }).catch(function () {});
    }, 120);

    return cleanup;
  }

  root.VibePersist = {
    STORAGE_KEY,
    ASSET_VERSION,
    TRACKS,
    trackSrc,
    loadState,
    saveState,
    clearState,
    armGestureResume
  };
})(window);
