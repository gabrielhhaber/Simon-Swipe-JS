/*
 * Screen reader announcements through ARIA live regions.
 * Two regions are used: polite (status) and assertive (urgent results).
 */
(function () {
  'use strict';

  const SimonSwipe = (window.SimonSwipe = window.SimonSwipe || {});

  let politeRegion = null;
  let assertiveRegion = null;
  let lastMessage = '';
  const timers = new WeakMap();

  function write(region, text) {
    clearTimeout(timers.get(region));
    /* Clearing first guarantees repeated messages are spoken again. */
    region.textContent = '';
    timers.set(
      region,
      setTimeout(() => {
        region.textContent = text;
      }, 60)
    );
  }

  SimonSwipe.Announcer = {
    init(polite, assertive) {
      politeRegion = polite;
      assertiveRegion = assertive;
    },

    say(text, options) {
      if (!text || !politeRegion) return;
      const assertive = options && options.assertive;
      lastMessage = text;
      write(assertive ? assertiveRegion : politeRegion, text);
    },

    repeatLast() {
      if (lastMessage) write(politeRegion, lastMessage);
    },
  };
})();
