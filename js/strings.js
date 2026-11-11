/*
 * User-facing text in Brazilian Portuguese, English and Spanish, and the
 * language switching. Code identifiers stay in English.
 *
 * `SimonSwipe.STRINGS` always holds the active language. It is one object
 * that is refilled when the language changes, so modules can keep the
 * reference they took at load time.
 *
 * Every pack has the same keys. `ui` holds the static page text, applied to
 * elements marked in index.html:
 *   data-i18n="key"            -> textContent
 *   data-i18n-html="key"       -> innerHTML (text with <kbd>, <strong>...)
 *   data-i18n-attr="attr:key"  -> attributes (comma separated pairs)
 */
(function () {
  'use strict';

  const SimonSwipe = (window.SimonSwipe = window.SimonSwipe || {});

  function plural(n, one, many) {
    return n === 1 ? one : many;
  }

  function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  /* ------------------------------------------------------------------ */
  /* Português (Brasil)                                                   */
  /* ------------------------------------------------------------------ */

  function portuguese() {
    const colorNames = { green: 'verde', red: 'vermelho', blue: 'azul', yellow: 'amarelo' };
    const directionNames = {
      ArrowUp: 'cima', ArrowRight: 'direita', ArrowDown: 'baixo', ArrowLeft: 'esquerda',
    };
    const modeNames = {
      classic: 'Clássico', levels: 'Níveis', extreme: 'Extremo', party: 'Festa', learn: 'Aprender',
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

    return {
      htmlLang: 'pt-BR',
      languageName: 'Português',
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
      modeButtonHint(direction, color) {
        return 'Seta para ' + direction + ' · ' + colorNames[color];
      },
      modeSelected(mode, direction) {
        return modeNames[mode] + ' selecionado. ' + modeDescriptions[mode] +
          ' Pressione ' + direction + ' de novo, ou Enter, para começar.';
      },
      modeStarting(mode, training) {
        return 'Começando ' + modeNames[mode] + '.' +
          (training ? ' Modo treino: sem limite de tempo.' : '');
      },
      levelAnnounce(level, total) {
        return 'Nível ' + level + ' de ' + total + '.';
      },
      levelUp(level) {
        return 'Subiu de nível! Agora nível ' + level + '.';
      },
      yourTurn: 'Sua vez.',
      passIt: 'Passe para o próximo jogador. Toque em qualquer cor ou pressione qualquer seta quando estiver pronto.',
      failed: 'Errou!',
      timeout: 'Tempo esgotado!',
      released: 'Soltou antes de terminar o deslize!',
      score(points) {
        return 'Pontuação: ' + points + ' ' + plural(points, 'ponto', 'pontos') + '.';
      },
      highScore(points) {
        return 'Novo recorde: ' + points + '!';
      },
      bestScore(points) {
        return 'Recorde: ' + points + '.';
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
        if (moveType === 'tap') return 'toque ' + pathDirections[0];
        return moveNames[moveType] + ': ' + pathDirections.join(', ');
      },
      describePattern(descriptions) {
        return 'Sequência: ' + descriptions.join('; ') + '.';
      },
      learnStart: 'Modo aprender. Faça qualquer toque ou deslize: quando soltar, ' +
        'Simon toca o som da jogada e ela é descrita. Esc sai do modo.',
      learnExit: 'Saindo do modo aprender.',
      learnStatus: 'Modo aprender. Faça um toque ou deslize para ouvir o som. Esc sai do modo.',
      learnMove(description) {
        return capitalize(description) + '.';
      },
      learnInvalid(error, directions) {
        const path = directions.join(', ');
        if (error === 'jump') {
          return 'Jogada inválida: ' + path + '. O deslize só passa por cores vizinhas, sem pular nenhuma.';
        }
        return 'Jogada inválida: ' + path + '. Um deslize vai em um só sentido por 2, 3 ou 4 cores, ' +
          'ou vai até o fim e volta pelo mesmo caminho até a cor inicial.';
      },
      soundsLoading: 'Carregando sons…',
      soundsError: 'Alguns sons não carregaram. Recarregue a página; se continuar, veja o README.',
      levelsReset: 'Progresso dos níveis reiniciado. Você volta ao nível 1.',
      recordsReset: 'Recordes apagados.',
      languageChanged: 'Idioma: Português.',
      languageAuto(name) {
        return 'Automático, idioma do sistema (' + name + ')';
      },

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
        learning: 'Modo aprender — faça uma jogada (Esc sai)',
      },

      ui: {
        docTitle: 'Simon Swipe Acessível',
        metaDescription: 'Versão acessível do jogo Simon Swipe para teclado, mouse, toque e leitores de tela.',
        skipLink: 'Ir para o jogo',
        titleTag: 'acessível',
        optionsNav: 'Opções',
        helpButton: 'Ajuda <kbd>H</kbd>',
        settingsButton: 'Configurações <kbd>O</kbd>',
        gameRole: 'jogo',
        gameLabel: 'Simon Swipe. Use as setas para tocar nas cores.',
        powerButton: 'Ligar ou desligar',
        panel: 'Painel do jogo',
        scoreboard: 'Placar',
        scoreGame: 'Jogo',
        scorePoints: 'Pontos',
        scoreBest: 'Recorde',
        scoreLevel: 'Nível',
        modesTitle: 'Jogos',
        learnName: 'Aprender comandos',
        learnHint: 'Tecla L · faça qualquer jogada e ouça o som dela',
        gameInstructions: 'Cada seta é uma cor do anel: cima verde, direita vermelho, baixo azul, esquerda amarelo. ' +
          'Toque: pressione a seta da cor. Deslize: segure a seta da cor inicial e pressione as próximas em ordem, ' +
          'sem soltar todas as teclas antes de terminar. Retorno: vá até o fim do caminho e volte pelas mesmas setas ' +
          'até a cor inicial. Enter começa o jogo selecionado, Esc volta ao menu, L abre o modo aprender comandos, ' +
          'I informa o placar, H abre a ajuda.',
        powerOverlayButton: 'Ligar o Simon Swipe',
        powerOverlayHint: 'Use as setas, o mouse ou o toque. Pressione H para ajuda.',
        close: 'Fechar',
        settingsTitle: 'Configurações',
        language: 'Idioma',
        volume: 'Volume',
        timeout: 'Tempo para cada jogada (ignorado no modo treino)',
        timeout5: '5 segundos (como o brinquedo)',
        timeout10: '10 segundos',
        timeout20: '20 segundos',
        timeoutNone: 'Sem limite',
        allowLift: 'Permitir soltar a tecla ou levantar o dedo no meio de um deslize',
        allowLiftHint: 'Para quem tem dificuldade motora. Desligado, soltar antes de terminar conta como erro, como no brinquedo.',
        directionCue: 'Indicar o sentido dos deslizes pelo som',
        directionCueHint: 'O som do deslize acompanha o caminho no anel: fica mais agudo ao passar pela cor de cima, ' +
          'mais grave pela de baixo, e vai para o lado esquerdo ou direito do fone. Assim deslizes como esquerda, cima ' +
          'e esquerda, baixo soam diferentes. Os toques na esquerda e na direita também saem do lado da cor. ' +
          'Desligado, os sons são iguais aos do brinquedo.',
        announceTurn: 'Avisar “Sua vez” no leitor de tela',
        training: 'Modo treino',
        trainingHint: 'O leitor de tela descreve cada sequência depois que ela toca, e não há limite de tempo para ' +
          'responder. Partidas de treino não contam para os recordes.',
        resetLevels: 'Reiniciar níveis',
        resetRecords: 'Apagar recordes',
        helpContent: `
      <h2 id="help-title">Como jogar</h2>

      <h3>O anel</h3>
      <p>O anel tem quatro cores. Cada uma corresponde a uma seta do teclado, na posição em que está no brinquedo:</p>
      <ul>
        <li><kbd>↑</kbd> cima: verde</li>
        <li><kbd>→</kbd> direita: vermelho</li>
        <li><kbd>↓</kbd> baixo: azul</li>
        <li><kbd>←</kbd> esquerda: amarelo</li>
      </ul>
      <p>As teclas W, A, S, D e o teclado numérico (8, 4, 2, 6) também funcionam.</p>

      <h3>Escolher um jogo</h3>
      <p>No menu, pressione a seta de uma cor para selecionar o jogo dela. Pressione a mesma seta de novo, ou Enter, para começar.</p>
      <ul>
        <li><strong>Clássico</strong> (cima, verde): só toques. A sequência cresce uma jogada a cada rodada.</li>
        <li><strong>Níveis</strong> (direita, vermelho): 16 níveis. O progresso fica salvo. Antes de cada nível, Simon toca um bipe para cada número do nível.</li>
        <li><strong>Extremo</strong> (baixo, azul): toques, deslizes e retornos desde o começo.</li>
        <li><strong>Festa</strong> (esquerda, amarelo): para vários jogadores. Depois de cada rodada certa toca a música de passar; entregue o aparelho e o próximo jogador toca em qualquer cor (ou pressiona qualquer seta) para continuar.</li>
      </ul>

      <h3>Jogadas</h3>
      <ul>
        <li><strong>Toque</strong>: um som curto. Pressione a seta da cor, ou toque nela.</li>
        <li><strong>Deslize</strong> (duplo, triplo ou quádruplo): o dedo passa por 2, 3 ou 4 cores vizinhas, em qualquer sentido. No teclado, segure a seta da cor inicial e pressione as próximas em ordem. Sempre mantenha pelo menos uma seta pressionada até o fim. Exemplo: segure <kbd>↑</kbd> e pressione <kbd>←</kbd> é um deslize de cima para a esquerda.</li>
        <li><strong>Retorno</strong> (deslize com volta): vá até o fim e volte pelo mesmo caminho até a cor inicial. Exemplo de retorno duplo: segure <kbd>↑</kbd>, pressione <kbd>→</kbd>, solte <kbd>↑</kbd> e pressione <kbd>↑</kbd> de novo, ainda segurando <kbd>→</kbd>.</li>
      </ul>
      <p>No toque ou mouse, deslize sem levantar o dedo. Soltar todas as teclas ou levantar o dedo antes de terminar o deslize conta como erro. Quem tem dificuldade motora pode desligar essa regra nas configurações.</p>
      <p>Cada cor tem seu próprio som, e cada tipo de jogada tem seu próprio padrão de som. O som de um deslize é o da cor onde ele começa.</p>
      <p>No brinquedo, um deslize soa igual nos dois sentidos (esquerda, cima e esquerda, baixo, por exemplo). Por isso, aqui o som acompanha o caminho: fica mais agudo ao passar pela cor de cima, mais grave pela de baixo, e vai para o lado esquerdo ou direito do fone. Os toques na esquerda e na direita também saem do lado da cor. Essa indicação pode ser desligada nas configurações.</p>

      <h3>Aprender comandos</h3>
      <p>No menu, pressione <kbd>L</kbd> ou o botão “Aprender comandos”. Faça qualquer toque ou deslize, com as setas, o mouse ou o dedo: quando você soltar, Simon toca o som daquela jogada e o leitor de tela descreve qual foi, por exemplo “Deslize duplo: cima, direita”. Se o caminho não for uma jogada do brinquedo, toca a buzina e o motivo é explicado. Nada é pontuado e não há limite de tempo. <kbd>Esc</kbd> (ou <kbd>L</kbd> de novo) sai do modo.</p>
      <p>Com leitor de tela no celular, ou com a opção de soltar no meio do deslize ligada, a jogada termina depois de uma pausa de um segundo sem tocar em nenhuma cor.</p>

      <h3>Modo treino</h3>
      <p>Ative nas configurações (<kbd>O</kbd>). Depois de cada sequência, o leitor de tela descreve as jogadas, e não há limite de tempo para responder. Partidas de treino não contam para os recordes.</p>

      <h3>Fim do jogo</h3>
      <p>Se errar ou demorar demais, toca a buzina. Depois Simon toca sua pontuação: um som de contagem para cada 10 pontos e um bipe para cada ponto restante. Se bater o recorde, toca a música de recorde.</p>

      <h3>Atalhos</h3>
      <ul>
        <li><kbd>Enter</kbd> ou <kbd>Espaço</kbd>: começar o jogo selecionado / continuar no modo Festa</li>
        <li><kbd>Esc</kbd>: interromper o jogo e voltar ao menu</li>
        <li><kbd>L</kbd>: entrar ou sair do modo aprender comandos</li>
        <li><kbd>P</kbd>: ligar ou desligar</li>
        <li><kbd>I</kbd>: ouvir o placar e o estado atual</li>
        <li><kbd>R</kbd>: repetir o último aviso</li>
        <li><kbd>+</kbd> e <kbd>-</kbd>: volume</li>
        <li><kbd>O</kbd>: configurações (incluindo o idioma) · <kbd>H</kbd>: esta ajuda</li>
      </ul>
      <p>Com leitor de tela (NVDA, JAWS), o jogo entra sozinho no modo de foco quando o anel está focado. Se as setas não responderem, pressione Tab até “Simon Swipe” ou ative o modo de foco (NVDA+Espaço).</p>

      <h3>Créditos</h3>
      <p>Sons da EG Public Library, de zseli22, publicada originalmente em keybase.pub/zseli22/EG_Public_library (o keybase.pub não existe mais). Simon e Simon Swipe são marcas da Hasbro; este é um projeto de fãs sem relação com a Hasbro.</p>`,
      },
    };
  }

  /* ------------------------------------------------------------------ */
  /* English                                                              */
  /* ------------------------------------------------------------------ */

  function english() {
    const colorNames = { green: 'green', red: 'red', blue: 'blue', yellow: 'yellow' };
    const directionNames = {
      ArrowUp: 'up', ArrowRight: 'right', ArrowDown: 'down', ArrowLeft: 'left',
    };
    const modeNames = {
      classic: 'Classic', levels: 'Levels', extreme: 'Extreme', party: 'Party', learn: 'Learn',
    };
    const modeDescriptions = {
      classic: 'Taps only. The sequence grows every round.',
      levels: '16 levels of taps and swipes that get harder.',
      extreme: 'Taps, swipes and U-turns from the start.',
      party: 'For several players: pass the device every round.',
    };
    const moveNames = {
      tap: 'tap',
      double: 'double swipe',
      doubleReverse: 'double U-turn swipe',
      triple: 'triple swipe',
      tripleReverse: 'triple U-turn swipe',
      quad: 'quad swipe',
      quadReverse: 'quad U-turn swipe',
    };

    return {
      htmlLang: 'en',
      languageName: 'English',
      colorNames,
      directionNames,
      modeNames,
      modeDescriptions,
      moveNames,

      powerOnButton: 'Turn on Simon Swipe',
      powerOffButton: 'Turn off',
      poweredOn(menuHint) {
        return 'Simon Swipe on. ' + menuHint;
      },
      poweredOff: 'Simon Swipe off. Press P or the center button to turn it on.',

      menuHint(modeList) {
        return 'Choose a game with the arrows: ' + modeList +
          '. Press the same arrow again, or Enter, to start. H opens the help.';
      },
      modeListItem(direction, mode) {
        return direction + ' ' + modeNames[mode];
      },
      modeButtonHint(direction, color) {
        return capitalize(direction) + ' arrow · ' + colorNames[color];
      },
      modeSelected(mode, direction) {
        return modeNames[mode] + ' selected. ' + modeDescriptions[mode] +
          ' Press ' + direction + ' again, or Enter, to start.';
      },
      modeStarting(mode, training) {
        return 'Starting ' + modeNames[mode] + '.' +
          (training ? ' Training mode: no time limit.' : '');
      },
      levelAnnounce(level, total) {
        return 'Level ' + level + ' of ' + total + '.';
      },
      levelUp(level) {
        return 'Level up! Now level ' + level + '.';
      },
      yourTurn: 'Your turn.',
      passIt: 'Pass it to the next player. Touch any color or press any arrow when you are ready.',
      failed: 'Wrong!',
      timeout: 'Time is up!',
      released: 'Released before finishing the swipe!',
      score(points) {
        return 'Score: ' + points + ' ' + plural(points, 'point', 'points') + '.';
      },
      highScore(points) {
        return 'New high score: ' + points + '!';
      },
      bestScore(points) {
        return 'High score: ' + points + '.';
      },
      stoppedAtLevel(level) {
        return 'You will continue from level ' + level + ' next time.';
      },
      win: 'You won! Congratulations!',
      levelsWin: 'You completed all 16 levels! Congratulations!',
      backToMenu: 'Back to the menu.',
      gameAborted: 'Game stopped.',
      volume(percent) {
        return 'Volume ' + percent + ' percent.';
      },
      statusSummary(parts) {
        return parts.join(' ');
      },
      describeMove(moveType, pathDirections) {
        if (moveType === 'tap') return 'tap ' + pathDirections[0];
        return moveNames[moveType] + ': ' + pathDirections.join(', ');
      },
      describePattern(descriptions) {
        return 'Sequence: ' + descriptions.join('; ') + '.';
      },
      learnStart: 'Learn mode. Make any tap or swipe: when you let go, ' +
        'Simon plays its sound and describes it. Escape leaves the mode.',
      learnExit: 'Leaving learn mode.',
      learnStatus: 'Learn mode. Make a tap or swipe to hear its sound. Escape leaves the mode.',
      learnMove(description) {
        return capitalize(description) + '.';
      },
      learnInvalid(error, directions) {
        const path = directions.join(', ');
        if (error === 'jump') {
          return 'Invalid move: ' + path + '. A swipe only goes through neighboring colors, without skipping any.';
        }
        return 'Invalid move: ' + path + '. A swipe goes one way through 2, 3 or 4 colors, ' +
          'or goes to the end and comes back the same way to the starting color.';
      },
      soundsLoading: 'Loading sounds…',
      soundsError: 'Some sounds did not load. Reload the page; if it keeps happening, see the README.',
      levelsReset: 'Levels progress reset. You are back to level 1.',
      recordsReset: 'High scores cleared.',
      languageChanged: 'Language: English.',
      languageAuto(name) {
        return 'Automatic, system language (' + name + ')';
      },

      status: {
        off: 'Off',
        menu: 'Choose a game',
        selected(mode) {
          return modeNames[mode] + ' selected — press again to start';
        },
        watching: 'Watch the sequence…',
        playing: 'Your turn',
        passing: 'Pass the device',
        result: 'Game over',
        learning: 'Learn mode — make a move (Escape leaves)',
      },

      ui: {
        docTitle: 'Accessible Simon Swipe',
        metaDescription: 'Accessible version of the Simon Swipe game for keyboard, mouse, touch and screen readers.',
        skipLink: 'Skip to the game',
        titleTag: 'accessible',
        optionsNav: 'Options',
        helpButton: 'Help <kbd>H</kbd>',
        settingsButton: 'Settings <kbd>O</kbd>',
        gameRole: 'game',
        gameLabel: 'Simon Swipe. Use the arrow keys to touch the colors.',
        powerButton: 'Turn on or off',
        panel: 'Game panel',
        scoreboard: 'Scoreboard',
        scoreGame: 'Game',
        scorePoints: 'Points',
        scoreBest: 'High score',
        scoreLevel: 'Level',
        modesTitle: 'Games',
        learnName: 'Learn the moves',
        learnHint: 'L key · make any move and hear its sound',
        gameInstructions: 'Each arrow is a color of the ring: up green, right red, down blue, left yellow. ' +
          'Tap: press the color\'s arrow. Swipe: hold the starting color\'s arrow and press the next ones in order, ' +
          'without releasing every key before the end. U-turn: go to the end of the path and come back through the ' +
          'same arrows to the starting color. Enter starts the selected game, Escape goes back to the menu, L opens ' +
          'learn mode, I reads the score, H opens the help.',
        powerOverlayButton: 'Turn on Simon Swipe',
        powerOverlayHint: 'Use the arrow keys, the mouse or touch. Press H for help.',
        close: 'Close',
        settingsTitle: 'Settings',
        language: 'Language',
        volume: 'Volume',
        timeout: 'Time for each move (ignored in training mode)',
        timeout5: '5 seconds (like the toy)',
        timeout10: '10 seconds',
        timeout20: '20 seconds',
        timeoutNone: 'No limit',
        allowLift: 'Allow releasing the key or lifting the finger in the middle of a swipe',
        allowLiftHint: 'For players with motor difficulties. When off, releasing before the end counts as a mistake, like on the toy.',
        directionCue: 'Show the direction of swipes through sound',
        directionCueHint: 'The swipe sound follows the path on the ring: it gets higher on the top color, lower on ' +
          'the bottom one, and moves to the left or right side of the headphones. This makes swipes such as left, up ' +
          'and left, down sound different. Taps on the left and right colors also come from their side. ' +
          'When off, the sounds are the same as the toy\'s.',
        announceTurn: 'Announce “Your turn” on the screen reader',
        training: 'Training mode',
        trainingHint: 'The screen reader describes each sequence after it plays, and there is no time limit to ' +
          'answer. Training games do not count for high scores.',
        resetLevels: 'Reset levels',
        resetRecords: 'Clear high scores',
        helpContent: `
      <h2 id="help-title">How to play</h2>

      <h3>The ring</h3>
      <p>The ring has four colors. Each one matches an arrow key, in the position it has on the toy:</p>
      <ul>
        <li><kbd>↑</kbd> up: green</li>
        <li><kbd>→</kbd> right: red</li>
        <li><kbd>↓</kbd> down: blue</li>
        <li><kbd>←</kbd> left: yellow</li>
      </ul>
      <p>The W, A, S, D keys and the numeric keypad (8, 4, 2, 6) work too.</p>

      <h3>Choosing a game</h3>
      <p>In the menu, press a color's arrow to select its game. Press the same arrow again, or Enter, to start.</p>
      <ul>
        <li><strong>Classic</strong> (up, green): taps only. The sequence grows by one move every round.</li>
        <li><strong>Levels</strong> (right, red): 16 levels. Progress is saved. Before each level, Simon plays one beep for each number of the level.</li>
        <li><strong>Extreme</strong> (down, blue): taps, swipes and U-turns from the start.</li>
        <li><strong>Party</strong> (left, yellow): for several players. After each correct round the passing music plays; hand over the device and the next player touches any color (or presses any arrow) to continue.</li>
      </ul>

      <h3>Moves</h3>
      <ul>
        <li><strong>Tap</strong>: a short sound. Press the color's arrow, or touch it.</li>
        <li><strong>Swipe</strong> (double, triple or quad): the finger goes through 2, 3 or 4 neighboring colors, in either direction. On the keyboard, hold the starting color's arrow and press the next ones in order. Always keep at least one arrow held until the end. Example: holding <kbd>↑</kbd> and pressing <kbd>←</kbd> is a swipe from up to left.</li>
        <li><strong>U-turn</strong> (swipe and back): go to the end and come back the same way to the starting color. Double U-turn example: hold <kbd>↑</kbd>, press <kbd>→</kbd>, release <kbd>↑</kbd> and press <kbd>↑</kbd> again, still holding <kbd>→</kbd>.</li>
      </ul>
      <p>With touch or the mouse, swipe without lifting your finger. Releasing every key or lifting the finger before finishing the swipe counts as a mistake. Players with motor difficulties can turn this rule off in the settings.</p>
      <p>Each color has its own sound, and each kind of move has its own sound pattern. A swipe's sound is the one of the color where it starts.</p>
      <p>On the toy, a swipe sounds the same in both directions (left, up and left, down, for example). So here the sound follows the path: it gets higher on the top color, lower on the bottom one, and moves to the left or right side of the headphones. Taps on the left and right colors also come from their side. This cue can be turned off in the settings.</p>

      <h3>Learn the moves</h3>
      <p>In the menu, press <kbd>L</kbd> or the “Learn the moves” button. Make any tap or swipe with the arrows, the mouse or your finger: when you let go, Simon plays that move's sound and the screen reader says which one it was, for example “Double swipe: up, right”. If the path is not a move of the toy, the buzzer sounds and the reason is explained. Nothing is scored and there is no time limit. <kbd>Esc</kbd> (or <kbd>L</kbd> again) leaves the mode.</p>
      <p>With a screen reader on a phone, or with the option to release mid-swipe turned on, a move ends after a one-second pause without touching any color.</p>

      <h3>Training mode</h3>
      <p>Turn it on in the settings (<kbd>O</kbd>). After each sequence, the screen reader describes the moves, and there is no time limit to answer. Training games do not count for high scores.</p>

      <h3>Game over</h3>
      <p>If you make a mistake or take too long, the buzzer sounds. Then Simon plays your score: one counting sound for every 10 points and one beep for each remaining point. If you beat the high score, the high score music plays.</p>

      <h3>Shortcuts</h3>
      <ul>
        <li><kbd>Enter</kbd> or <kbd>Space</kbd>: start the selected game / continue in Party mode</li>
        <li><kbd>Esc</kbd>: stop the game and go back to the menu</li>
        <li><kbd>L</kbd>: enter or leave learn mode</li>
        <li><kbd>P</kbd>: turn on or off</li>
        <li><kbd>I</kbd>: hear the score and current state</li>
        <li><kbd>R</kbd>: repeat the last message</li>
        <li><kbd>+</kbd> and <kbd>-</kbd>: volume</li>
        <li><kbd>O</kbd>: settings (including the language) · <kbd>H</kbd>: this help</li>
      </ul>
      <p>With a screen reader (NVDA, JAWS), the game switches to focus mode by itself when the ring has focus. If the arrows do not respond, press Tab until “Simon Swipe” or turn on focus mode (NVDA+Space).</p>

      <h3>Credits</h3>
      <p>Sounds from the EG Public Library by zseli22, originally published at keybase.pub/zseli22/EG_Public_library (keybase.pub no longer exists). Simon and Simon Swipe are trademarks of Hasbro; this is a fan project not affiliated with Hasbro.</p>`,
      },
    };
  }

  /* ------------------------------------------------------------------ */
  /* Español                                                              */
  /* ------------------------------------------------------------------ */

  function spanish() {
    const colorNames = { green: 'verde', red: 'rojo', blue: 'azul', yellow: 'amarillo' };
    const directionNames = {
      ArrowUp: 'arriba', ArrowRight: 'derecha', ArrowDown: 'abajo', ArrowLeft: 'izquierda',
    };
    const modeNames = {
      classic: 'Clásico', levels: 'Niveles', extreme: 'Extremo', party: 'Fiesta', learn: 'Aprender',
    };
    const modeDescriptions = {
      classic: 'Solo toques. La secuencia crece en cada ronda.',
      levels: '16 niveles de toques y deslizamientos cada vez más difíciles.',
      extreme: 'Toques, deslizamientos y retornos desde el principio.',
      party: 'Para varios jugadores: pasa el dispositivo en cada ronda.',
    };
    const moveNames = {
      tap: 'toque',
      double: 'deslizamiento doble',
      doubleReverse: 'deslizamiento doble con retorno',
      triple: 'deslizamiento triple',
      tripleReverse: 'deslizamiento triple con retorno',
      quad: 'deslizamiento cuádruple',
      quadReverse: 'deslizamiento cuádruple con retorno',
    };

    return {
      htmlLang: 'es',
      languageName: 'Español',
      colorNames,
      directionNames,
      modeNames,
      modeDescriptions,
      moveNames,

      powerOnButton: 'Encender Simon Swipe',
      powerOffButton: 'Apagar',
      poweredOn(menuHint) {
        return 'Simon Swipe encendido. ' + menuHint;
      },
      poweredOff: 'Simon Swipe apagado. Pulsa P o el botón central para encenderlo.',

      menuHint(modeList) {
        return 'Elige un juego con las flechas: ' + modeList +
          '. Pulsa la misma flecha otra vez, o Enter, para empezar. H abre la ayuda.';
      },
      modeListItem(direction, mode) {
        return direction + ' ' + modeNames[mode];
      },
      modeButtonHint(direction, color) {
        return 'Flecha ' + direction + ' · ' + colorNames[color];
      },
      modeSelected(mode, direction) {
        return 'Juego ' + modeNames[mode] + ' seleccionado. ' + modeDescriptions[mode] +
          ' Pulsa ' + direction + ' otra vez, o Enter, para empezar.';
      },
      modeStarting(mode, training) {
        return 'Empezando ' + modeNames[mode] + '.' +
          (training ? ' Modo entrenamiento: sin límite de tiempo.' : '');
      },
      levelAnnounce(level, total) {
        return 'Nivel ' + level + ' de ' + total + '.';
      },
      levelUp(level) {
        return '¡Subiste de nivel! Ahora nivel ' + level + '.';
      },
      yourTurn: 'Tu turno.',
      passIt: 'Pásalo al siguiente jugador. Toca cualquier color o pulsa cualquier flecha cuando estés listo.',
      failed: '¡Fallaste!',
      timeout: '¡Se acabó el tiempo!',
      released: '¡Soltaste antes de terminar el deslizamiento!',
      score(points) {
        return 'Puntuación: ' + points + ' ' + plural(points, 'punto', 'puntos') + '.';
      },
      highScore(points) {
        return '¡Nuevo récord: ' + points + '!';
      },
      bestScore(points) {
        return 'Récord: ' + points + '.';
      },
      stoppedAtLevel(level) {
        return 'La próxima vez continuarás desde el nivel ' + level + '.';
      },
      win: '¡Ganaste! ¡Felicidades!',
      levelsWin: '¡Completaste los 16 niveles! ¡Felicidades!',
      backToMenu: 'Volviendo al menú.',
      gameAborted: 'Juego interrumpido.',
      volume(percent) {
        return 'Volumen ' + percent + ' por ciento.';
      },
      statusSummary(parts) {
        return parts.join(' ');
      },
      describeMove(moveType, pathDirections) {
        if (moveType === 'tap') return 'toque ' + pathDirections[0];
        return moveNames[moveType] + ': ' + pathDirections.join(', ');
      },
      describePattern(descriptions) {
        return 'Secuencia: ' + descriptions.join('; ') + '.';
      },
      learnStart: 'Modo aprender. Haz cualquier toque o deslizamiento: al soltar, ' +
        'Simon toca su sonido y lo describe. Escape sale del modo.',
      learnExit: 'Saliendo del modo aprender.',
      learnStatus: 'Modo aprender. Haz un toque o deslizamiento para oír su sonido. Escape sale del modo.',
      learnMove(description) {
        return capitalize(description) + '.';
      },
      learnInvalid(error, directions) {
        const path = directions.join(', ');
        if (error === 'jump') {
          return 'Jugada no válida: ' + path + '. El deslizamiento solo pasa por colores vecinos, sin saltar ninguno.';
        }
        return 'Jugada no válida: ' + path + '. Un deslizamiento va en un solo sentido por 2, 3 o 4 colores, ' +
          'o va hasta el final y vuelve por el mismo camino hasta el color inicial.';
      },
      soundsLoading: 'Cargando sonidos…',
      soundsError: 'Algunos sonidos no se cargaron. Recarga la página; si sigue pasando, consulta el README.',
      levelsReset: 'Progreso de niveles reiniciado. Vuelves al nivel 1.',
      recordsReset: 'Récords borrados.',
      languageChanged: 'Idioma: Español.',
      languageAuto(name) {
        return 'Automático, idioma del sistema (' + name + ')';
      },

      status: {
        off: 'Apagado',
        menu: 'Elige un juego',
        selected(mode) {
          return 'Juego ' + modeNames[mode] + ' seleccionado — pulsa otra vez para empezar';
        },
        watching: 'Observa la secuencia…',
        playing: 'Tu turno',
        passing: 'Pasa el dispositivo',
        result: 'Fin del juego',
        learning: 'Modo aprender — haz una jugada (Escape sale)',
      },

      ui: {
        docTitle: 'Simon Swipe Accesible',
        metaDescription: 'Versión accesible del juego Simon Swipe para teclado, ratón, pantalla táctil y lectores de pantalla.',
        skipLink: 'Ir al juego',
        titleTag: 'accesible',
        optionsNav: 'Opciones',
        helpButton: 'Ayuda <kbd>H</kbd>',
        settingsButton: 'Configuración <kbd>O</kbd>',
        gameRole: 'juego',
        gameLabel: 'Simon Swipe. Usa las flechas para tocar los colores.',
        powerButton: 'Encender o apagar',
        panel: 'Panel del juego',
        scoreboard: 'Marcador',
        scoreGame: 'Juego',
        scorePoints: 'Puntos',
        scoreBest: 'Récord',
        scoreLevel: 'Nivel',
        modesTitle: 'Juegos',
        learnName: 'Aprender jugadas',
        learnHint: 'Tecla L · haz cualquier jugada y oye su sonido',
        gameInstructions: 'Cada flecha es un color del anillo: arriba verde, derecha rojo, abajo azul, izquierda amarillo. ' +
          'Toque: pulsa la flecha del color. Deslizamiento: mantén la flecha del color inicial y pulsa las siguientes en ' +
          'orden, sin soltar todas las teclas antes de terminar. Retorno: ve hasta el final del camino y vuelve por las ' +
          'mismas flechas hasta el color inicial. Enter empieza el juego seleccionado, Escape vuelve al menú, L abre el ' +
          'modo aprender jugadas, I dice el marcador, H abre la ayuda.',
        powerOverlayButton: 'Encender Simon Swipe',
        powerOverlayHint: 'Usa las flechas, el ratón o la pantalla táctil. Pulsa H para ver la ayuda.',
        close: 'Cerrar',
        settingsTitle: 'Configuración',
        language: 'Idioma',
        volume: 'Volumen',
        timeout: 'Tiempo para cada jugada (no se usa en el modo entrenamiento)',
        timeout5: '5 segundos (como el juguete)',
        timeout10: '10 segundos',
        timeout20: '20 segundos',
        timeoutNone: 'Sin límite',
        allowLift: 'Permitir soltar la tecla o levantar el dedo en medio de un deslizamiento',
        allowLiftHint: 'Para quien tiene dificultades motoras. Desactivado, soltar antes de terminar cuenta como error, como en el juguete.',
        directionCue: 'Indicar el sentido de los deslizamientos con el sonido',
        directionCueHint: 'El sonido del deslizamiento sigue el camino en el anillo: se vuelve más agudo al pasar por ' +
          'el color de arriba, más grave por el de abajo, y va al lado izquierdo o derecho de los auriculares. Así, ' +
          'deslizamientos como izquierda, arriba e izquierda, abajo suenan distintos. Los toques en la izquierda y la ' +
          'derecha también suenan de su lado. Desactivado, los sonidos son iguales a los del juguete.',
        announceTurn: 'Avisar “Tu turno” en el lector de pantalla',
        training: 'Modo entrenamiento',
        trainingHint: 'El lector de pantalla describe cada secuencia después de que suena, y no hay límite de tiempo ' +
          'para responder. Las partidas de entrenamiento no cuentan para los récords.',
        resetLevels: 'Reiniciar niveles',
        resetRecords: 'Borrar récords',
        helpContent: `
      <h2 id="help-title">Cómo jugar</h2>

      <h3>El anillo</h3>
      <p>El anillo tiene cuatro colores. Cada uno corresponde a una flecha del teclado, en la posición que tiene en el juguete:</p>
      <ul>
        <li><kbd>↑</kbd> arriba: verde</li>
        <li><kbd>→</kbd> derecha: rojo</li>
        <li><kbd>↓</kbd> abajo: azul</li>
        <li><kbd>←</kbd> izquierda: amarillo</li>
      </ul>
      <p>Las teclas W, A, S, D y el teclado numérico (8, 4, 2, 6) también funcionan.</p>

      <h3>Elegir un juego</h3>
      <p>En el menú, pulsa la flecha de un color para seleccionar su juego. Pulsa la misma flecha otra vez, o Enter, para empezar.</p>
      <ul>
        <li><strong>Clásico</strong> (arriba, verde): solo toques. La secuencia crece una jugada en cada ronda.</li>
        <li><strong>Niveles</strong> (derecha, rojo): 16 niveles. El progreso se guarda. Antes de cada nivel, Simon toca un pitido por cada número del nivel.</li>
        <li><strong>Extremo</strong> (abajo, azul): toques, deslizamientos y retornos desde el principio.</li>
        <li><strong>Fiesta</strong> (izquierda, amarillo): para varios jugadores. Después de cada ronda correcta suena la música para pasar; entrega el dispositivo y el siguiente jugador toca cualquier color (o pulsa cualquier flecha) para continuar.</li>
      </ul>

      <h3>Jugadas</h3>
      <ul>
        <li><strong>Toque</strong>: un sonido corto. Pulsa la flecha del color, o tócalo.</li>
        <li><strong>Deslizamiento</strong> (doble, triple o cuádruple): el dedo pasa por 2, 3 o 4 colores vecinos, en cualquier sentido. En el teclado, mantén la flecha del color inicial y pulsa las siguientes en orden. Mantén siempre al menos una flecha pulsada hasta el final. Ejemplo: mantener <kbd>↑</kbd> y pulsar <kbd>←</kbd> es un deslizamiento de arriba a la izquierda.</li>
        <li><strong>Retorno</strong> (deslizamiento de ida y vuelta): ve hasta el final y vuelve por el mismo camino hasta el color inicial. Ejemplo de retorno doble: mantén <kbd>↑</kbd>, pulsa <kbd>→</kbd>, suelta <kbd>↑</kbd> y pulsa <kbd>↑</kbd> otra vez, sin soltar <kbd>→</kbd>.</li>
      </ul>
      <p>Con la pantalla táctil o el ratón, desliza sin levantar el dedo. Soltar todas las teclas o levantar el dedo antes de terminar el deslizamiento cuenta como error. Quien tiene dificultades motoras puede desactivar esta regla en la configuración.</p>
      <p>Cada color tiene su propio sonido, y cada tipo de jugada tiene su propio patrón de sonido. El sonido de un deslizamiento es el del color donde empieza.</p>
      <p>En el juguete, un deslizamiento suena igual en los dos sentidos (izquierda, arriba e izquierda, abajo, por ejemplo). Por eso, aquí el sonido sigue el camino: se vuelve más agudo al pasar por el color de arriba, más grave por el de abajo, y va al lado izquierdo o derecho de los auriculares. Los toques en la izquierda y la derecha también suenan de su lado. Esta indicación se puede desactivar en la configuración.</p>

      <h3>Aprender jugadas</h3>
      <p>En el menú, pulsa <kbd>L</kbd> o el botón “Aprender jugadas”. Haz cualquier toque o deslizamiento con las flechas, el ratón o el dedo: al soltar, Simon toca el sonido de esa jugada y el lector de pantalla dice cuál fue, por ejemplo “Deslizamiento doble: arriba, derecha”. Si el camino no es una jugada del juguete, suena la bocina y se explica el motivo. No se puntúa nada y no hay límite de tiempo. <kbd>Esc</kbd> (o <kbd>L</kbd> otra vez) sale del modo.</p>
      <p>Con lector de pantalla en el móvil, o con la opción de soltar en medio del deslizamiento activada, la jugada termina tras una pausa de un segundo sin tocar ningún color.</p>

      <h3>Modo entrenamiento</h3>
      <p>Actívalo en la configuración (<kbd>O</kbd>). Después de cada secuencia, el lector de pantalla describe las jugadas, y no hay límite de tiempo para responder. Las partidas de entrenamiento no cuentan para los récords.</p>

      <h3>Fin del juego</h3>
      <p>Si fallas o tardas demasiado, suena la bocina. Después Simon toca tu puntuación: un sonido de conteo por cada 10 puntos y un pitido por cada punto restante. Si superas el récord, suena la música de récord.</p>

      <h3>Atajos</h3>
      <ul>
        <li><kbd>Enter</kbd> o <kbd>Espacio</kbd>: empezar el juego seleccionado / continuar en el modo Fiesta</li>
        <li><kbd>Esc</kbd>: interrumpir el juego y volver al menú</li>
        <li><kbd>L</kbd>: entrar o salir del modo aprender jugadas</li>
        <li><kbd>P</kbd>: encender o apagar</li>
        <li><kbd>I</kbd>: oír el marcador y el estado actual</li>
        <li><kbd>R</kbd>: repetir el último aviso</li>
        <li><kbd>+</kbd> y <kbd>-</kbd>: volumen</li>
        <li><kbd>O</kbd>: configuración (incluido el idioma) · <kbd>H</kbd>: esta ayuda</li>
      </ul>
      <p>Con lector de pantalla (NVDA, JAWS), el juego entra solo en el modo de foco cuando el anillo tiene el foco. Si las flechas no responden, pulsa Tab hasta “Simon Swipe” o activa el modo de foco (NVDA+Espacio).</p>

      <h3>Créditos</h3>
      <p>Sonidos de la EG Public Library, de zseli22, publicada originalmente en keybase.pub/zseli22/EG_Public_library (keybase.pub ya no existe). Simon y Simon Swipe son marcas de Hasbro; este es un proyecto de fans sin relación con Hasbro.</p>`,
      },
    };
  }

  /* ------------------------------------------------------------------ */
  /* Language switching                                                   */
  /* ------------------------------------------------------------------ */

  const PACKS = { pt: portuguese(), en: english(), es: spanish() };
  const SUPPORTED = Object.keys(PACKS);
  /* Used when the system language is none of the supported ones. */
  const FALLBACK = 'en';

  const STRINGS = (SimonSwipe.STRINGS = {});

  /* First supported language in the browser / system preferences. */
  function detect() {
    const preferred = (navigator.languages && navigator.languages.length)
      ? navigator.languages
      : [navigator.language || ''];
    for (const tag of preferred) {
      const base = String(tag).toLowerCase().split('-')[0];
      if (SUPPORTED.includes(base)) return base;
    }
    return FALLBACK;
  }

  function translateDocument(pack) {
    const ui = pack.ui;
    document.documentElement.lang = pack.htmlLang;
    document.title = ui.docTitle;
    const description = document.querySelector('meta[name="description"]');
    if (description) description.setAttribute('content', ui.metaDescription);

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const text = ui[el.dataset.i18n];
      if (text != null) el.textContent = text;
    });
    document.querySelectorAll('[data-i18n-html]').forEach((el) => {
      const html = ui[el.dataset.i18nHtml];
      if (html != null) el.innerHTML = html;
    });
    document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
      el.dataset.i18nAttr.split(',').forEach((pair) => {
        const [attr, key] = pair.split(':').map((part) => part.trim());
        if (ui[key] != null) el.setAttribute(attr, ui[key]);
      });
    });
  }

  SimonSwipe.I18n = {
    SUPPORTED,
    detect,

    /* 'auto' (or anything unknown) follows the system language. */
    resolve(setting) {
      return SUPPORTED.includes(setting) ? setting : detect();
    },

    /* Active language code. */
    current: null,

    packFor(code) {
      return PACKS[code];
    },

    /* Switches every text to `setting` ('auto', 'pt', 'en' or 'es'). */
    apply(setting) {
      const code = this.resolve(setting);
      const pack = PACKS[code];
      this.current = code;
      Object.keys(STRINGS).forEach((key) => delete STRINGS[key]);
      Object.assign(STRINGS, pack);
      if (document.readyState !== 'loading') translateDocument(pack);
      return code;
    },
  };

  /* Usable right away; main.js applies the saved setting on boot. */
  SimonSwipe.I18n.apply('auto');
})();
