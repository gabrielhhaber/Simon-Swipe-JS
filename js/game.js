/*
 * Game engine: power, mode menu, pattern playback, player turns, scoring.
 *
 * States:
 *   off      - unit switched off
 *   menu     - waiting for a mode to be selected/started
 *   busy     - Simon is playing sounds; touches are ignored (like the toy)
 *   input    - the player is repeating the pattern
 *   passing  - party mode: waiting for the next player to take the unit
 */
(function () {
  'use strict';

  const SimonSwipe = (window.SimonSwipe = window.SimonSwipe || {});
  const { CONFIG, STRINGS, Audio, Moves, UI, Announcer, Storage } = SimonSwipe;
  const T = CONFIG.timing;

  const ABORT = Symbol('abort');

  const START_SOUNDS = {
    classic: 'classicStart',
    levels: 'levelsStart',
    extreme: 'extremeStart',
    party: 'partyStart',
  };
  const SELECT_SOUNDS = {
    classic: 'classicSelect',
    levels: 'levelsSelect',
    extreme: 'extremeSelect',
    party: 'partySelect',
  };

  function gapFor(length) {
    let gap = T.patternGaps[0].gap;
    T.patternGaps.forEach((entry) => {
      if (length >= entry.fromLength) gap = entry.gap;
    });
    return gap;
  }

  const Game = {
    state: 'off',
    token: 0,
    selectedMode: null,
    mode: null,
    score: 0,
    turn: null,
    passResolve: null,

    /* ---------- helpers ---------- */

    say(text, assertive) {
      Announcer.say(text, { assertive: Boolean(assertive) });
    },

    /* Awaits a promise and aborts the running flow if the game was reset. */
    async step(token, promise) {
      const result = await promise;
      if (token !== this.token) throw ABORT;
      return result;
    },

    wait(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },

    setState(state) {
      this.state = state;
      document.body.dataset.state = state;
    },

    /* Stops whatever is running (sounds, lights, timers, pending turns). */
    reset() {
      this.token += 1;
      this.clearTurnTimer();
      if (this.turn) {
        this.turn.resolve({ ok: false, aborted: true });
        this.turn = null;
      }
      if (this.passResolve) {
        this.passResolve();
        this.passResolve = null;
      }
      Audio.stopAll();
      UI.cancelAnimations();
    },

    refreshScoreboard() {
      const mode = this.mode || this.selectedMode;
      UI.setScoreboard({
        mode,
        score: this.mode ? this.score : null,
        best: mode ? Storage.highScore(mode) : null,
        level: mode === 'levels' ? Storage.level : null,
      });
    },

    menuHintText() {
      const items = CONFIG.ring.map(({ color }, index) =>
        STRINGS.modeListItem(Moves.directionName(index), CONFIG.modeByColor[color])
      );
      return STRINGS.menuHint(items.join(', '));
    },

    /* ---------- power ---------- */

    async powerOn() {
      this.reset();
      const token = this.token;
      this.setState('busy');
      UI.setPower(true);
      UI.setStatus(STRINGS.status.menu);
      try {
        UI.flashAll(Audio.duration('on'));
        await this.step(token, Audio.play('on'));
        this.goMenu(STRINGS.poweredOn(this.menuHintText()));
      } catch (err) {
        if (err !== ABORT) throw err;
      }
    },

    async powerOff() {
      this.reset();
      const token = this.token;
      this.mode = null;
      this.selectedMode = null;
      UI.setSelectedMode(null);
      this.setState('off');
      UI.setStatus(STRINGS.status.off);
      this.say(STRINGS.poweredOff);
      try {
        await this.step(token, Audio.play('off'));
      } catch (err) {
        if (err !== ABORT) throw err;
      }
      if (token === this.token) UI.setPower(false);
    },

    togglePower() {
      if (this.state === 'off') this.powerOn();
      else this.powerOff();
    },

    /* ---------- menu ---------- */

    goMenu(announcement) {
      this.mode = null;
      this.setState('menu');
      UI.setSelectedMode(this.selectedMode);
      UI.setStatus(
        this.selectedMode ? STRINGS.status.selected(this.selectedMode) : STRINGS.status.menu
      );
      this.refreshScoreboard();
      if (announcement) this.say(announcement);
    },

    modeIndex(mode) {
      return CONFIG.ring.findIndex(({ color }) => CONFIG.modeByColor[color] === mode);
    },

    /* Touching a color in the menu selects its game; touching again starts it. */
    chooseMode(mode) {
      if (this.state !== 'menu') return;
      const index = this.modeIndex(mode);
      if (this.selectedMode === mode) {
        this.startMode(mode);
        return;
      }
      this.selectedMode = mode;
      Object.values(SELECT_SOUNDS).forEach((id) => Audio.stop(id));
      UI.flash(index, 300);
      Audio.fire(SELECT_SOUNDS[mode]);
      UI.setSelectedMode(mode);
      UI.setStatus(STRINGS.status.selected(mode));
      this.refreshScoreboard();
      this.say(STRINGS.modeSelected(mode, Moves.directionName(index)));
    },

    async startMode(mode) {
      this.reset();
      const token = this.token;
      this.selectedMode = mode;
      this.mode = mode;
      this.score = 0;
      this.setState('busy');
      Object.values(SELECT_SOUNDS).forEach((id) => Audio.stop(id));
      UI.setSelectedMode(mode);
      this.refreshScoreboard();
      this.say(STRINGS.modeStarting(mode, Storage.settings.trainingMode));
      try {
        UI.flashAll(Audio.duration(START_SOUNDS[mode]));
        await this.step(token, Audio.play(START_SOUNDS[mode]));
        await this.step(
          token,
          this.wait(mode === 'levels' ? T.levelsStartToCount : T.afterModeStart)
        );
        if (mode === 'levels') await this.runLevels(token);
        else await this.runSequenceGame(token, mode);
      } catch (err) {
        if (err !== ABORT) throw err;
      }
    },

    /* Escape: leave the current game and go back to the menu. */
    abortToMenu() {
      if (this.state === 'off' || this.state === 'menu') return;
      this.reset();
      this.goMenu(STRINGS.gameAborted + ' ' + this.menuHintText());
    },

    /* ---------- pattern playback ---------- */

    async playMove(token, move) {
      const id = Audio.commandId(Moves.color(move.start), move.type);
      UI.lightPath(move.path, Audio.duration(id));
      await this.step(token, Audio.play(id));
    },

    async playPattern(token, sequence) {
      this.setState('busy');
      UI.setStatus(STRINGS.status.watching);
      const gap = gapFor(sequence.length);
      for (let i = 0; i < sequence.length; i += 1) {
        if (i > 0) await this.step(token, this.wait(gap));
        await this.playMove(token, sequence[i]);
      }
      const settings = Storage.settings;
      const parts = [];
      if (settings.trainingMode) {
        parts.push(STRINGS.describePattern(sequence.map((move) => Moves.describe(move))));
      }
      if (settings.announceTurn) parts.push(STRINGS.yourTurn);
      if (parts.length) this.say(parts.join(' '));
    },

    /* ---------- player turn ---------- */

    playerTurn(token, sequence) {
      return new Promise((resolve) => {
        this.turn = {
          token,
          sequence,
          index: 0,
          pathPos: 0,
          swipeSource: null,
          lastSound: Promise.resolve(),
          resolve: (result) => resolve(result),
        };
        this.setState('input');
        UI.setStatus(STRINGS.status.playing);
        this.armTurnTimer();
      }).then((result) => {
        if (token !== this.token) throw ABORT;
        return result;
      });
    },

    /* After a correct turn: let the final move's sound finish, then pause. */
    async afterCorrectTurn(token, result) {
      await this.step(token, result.lastSound);
      await this.step(token, this.wait(T.beforePattern));
    },

    armTurnTimer() {
      this.clearTurnTimer();
      /* Training mode never times out: the screen reader may still be
         describing a long pattern. */
      if (Storage.settings.trainingMode) return;
      const limit = Number(Storage.settings.responseTimeout);
      if (!limit) return;
      this.turnTimer = setTimeout(() => this.endTurn(false, 'timeout'), limit);
    },

    clearTurnTimer() {
      clearTimeout(this.turnTimer);
      this.turnTimer = null;
    },

    endTurn(ok, reason) {
      const turn = this.turn;
      if (!turn) return;
      this.clearTurnTimer();
      this.turn = null;
      this.setState('busy');
      turn.resolve({ ok, reason, lastSound: turn.lastSound, completedAt: Date.now() });
    },

    turnTouch(index, source, kind) {
      const turn = this.turn;
      const move = turn.sequence[turn.index];

      if (turn.pathPos === 0) {
        /* Sliding into a color only counts while a swipe is in progress. */
        if (kind === 'enter') return;
        if (index !== move.path[0]) {
          this.endTurn(false, 'wrong');
          return;
        }
        if (move.type === 'tap') {
          UI.flash(index, T.tapLight);
          turn.lastSound = Audio.play(Audio.commandId(Moves.color(index), 'tap'));
          this.completeMove();
          return;
        }
        turn.pathPos = 1;
        turn.swipeSource = source;
        UI.holdLit(index);
        this.armTurnTimer();
        return;
      }

      /* Swipe in progress: ignore re-touching the color we are on. */
      if (index === move.path[turn.pathPos - 1]) return;
      if (index !== move.path[turn.pathPos]) {
        this.endTurn(false, 'wrong');
        return;
      }
      turn.pathPos += 1;
      UI.holdLit(index);
      if (turn.pathPos === move.path.length) {
        const id = Audio.commandId(Moves.color(move.start), move.type);
        UI.lightPath(move.path, Audio.duration(id));
        turn.lastSound = Audio.play(id);
        this.completeMove();
      } else {
        this.armTurnTimer();
      }
    },

    completeMove() {
      const turn = this.turn;
      turn.pathPos = 0;
      turn.swipeSource = null;
      turn.index += 1;
      if (turn.index >= turn.sequence.length) {
        this.endTurn(true);
      } else {
        this.armTurnTimer();
      }
    },

    /* ---------- game flows ---------- */

    async runSequenceGame(token, mode) {
      const rules = CONFIG.modes[mode];
      const sequence = [];
      for (;;) {
        sequence.push(Moves.random(rules.moveWeights));
        await this.playPattern(token, sequence);
        const result = await this.playerTurn(token, sequence);
        if (!result.ok) {
          await this.gameOver(token, result.reason, this.score);
          return;
        }
        this.score = sequence.length;
        this.refreshScoreboard();
        if (sequence.length >= rules.winAt) {
          await this.step(token, result.lastSound);
          await this.gameWon(token, this.score, STRINGS.win);
          return;
        }
        if (mode === 'party') {
          await this.step(token, result.lastSound);
          await this.passIt(token);
        }
        await this.afterCorrectTurn(token, result);
      }
    },

    async runLevels(token) {
      const total = CONFIG.modes.levels.count;
      let level = Math.min(Math.max(Storage.level, 1), total);
      await this.tapOutLevel(token, level, total);
      for (;;) {
        const rules = CONFIG.levels[level - 1];
        const sequence = [];
        let result = null;
        while (sequence.length < rules.length) {
          if (result) await this.afterCorrectTurn(token, result);
          sequence.push(Moves.random(rules.moveWeights));
          await this.playPattern(token, sequence);
          result = await this.playerTurn(token, sequence);
          if (!result.ok) {
            await this.gameOver(token, result.reason, this.score, STRINGS.stoppedAtLevel(level));
            return;
          }
          this.score += 1;
          this.refreshScoreboard();
        }

        Storage.submitScore('levels', level);
        if (level >= total) {
          Storage.level = 1;
          await this.step(token, result.lastSound);
          await this.gameWon(token, this.score, STRINGS.levelsWin);
          return;
        }
        level += 1;
        Storage.level = level;
        this.refreshScoreboard();
        /* "Level up" starts a fixed time after the last correct touch. */
        const levelUpAt = result.completedAt + T.beforeLevelUp;
        await this.step(token, this.wait(Math.max(0, levelUpAt - Date.now())));
        this.say(STRINGS.levelUp(level));
        UI.flashAll(Audio.duration('levelUp'));
        await this.step(token, Audio.play('levelUp'));
        await this.step(token, this.wait(T.afterLevelUp));
        await this.tapOutLevel(token, level, total, true);
      }
    },

    /* The toy taps out the level number before a level starts. */
    async tapOutLevel(token, level, total, silentAnnounce) {
      this.setState('busy');
      if (!silentAnnounce) this.say(STRINGS.levelAnnounce(level, total));
      UI.setStatus(STRINGS.levelAnnounce(level, total));
      /* Ticks are scheduled on a fixed clock so they chain without gaps. */
      const startedAt = Date.now();
      let last = Promise.resolve();
      for (let i = 1; i <= level; i += 1) {
        const due = startedAt + (i - 1) * T.levelTickInterval;
        await this.step(token, this.wait(Math.max(0, due - Date.now())));
        UI.tick(i - 1);
        last = Audio.play(i === level ? 'levelTap' : 'levelTapLoop');
      }
      await this.step(token, last);
      await this.step(token, this.wait(T.afterLevelCount));
    },

    /* Party mode: music plays until the next player touches the unit. */
    async passIt(token) {
      await this.step(token, this.wait(T.beforePass));
      this.setState('passing');
      UI.setStatus(STRINGS.status.passing);
      this.say(STRINGS.passIt);
      const waitForPlayer = new Promise((resolve) => {
        this.passResolve = resolve;
      });
      Audio.play('passIt', { loop: true });
      await this.step(token, waitForPlayer);
      Audio.stop('passIt');
      this.setState('busy');
    },

    confirmPass() {
      if (this.state !== 'passing' || !this.passResolve) return;
      const resolve = this.passResolve;
      this.passResolve = null;
      resolve();
    },

    async gameOver(token, reason, score, extraMessage) {
      this.setState('busy');
      UI.setStatus(STRINGS.status.result);
      Audio.stop('passIt');
      const reasons = { timeout: STRINGS.timeout, released: STRINGS.released };
      this.say(reasons[reason] || STRINGS.failed, true);
      UI.flashAll(Audio.duration('fail'));
      await this.step(token, Audio.play('fail'));
      await this.step(token, this.wait(T.afterFail));
      await this.finishWithScore(token, score, extraMessage);
    },

    async gameWon(token, score, message) {
      this.setState('busy');
      UI.setStatus(STRINGS.status.result);
      this.say(message, true);
      UI.flashAll(Audio.duration('win'));
      await this.step(token, Audio.play('win'));
      await this.step(token, this.wait(T.afterFail));
      await this.finishWithScore(token, score);
    },

    async finishWithScore(token, score, extraMessage) {
      const mode = this.mode;
      /* Training games have no time limit, so they do not set records. */
      const isRecord = mode !== 'levels' && !Storage.settings.trainingMode &&
        Storage.submitScore(mode, score);
      this.say(STRINGS.score(score) + (extraMessage ? ' ' + extraMessage : ''));
      await this.playScore(token, score);
      if (isRecord) {
        this.say(STRINGS.highScore(score), true);
        UI.flashAll(Audio.duration('highScore'));
        await this.step(token, Audio.play('highScore'));
      }
      this.refreshScoreboard();
      await this.step(token, this.wait(T.afterScore));
      this.goMenu(STRINGS.backToMenu);
    },

    /*
     * Score playback: "Score", then one count per ten (each ten one step
     * higher in pitch), then one tick per remaining point at the pitch
     * reached so far.
     */
    async playScore(token, score) {
      await this.step(token, Audio.play('score'));
      const tens = Math.floor(score / 10);
      const units = score % 10;
      const rateFor = (step) => Math.min(T.pointPitchMax, Math.pow(T.pointPitchStep, step));
      for (let i = 0; i < tens; i += 1) {
        const rate = rateFor(i);
        UI.flashAll(Audio.duration('countTen') / rate);
        await this.step(token, Audio.play('countTen', { rate }));
      }
      const unitRate = rateFor(tens);
      const startedAt = Date.now();
      let last = Promise.resolve();
      for (let i = 0; i < units; i += 1) {
        const due = startedAt + i * T.pointTickInterval;
        await this.step(token, this.wait(Math.max(0, due - Date.now())));
        UI.tick(i);
        last = Audio.play('pointCounter', { rate: unitRate });
      }
      await this.step(token, last);
    },

    /* ---------- input entry points ---------- */

    handleTouch(index, source, kind) {
      switch (this.state) {
        case 'menu':
          if (kind === 'down') this.chooseMode(CONFIG.modeByColor[Moves.color(index)]);
          break;
        case 'input':
          this.turnTouch(index, source, kind);
          break;
        case 'passing':
          if (kind === 'down') this.confirmPass();
          break;
        default:
          /* off / busy: the toy ignores touches. */
          break;
      }
    },

    /*
     * Lifting the finger (or releasing every arrow) before a swipe is
     * complete is a mistake, like on the toy. The motor accessibility
     * setting tolerates it so the swipe can be finished color by color.
     * Screen reader double taps ('virtual') can never hold, so they are
     * always tolerated.
     */
    handleRelease(source) {
      const turn = this.turn;
      if (this.state !== 'input' || !turn || turn.pathPos === 0) return;
      if (turn.swipeSource !== source) return;
      if (Storage.settings.allowLift) return;
      this.endTurn(false, 'released');
    },

    handleEnter() {
      if (this.state === 'off') this.powerOn();
      else if (this.state === 'menu' && this.selectedMode) this.startMode(this.selectedMode);
      else if (this.state === 'passing') this.confirmPass();
    },

    statusSummary() {
      const parts = [];
      if (this.state === 'off') return STRINGS.status.off;
      const mode = this.mode || this.selectedMode;
      if (mode) parts.push(STRINGS.modeNames[mode] + '.');
      if (this.mode) parts.push(STRINGS.score(this.score));
      if (mode === 'levels') parts.push(STRINGS.levelAnnounce(Storage.level, CONFIG.modes.levels.count));
      if (mode && mode !== 'levels') parts.push('Recorde: ' + Storage.highScore(mode) + '.');
      if (this.state === 'menu') parts.push(this.menuHintText());
      return STRINGS.statusSummary(parts);
    },
  };

  SimonSwipe.Game = Game;
})();
