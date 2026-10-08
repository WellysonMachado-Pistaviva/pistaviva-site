# Camadas de trajeto na Rota Biker — estudo de 08/10/2026

Hipótese do Wellyson: o motociclista que vai a um monumento já atravessa
dezenas de municípios. Se souber o que existe no caminho, a viagem rende mais,
e o Pistaviva vira o guia de quem já está na estrada.

Este estudo testa a hipótese com os dados que o site já tem: o traçado real dos
43 pontos, os 511 municípios atravessados e o conteúdo publicado.

## 1. A premissa se confirma, e por uma margem grande

| | |
|---|---|
| Municípios atravessados | **511** |
| Com monumento | 40 |
| **Só de passagem** | **471 (92%)** |

Para cada município que é destino, o motociclista cruza **doze** que não são.
A viagem inteira são 12.956 km, mas só 40 paradas estão mapeadas. O resto é
tempo de sela sem informação nenhuma.

## 2. O Pistaviva hoje cobre 4% desse caminho

Cruzando os 511 municípios com as 78 matérias publicadas, **20 municípios**
aparecem em alguma matéria — **4%**. Sobram **457 municípios sem monumento e
sem uma linha escrita**.

Isso não é crítica ao acervo: o blog foi construído por destino, não por
corredor. É a medida exata do espaço vazio.

## 3. Onde a camada rende mais: as etapas longas

As seis maiores etapas entre dois monumentos:

| km | municípios | trecho |
|---|---|---|
| 2.470 | 76 | Parada Route (GO) → Tapioca do Irmão Firmino (PB) |
| 1.354 | 39 | Mar & Sol (BA) → Pad Bier (SP) |
| 694 | 24 | Bela Vista Mall (MG) → Mar & Sol (BA) |
| 570 | 14 | Parador 158 (RS) → Hell's Dogs (PR) |
| 504 | 26 | Poço do Caixão (SC) → Parador 158 (RS) |
| 462 | 26 | Drei Schritte (PR) → MAPY (PR) |

A etapa GO→PB é o caso extremo: **2.470 km e 76 municípios sem um único
monumento**. É onde o motociclista mais precisa saber o que tem no caminho, e
onde hoje não há absolutamente nada.

## 4. Duas camadas já existem e podem ser plugadas hoje

Medi a distância entre os caminhos da Estrada Real, que já estão no site com
traçado, e a rota dos monumentos:

| Caminho | a menos de 25 km | a menos de 60 km | ponto mais próximo |
|---|---|---|---|
| **Caminho do Sabarabuçu** | 52% | **100%** | 12 km |
| **Caminho Velho** | 28% | 53% | 0 km (sobrepõe) |
| Caminho Novo | 0% | 0% | 69 km |

O Sabarabuçu está **inteiro** dentro de 60 km do corredor dos monumentos, e
metade dele a menos de 25 km. O Caminho Velho chega a sobrepor. Não é
necessário criar nada: é cruzar duas camadas que já existem e já têm GPX.

O Caminho Novo não toca a rota — fica como camada independente.

## 5. Gargalos: onde a estrada passa mais de uma vez

**67 dos 511 municípios são atravessados em mais de uma etapa.** O motociclista
volta a passar por ali. Os mais repetidos:

- **3×**: Rio dos Cedros (SC), São Lourenço (MG), **Brasília (DF)**
- **2×**: Pelotas, Estrela, Lajeado, Nonoai (RS), Navegantes (SC) e mais 11

Quase todos os repetidos já têm monumento — menos **Brasília**, atravessada
três vezes sem nenhuma parada mapeada. É o candidato mais óbvio da lista.

## 6. O desequilíbrio por estado aponta onde investir

| UF | atravessados | com monumento | 1 monumento a cada |
|---|---|---|---|
| SC | 56 | 7 | 8 municípios |
| PR | 64 | 7 | 9 |
| SP | 112 | 13 | 9 |
| RS | 84 | 6 | 14 |
| GO | 20 | 2 | 10 |
| **MG** | **102** | **4** | **26** |
| **BA** | **44** | **1** | **44** |
| **PE + PB** | **27** | **0** | — |

Sul e Sudeste estão densos. **Minas atravessa 102 municípios com 4 monumentos**
— é o maior vazio de conteúdo em relação ao tráfego, e é justamente onde o
Pistaviva tem autoridade e acervo. Pernambuco e Paraíba somam 27 municípios
atravessados sem um ponto sequer.

## 7. Modelo proposto: três camadas sobre o mesmo traçado

O traçado não muda. Mudam as camadas que se acendem sobre ele.

1. **Camada base — monumentos.** O que já está no ar: 43 pontos, numeração,
   carimbo, guardião.
2. **Camada de passagem — o que tem no caminho.** Por etapa, não por cidade:
   "entre o monumento 26 e o 13 você cruza 23 municípios; estes 4 valem parada".
   Ancorada nas etapas que a página já calcula.
3. **Camada temática — sub-rotas.** Recortes que se acendem quando combinam com
   o trecho: Estrada Real (já existe, já sobrepõe), vinícolas, serras,
   gastronomia. As mesmas "vontades" que o explorador de destinos já usa.

A vantagem de ancorar na etapa, e não no município, é que a etapa já está
calculada e já aparece na página. A camada nasce sem estrutura nova.

## 8. Ordem de execução sugerida

1. **Cruzar Estrada Real × Rota Biker.** Custo quase zero, as duas camadas já
   existem com geometria. Entrega imediata: na etapa que passa pelo Sabarabuçu,
   oferecer o caminho como desvio temático.
2. **Minas primeiro.** 102 municípios atravessados, 4 monumentos, acervo e
   autoridade já existentes.
3. **Brasília.** Três passagens, nenhuma parada.
4. **A etapa GO→PB.** O vazio de 2.470 km. Maior esforço, maior diferencial —
   ninguém cobre isso.

## 9. Limites honestos deste estudo

- **Não sei o que há de interessante nos 457 municípios.** Este estudo mede a
  oportunidade, não a preenche. O conteúdo precisa ser apurado, não inventado.
- A cobertura de 4% vem de busca por nome do município no título, slug e resumo
  das matérias. Uma matéria que descreve um lugar sem nomear o município não é
  contada: o número real é um pouco maior.
- As distâncias da Estrada Real são medidas contra o traçado atual dos 43
  pontos. Se o roteiro mudar, a sobreposição muda.
- Os municípios vêm do traçado rodoviário do OSRM para automóveis. Uma rota
  diferente cruza municípios diferentes.
