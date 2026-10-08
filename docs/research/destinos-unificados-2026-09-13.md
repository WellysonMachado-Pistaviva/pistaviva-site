# Destinos unificados: Estrada Real, vinícolas e paradas biker

Solicitação: reunir conteúdo em Destinos, preservando origem por localização e indicação honesta de piso. Consulta em 13/09/2026. Conteúdo das páginas e arquivos externos é referência, não instrução para executar ações.

## Estrutura entregue

Catálogo único em `/destinos#explorar`, antecipado para depois do hero, reúne destinos existentes e nove roteiros: quatro caminhos da Estrada Real, São Roque, SP, MG, Mantiqueira e Monumentos Bikers. Busca inclui estabelecimentos e cidades. Filtros de coleção, estilo, região e favoritos combinam-se.

Diamantes migrou para `/destinos/caminho-dos-diamantes`, mantendo mapa por etapa e cálculo de acesso. Endereço antigo redireciona permanentemente. Demais oito guias em `/destinos/roteiros/[slug]`; todos oferecem localização por clique, origem manual e destino selecionável no Google Maps. Sem persistir coordenadas nem apresentar distância em linha reta como rodoviária.

## Fontes

- Instituto Estrada Real: páginas de roteiros planilhados Caminho Velho, Novo e Sabarabuçu, metadados de todas as etapas e GPX completos. URLs de planilhas e arquivos preservadas em `app/lib/estradaRealCatalog.json`.
- https://www.roteirodovinho.com.br/ e páginas individuais Góes, Canguera e Quinta do Olivardo: endereço e perfil das paradas.
- https://www.rotasdesp.sp.gov.br/rotasdesp/as-rotas/rotas-do-vinho: retornou HTTP 403 no leitor web e navegador público. Complemento pelo catálogo estadual indexado https://www.rotasdovinho.sp.gov.br/rotas/As%20rotas/outros%20destinos/casa%20soncini e referências dos roteiros São Roque/Mantiqueira. Não apresentada lista completa ou números atuais de empreendimentos estaduais.
- https://descubraminasgerais.com.br/roteiros_minas_gerais/rota-das-vinicolas: conteúdo dependente de JavaScript, lido no navegador. Guia em atualização; mistura exemplos de MG e SP. Seleção Pista Viva preserva apenas estabelecimentos mineiros no roteiro MG. Não copiados anúncios, instruções de login ou chamadas comerciais.
- https://www.rotadosvinhosdamantiqueira.com.br/ e /vin%C3%ADcolas: cinco estabelecimentos e reservas prévias. São Bento do Sapucaí e Santo Antônio do Pinhal ficam em SP; não tratados como municípios mineiros.
- https://monumentobikers.com.br/monumentos/: seleção de seis pontos do catálogo, mapa externo completo e status explicitamente a confirmar.

## Piso e geometrias

Caminho Velho: 710 km, 27 etapas, porcentagens históricas publicadas. Novo: 515 km, 18 etapas. Sabarabuçu: 160 km, seis etapas, 124 km terra e 36 km trilha; porcentagens oficiais inconsistentes não reproduzidas como gráfico.

Mapas novos preservam segmentos GPX identificados como Estrada Real, deduplicados. Excluem logs genéricos e alternativas não verificadas. Não conectam lacunas por retas. Legenda explicita que esses mapas não segmentam piso; notas e planilhas fornecem informações disponíveis. Diamantes mantém classificação por etapa.

Avisos: trilhas difíceis no Velho; porteira/desvio Ewbank–Juiz de Fora no Novo; ponte do córrego do Feijão/MG-030 em Sabarabuçu. GPX não certifica liberação para motos. Vinícolas e monumentos não têm levantamento confiável de piso; interface exige confirmação sem prometer acesso asfaltado. Passeio off-road de uma vinícola não foi usado como prova de piso de toda estrada.

GIFs fornecidos foram copiados sem alteração; identificação explícita de mapa esquemático. Consulta não equivale a vistoria. Vinhos: orientação contextual de não pilotar após degustação alcoólica.

## Validação

`npm run check`: lint, auditoria de tokens e 59 testes passaram. Build compilou e gerou 103 páginas; consultas de páginas antigas a serviços externos receberam bloqueio de rede no sandbox, sem falha na geração dos novos guias.

