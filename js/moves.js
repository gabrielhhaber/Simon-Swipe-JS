/*
 * Move generation. A move is { type, start, direction, path } where `path`
 * is the ordered list of ring indexes the finger (or arrow keys) must touch.
 *
 *   tap               -> [start]
 *   double            -> [start, next]
 *   triple            -> [start, next, next]
 *   quad              -> [start, next, next, next]   (full lap)
 *   *Reverse (U-turn) -> travel out, then come back to start
 */
(function () {
  'use strict';

  const SimonSwipe = (window.SimonSwipe = window.SimonSwipe || {});
  const { CONFIG, STRINGS } = SimonSwipe;
  const RING_SIZE = CONFIG.ring.length;

  function wrap(index) {
    return ((index % RING_SIZE) + RING_SIZE) % RING_SIZE;
  }

  function buildPath(type, start, direction) {
    const move = CONFIG.moves[type];
    const out = [];
    for (let i = 0; i < move.steps; i += 1) {
      out.push(wrap(start + i * direction));
    }
    if (!move.reverse) return out;
    const back = out.slice(0, -1).reverse();
    return out.concat(back);
  }

  function pickWeighted(weights) {
    const entries = Object.entries(weights).filter(([, w]) => w > 0);
    const total = entries.reduce((sum, [, w]) => sum + w, 0);
    let roll = Math.random() * total;
    for (const [type, weight] of entries) {
      roll -= weight;
      if (roll < 0) return type;
    }
    return entries[entries.length - 1][0];
  }

  const Moves = {
    create(type, start, direction) {
      return { type, start, direction, path: buildPath(type, start, direction) };
    },

    random(weights) {
      const type = pickWeighted(weights);
      const start = Math.floor(Math.random() * RING_SIZE);
      const direction = Math.random() < 0.5 ? 1 : -1;
      return this.create(type, start, direction);
    },

    color(index) {
      return CONFIG.ring[index].color;
    },

    directionName(index) {
      return STRINGS.directionNames[CONFIG.ring[index].key];
    },

    /*
     * Learn mode: turns a free path of touched colors into the move it
     * forms. Returns { move } on success or { error, path } when the path is
     * not one of the toy's moves ('jump' = colors that are not neighbours,
     * 'shape' = neighbours but no matching move, e.g. a half U-turn).
     */
    classify(path) {
      if (path.length === 1) return { move: this.create('tap', path[0], 1) };
      for (let i = 1; i < path.length; i += 1) {
        const diff = wrap(path[i] - path[i - 1]);
        if (diff !== 1 && diff !== RING_SIZE - 1) return { error: 'jump', path };
      }
      const direction = wrap(path[1] - path[0]) === 1 ? 1 : -1;
      const match = Object.keys(CONFIG.moves).find((type) => {
        const candidate = buildPath(type, path[0], direction);
        return candidate.length === path.length &&
          candidate.every((index, i) => index === path[i]);
      });
      if (!match) return { error: 'shape', path };
      return { move: this.create(match, path[0], direction) };
    },

    /*
     * Direction cue for a move's sound: one pitch and stereo position per
     * color of the path, from where that color sits on the ring (index 0 at
     * the top, then clockwise). Taps only get the stereo position, so left
     * and right taps come from their side and the pitch stays untouched.
     */
    cue(move) {
      const { semitones, pan } = CONFIG.directionCue;
      const round = (value) => Math.round(value * 1000) / 1000;
      const angle = (index) => (index / RING_SIZE) * 2 * Math.PI;
      const isTap = move.path.length < 2;
      return {
        pitch: move.path.map((index) => (isTap ? 0 : round(Math.cos(angle(index)) * semitones))),
        pan: move.path.map((index) => round(Math.sin(angle(index)) * pan)),
      };
    },

    describe(move) {
      return STRINGS.describeMove(
        move.type,
        move.path.map((index) => this.directionName(index))
      );
    },
  };

  SimonSwipe.Moves = Moves;
})();
