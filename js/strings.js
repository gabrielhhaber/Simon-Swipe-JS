/*
 * User-facing text (Brazilian Portuguese). Code identifiers stay in English.
 */
(function () {
  'use strict';

  const SimonSwipe = (window.SimonSwipe = window.SimonSwipe || {});

  const colorNames = {
    green: 'verde',
    red: 'vermelho',
    blue: 'azul',
    yellow: 'amarelo',
  };

  const directionNames = {
    ArrowUp: 'cima',
    ArrowRight: 'direita',
    ArrowDown: 'baixo',
    ArrowLeft: 'esquerda',
  };

  const modeNames = {
    classic: 'Clássico',
    levels: 'Níveis',
    extreme: 'Extremo',
    party: 'Festa',
  };

  const modeDescriptions = {
    classic: 'Só toques. A sequência cresce a cada rodada.',
    levels: '16 níveis com toques e deslizes que ficam mais difíceis.',
    extreme: 'Toques, deslizes e retornos desde o início.',
    party: 'Para vários jogadores: passe o aparelho a cada rodada.',
  };

  const moveNames = {
    tap: 'toque',
    double: 'deslize duplo',
    doubleReverse: 'deslize duplo com retorno',
    triple: 'deslize triplo',
    tripleReverse: 'deslize triplo com retorno',
    quad: 'deslize quádruplo',
    quadReverse: 'deslize quádruplo com retorno',
  };

  function plural(n, one, many) {
    return n === 1 ? one : many;
  }

  SimonSwipe.STRINGS = {
    colorNames,
    directionNames,
    modeNames,
    modeDescriptions,
    moveNames,

    powerOnButton: 'Ligar o Simon Swipe',
    powerOffButton: 'Desligar',
    poweredOn(menuHint) {
      return 'Simon Swipe ligado. ' + menuHint;
    },
    poweredOff: 'Simon Swipe desligado. Pressione P ou o botão central para ligar.',

    menuHint(modeList) {
      return 'Escolha um jogo com as setas: ' + modeList +
        '. Pressione a mesma seta de novo, ou Enter, para começar. H abre a ajuda.';
    },
    modeListItem(direction, mode) {
      return direction + ' ' + modeNames[mode];
    },
    modeSelected(mode, direction) {
      return modeNames[mode] + ' selecionado. ' + modeDescriptions[mode] +
        ' Pressione ' + direction + ' de novo, ou Enter, para começar.';
    },
    modeStarting(mode) {
      return 'Começando ' + modeNames[mode] + '.';
    },
    levelAnnounce(level, total) {
      return 'Nível ' + level + ' de ' + total + '.';
    },
    levelUp(level) {
      return 'Subiu de nível! Agora nível ' + level + '.';
    },
    yourTurn: 'Sua vez.',
    roundAnnounce(n) {
      return 'Rodada ' + n + '.';
    },
    passIt: 'Passe para o próximo jogador. Toque em qualquer cor ou pressione qualquer seta quando estiver pronto.',
    failed: 'Errou!',
    timeout: 'Tempo esgotado!',
    score(points) {
      return 'Pontuação: ' + points + ' ' + plural(points, 'ponto', 'pontos') + '.';
    },
    highScore(points) {
      return 'Novo recorde: ' + points + '!';
    },
    stoppedAtLevel(level) {
      return 'Você vai continuar do nível ' + level + ' na próxima vez.';
    },
    win: 'Você venceu! Parabéns!',
    levelsWin: 'Você completou os 16 níveis! Parabéns!',
    backToMenu: 'Voltando ao menu.',
    gameAborted: 'Jogo interrompido.',
    volume(percent) {
      return 'Volume ' + percent + ' por cento.';
    },
    statusSummary(parts) {
      return parts.join(' ');
    },
    describeMove(moveType, pathDirections) {
      if (moveType === 'tap') {
        return 'toque ' + pathDirections[0];
      }
      return moveNames[moveType] + ': ' + pathDirections.join(', ');
    },
    describePattern(descriptions) {
      return 'Sequência: ' + descriptions.join('; ') + '.';
    },
    soundsLoading: 'Carregando sons…',
    soundsError: 'Alguns sons não carregaram. Abra o jogo por um servidor local (veja o README).',
    levelsReset: 'Progresso dos níveis reiniciado. Você volta ao nível 1.',
    recordsReset: 'Recordes apagados.',

    status: {
      off: 'Desligado',
      menu: 'Escolha um jogo',
      selected(mode) {
        return modeNames[mode] + ' selecionado — pressione de novo para começar';
      },
      watching: 'Observe a sequência…',
      playing: 'Sua vez',
      passing: 'Passe o aparelho',
      result: 'Fim de jogo',
    },
  };
})();
