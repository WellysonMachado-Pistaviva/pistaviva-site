# Índice Nacional de Passagem — estratégia, 08/10/2026

## A inversão

O mapa da Rota Biker mostra **onde alguém decidiu erguer um monumento**. Quem
decide é quem paga: a adesão é voluntária, em propriedade privada, custeada pelo
dono do estabelecimento. O mapa é, portanto, o retrato de 43 decisões privadas.

A inversão: medir **por onde o mototurismo realmente circula** e mostrar, para
cada município do Brasil, se essa circulação encontra alguma parada. Deixa de
ser um catálogo de quem já está e vira um diagnóstico de quem está de fora.

Essa é a diferença entre um mapa que se consulta e um mapa em que se quer
entrar.

## O que foi medido

A rede não é uma rota, é uma malha. Liguei cada monumento aos **cinco vizinhos
mais próximos por estrada**, o que dá **140 corredores reais** roteados no OSRM
— não linhas retas. Depois varri cada corredor a cada 100 metros contra a malha
municipal do IBGE.

Para cada um dos 5.564 municípios ficaram três números:

| Métrica | O que é |
|---|---|
| **Passagem** | quantos dos 140 corredores cruzam o município (0 a 12) |
| **Distância** | km até o monumento mais próximo |
| **Situação** | o cruzamento dos dois |

## O retrato

- **1.078 municípios** são cruzados por pelo menos um corredor — o dobro dos 511
  do roteiro único, porque a malha é mais larga que qualquer viagem.
- **42** têm monumento.
- **3.055 municípios (55% do Brasil)** estão a mais de 150 km de qualquer
  monumento. Pela régua da própria associação, são todos elegíveis.

## Os quatro quadrantes

| Situação | Municípios | Definição |
|---|---|---|
| Corredor servido | 221 | 3+ corredores, monumento a menos de 80 km |
| **Corredor cego** | **177** | **3+ corredores, monumento a 80 km ou mais** |
| Margem da rede | 638 | 1 ou 2 corredores |
| Vazio | 2.976 | pouca passagem e longe de tudo |

O **corredor cego** é o produto. São municípios por onde a rede já passa, com
volume, e onde nada segura o viajante.

## Os três achados

**1. A Grande BH está na malha e não tem nada.**
Belo Horizonte, Contagem e Betim são cruzadas por **8 corredores cada** — o
máximo da escala é 12. O monumento mais próximo está a **112–128 km**. A
terceira maior região metropolitana do país é passagem obrigatória da rede e
não tem um único ponto.

**2. O corredor Bahia–Sergipe é um vazio de 600 km.**
Feira de Santana, Alagoinhas, Estância, São Cristóvão e mais uma dúzia de
municípios são cruzados por **5 corredores** cada, com o monumento mais próximo
entre **470 e 600 km**. É o caminho obrigatório de quem vai ao Nordeste, e não
há nada nele.

**3. Estados inteiros com passagem e zero monumentos.**

| UF | municípios cruzados | monumentos | em corredor cego |
|---|---|---|---|
| MG | 199 | 4 | 61 |
| AL | 20 | **0** | 20 |
| SE | 17 | **0** | 17 |
| PE | 20 | **0** | 12 |
| ES | 26 | **0** | 0 |
| RJ | 13 | **0** | 0 |

Minas é o caso mais gritante: **199 municípios cruzados, 4 monumentos**.

## Por que prefeitura responde a isso

Prefeitura não reage a mapa. Reage a três coisas, nesta ordem:

1. **Ver-se medido.** Um número atribuído ao município, que ela não controla e
   não encomendou, com método publicado.
2. **Ver o vizinho.** Ranking estadual. "Pouso Alegre tem 6 corredores e uma
   parada; nós temos 7 e nenhuma."
3. **Ter um pedido concreto.** Não "receba um monumento" — isso não depende do
   Pistaviva. E sim "entre no mapa como parada", que depende.

O terceiro ponto é o mais importante e é o que torna isto viável: **o Pistaviva
não precisa de autorização de ninguém para criar sua própria camada de
paradas.** O monumento é da associação. O corredor é geografia. A camada de
quem atende nesse corredor pode ser do Pistaviva.

## O produto

**Camada 1 — A malha.** Os 140 corredores. É o mapa que ninguém tem.

**Camada 2 — Os monumentos.** Os 43 pontos, como já existem hoje.

**Camada 3 — Os municípios.** Cada um com sua situação e seus números.

**Camada 4 — As paradas Pistaviva.** A camada que não depende de terceiros:
estabelecimentos credenciados no corredor, com critério publicado. É aqui que a
fila se forma, porque entrar depende só do Pistaviva.

**A página por município.** Para os 440 municípios com 3 ou mais corredores —
não para os 5.564, o que seria conteúdo fino. Cada página mostra: quantos
corredores cruzam, a que distância está o monumento mais próximo, a posição no
estado, e o que falta. É a página que o secretário de turismo encontra quando
procura o nome da própria cidade.

## Ordem de execução

1. **Publicar o índice** como peça única, com método aberto. Sem ele, o resto
   não tem autoridade.
2. **Abrir a camada de paradas** com critério publicado. É o que transforma
   leitor em candidato.
3. **Páginas por município**, começando pelos 177 em corredor cego.
4. **Ranking estadual anual.** O que faz a prefeitura voltar.

## Limites honestos

- **Passagem é potencial, não fluxo medido.** Mede quantos corredores da rede
  cruzam o município, não quantas motos passam. Não há contagem de tráfego de
  motociclistas no Brasil com essa granularidade; se houver, o índice melhora.
- **Os 140 corredores são uma escolha.** Liguei cada monumento aos 5 vizinhos
  mais próximos. Com 3 ou com 8 a malha muda, e os números com ela. O critério
  precisa ser publicado junto com o resultado.
- **A distância é em linha reta até o centroide do município.** Serve para
  classificar, não para planejar viagem.
- **O Pistaviva não concede monumentos.** Qualquer comunicação que sugira isso
  cria expectativa falsa e queima a relação com a associação. A oferta é a
  camada de paradas, que é própria.
- **O índice mede oportunidade, não qualidade.** Um município em corredor cego
  pode não ter estrutura nenhuma para receber. A apuração continua necessária.
