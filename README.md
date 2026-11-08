# Simon Swipe JS

Versão acessível do brinquedo Simon Swipe para navegador (computador e celular), feita para jogadores cegos, com baixa visão e que enxergam. Funciona com teclado, mouse, toque e leitores de tela (NVDA, JAWS, VoiceOver, TalkBack).

## Como rodar

Os sons usam Web Audio (howler.js), que precisa de um servidor local. Abrir o `index.html` direto do disco pode falhar.

```bash
node serve.js
```

Depois abra <http://localhost:8080>. Qualquer outro servidor estático (como o Live Server do VS Code) também funciona.

## Controles

| Ação | Teclado | Mouse / toque |
| --- | --- | --- |
| Cores do anel | ↑ verde · → vermelho · ↓ azul · ← amarelo (também WASD e o teclado numérico 8/6/2/4) | tocar ou clicar na cor |
| Toque | pressionar a seta da cor | tocar na cor |
| Deslize | pressionar as setas do caminho em ordem, segurando a última (↑ e depois segurar ← = de cima para a esquerda) | deslizar o dedo pelas cores |
| Retorno (U-turn) | ir até o fim e voltar pelas mesmas setas (↑ → segurar ↑) | deslizar e voltar até a cor inicial |
| Escolher jogo | seta da cor do jogo; a mesma seta de novo, ou Enter, começa | tocar na cor duas vezes, ou usar os botões de jogo |
| Menu / ligar | Esc volta ao menu · P liga e desliga | botão central |
| Outros | I placar · R repete o aviso · + / - volume · O configurações · H ajuda | |

## Jogos

| Cor | Jogo | Regras |
| --- | --- | --- |
| Verde (↑) | Clássico | Só toques. A sequência cresce a cada rodada. |
| Vermelho (→) | Níveis | 16 níveis com o progresso salvo. Antes de cada nível, um bipe para cada número do nível. |
| Azul (↓) | Extremo | Toques, deslizes e retornos desde o começo. |
| Amarelo (←) | Festa | Vários jogadores. A música de passar toca até o próximo jogador tocar em uma cor. |

Quando o jogo acaba (erro, tempo esgotado ou vitória), Simon toca a pontuação: o som de contagem para cada 10 pontos e um bipe para cada ponto restante. Se for recorde, toca a música de recorde.

## Ajustes finos

Todas as regras e tempos que imitam o brinquedo ficam em [`js/config.js`](js/config.js): posição das cores, cor de cada jogo, pontuação de vitória, níveis, intervalos entre os sons e tempo de resposta.

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
