# Selos municipais do Brasil

Catálogo em `/selos/brasil`, ligado à página `/selos`. Busca sem acentos, filtro por UF, filtro da Rota Biker e paginação de 24 cidades. Município tem página própria, histórico atribuído, fonte da data, oito variantes e download SVG. Itajubá mantém sua arte exclusiva como nona opção.

## Cobertura e fontes

- 5.571 registros da lista municipal já usada no projeto; 27 UFs.
- 511 municípios do traçado nacional da Rota Biker, todos com ano histórico identificado.
- 5.424 registros com ano; 147 sem confirmação suficiente, todos fora da rota. A interface informa a pendência, sem inventar números.
- Anos da planilha são de emancipação política, não necessariamente de fundação. Cada marco recebe rótulo próprio. Brasília usa inauguração; Carambeí usa o marco de fundação registrado no histórico.
- Históricos consultados em `https://servicodados.ibge.gov.br/api/v1/biblioteca?aspas=3&codmun=CODIGO`. Fichas PDF do IBGE complementam ausências da API. Evidências e URLs permanecem no registro de cada cidade.
- `conteudo/selos/datas-revisadas.json` contém revisões manuais. Cambuquira: 1909 conforme Câmara Municipal, distinguindo a elevação a vila de 1911. Os textos curtos do histórico são identificados como citações, com fonte.
- `conteudo/selos/datas-pendentes.csv` registra as lacunas para continuidade editorial.

## Arte

`modelosMunicipais.json` preserva contornos, textura, estrelas, coruja e motociclista dos arquivos fornecidos `selos3.svg` e `msnnssn.svg`. Rótulos estrangeiros foram removidos; nomes, UF e datas são posicionados dentro dos selos. A faixa original de Itajubá só é usada nessa cidade. O PDF de revisão, HTML e demais SVGs serviram de referência visual. Amarelo e turquesa receberam ajustes de contraste sobre papel claro.

Os SVGs são gerados no servidor; não dependem de fontes remotas. A galeria alterna os formatos para evitar repetição em sequência. Textos são escapados antes de entrar no XML. A rota antiga de carimbos usa as novas artes e mantém a data da visita; regras de conquista e validação GPS não mudam.

## Manutenção

`python3 scripts/build-selos-brasil.py` gera `municipiosBrasil.json` a partir da lista nacional, do traçado, CSV fornecido, revisões manuais e históricos em `.cache/selos-historicos`; PDFs extraídos ficam em `.cache/selos-pdfs`. O catálogo gerado é versionável e dispensa acesso ao IBGE durante execução do site. Caches e dados pessoais locais ficam excluídos do upload Vercel.

## Verificação

- 208 testes Node passaram, incluindo cobertura nacional, prioridade, busca, datas, escape XML, variantes e preservação da data de visita.
- ESLint passou. Build Next passou.
- Navegador: busca sem acentos, navegação, filtros, 24 cartões por página, ausência de overflow móvel, download de Itajubá, oito endpoints SVG e 404 para slug inexistente.
- Revisão visual dos SVGs e páginas em desktop/celular; correções de fundo, encaixe de nomes/datas e rótulos curvos compatíveis com conversão raster.
- Auditoria visual geral ainda aponta 48 desvios anteriores em outros componentes; nenhum nas folhas alteradas para este catálogo.

### Revisão dos cinco SVGs adicionais

- Importação reproduzível: `scripts/import-selos-adicionais.py <diretório dos cinco SVGs>`.
- `1.svg`: moldura postal; `2.svg`: cartão com anel do ano; `3.svg`, `4.svg`, `5.svg`: coruja viajante, moldura quadrada e escudo.
- Desenhos originais preservados. Letras antigas em curvas removidas por grupos; dependências SVG mantidas e definições não utilizadas descartadas.
- Novos modelos disponíveis na página de cada município. Nomes usam linhas balanceadas por palavras e medidas reais dos glifos, preservando acentos. Variações antigas com altura de letra inferior a 16 unidades deixam de ser oferecidas.
- Fontes convertidas em contornos; nenhuma fonte externa necessária ao abrir ou baixar SVG. Versão da arte inclui modelos novos e funções de composição, invalidando imagens antigas em cache.
- Revisão visual inclui Vila Bela da Santíssima Trindade/MT nos cinco modelos. Testes cobrem nomes completos, datas, ausência de coordenadas inválidas e distinção entre modelos.

Publicação: o preflight remoto encontrou três aliases legados `NEXT_PUBLIC_SUPABASE_URL_SUPABASE_*` de credenciais privadas. Duplicatas removidas das configurações Production e Preview. Como a integração ainda as injetava em novos builds, `scripts/build-production.mjs` remove exatamente esses três aliases do ambiente dos processos de compilação. Credenciais privadas, preflight e migrações existentes permanecem. A verificação remota passou após essa correção.
