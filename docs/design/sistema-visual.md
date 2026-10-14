# Sistema visual Pistaviva

Direção: fotografia de viagem, títulos de campanha, preto e laranja, superfícies claras para leitura.

| Documento | Conteúdo |
| --- | --- |
| [`tokens.md`](tokens.md) | cor, geometria, espaço, tipografia, breakpoints — a referência |
| [`wireframes.md`](wireframes.md) | os cinco arquétipos de página e a moldura comum |
| [`referencias-visuais.md`](referencias-visuais.md) | referências consultadas e o que foi aplicado |

## Fonte única

| Camada | Arquivo | Papel |
| --- | --- | --- |
| Tokens | [`app/tokens.css`](../../app/tokens.css) | **único** lugar com literal de cor no CSS |
| Paleta JS | [`src/palette.js`](../../src/palette.js) | espelho dos tokens para SVG, Leaflet, canvas e dados |
| Reset e SPA | [`src/index.css`](../../src/index.css) | base herdada, só consome tokens |
| Componentes | [`app/globals.css`](../../app/globals.css) | páginas e componentes |
| Sistema | [`app/design-system.css`](../../app/design-system.css) | camada final: intro, botão, formulário, card, rodapé |
| Home | [`app/home-experience.css`](../../app/home-experience.css) | blocos exclusivos da home |
| Páginas | `app/motosul/motosul.css`, `app/parque-da-cidade/parque.css`, `app/parque-da-cidade/parque-editorial.css`, `app/admin/admin-ignis.css` | folhas de página, carregadas pela própria rota |

Ordem de carga em [`app/site.css`](../../app/site.css): tokens → index → leaflet → globals → design-system.
Nenhuma folha além de `tokens.css` declara token. Não importar `src/App.css` no layout Next: contém a antiga coluna de SPA e reaplica margens incompatíveis.

## Componentes compartilhados

`PageIntro` (`eyebrow`, `title`, conteúdo, `image`, `imageAlt`, `action`, `compact`) · `SpaIntro` (adaptador compacto para ferramentas) · `SiteHeader`, `MobileShell`, `SiteFooter` · `SeoContent` (texto de apoio e FAQ em HTML nativo).

## Regras que não se negociam

- Literal de cor só em `app/tokens.css` e `src/palette.js`. Em CSS use `var(--pv-…)`; em JS, `PV.…` e `withAlpha(PV.…, alfa)`.
- Cor de status e legenda de mapa continuam distintas: laranja não substitui sucesso, erro nem legenda geográfica.
- Botão primário: fundo laranja, texto preto. Interação principal com ao menos 44px de altura, foco visível, label em todo campo, `prefers-reduced-motion` respeitado.
- `border-radius` sempre por token. Espaço em múltiplo de 4px. Breakpoint só nos seis degraus.
- Ritmo de seção pelos quatro degraus `--sec-y*`; nada de `clamp` novo por seção.
- Conteúdo sem imagem disponível não recebe paisagem inventada.

## Verificação

```
npm run audit:design    # tokens, cor, alfa, raio, espaço, breakpoint, órfãos, paleta
npm run check           # lint + auditoria + testes
```

A auditoria ([`scripts/audit-design.mjs`](../../scripts/audit-design.mjs)) falha quando uma folha ou um `.jsx` rompe qualquer regra acima, e quando `src/palette.js` diverge de `app/tokens.css`. Ela descobre as folhas sozinha: arquivo `.css` novo entra na checagem sem precisar ser registrado.

Cobertura: as 10 folhas do repositório e todo `.jsx`. A lista `PENDING` do script está vazia — não há dívida declarada.

## Estado desta revisão

Consolidação a partir de três gerações de tokens empilhadas (Harley em `index.css`, IGNIS em `globals.css`, `--pv-*` em `design-system.css`), que se sobrescreviam pela ordem de carga.

| Antes | Depois |
| --- | --- |
| 3 blocos `:root` concorrentes | 1 |
| 163 cores literais no CSS | 0 fora de `tokens.css` |
| 66 cores literais no JSX | 0 fora de `palette.js` |
| 44 alfas de branco, 18 de laranja, 21 de preto | escada de 12 degraus |
| 28 breakpoints | 6 |
| 21 valores de raio | 6 |
| 64 valores de espaço (escada de 2px) | 29, todos múltiplos de 4 |
| 7 apelidos de fonte para 3 famílias | 3 |
| 4 folhas fora de qualquer checagem | 0 |
| sem verificação automática | `npm run audit:design` |

Verificado: build de produção, `eslint .` sem erro, 28 testes existentes passando, `git diff --check` limpo.

Limites: a auditoria cobre CSS e JSX do repositório; não valida contraste nem renderização. Rendering em 24 rotas e dados externos (Supabase, scripts Google/Vercel) não foram revalidados nesta passagem.

## Conquistadores — outubro de 2026

O mural público mantém a composição editorial da home: fotografia de encontro, títulos condensados, fundo claro e chamadas em laranja. Nome, origem e passaporte são protagonistas; posição no ranking permanece secundária. A textura de papel fica restrita à miniatura do passaporte.

Métricas usam apenas coleções públicas autorizadas. Anos completos recebem distinção textual; espaços sem confirmação ficam vazios. Busca e filtros não alteram a regra de empates. Cada coleção oferece abertura do perfil e compartilhamento de link; o perfil concentra a prévia do cartão para Stories e download. Convites explicam visita, confirmação, autorização e aprovação, sem prometer entrada automática no mural.
