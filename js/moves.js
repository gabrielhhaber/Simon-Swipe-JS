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

    describe(move) {
      return STRINGS.describeMove(
        move.type,
        move.path.map((index) => this.directionName(index))
      );
    },
  };

  SimonSwipe.Moves = Moves;
})();
