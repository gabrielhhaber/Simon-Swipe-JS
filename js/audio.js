/*
 * Audio layer built on howler.js.
 * Every sound returns a promise that resolves when it finishes playing,
 * which lets the game reproduce the toy's timing precisely.
 */
(function () {
  'use strict';

  const SimonSwipe = (window.SimonSwipe = window.SimonSwipe || {});
  const { CONFIG } = SimonSwipe;

  const SOUND_ROOT = 'sounds/';

  /* id -> relative path (without extension) */
  const SOUND_FILES = {
    on: 'general/On',
    off: 'general/Off',
    highScore: 'general/High score',
    passIt: 'general/Pass it loop',
    volumeChange: 'general/Volume change',

    levelsStart: 'level/Levels start',
    levelUp: 'level/Level up',
    levelTap: 'level/Level tap',
    levelTapLoop: 'level/Level tap loopable',

    classicSelect: 'mode/Classic select',
    classicStart: 'mode/Classic start',
    extremeSelect: 'mode/Extreme select',
    extremeStart: 'mode/Extreme start',
    levelsSelect: 'mode/Levels select',
    partySelect: 'mode/Party select',
    partyStart: 'mode/Party start',

    score: 'points/Score',
    pointCounter: 'points/Point counter',
    countTen: 'points/counting 10 points',

    fail: 'result/Fail',
    win: 'result/Win game',
  };

  CONFIG.ring.forEach(({ color }) => {
    Object.entries(CONFIG.moves).forEach(([moveType, move]) => {
      SOUND_FILES[commandId(color, moveType)] = 'command/' + color + '/' + move.sound;
    });
  });

  function commandId(color, moveType) {
    return 'cmd:' + color + ':' + moveType;
  }

  function fileUrl(path) {
    return encodeURI(SOUND_ROOT + path + '.ogg');
  }

  const sounds = {};
  let failedCount = 0;

  function createHowl(id, html5) {
    return new Promise((resolve) => {
      const howl = new Howl({
        src: [fileUrl(SOUND_FILES[id])],
        format: ['ogg'],
        html5,
        preload: true,
        onload: () => resolve(true),
        onloaderror: () => {
          howl.unload();
          if (!html5) {
            /* Web Audio needs XHR, which fails on file://. Retry with HTML5. */
            createHowl(id, true).then(resolve);
          } else {
            failedCount += 1;
            resolve(false);
          }
        },
      });
      sounds[id] = howl;
    });
  }

  /* Playing sounds that can be stopped as a group (e.g. when aborting). */
  const active = new Set();

  const Audio = {
    commandId,

    loadAll(onProgress) {
      const ids = Object.keys(SOUND_FILES);
      let done = 0;
      return Promise.all(
        ids.map((id) =>
          createHowl(id, false).then((ok) => {
            done += 1;
            if (onProgress) onProgress(done, ids.length);
            return ok;
          })
        )
      ).then(() => failedCount === 0);
    },

    has(id) {
      return Boolean(sounds[id]) && sounds[id].state() === 'loaded';
    },

    duration(id) {
      const howl = sounds[id];
      return howl ? howl.duration() * 1000 : 0;
    },

    /* Plays a sound and resolves when it ends (or is stopped). */
    play(id, options) {
      const howl = sounds[id];
      if (!howl || howl.state() !== 'loaded') {
        return Promise.resolve();
      }
      const opts = options || {};
      return new Promise((resolve) => {
        const soundId = howl.play();
        howl.loop(Boolean(opts.loop), soundId);
        howl.rate(opts.rate || 1, soundId);
        const entry = { howl, soundId, resolve };
        active.add(entry);
        const finish = () => {
          if (!active.has(entry)) return;
          active.delete(entry);
          howl.off('end', onEnd, soundId);
          howl.off('stop', finish, soundId);
          resolve();
        };
        const onEnd = () => {
          if (!opts.loop) finish();
        };
        howl.on('end', onEnd, soundId);
        howl.on('stop', finish, soundId);
        entry.finish = finish;
      });
    },

    /* Fire-and-forget playback that does not need to be awaited. */
    fire(id, options) {
      this.play(id, options);
    },

    stop(id) {
      active.forEach((entry) => {
        if (!id || entry.howl === sounds[id]) {
          entry.howl.stop(entry.soundId);
          if (entry.finish) entry.finish();
        }
      });
    },

    stopAll() {
      this.stop();
    },

    setVolume(value) {
      Howler.volume(value);
    },

    /* Resolves once the browser allows audio (after a user gesture). */
    isUnlocked() {
      return !Howler.ctx || Howler.ctx.state === 'running';
    },

    resume() {
      if (Howler.ctx && Howler.ctx.state !== 'running') {
        return Howler.ctx.resume().catch(() => {});
      }
      return Promise.resolve();
    },
  };

  SimonSwipe.Audio = Audio;
})();