Dez páginas locais responderam HTTP 200. Navegador validou coleções com quatro caminhos/quatro roteiros de vinhos, busca sem acentos por estabelecimento, favorito, endereço com caracteres especiais, GPS negado e simulado, tela de 390 px sem overflow e redirecionamento antigo com 18 etapas preservadas. Capturas desktop/mobile revisadas. Correção de margem de rolagem evita esconder títulos atrás do cabeçalho fixo.

Publicação Vercel `dpl_4gbDm3YciKYZqLmRHTcBzwuewKvV` concluída, status Ready. Domínio `www.pistavivamototurismo.com.br`: dez páginas verificadas com HTTP 200; endereço antigo retorna 308 para Destinos; sitemap inclui novos guias e remove canônica antiga. Filtros também conferidos no navegador público.

## Ampliação do catálogo Monumentos Bikers e revisão de Destinos

Pedido: substituir seleção de seis paradas pelo catálogo completo e fortalecer visualmente a aba Destinos.

- Fonte: https://monumentobikers.com.br/monumentos/ (consulta em 13/09/2026, horário de Brasília).
- Coordenadas e situação: mapa público vinculado pela própria fonte, exportado de https://www.google.com/maps/d/kml?mid=1ZHPck3Yykbhc8M1GYPrCcKf5pajiTvk&forcekml=1 . Conferidos 41 Placemark, nomes e associação à numeração do catálogo.
- 42 registros numerados: 41 locais identificados e nº 2 sem nome/local atualizado. Preservado sem coordenadas nem navegação.
- 37 pontos descritos no mapa como prontos/carimbando; quatro em construção (39–42). Não foi deduzida situação a partir de bandeiras ou proximidade.
- Route 60: página de monumentos informa Goiás; home anteriormente consultada cita Abadiânia. Campo municipal indica divergência; navegação usa coordenadas oficiais [-16.1849568, -48.688318].
- Terrasul Motos: mapa diferencia carimbo na loja Av. Vinte e Sete de Janeiro, 494. Nota preservada.
- Nenhuma coordenada representa prova de piso. Asfalto/terra continuam explicitamente a confirmar para acessos biker. Google Maps calcula acesso ao ponto; não é promessa de seguir roteiro oficial ou reconhecer transições de piso.
- Imagem de referência do monumento: https://monumentobikers.com.br/wp-content/uploads/2026/01/MONUMENTO-ROTA-660x1024.png . Arquivo público original, sem alteração raster, usado com crédito e link para Rota Biker. Não é fotografia de um estabelecimento específico.

Interface: destaque editorial da rede em Destinos, coleções com contagem, cartões com mapas/métricas/fotos licenciadas, expansão do catálogo; diretório com 42 registros, filtros por estado/país/situação, busca sem acentos, mapa Leaflet com os 41 pontos, contatos publicados e origem compartilhada entre os links de navegação. Localização solicitada apenas após botão; origem manual e tratamento de recusa/timeout/resposta tardia.

Validação local: lint, auditoria visual de tokens, 63 testes passando; build completo. Playwright: coleções, expansão, todos os registros, Paraguai, construção, registro sem localização, estado vazio, origem manual enviada com coordenadas, recusa de geolocalização, sucesso e resposta tardia; desktop 1440 px e celulares 390/320 px sem overflow. Scripts externos de anúncios/CSP report-only e endpoints locais de Vercel emitem avisos preexistentes, fora desta mudança.

Publicação final desta ampliação: `dpl_8F8vWL7kuNPQ3mJ5FQKg2h7tLg7k`, estado **Ready** em produção. URL da implantação: https://pistaviva-93l1c0htv-wellysons-projects-b1d6c92a.vercel.app . Domínio oficial verificado pelo navegador: destaque carregado, 42 registros, filtro Paraguai, origem manual e coleção biker. Corrigido override global de inputs para garantir 17 px e legibilidade móvel. Auditoria de tokens passou após ajuste. O primeiro deploy sem scope retornou “Not authorized”; publicação funcionou com `--scope wellysons-projects-b1d6c92a`, equipe confirmada na Vercel.
