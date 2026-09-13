# Growth orgânico — execução de 11/09/2026

## Entrega

- Estrada X: título e H1 respondem à busca por aplicativo; instalação Android/iPhone, suporte, fontes e condições de uso. Removida alegação não comprovada de maior comunidade. Download gratuito não é apresentado como garantia de gratuidade de todos os recursos.
- BH: corrigida promessa de até 130 km na descrição, incompatível com Tiradentes no próprio artigo; bloco de decisão por tempo disponível, ida e volta e planejamento. Distâncias e experiência de viagem não foram inventadas.
- Rio do Rastro: resposta explícita sobre época da viagem com fonte Epagri/Ciram; corrigidas garantias de pista seca e segurança. Previsão e condições reais prevalecem sobre mês ou estação.
- Mantiqueira/Sul de Minas: ligações contextuais para Parque da Cidade e Motosul.
- Blog: índice automático com âncoras para matérias com três ou mais seções; mecanismo funciona também em futuras publicações.
- Sitemap: atualização editorial sinalizada nas páginas alteradas.

## Implementação editorial

Artigos de BH e Rio do Rastro vêm do CMS. `app/lib/growthEditorial.mjs` corrige apenas expressões antigas específicas durante a leitura, sem gravar no banco ou substituir o artigo inteiro. Novo texto do CMS que não contenha essas expressões permanece intacto. Os blocos adicionais vivem em `ArticlePlanning.jsx`, com seleção explícita por slug. Ao revisar futuramente artigos no CMS, consultar esses arquivos para evitar duplicação e consolidar as correções no conteúdo-base.

## Medição

Evento `editorial_action`, com propriedades `action` e `source`, enviado à instrumentação Vercel já instalada e ao GA4 quando `gtag` estiver disponível.

Ações instrumentadas:

- `plan_route`: BH e Rio do Rastro;
- `explore_park`: matérias regionais;
- `explore_festival`: matérias regionais;
- `app_store_click` / `google_play_click`: botões de lojas do Estrada X.

Não coleta texto de busca, endereço, geolocalização ou identificador pessoal. Clique na loja não é instalação nem cadastro. O recebimento dos eventos ainda precisa ser confirmado no painel de analytics; disponibilidade de eventos personalizados depende da configuração/plano do serviço. Nenhuma assinatura ou configuração de cobrança foi alterada.

## Leitura de resultados

Comparar 28 dias posteriores à publicação com período equivalente anterior, por consulta, página e dispositivo. Não misturar consultas de marca Estrada X com descoberta regional. Métricas: impressões, cliques, CTR e posição por consulta; ações editoriais por página. Contagem de ações não identifica automaticamente origem orgânica sem segmentação no analytics.

Hipóteses:

1. Estrada X: descrição alinhada a aplicativo melhora entendimento e pode aumentar cliques qualificados. Refutada se CTR não melhorar com posição/mix estáveis; verificar antes a URL exibida.
2. BH: planejamento útil aumenta uso do planejador; avaliar ações e experiência mobile, sem trocar URL vencedora.
3. Rio do Rastro: resposta específica aumenta relevância para consulta de melhor época; acompanhar a consulta e possíveis outras URLs exibidas.
4. Mantiqueira: links pertinentes ampliam descoberta de Parque/Motosul. Medir navegação antes de atribuir crescimento a autoridade.

Não há garantia de posição ou estimativa de ganho percentual. Ranking e conversões posteriores não foram medidos nesta entrega.

## Fontes consultadas

- https://apps.apple.com/br/app/estrada-x/id6764478794
- https://play.google.com/store/apps/details?id=com.cbc.estradax
- https://ciram.epagri.sc.gov.br/index.php/2024/08/25/neve-na-serra-catarinense-2/
- https://ciram.epagri.sc.gov.br/

## Verificação

40 testes locais passaram, incluindo correções editoriais, preservação de conteúdo e idempotência. Auditoria de design e `git diff --check` passaram. Lint local continua limitado por dependências incompletas. Build e HTTP de produção registrados após publicação. Inspeção visual em navegador e recebimento real dos eventos não foram realizados nesta sessão.


## Publicação confirmada

Deployment `dpl_FgNe9oPogbAJush1MiQvwHs7oiTr`, produção READY no domínio principal. Build concluído com 142 páginas. Cinco URLs prioritárias responderam HTTP 200 e canonical correto; títulos, descrições, correções, blocos de planejamento e atributos das ações foram conferidos no HTML público. Relatório: `growth-verificacao-2026-09-11.json`. Índice aparece somente em matérias com pelo menos três H2 do conteúdo-base; ausência em matéria sem esses títulos é comportamento esperado.
