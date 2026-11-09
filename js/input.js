/*
 * Input layer. Keyboard, mouse, touch and screen reader activation are all
 * reduced to the same events so the game logic stays device independent:
 *
 *   touch(index, source, kind)
 *     kind 'down'  -> a new contact with a color (key press, finger down,
 *                     screen reader activation)
 *     kind 'enter' -> the finger/mouse slid into another color while held
 *   release(source) -> the finger/mouse was lifted
 *   command(name)   -> non-color actions (enter, escape, power, help, ...)
 *
 * Keyboard swipes: hold the starting arrow and press the next arrows of the
 * path in order, always keeping at least one of them held (e.g. hold Up,
 * press Left = swipe from the top towards the left). Each key press is one
 * step on the ring; releasing every key mid-swipe is like lifting a finger.
 */
(function () {
  'use strict';

  const SimonSwipe = (window.SimonSwipe = window.SimonSwipe || {});
  const { CONFIG } = SimonSwipe;

  const RING_SIZE = CONFIG.ring.length;
  /* Inside this fraction of the radius the pointer is on the center button. */
  const DEAD_ZONE = 0.36;

  const keyToIndex = {};
  CONFIG.ring.forEach(({ key }, index) => {
    keyToIndex[key] = index;
  });
  Object.assign(keyToIndex, CONFIG.alternateKeys);

  const commandKeys = {
    Enter: 'enter',
    NumpadEnter: 'enter',
    Space: 'enter',
    Escape: 'escape',
    KeyP: 'power',
    KeyH: 'help',
    F1: 'help',
    KeyO: 'settings',
    Equal: 'volumeUp',
    NumpadAdd: 'volumeUp',
    Minus: 'volumeDown',
    NumpadSubtract: 'volumeDown',
    KeyI: 'status',
    KeyR: 'repeat',
    KeyL: 'learn',
  };

  /* Ring keys currently held down. */
  const heldKeys = new Set();

  function isTypingTarget(target) {
    if (!target || !target.closest) return false;
    if (target.closest('dialog[open]')) return true;
    const tag = target.tagName;
    return tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA' || target.isContentEditable;
  }

  const Input = {
    handlers: null,

    init(ringSvg, segmentElements, handlers) {
      this.handlers = handlers;
      this.bindKeyboard();
      this.bindPointer(ringSvg);
      this.bindActivation(segmentElements);
    },

    bindKeyboard() {
      document.addEventListener('keydown', (event) => {
        if (event.ctrlKey || event.altKey || event.metaKey) return;
        if (document.querySelector('dialog[open]')) return;
        if (isTypingTarget(event.target)) return;

        const index = keyToIndex[event.code] != null ? keyToIndex[event.code] : keyToIndex[event.key];
        if (index != null) {
          event.preventDefault();
          if (event.repeat) return;
          heldKeys.add(event.code || event.key);
          this.handlers.touch(index, 'keyboard', 'down');
          return;
        }

        const command = commandKeys[event.code];
        if (!command) return;
        /* Let Enter/Space activate real buttons outside the game area. */
        const onButton = event.target.closest && event.target.closest('button, a, summary');
        if (command === 'enter' && onButton) return;
        event.preventDefault();
        if (event.repeat) return;
        this.handlers.command(command);
      });

      /*
       * A keyboard swipe counts as "finger lifted" only when no ring key is
       * held anymore, so pressing the next arrow before releasing the
       * previous one keeps the swipe going.
       */
      document.addEventListener('keyup', (event) => {
        if (!heldKeys.delete(event.code || event.key)) return;
        if (heldKeys.size === 0) this.handlers.release('keyboard');
      });
      window.addEventListener('blur', () => {
        if (heldKeys.size === 0) return;
        heldKeys.clear();
        this.handlers.release('keyboard');
      });
    },

    indexFromPoint(svg, clientX, clientY) {
      const rect = svg.getBoundingClientRect();
      const dx = clientX - (rect.left + rect.width / 2);
      const dy = clientY - (rect.top + rect.height / 2);
      const radius = rect.width / 2;
      if (Math.hypot(dx, dy) < radius * DEAD_ZONE) return null;
      /* 0deg = top, growing clockwise. */
      let degrees = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
      degrees = (degrees + 360) % 360;
      const slice = 360 / RING_SIZE;
      return Math.floor(((degrees + slice / 2) % 360) / slice);
    },

    bindPointer(svg) {
      let activePointer = null;
      let currentIndex = null;
      this.lastPointerDown = 0;

      svg.addEventListener('pointerdown', (event) => {
        if (event.button !== 0) return;
        const index = this.indexFromPoint(svg, event.clientX, event.clientY);
        if (index == null) return;
        event.preventDefault();
        activePointer = event.pointerId;
        currentIndex = index;
        this.lastPointerDown = Date.now();
        try {
          svg.setPointerCapture(event.pointerId);
        } catch (err) {
          /* Synthetic pointers (assistive tech) may not support capture. */
        }
        this.handlers.touch(index, 'pointer', 'down');
      });

      svg.addEventListener('pointermove', (event) => {
        if (event.pointerId !== activePointer) return;
        const index = this.indexFromPoint(svg, event.clientX, event.clientY);
        if (index == null || index === currentIndex) return;
        currentIndex = index;
        this.handlers.touch(index, 'pointer', 'enter');
      });

      const end = (event) => {
        if (event.pointerId !== activePointer) return;
        activePointer = null;
        currentIndex = null;
        this.handlers.release('pointer');
      };
      svg.addEventListener('pointerup', end);
      svg.addEventListener('pointercancel', end);

      /* Stop the page from scrolling or zooming while swiping on the ring. */
      svg.addEventListener('touchmove', (event) => event.preventDefault(), { passive: false });
      svg.addEventListener('contextmenu', (event) => event.preventDefault());
    },

    /*
     * Screen readers on touch devices (VoiceOver, TalkBack) activate elements
     * with a double tap, which arrives as a click without a pointer gesture.
     * Each activation is treated like an arrow key press.
     */
    bindActivation(segmentElements) {
      segmentElements.forEach((segment) => {
        segment.addEventListener('click', () => {
          if (Date.now() - this.lastPointerDown < 800) return;
          this.handlers.touch(Number(segment.dataset.index), 'virtual', 'down');
        });
      });
    },
  };

  SimonSwipe.Input = Input;
})();
