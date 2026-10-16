# Stampie — comparação de produto com Pista Viva

Data: 15/10/2026. Escopo: páginas públicas, navegação anônima e recursos descritos pela equipe. Sem autenticação, testes de funcionalidades pagas, métricas de SEO ou estimativas de receita.

## Evidências

- https://stampie.app/ — proposta centrada no passaporte pessoal, mapa de visitas, diário, exportação e perfil compartilhável.
- https://stampie.app/@tutosports14 — perfil público confirmado no Chrome: identidade, apresentação, contadores, livro/grade, mapa pessoal e progresso na mesma página.
- https://stampie.app/passports — diretório público confirmado no Chrome: busca, ordenação por países, carimbos e adição recente; cartões com identidade e últimas conquistas. Contagens de usuários variam entre extração indexada e navegador; não foram usadas como métrica comparativa.
- https://stampie.app/collections — coleções temáticas e subconjuntos; inclui estados brasileiros.
- https://stampie.app/blog/stampie-updates-july-2026 — equipe descreve coleções fixadas/reordenadas, cartões do mapa, compartilhamento de uma visita e personalização. Descrição da equipe, sem teste autenticado do aplicativo.

## Pista Viva: base já disponível

Código publicado examinado no snapshot `dpl_2dD55Kgy82Kkv8MPCRRVQScw2P53`: carimbos por município com GPS, número de série, livro e grade, agrupamento por estado, perfil público autorizado, mural, progresso de duas coleções, mapa comunitário e exportação paginada em Stories/feed.

Não tratar esses recursos existentes como ausentes. Animação de aquisição também existe no check-in.

## Lacunas e evolução recomendada

1. **Mapa pessoal no perfil:** mapa atual mostra contagens e fotos da comunidade; falta representar visualmente cidades/UFs do titular e exportar essa visão.
2. **Memórias por visita:** fotos opcionais existem, mas clicar no carimbo do livro abre página genérica da cidade. Falta reunir carimbo específico, foto da visita, data e relato pessoal.
3. **Coleções escolhidas pelo motociclista:** catálogo regional existe; progresso individual está concentrado na Rota Biker e nas quatro estações de Itajubá. Evoluir para coleções favoritas, metas e progresso próprio por roteiro/região.
4. **Descoberta nacional e identidade pública:** perfil existe, mas avatar é inicial, sem apresentação própria. Diretório atual se baseia nas conquistas sazonais de Itajubá; ampliar descoberta de passaportes nacionais autorizados, incluindo quem só possui carimbos de cidades.
5. **Coerência de marca e contadores:** perfil público ainda usa Rota Biker em metadados e comunicação. `modelo.stats.totalCidades` é `CIDADES.length` (42), enquanto cidades visitadas podem vir de todo Brasil. Separar total pessoal nacional de progresso da coleção Rota Biker.

Prioridade sugerida: mapa pessoal, memória por carimbo e coleções escolhidas. Impacto sobre retenção/compartilhamento é hipótese de produto, não resultado medido.

## Diferencial próprio

Preservar presença municipal conferida por GPS, série individual e vínculo com experiências/benefícios locais. GPS não comprova veículo utilizado. Comunicação deve reforçar identidade Pista Viva e posicionar Rota Biker como coleção específica.

## Fontes brutas

`raw/stampie/2026-10-15/scrapes/`: extrações web e texto das páginas públicas no navegador. Perfis com `@` não abriram no extrator web, mas responderam HTTP 200 no Chrome. Captura inicial do perfil aconteceu durante carregamento das imagens; não fundamenta conclusão sobre ausência de artes ou desempenho.
