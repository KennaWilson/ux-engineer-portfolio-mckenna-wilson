(function (root) {
  const STORAGE_KEY = 'mckenna_vibe_state';

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

  const ASSET_VERSION = '20261105c';

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

  function saveState( partial) {
    try {
      const prev = loadState() || { index: 0, time: 0, playing: false, loaded: false };
      const next = { ...prev, ...partial, updatedAt: Date.now() };
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

  root.VibePersist = {
    STORAGE_KEY,
    TRACKS,
    trackSrc,
    loadState,
    saveState,
    clearState
  };
})(window);
