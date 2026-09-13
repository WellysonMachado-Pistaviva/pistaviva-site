# Publicação editorial — 11/09/2026

Quatro matérias novas e duas revisões publicadas em `pv_blog_posts`, com as URLs existentes dos guias de BH e Rio do Rastro preservadas. Textos completos e payload público neste diretório. A autoria editorial é Equipe Pistaviva. Datas originais de publicação dos dois guias preservadas; a revisão está identificada no corpo e no adaptador de metadados.

## Conteúdo e imagens

- Itajubá em um fim de semana: roteiro urbano de dois dias.
- Onde comer no Parque da Cidade: seleção por ocasião, baseada no levantamento local de 26/08/2026, sem preços ou horários inventados.
- Motosul 2027: logística de chegada, hospedagem, orçamento e retorno.
- Mantiqueira com parada em Itajubá: proposta de planejamento, sem alegação de GPX ou inspeção de vias.
- Bate-voltas de BH: dez opções; retirada de cachoeira sem localização precisa e separação de Moeda/Belo Vale.
- Rio do Rastro: planejamento com margem para clima, fontes meteorológicas e perguntas frequentes.

Fotos novas não foram geradas. Reutilizados caminhos já presentes no cadastro da cobertura do Motosul: `/motosul/hero-motos.jpg`, `/motosul/g-chegada.jpg`, `/motosul/gastronomia.jpg`. Imagens inspecionadas, com registros de festival identificados como acervo de edição anterior. Capas dos dois guias anteriores preservadas, incluindo referências de crédito.

## Segurança da publicação

Leitura prévia dos seis slugs; novos slugs exigiram ausência no banco. Atualizações dos dois guias usaram ID e corpo anterior como condição. Backup anterior à publicação em arquivo privado temporário, fora do deploy. Credenciais não foram registradas. As seis respostas de escrita foram verificadas contra os textos enviados.

## Validação

40 testes passaram. Auditoria de design passou. `git diff --check` passou. As 17 URLs únicas de links internos e imagens consultadas responderam HTTP 200. Build de produção e conferência final registrados no relatório de verificação deste diretório. Não houve medição de ranking, tráfego posterior ou inspeção visual em navegador.

## Conclusão — 12/09/2026

Deploy `dpl_9si8tsT5jqTwHhGZYLBmoWSxQckK` confirmado como Ready, associado ao domínio principal. Primeira tentativa falhou por timeout de provisionamento; nova tentativa compilou e gerou 146 páginas. Conferência pública posterior confirmou as seis URLs com HTTP 200, conteúdo revisado, canonical correto, schema de artigo, ausência de noindex e presença no blog e sitemap. Datas de revisão dos dois guias aparecem como 11/09/2026. Resultados completos em `verificacao.json`. Indexação e posições no Google ainda não foram medidas.
