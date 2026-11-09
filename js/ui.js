/*
 * Visual layer: draws the light ring and drives its lights, status text and
 * scoreboard. It never decides game rules.
 */
(function () {
  'use strict';

  const SimonSwipe = (window.SimonSwipe = window.SimonSwipe || {});
  const { CONFIG, STRINGS } = SimonSwipe;

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const OUTER_RADIUS = 96;
  const INNER_RADIUS = 56;
  const GAP_DEGREES = 5;
  const ARROWS = { ArrowUp: '▲', ArrowRight: '▶', ArrowDown: '▼', ArrowLeft: '◀' };

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  let segments = [];
  let unitEl = null;
  let statusEl = null;
  let scoreEls = {};
  const timers = new Set();

  function polar(radius, degrees) {
    const radians = (degrees * Math.PI) / 180;
    return [radius * Math.cos(radians), radius * Math.sin(radians)];
  }

  function arcPath(centerDegrees) {
    const half = 45 - GAP_DEGREES / 2;
    const a0 = centerDegrees - half;
    const a1 = centerDegrees + half;
    const [x0, y0] = polar(OUTER_RADIUS, a0);
    const [x1, y1] = polar(OUTER_RADIUS, a1);
    const [x2, y2] = polar(INNER_RADIUS, a1);
    const [x3, y3] = polar(INNER_RADIUS, a0);
    const p = (v) => v.toFixed(2);
    /* Arc flags must stay plain 0/1, so they are written as strings. */
    return [
      'M', p(x0), p(y0),
      'A', OUTER_RADIUS, OUTER_RADIUS, '0 0 1', p(x1), p(y1),
      'L', p(x2), p(y2),
      'A', INNER_RADIUS, INNER_RADIUS, '0 0 0', p(x3), p(y3),
      'Z',
    ].join(' ');
  }

  function later(fn, ms) {
    const id = setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
    return id;
  }

  const UI = {
    init(elements) {
      unitEl = elements.unit;
      statusEl = elements.status;
      scoreEls = elements.scoreboard;
      this.buildRing(elements.ring);
    },

    buildRing(svg) {
      const ringSize = CONFIG.ring.length;
      segments = CONFIG.ring.map(({ color, key }, index) => {
        /* Index 0 sits at the top (-90deg), then clockwise. */
        const center = -90 + (360 / ringSize) * index;
        const group = document.createElementNS(SVG_NS, 'g');
        group.setAttribute('class', 'segment segment--' + color);
        group.dataset.index = String(index);
        group.setAttribute('role', 'button');
        group.setAttribute(
          'aria-label',
          STRINGS.colorNames[color] + ', ' + STRINGS.directionNames[key]
        );

        const path = document.createElementNS(SVG_NS, 'path');
        path.setAttribute('d', arcPath(center));
        path.setAttribute('class', 'segment__light');
        group.appendChild(path);

        const [tx, ty] = polar((OUTER_RADIUS + INNER_RADIUS) / 2, center);
        const label = document.createElementNS(SVG_NS, 'text');
        label.setAttribute('x', tx.toFixed(2));
        label.setAttribute('y', ty.toFixed(2));
        label.setAttribute('class', 'segment__arrow');
        label.setAttribute('aria-hidden', 'true');
        label.textContent = ARROWS[key];
        group.appendChild(label);

        svg.appendChild(group);
        return group;
      });
    },

    segmentElements() {
      return segments;
    },

    setLit(index, lit) {
      const segment = segments[index];
      if (segment) segment.classList.toggle('is-lit', lit);
    },

    flash(index, ms) {
      this.setLit(index, true);
      later(() => this.setLit(index, false), ms);
    },

    /* Lights a swipe path along the ring over `duration` ms. */
    lightPath(path, duration) {
      if (path.length === 1) {
        this.flash(path[0], Math.max(duration * 0.8, 150));
        return;
      }
      const stepTime = duration / path.length;
      path.forEach((index, step) => {
        later(() => {
          this.setLit(index, true);
          later(() => this.setLit(index, false), stepTime * 1.15);
        }, step * stepTime);
      });
    },

    /* Holds a segment lit while a player swipe is in progress. */
    holdLit(index) {
      this.setLit(index, true);
      later(() => this.setLit(index, false), CONFIG.timing.tapLight * 1.5);
    },

    /* Celebration flash of the whole ring (level up / win). */
    flashAll(duration) {
      const interval = reducedMotion.matches ? 600 : 360;
      const count = Math.max(1, Math.floor(duration / interval));
      for (let i = 0; i < count; i += 1) {
        later(() => segments.forEach((_, idx) => this.setLit(idx, true)), i * interval);
        later(() => this.clearLights(), i * interval + interval / 2);
      }
    },

    /* Runs a light around the ring, used for ticks while counting. */
    tick(step) {
      this.flash(step % segments.length, 120);
    },

    clearLights() {
      segments.forEach((_, idx) => this.setLit(idx, false));
    },

    cancelAnimations() {
      timers.forEach((id) => clearTimeout(id));
      timers.clear();
      this.clearLights();
    },

    setPower(on) {
      unitEl.classList.toggle('is-off', !on);
    },

    setStatus(text) {
      statusEl.textContent = text;
    },

    setSelectedMode(mode) {
      document.querySelectorAll('[data-mode]').forEach((button) => {
        button.setAttribute('aria-pressed', String(button.dataset.mode === mode));
      });
      unitEl.dataset.selectedMode = mode || '';
    },

    setLearning(on) {
      const button = document.querySelector('#learn-button');
      if (button) button.setAttribute('aria-pressed', String(Boolean(on)));
      unitEl.classList.toggle('is-learning', Boolean(on));
    },

    setScoreboard({ mode, score, best, level }) {
      scoreEls.mode.textContent = mode ? STRINGS.modeNames[mode] : '—';
      scoreEls.score.textContent = score == null ? '—' : String(score);
      scoreEls.best.textContent = best == null ? '—' : String(best);
      scoreEls.level.textContent = level == null ? '—' : String(level);
    },
  };

  SimonSwipe.UI = UI;
})();
