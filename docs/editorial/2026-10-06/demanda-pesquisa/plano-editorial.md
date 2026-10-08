# Conteúdo orientado pela demanda de pesquisa do Pistaviva

Análise em 06/10/2026. Período efetivamente presente em Gráfico.csv: **06/09/2026 a 03/10/2026**. Sete CSVs e três capturas fornecidos pelo proprietário.

## O que os dados medem

Cliques, impressões, CTR e posição em pesquisa Web associados a URLs do Instagram. Não são reproduções dos Reels, alcance no Instagram, envios por direct nem acessos ao portal Pistaviva. Também não equivalem ao volume total de pesquisas desses assuntos no Google.

O gráfico soma **528 cliques e 9.053 impressões**, CTR calculado de **5,83%**. Celular: **472 cliques, 89,4% do total**. Brasil: **527 cliques**. Aparência Vídeos: **39 cliques / 3.425 impressões / 1,14% de CTR**; é uma dimensão da pesquisa, não 3.425 reproduções.

Limitações relevantes:

- Posts.csv soma 531 cliques e 10.192 impressões; Consultas.csv soma 174 cliques e 2.986 impressões. Essas dimensões não fecham com o gráfico. Os arquivos não permitem identificar a causa exata. Não somar dimensões nem usar as consultas como cobertura de todo o tráfego.
- Não há junção consulta–post: nenhuma consulta foi atribuída a uma URL específica sem evidência.
- Há URLs /p/ e /reel/ com mesmo shortcode e parâmetros alternativos. Não tratar como conteúdos distintos. Contagens por URL continuam identificadas como tal, sem presumir usuários únicos.
- A URL DdtRBQkxuce tem 20 cliques, mas não há título identificável no print. Excluída da classificação temática dos posts.
- Percentuais de crescimento dos prints não foram recalculados: não há exportação do período anterior.
- Resultados de pesquisa do Instagram orientam hipóteses para o portal; não garantem desempenho equivalente no site.

## Evidências que mudam a prioridade

| Conteúdo identificado nos prints | Cliques da URL | Impressões da URL | CTR | Decisão |
|---|---:|---:|---:|---|
| Divulgação do BMW Motorrad Fest — DcrhKVUgWMd | 327 | 1.535 | 21,30% | Reaproveitar matéria publicada; não anunciar edição encerrada como futura |
| São Lourenço — Dak7zOmkePm | 64 | 750 | 8,53% | Guia do Monumento 35 com localização e carimbo |
| Monumento 27 — DOuDaUJgfhq | 13 | 2.374 | 0,55% | Guia específico: onde fica e como organizar a visita |
| Outro Reel do Monumento 27 — DYvY6ceRjOe | 7 | 795 | 0,88% | Complementa evidência do tema; não somar públicos |
| Monumento 29 — DVmSS5Xgbo9 | 16 | 539 | 2,97% | Guia do Rancho em São José do Barreiro |
| Monumento 22 — DMWYNF7On95 | 3 | 819 | 0,37% | Próxima rodada: verificar matéria local já existente antes de criar outra |
| Travessia — DQXnWElgdTQ | 2 | 428 | 0,47% | Melhorar distribuição dos roteiros da Mantiqueira já publicados |

Impressões altas com CTR baixo sugerem oportunidade de responder melhor à intenção de busca. Não demonstram sozinhas problema de título: posição, apresentação do resultado e concorrência também podem contribuir.

## Consultas agrupadas, sem sobreposição

Regras reproduzíveis em analisar.py; classificação linha a linha em consultas-classificadas.csv. São agrupamentos editoriais por termos e números, não categorias oficiais.

| Grupo | Cliques | Impressões | CTR calculado |
|---|---:|---:|---:|
| BMW | 126 | 535 | 23,55% |
| São Lourenço / 35 | 26 | 244 | 10,66% |
| Pedra do Baú / São Bento / 27 | 6 | 664 | 0,90% |
| São José do Barreiro / 29 | 8 | 226 | 3,54% |
| Rota 68 | 0 | 286 | 0% |
| Perto de mim | 1 | 280 | 0,36% |
| Monumento 22 / Três Corações | 0 | 59 | 0% |
| Outras buscas biker | 0 | 374 | 0% |
| Outras consultas | 7 | 318 | 2,20% |

