# Simon Swipe JS

Versão acessível do brinquedo Simon Swipe para navegador (computador e celular), feita para jogadores cegos, com baixa visão e que enxergam. Funciona com teclado, mouse, toque e leitores de tela (NVDA, JAWS, VoiceOver, TalkBack).

## Como rodar

Basta abrir o `index.html` no navegador. Também dá para rodar por um servidor local:

```bash
node serve.js
```

Depois abra <http://localhost:8080>. Qualquer outro servidor estático (como o Live Server do VS Code) também funciona.

Os sons usam Web Audio (howler.js). Aberto direto do disco (`file://`), o navegador bloqueia o carregamento dos arquivos `.ogg` pelo Web Audio, então o jogo carrega os mesmos sons embutidos em [`js/sound-data.js`](js/sound-data.js). Esse arquivo é gerado a partir da pasta `sounds/`; depois de adicionar ou trocar um som, gere de novo:

```bash
node tools/build-sound-data.js
```

## Controles

| Ação | Teclado | Mouse / toque |
| --- | --- | --- |
| Cores do anel | ↑ verde · → vermelho · ↓ azul · ← amarelo (também WASD e o teclado numérico 8/6/2/4) | tocar ou clicar na cor |
| Toque | pressionar a seta da cor | tocar na cor |
| Deslize | segurar a seta inicial e pressionar as próximas em ordem, sem soltar todas antes do fim (segurar ↑ e pressionar ← = de cima para a esquerda) | deslizar o dedo pelas cores sem levantar |
| Retorno (U-turn) | ir até o fim e voltar pelas mesmas setas até a cor inicial | deslizar e voltar até a cor inicial |
| Escolher jogo | seta da cor do jogo; a mesma seta de novo, ou Enter, começa | tocar na cor duas vezes, ou usar os botões de jogo |
| Menu / ligar | Esc volta ao menu · P liga e desliga | botão central |
| Outros | L aprender comandos · I placar · R repete o aviso · + / - volume · O configurações · H ajuda | |

Soltar todas as teclas ou levantar o dedo no meio de um deslize conta como erro, como no brinquedo. Nas configurações há uma opção de acessibilidade motora que permite soltar e terminar o deslize cor por cor.

## Jogos

| Cor | Jogo | Regras |
| --- | --- | --- |
| Verde (↑) | Clássico | Só toques. A sequência cresce a cada rodada. |
| Vermelho (→) | Níveis | 16 níveis com o progresso salvo. Antes de cada nível, um bipe para cada número do nível. |
| Azul (↓) | Extremo | Toques, deslizes e retornos desde o começo. |
| Amarelo (←) | Festa | Vários jogadores. A música de passar toca até o próximo jogador tocar em uma cor. |

Quando o jogo acaba (erro, tempo esgotado ou vitória), Simon toca a pontuação: o som de contagem para cada 10 pontos e um bipe para cada ponto restante. Se for recorde, toca a música de recorde.

## Aprender comandos

No menu, pressione L ou o botão "Aprender comandos". Faça qualquer toque ou deslize: ao soltar, Simon toca o som da jogada e o leitor de tela a descreve. Caminhos que não são jogadas do brinquedo tocam a buzina com a explicação. Esc ou L saem do modo. Com leitor de tela no celular, ou com a opção de soltar no meio do deslize, a jogada termina após 1 segundo sem toques.

## Modo treino

Nas configurações (tecla O). O leitor de tela descreve cada sequência depois que ela toca e não há limite de tempo para responder. Partidas de treino não contam para os recordes.

## Sentido dos deslizes pelo som

No brinquedo, um deslize soa igual nos dois sentidos (esquerda, cima e esquerda, baixo, por exemplo), então só dá para diferenciá-los olhando. Para jogar só pelo som, o som do deslize acompanha o caminho no anel: fica mais agudo ao passar pela cor de cima, mais grave pela de baixo, e vai para o lado esquerdo ou direito do fone. Os arquivos de som são os mesmos; o efeito é aplicado na hora. A opção fica nas configurações (ligada por padrão) e a intensidade em `directionCue`, no [`js/config.js`](js/config.js).

## Ajustes finos

Todas as regras e tempos que imitam o brinquedo ficam em [`js/config.js`](js/config.js): posição das cores, cor de cada jogo, pontuação de vitória, níveis, intervalos entre os sons e tempo de resposta.

## Créditos

Os sons vêm da **EG Public Library**, a biblioteca de sons de altíssima qualidade gravada e organizada por **zseli22**. Muito obrigado pelo trabalho de preservação!

- Endereço original: <https://keybase.pub/zseli22/EG_Public_library/>. O keybase.pub foi desligado e o link não funciona mais. Os arquivos foram extraídos com o aplicativo do Keybase para Windows, onde a pasta pública ainda pode ser acessada.
- Os sons de vermelho, amarelo e verde, dos jogos e gerais foram convertidos de FLAC para OGG com o ffmpeg, sem outras alterações.

Simon e Simon Swipe são marcas da Hasbro. Este é um projeto de fãs, sem fins lucrativos e sem relação com a Hasbro.

## Estrutura

- `js/config.js`: regras, layout e tempos
- `js/strings.js`: textos em português
- `js/audio.js`: carregamento e reprodução dos sons (howler.js)
- `js/moves.js`: geração das jogadas (toque, deslizes, retornos)
- `js/input.js`: teclado, mouse, toque e ativação por leitor de tela
- `js/game.js`: estados do jogo, modos e pontuação
- `js/ui.js`: anel de luzes e placar
- `js/announcer.js`: avisos para o leitor de tela
- `sounds/`: sons originais convertidos para OGG
