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
    /* Opened from disk: use the embedded copy so Web Audio still works. */
    const embedded = SimonSwipe.SOUND_DATA && SimonSwipe.SOUND_DATA[path];
    if (embedded) return embedded;
    return encodeURI(SOUND_ROOT + path + '.ogg');
  }

  /*
   * Browsers block Web Audio from loading files over file://, which would
   * force the HTML5 fallback (no stereo panning, stepped pitch). There the
   * sounds come from js/sound-data.js instead, loaded only in that case.
   */
  function loadEmbeddedSounds() {
    if (window.location.protocol !== 'file:' || SimonSwipe.SOUND_DATA) {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'js/sound-data.js';
      script.onload = resolve;
      /* Missing file: fall back to the .ogg files (HTML5 audio). */
      script.onerror = resolve;
      document.head.appendChild(script);
    });
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

  /* Length of the slide between two notes of a contour, in seconds. */
  const CONTOUR_GLIDE = 0.05;

  /*
   * Direction cue for swipes. `contour` = { pitch: [semitones], pan: [-1..1] }
   * with one entry per color of the path. The sound is split into equal
   * parts of the file, one per color, each played at its own pitch and
   * stereo position, with a short slide between them. Higher pitch plays
   * faster, so the part boundaries are placed in real time accordingly and
   * howler's end timer is told the resulting average rate.
   * Returns the timers to clear when the sound ends (HTML5 fallback only).
   */
  function applyContour(howl, soundId, baseRate, contour) {
    const sound = howl._soundById(soundId);
    if (!sound) return [];
    const hasContour = contour && contour.pitch && contour.pitch.length > 1;

    /* Pooled sounds keep their panner: re-center it for plain playback. */
    if (!hasContour) {
      if (sound._panner) howl.stereo(0, soundId);
      return [];
    }

    const parts = contour.pitch.length;
    const rates = contour.pitch.map((semitones) => baseRate * Math.pow(2, semitones / 12));
    const partLength = howl.duration() / parts;
    /* Real-time start of each part, and the total real duration. */
    const starts = [];
    let total = 0;
    rates.forEach((rate) => {
      starts.push(total);
      total += partLength / rate;
    });
    const averageRate = howl.duration() / total;

    if (howl._webAudio) {
      /* Creating the panner restarts the sound with a new buffer source,
         so it must happen before the pitch is scheduled on that source. */
      const canPan = contour.pan && typeof howl.stereo === 'function';
      if (canPan) howl.stereo(contour.pan[0], soundId);
      howl.rate(averageRate, soundId);
      const source = sound._node && sound._node.bufferSource;
      const ctx = Howler.ctx;
      const now = ctx.currentTime;
      const ramp = (param, values) => {
        param.cancelScheduledValues(now);
        param.setValueAtTime(values[0], now);
        for (let i = 1; i < parts; i += 1) {
          const at = now + starts[i];
          param.setValueAtTime(values[i - 1], Math.max(now, at - CONTOUR_GLIDE / 2));
          param.linearRampToValueAtTime(values[i], at + CONTOUR_GLIDE / 2);
        }
      };
      if (source) ramp(source.playbackRate, rates);
      if (canPan && sound._panner && sound._panner.pan) ramp(sound._panner.pan, contour.pan);
      return [];
    }

    /* HTML5 audio: no panning; the pitch changes in steps once playing. */
    const node = sound._node;
    if (node && 'preservesPitch' in node) node.preservesPitch = false;
    const timers = [];
    howl.once('play', () => {
      howl.rate(rates[0], soundId);
      for (let i = 1; i < parts; i += 1) {
        timers.push(setTimeout(() => howl.rate(rates[i], soundId), starts[i] * 1000));
      }
    }, soundId);
    return timers;
  }

  /* Playing sounds that can be stopped as a group (e.g. when aborting). */
  const active = new Set();

  const Audio = {
    commandId,

    loadAll(onProgress) {
      return loadEmbeddedSounds().then(() => this.loadFiles(onProgress));
    },

    loadFiles(onProgress) {
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

    /*
     * Plays a sound and resolves when it ends (or is stopped).
     * Options: loop, rate, contour (see applyContour).
     */
    play(id, options) {
      const howl = sounds[id];
      if (!howl || howl.state() !== 'loaded') {
        return Promise.resolve();
      }
      const opts = options || {};
      return new Promise((resolve) => {
        const soundId = howl.play();
        howl.loop(Boolean(opts.loop), soundId);
        const rate = opts.rate || 1;
        howl.rate(rate, soundId);
        if (!howl._webAudio && rate !== 1) {
          /*
           * HTML5 audio (the file:// fallback): a rate set while the
           * browser's play() is still pending is dropped by howler, so it is
           * applied again once playback starts. The element also keeps the
           * pitch by default; the score count needs the pitch to rise.
           */
          const node = howl._soundById(soundId) && howl._soundById(soundId)._node;
          if (node && 'preservesPitch' in node) node.preservesPitch = false;
          howl.once('play', () => howl.rate(rate, soundId), soundId);
        }
        const timers = applyContour(howl, soundId, rate, opts.contour);
        const entry = { howl, soundId, resolve };
        active.add(entry);
        const finish = () => {
          if (!active.has(entry)) return;
          active.delete(entry);
          timers.forEach((timer) => clearTimeout(timer));
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
