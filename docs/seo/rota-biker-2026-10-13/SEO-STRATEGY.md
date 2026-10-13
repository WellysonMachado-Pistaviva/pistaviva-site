# Rota Biker — estratégia de busca da Pistaviva

Data: 13/10/2026. Negócio: portal de mototurismo, parceiro oficial da Rota Biker (confirmado pelo responsável nesta sessão).

## Decisão

Concentrar autoridade na página existente `/destinos/roteiros/monumentos-bikers`: mapa, monumentos, planejamento e passaporte. A meta é tornar a Pistaviva uma referência de planejamento da Rota Biker, com conteúdo útil e reconhecimento da parceria. Não apresentar o portal como proprietário da marca nem como único site oficial.

Disputar “rota biker” e ganhar cobertura para “mapa rota biker”, passaporte, estados e monumentos específicos. Não criar uma segunda página nacional concorrente em `/rota-biker`. Não há garantia de posição nº 1, presença em toda pesquisa ou prazo de resultado.

## Evidências e limites

- Busca pública consultada encontrou a página nacional e a página de São Paulo da Pistaviva. Isso evidencia descoberta, não posição estável no Google do usuário.
- Link de resultados Google enviado não abriu na ferramenta; a pesquisa alternativa não reproduz personalização, localização ou dispositivo do usuário. Nenhum ranking atual é afirmado.
- Página nacional: HTTP 200; robots `index, follow`; canonical para a própria URL; presente no sitemap. `/destinos/monumentos` responde 308. Página Minas Gerais responde 200 com canonical próprio. Robots permite conteúdo público e recursos de renderização.
- Title publicado já descreve mapa, mas H1 visível era “Um gesto. Muitos caminhos.”. Rodapé dizia “guia independente”, divergindo da parceria informada.
- Não há baseline atual do Search Console do domínio nesta análise, nem volumes mensais, dificuldade ou autoridade de domínio medidos.
- `docs/editorial/2026-10-06/demanda-pesquisa/analise.json` documenta dados de pesquisa Web de URLs do Instagram entre 06/09 e 03/10/2026. **Não são métricas da Pistaviva nem volume de mercado**. Só orientam hipóteses editoriais.
- Nesse histórico: “rota biker” teve 75 impressões; “monumento rota biker perto de mim”, 187; grupo Monumento 27, 664. Não atribuir essas impressões ao site nem calcular crescimento do portal usando esse arquivo.

## Posicionamento e primeira intervenção

Title proposto: **Rota Biker: mapa, monumentos e passaporte | Pistaviva**.
H1: **Rota Biker. Viva o caminho.**
Abertura: mapa dos pontos com coordenadas, planejamento de paradas, passaporte e parceria oficial.

Alterações locais preparadas: H1 e descrição diretos; title e meta description; parceria identificada; respostas sobre contagens, localização, passaporte e planejamento; links para três guias existentes. Sem FAQPage novo: perguntas visíveis servem ao visitante, sem promessa de rich result. Contagens vêm do catálogo, não de números escritos no texto. A data de consulta do catálogo permanece 08/10/2026; mudança editorial não equivale a reconferência dos pontos.

## Prioridades e como verificar

| Prioridade | Ação e fundamento | Dependência | Indicador | Sinal para revisar |
|---|---|---|---|---|
| P0 | Conectar/exportar Search Console do domínio; sem isso não sabemos consultas e URLs vencedoras | Acesso do proprietário | 90 dias por consulta, página, país e dispositivo; inspeção da URL | Sem dados do domínio, não anunciar melhora de posição |
| P1 | Publicar abertura e respostas mais claras; alinhar oferta, título e parceria | Revisão do texto e deploy | Nova versão rastreada; impressões e CTR das consultas alvo | Após 6–8 semanas e novo rastreamento, sem melhora com exposição comparável: revisar intenção e snippet |
| P1 | Apresentar mapa como ferramenta da parceira nos canais da organização | Alinhar papel da parceria e obter aceite de cada canal | Links publicados em páginas relevantes e acessos de referência | Links sem cliques e sem descoberta: revisar posição e utilidade da indicação |
| P1 | Melhorar guias 27, 29 e 35 já existentes, sem duplicar URLs | Verificação com guardiões, fotos e direitos | Cliques por monumento, abertura do mapa e contato | Impressões crescendo sem cliques: revisar título; cliques sem uso: revisar utilidade |
| P2 | Aprofundar MG, SP, PR e SC com roteiros reais, acesso e contexto local | Conferência editorial e disponibilidade de fontes | Consultas locais e cliques no mapa | Páginas competindo pela mesma intenção: distinguir conteúdo e links |
| P2 | Medir experiência mobile e uso do planejador | Search Console/CWV e eventos analíticos | LCP, INP, CLS; início de roteiro e abertura do Maps | Regressão de desempenho ou abandono: priorizar correção antes de expandir |

## Parceria e links: proposta concreta

Para responsáveis pela Rota Biker: inserir, em seção de planejamento do site/canais, um link contextual **“Planeje sua viagem pelo mapa da Pistaviva, parceira da Rota Biker”** para o hub nacional. Para cada guardião: link para a página do estado ou guia específico, se realmente útil ao visitante. Variar texto naturalmente. Preparar vídeo curto demonstrando escolha de paradas e cálculo do roteiro, com o mesmo destino do link.

Confirmar com a organização quais papéis podem ser descritos publicamente: conteúdo, mapa, tecnologia, divulgação ou cobertura. Confirmação de parceria não autoriza afirmar exclusividade. Nenhuma mensagem foi enviada e nenhum link externo foi alterado.

Evitar compra de links, listas artificiais, páginas em massa por cidade e repetição forçada de palavras. Uma página nova só entra quando tiver informação própria, fontes verificadas e intenção distinta.

## Medição

Na propriedade correta do Search Console, exportar últimos 90 dias e comparar janelas de 28 dias; separar Brasil, mobile/desktop, consulta e URL. Filtro inicial de consultas: `(?i)(rota.?biker|monumento.*biker|passaporte.*biker)`. Exportar também URLs do hub, páginas estaduais e guias para capturar consultas que não contêm esses termos. Inspecionar canonical escolhido pelo Google e último rastreamento do hub.

Baseline de cliques, impressões, CTR e posição: pendente. Não definir porcentagens de crescimento arbitrárias antes de medir. Em 30 dias, objetivo operacional: versão rastreada e baseline salvo. Em 90 dias: avaliar evolução de cada grupo; priorizar termos com impressões e posições 4–20 confirmadas pelo Search Console. Em 6 e 12 meses: revisar expansão conforme resultado, sem atribuir causalidade só por correlação.

Fontes: [Google — guia SEO](https://developers.google.com/search/docs/fundamentals/seo-starter-guide), [Google — títulos](https://developers.google.com/search/docs/appearance/title-link), [hub publicado](https://www.pistavivamototurismo.com.br/destinos/roteiros/monumentos-bikers). Concorrência detalhada no arquivo COMPETITOR-ANALYSIS.md.
