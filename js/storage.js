/*
 * Persistent data: settings, high scores and Levels progress.
 * Falls back to memory when localStorage is unavailable.
 */
(function () {
  'use strict';

  const SimonSwipe = (window.SimonSwipe = window.SimonSwipe || {});
  const { CONFIG } = SimonSwipe;

  const DEFAULTS = {
    settings: {
      volume: 0.8,
      responseTimeout: CONFIG.timing.responseTimeout,
      announceTurn: true,
      /* Training mode: describes each pattern and never times out. */
      trainingMode: false,
      /* Motor accessibility: allow releasing mid-swipe. Off = toy rules. */
      allowLift: false,
      /* Bends swipe sounds so their direction can be heard. Off = toy sounds. */
      directionCue: true,
    },
    highScores: { classic: 0, extreme: 0, party: 0, levels: 0 },
    level: 1,
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function load() {
    try {
      const raw = window.localStorage.getItem(CONFIG.storageKey);
      if (!raw) return clone(DEFAULTS);
      const parsed = JSON.parse(raw);
      /* Older versions called training mode "describeMoves". */
      if (parsed.settings && parsed.settings.trainingMode === undefined &&
          parsed.settings.describeMoves !== undefined) {
        parsed.settings.trainingMode = parsed.settings.describeMoves;
      }
      if (parsed.settings) delete parsed.settings.describeMoves;
      return {
        settings: Object.assign(clone(DEFAULTS.settings), parsed.settings),
        highScores: Object.assign(clone(DEFAULTS.highScores), parsed.highScores),
        level: Number(parsed.level) || 1,
      };
    } catch (err) {
      return clone(DEFAULTS);
    }
  }

  const data = load();

  function save() {
    try {
      window.localStorage.setItem(CONFIG.storageKey, JSON.stringify(data));
    } catch (err) {
      /* Private mode or blocked storage: keep data in memory only. */
    }
  }

  SimonSwipe.Storage = {
    get settings() {
      return data.settings;
    },
    setSetting(name, value) {
      data.settings[name] = value;
      save();
    },
    highScore(mode) {
      return data.highScores[mode] || 0;
    },
    /* Returns true when `score` beats the stored record. */
    submitScore(mode, score) {
      if (score > (data.highScores[mode] || 0)) {
        data.highScores[mode] = score;
        save();
        return true;
      }
      return false;
    },
    resetHighScores() {
      data.highScores = clone(DEFAULTS.highScores);
      save();
    },
    get level() {
      return data.level;
    },
    set level(value) {
      data.level = value;
      save();
    },
  };
})();