Exemplos: “monumento rota biker 27” teve 210 impressões e 2 cliques; “monumento rota biker perto de mim”, 187 impressões e zero clique; “rota 68 onde fica”, 69 impressões e zero clique. Amostras pequenas não justificam previsões de ganhos percentuais.

## Conteúdos criados nesta rodada

1. **Monumento Rota Biker 35 em São Lourenço: onde fica e onde carimbar.** Resposta direta no primeiro parágrafo, orientação de atendimento turístico, mapa e post do proprietário incorporado.
2. **Monumento Rota Biker 27: onde fica na Pedra do Baú e como planejar a visita.** Identifica restaurante e município, separa monumento de buscas genéricas pela Pedra do Baú, inclui Reel do proprietário.
3. **Monumento Rota Biker 29 em São José do Barreiro: parada no Rancho.** Localização, contato, carimbo a confirmar, distinção entre número do monumento e nome Rota 68, post incorporado.

Textos salvos como rascunhos. Capas ainda não selecionadas; posts incorporados não substituem imagens de capa. Dados analíticos permanecem neste relatório interno, não nas matérias públicas.

As cinco matérias genéricas criadas anteriormente continuam úteis, mas estes guias locais têm evidência mais direta nos arquivos e devem receber prioridade editorial.

## Aproveitar páginas existentes

- **BMW:** manter URL da matéria publicada, divulgar vídeo e bastidores com data da edição. Chamada social pronta em conteudos-sociais.md. Não criar página concorrente contando a mesma história.
- **“Perto de mim”:** direcionar para `/destinos/roteiros/monumentos-bikers`, que já possui busca e cálculo de acesso. Não criar outra lista genérica. O sistema não deve prometer ordenação por distância se não oferecer esse recurso.
- **Mantiqueira:** revisar intenção e chamadas dos roteiros existentes antes de abrir outro guia da mesma travessia.
- **Garganta do Registro:** aproveitar reportagem existente. Somente 4 cliques na URL identificada no print; prioridade abaixo dos monumentos nesta amostra.
- **Rota 68:** próxima apuração específica: percurso, cidades, mapa e condições. Não confundir SP-068, marca turística e número dos monumentos. Não montar mapa do percurso a partir de um único ponto do Rancho.

## Verificação das informações de serviço

Fontes consultadas em 06/10/2026:

- Rota Biker: https://monumentobikers.com.br/monumentos/ — identificação dos pontos 27, 29 e 35.
- São Lourenço Convention & Visitors Bureau: https://saolourencocvb.com.br/guia-rota-biker/ — Portal, Centro de Atendimento ao Turista, passaporte e benefícios sujeitos às condições dos parceiros.
- Restaurante Pedra do Baú: https://restaurantepedradobau.com.br/o-restaurante/ — município, proposta gastronômica e dias informados pelo estabelecimento.
- Ducati DOC Friendly: https://www.ducatidocfriendly.com.br/restaurante-rancho-gastronomia-e-cultura-rota-68/ — endereço e telefone do Rancho. Nenhum desconto do programa foi generalizado para os leitores.

Observação encontrada na apuração: catálogo oficial agora lista registros até o nº 44; base local consultada possui 42. Os novos registros 43 e 44 estão descritos como em construção. Atualização do diretório deve ser tarefa própria; os três pontos usados nas matérias foram conferidos individualmente. Não anunciar quantidade total desatualizada nos novos textos.

## Distribuição e acompanhamento

Ordem sugerida: publicar guia 27, depois 35, depois 29, com um conteúdo social correspondente a cada publicação. Chamada BMW pode usar a URL já disponível. URLs de rascunhos só devem ser divulgadas após publicação.

Após 28 dias de publicação, comparar períodos completos e equivalentes. No Search Console do portal, acompanhar consultas e páginas destes guias; nas redes, medir separadamente visualizações, envios, salvamentos e visitas ao perfil. Usar links identificáveis nos Stories para medir encaminhamento ao site. Não misturar totais de Instagram e portal.

Registrar data de publicação, indexação, cliques e impressões. Se houver impressões e poucos cliques, revisar correspondência entre consulta, título e primeira resposta. Se não houver impressões, verificar indexação e links internos antes de concluir que tema não interessa.
