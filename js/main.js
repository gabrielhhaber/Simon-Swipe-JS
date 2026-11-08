/*
 * Boot: loads sounds, wires the DOM, dialogs and settings to the game.
 */
(function () {
  'use strict';

  const SimonSwipe = window.SimonSwipe;
  const { CONFIG, STRINGS, Audio, UI, Input, Announcer, Storage, Game } = SimonSwipe;

  const $ = (selector) => document.querySelector(selector);

  const VOLUME_STEP = 0.1;

  function changeVolume(delta) {
    const current = Number(Storage.settings.volume);
    const next = Math.round(Math.min(1, Math.max(0, current + delta)) * 10) / 10;
    Storage.setSetting('volume', next);
    Audio.setVolume(next);
    Audio.stop('volumeChange');
    Audio.fire('volumeChange');
    const percent = Math.round(next * 100);
    Announcer.say(STRINGS.volume(percent));
    const slider = $('#setting-volume');
    if (slider) slider.value = String(percent);
  }

  function focusGame() {
    $('#game').focus({ preventScroll: true });
  }

  function openDialog(dialog) {
    if (dialog.open) return;
    dialog.showModal();
  }

  function setupDialogs() {
    const help = $('#help-dialog');
    const settings = $('#settings-dialog');

    $('#help-button').addEventListener('click', () => openDialog(help));
    $('#settings-button').addEventListener('click', () => openDialog(settings));
    document.querySelectorAll('[data-close-dialog]').forEach((button) => {
      button.addEventListener('click', () => button.closest('dialog').close());
    });
    [help, settings].forEach((dialog) => {
      dialog.addEventListener('close', () => {
        if (Game.state !== 'off' || !$('#power-overlay').hidden) focusGame();
      });
    });

    /* Settings controls */
    const s = Storage.settings;
    const volume = $('#setting-volume');
    volume.value = String(Math.round(s.volume * 100));
    volume.addEventListener('input', () => {
      const value = Number(volume.value) / 100;
      Storage.setSetting('volume', value);
      Audio.setVolume(value);
    });
    volume.addEventListener('change', () => Audio.fire('volumeChange'));

    const timeout = $('#setting-timeout');
    timeout.value = String(s.responseTimeout);
    timeout.addEventListener('change', () => {
      Storage.setSetting('responseTimeout', Number(timeout.value));
    });

    const announceTurn = $('#setting-announce-turn');
    announceTurn.checked = Boolean(s.announceTurn);
    announceTurn.addEventListener('change', () => {
      Storage.setSetting('announceTurn', announceTurn.checked);
    });

    const describe = $('#setting-describe');
    describe.checked = Boolean(s.describeMoves);
    describe.addEventListener('change', () => {
      Storage.setSetting('describeMoves', describe.checked);
    });

    $('#reset-levels').addEventListener('click', () => {
      Storage.level = 1;
      Game.refreshScoreboard();
      Announcer.say(STRINGS.levelsReset);
    });
    $('#reset-records').addEventListener('click', () => {
      Storage.resetHighScores();
      Game.refreshScoreboard();
      Announcer.say(STRINGS.recordsReset);
    });
  }

  function setupModeButtons() {
    document.querySelectorAll('[data-mode]').forEach((button) => {
      const mode = button.dataset.mode;
      const index = Game.modeIndex(mode);
      const color = CONFIG.ring[index].color;
      const direction = STRINGS.directionNames[CONFIG.ring[index].key];
      button.dataset.color = color;
      button.querySelector('.mode-button__name').textContent = STRINGS.modeNames[mode];
      button.querySelector('.mode-button__hint').textContent =
        'Seta para ' + direction + ' · ' + STRINGS.colorNames[color];
      button.addEventListener('click', () => {
        if (Game.state === 'off') return;
        if (Game.state !== 'menu') return;
        Game.chooseMode(mode);
      });
    });
  }

  function powerOnFromUser() {
    $('#power-overlay').hidden = true;
    Audio.resume().then(() => {
      Game.powerOn();
      focusGame();
    });
  }

  function setupPower() {
    $('#power-overlay-button').addEventListener('click', powerOnFromUser);
    $('#power-button').addEventListener('click', () => {
      if (!$('#power-overlay').hidden) {
        powerOnFromUser();
        return;
      }
      Audio.resume().then(() => Game.togglePower());
      focusGame();
    });
  }

  function handleCommand(command) {
    if (!$('#power-overlay').hidden) {
      if (command === 'enter' || command === 'power') powerOnFromUser();
      if (command === 'help') openDialog($('#help-dialog'));
      return;
    }
    switch (command) {
      case 'enter':
        Game.handleEnter();
        break;
      case 'escape':
        Game.abortToMenu();
        break;
      case 'power':
        Game.togglePower();
        break;
      case 'help':
        openDialog($('#help-dialog'));
        break;
      case 'settings':
        openDialog($('#settings-dialog'));
        break;
      case 'volumeUp':
        changeVolume(VOLUME_STEP);
        break;
      case 'volumeDown':
        changeVolume(-VOLUME_STEP);
        break;
      case 'status':
        Announcer.say(Game.statusSummary());
        break;
      case 'repeat':
        Announcer.repeatLast();
        break;
      default:
        break;
    }
  }

  function boot() {
    Announcer.init($('#announcer-polite'), $('#announcer-assertive'));
    UI.init({
      unit: $('#unit'),
      ring: $('#ring'),
      status: $('#status'),
      scoreboard: {
        mode: $('#score-mode'),
        score: $('#score-points'),
        best: $('#score-best'),
        level: $('#score-level'),
      },
    });
    UI.setPower(false);
    UI.setStatus(STRINGS.status.off);
    Game.setState('off');
    Game.refreshScoreboard();

    Input.init($('#ring'), UI.segmentElements(), {
      touch: (index, source, kind) => {
        if (!$('#power-overlay').hidden) return;
        Game.handleTouch(index, source, kind);
      },
      release: (source) => Game.handleRelease(source),
      command: handleCommand,
    });

    setupDialogs();
    setupModeButtons();
    setupPower();

    Audio.setVolume(Storage.settings.volume);
    const overlayButton = $('#power-overlay-button');
    const loading = $('#loading');
    overlayButton.disabled = true;
    loading.textContent = STRINGS.soundsLoading;

    Audio.loadAll((done, total) => {
      loading.textContent = STRINGS.soundsLoading + ' ' + Math.round((done / total) * 100) + '%';
    }).then((allLoaded) => {
      overlayButton.disabled = false;
      loading.textContent = allLoaded ? '' : STRINGS.soundsError;
      if (!allLoaded) Announcer.say(STRINGS.soundsError, { assertive: true });
      /* If the browser already allows audio, switch on like the real toy. */
      if (Audio.isUnlocked() && Howler.ctx) {
        $('#power-overlay').hidden = true;
        Game.powerOn();
        focusGame();
      } else {
        overlayButton.focus();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', boot);
})();
