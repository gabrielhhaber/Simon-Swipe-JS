/*
 * Simon Swipe - accessible edition
 * Central configuration: ring layout, modes, rules and timings.
 * Every value that tries to mimic the original toy lives here so it can be
 * tuned against the real device without touching the game logic.
 */
(function () {
  'use strict';

  const SimonSwipe = (window.SimonSwipe = window.SimonSwipe || {});

  SimonSwipe.CONFIG = {
    /*
     * Ring layout, clockwise starting at the top.
     * Each color is mapped to the arrow key that points at its position.
     */
    ring: [
      { color: 'green', key: 'ArrowUp' },
      { color: 'red', key: 'ArrowRight' },
      { color: 'blue', key: 'ArrowDown' },
      { color: 'yellow', key: 'ArrowLeft' },
    ],

    /* Extra keys that act as each ring position (index in `ring`). */
    alternateKeys: {
      KeyW: 0, Numpad8: 0,
      KeyD: 1, Numpad6: 1,
      KeyS: 2, Numpad2: 2,
      KeyA: 3, Numpad4: 3,
    },

    /*
     * Mode selection: on the toy you touch a color once to select a game
     * (the "select" sound plays) and touch it again to start it.
     * The manual confirms RED selects LEVELS.
     */
    modeByColor: {
      green: 'classic',
      red: 'levels',
      blue: 'extreme',
      yellow: 'party',
    },

    /*
     * Move types. `steps` describes how far a swipe travels around the ring
     * (number of colors touched) and `reverse` means a U-turn: travel out and
     * come back to the starting color.
     */
    moves: {
      tap: { steps: 1, reverse: false, sound: 'Tap' },
      double: { steps: 2, reverse: false, sound: 'Double swipe' },
      doubleReverse: { steps: 2, reverse: true, sound: 'Double swipe reverse' },
      triple: { steps: 3, reverse: false, sound: 'Tripple swipe' },
      tripleReverse: { steps: 3, reverse: true, sound: 'Tripple swipe reverse' },
      quad: { steps: 4, reverse: false, sound: 'Quad swipe' },
      quadReverse: { steps: 4, reverse: true, sound: 'Quad swipe reverse' },
    },

    /*
     * Game modes. `winAt` is the number of rounds (sequence length) that
     * triggers the win jingle. Levels uses `levels` instead.
     * Move weights control how often each move is drawn.
     */
    modes: {
      classic: {
        winAt: 31,
        moveWeights: { tap: 1 },
      },
      extreme: {
        winAt: 31,
        moveWeights: {
          tap: 4, double: 3, doubleReverse: 2,
          triple: 2, tripleReverse: 1, quad: 1, quadReverse: 1,
        },
      },
      party: {
        winAt: 31,
        moveWeights: {
          tap: 4, double: 3, doubleReverse: 2,
          triple: 2, tripleReverse: 1, quad: 1, quadReverse: 1,
        },
      },
      levels: {
        count: 16,
      },
    },

    /*
     * Levels: each level is a growing pattern that must reach `length`.
     * Difficulty grows with longer patterns and new move types.
     */
    levels: [
      { length: 4, moveWeights: { tap: 1 } },
      { length: 4, moveWeights: { tap: 3, double: 1 } },
      { length: 5, moveWeights: { tap: 3, double: 2 } },
      { length: 5, moveWeights: { tap: 2, double: 2 } },
      { length: 6, moveWeights: { tap: 3, double: 2, triple: 1 } },
      { length: 6, moveWeights: { tap: 2, double: 2, triple: 1 } },
      { length: 7, moveWeights: { tap: 2, double: 2, triple: 2 } },
      { length: 7, moveWeights: { tap: 2, double: 2, triple: 2 } },
      { length: 8, moveWeights: { tap: 3, double: 2, triple: 1, doubleReverse: 1 } },
      { length: 8, moveWeights: { tap: 2, double: 2, triple: 1, doubleReverse: 2 } },
      { length: 9, moveWeights: { tap: 2, double: 2, triple: 1, doubleReverse: 1, tripleReverse: 1 } },
      { length: 9, moveWeights: { tap: 2, double: 1, triple: 1, doubleReverse: 2, tripleReverse: 1 } },
      { length: 10, moveWeights: { tap: 2, double: 2, triple: 1, doubleReverse: 1, tripleReverse: 1, quad: 1 } },
      { length: 10, moveWeights: { tap: 2, double: 1, triple: 1, doubleReverse: 1, tripleReverse: 1, quad: 1, quadReverse: 1 } },
      { length: 11, moveWeights: { tap: 2, double: 1, triple: 1, doubleReverse: 1, tripleReverse: 1, quad: 1, quadReverse: 1 } },
      { length: 12, moveWeights: { tap: 2, double: 1, triple: 1, doubleReverse: 1, tripleReverse: 1, quad: 1, quadReverse: 1 } },
    ],

    /* Timings in milliseconds (estimates, tune against the real toy). */
    timing: {
      /* Silence between the mode "start" jingle and the first pattern. */
      afterModeStart: 700,
      /* Silence between the end of the player's turn and the next pattern. */
      beforePattern: 800,
      /*
       * Gap between two moves while Simon plays the pattern. Like the
       * classic Simon, the pace speeds up after the 5th, 9th and 13th move.
       */
      patternGaps: [
        { fromLength: 1, gap: 420 },
        { fromLength: 6, gap: 320 },
        { fromLength: 10, gap: 240 },
        { fromLength: 14, gap: 170 },
      ],
      /* Gap between the level-number ticks played before a level. */
      levelTickGap: 90,
      /* Pause after "Level up" before the level number is tapped out. */
      afterLevelUp: 500,
      /* Pause after the fail buzzer before the score is played back. */
      afterFail: 700,
      /* Pause between point counter ticks during score playback. */
      pointTickGap: 80,
      /* Pause after the score playback before returning to the menu. */
      afterScore: 600,
      /* Delay before "Pass it" music in party mode. */
      beforePass: 300,
      /* Default response timeout per move (settings can change it). */
      responseTimeout: 5000,
      /* How long the ring segments stay lit after a player's tap. */
      tapLight: 220,
    },

    storageKey: 'simonSwipe.v1',
  };
})();
