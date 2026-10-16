# Publicação do modelo de passaporte

Escopo: demonstração interativa para visitantes em `/selo/passaporte` e link direto `/selo/passaporte/modelo`. Mantém página e backend publicados; não inclui mapa pessoal, memórias, migração, PWA nem reformulação global de identidade.

## Pacote isolado

Base: `dpl_2dD55Kgy82Kkv8MPCRRVQScw2P53`, conferida no domínio antes da preparação. Todos os 973 arquivos de fonte recuperados com SHA-1 igual ao deploy. Snapshot: `/private/tmp/pistaviva-modelo-publicar-pQl8xX`.

Diferenças: cinco arquivos de editor/cadastro/entrada alterados; cinco fontes novas do modelo, rota, tipografia, dados de exemplo e script; cinquenta WebP ilustrativos. Manifesto Vercel: 1.028 arquivos, sem credenciais, banco local, dependências ou arquivos de agentes.

Tipografia restrita ao editor. Renderizador da arte, tokens globais, navegação, passaporte completo, APIs e lógica de check-in permanecem idênticos à base publicada. CTA do dono existente preservado. Editor real mantém sua coleção; exemplos aparecem só na demonstração.

## Validação

- 229 testes do pacote aprovados; ESLint dos arquivos alterados aprovado.
- Build isolado aprovado. Download inicial das fontes exigiu rede; fontes públicas disponíveis na segunda execução. Build local sem credenciais usa fallbacks de conteúdo; build Vercel usa ambiente de produção existente.
- Chrome sobre build de produção local: modelo público, nome/foto, coleção de 50 carimbos, JPEG/ZIP, compartilhamento simulado com gesto ativo, celular sem overflow. Perfil salvo preservado no link de demonstração. Coleção real vazia sem exemplos. Nenhuma gravação no servidor durante verificação.
- ZIP validado por leitor independente: cinco JPEGs íntegros, cada um 1080 × 1920.
- Rotas locais de desenvolvimento e API de memórias não incluídas (404).

## Deploy

Novo: `dpl_4Zf6sYth5pDXDKopNaccQuLPgQys`.

URL imutável: <https://pistaviva-8vdd69k94-wellysons-projects-b1d6c92a.vercel.app>.

Deploy criado em produção com `--skip-domain`, concluído e promovido. Alias `www.pistavivamototurismo.com.br` confirmado em `dpl_4Zf6sYth5pDXDKopNaccQuLPgQys`; estado Ready, sem erro. Build remoto gerou 269 páginas com ambiente de produção.

URL pública: <https://www.pistavivamototurismo.com.br/selo/passaporte/modelo>.

Conferência pública repetiu roteiro do navegador: edição/foto locais, 50 carimbos, exportação JPEG/ZIP, compartilhamento simulado, celular, conta real vazia simulada e preservação de perfil salvo. Sem exceções JavaScript ou gravações no servidor. Modelo também aparece na entrada normal para visitante sem perfil. Prévia de desenvolvimento e API de memórias continuam 404.

Rollback: `dpl_2dD55Kgy82Kkv8MPCRRVQScw2P53`.

## Correção da identidade visual

O primeiro pacote omitiu a textura e a tipografia da página externa ao editor. Correção preparada sobre os 1.028 arquivos exatos desse deploy: classe da rota, CSS escopado do modelo e três tokens de tinta escopados em `app/tokens.css`. Sem incluir a reformulação global de navegação e passaporte completo.

A página `/selo/passaporte/modelo` usa o mesmo `papel.webp` do localhost, repetido em 720px; navegação em 640px; título Impacted, destaque Mailart Rubberstamp vermelho e corpo Roboto Slab. Editor embutido transparente. Geometria e funcionamento preservados.

Build isolado e ESLint aprovados. Chrome comparou estilos computados do localhost com o build de publicação: papel, escala, fontes, cores e transparência iguais. Desktop e celular de 390px conferidos, sem overflow; edição de nome preenche cadastro sem salvar perfil. Manifesto: 1.029 arquivos, só três fontes alteradas/adicionadas; sem credenciais ou dados locais.

Deploy de correção: `dpl_BTk8ZrR1MQAJA8tQWX5cZyijvnK3`, Ready e promovido; domínio confirmado nesse deployment. Rollback da correção: `dpl_4Zf6sYth5pDXDKopNaccQuLPgQys`.

Conferência pública aprovada: mesmos estilos computados do localhost, desktop e celular sem overflow, edição de nome preservada e nenhum erro JavaScript. A primeira tentativa excedeu o limite de espera da prévia; diagnóstico e repetição confirmaram imagem pronta e teste completo aprovado. Evidência: `/private/tmp/pistaviva-papel-check.json` e capturas `pistaviva-papel-release-*`.

## Mesma identidade na página principal

Pedido: aplicar em `/selo/passaporte` a identidade do modelo. As duas rotas compartilham classe `passaporte-identidade`, papel e fontes. A principal também recebe cards de papel, números em carimbo, série com fontes da arte e comunidade transparente; botão contornado com tinta escura e hover claro para manter contraste.

Pacote isolado `/private/tmp/pistaviva-home-publicar-1hpOo1`: 1.029 arquivos exatos da publicação anterior conferidos por SHA-1. Somente quatro arquivos alterados: rota principal, rota do modelo, CSS compartilhado e seletor dos tokens de tinta. A rota principal recebe apenas importação e classes sobre a fonte publicada, preservando conteúdo e posição das seções em produção.

Build isolado e ESLint aprovados. Manifesto de publicação sem credenciais ou dados locais. Conferência inicial do Chrome aprovou estilo compartilhado entre rotas, papel nos cards, carimbo nos números, FAQ, edição de nome e coleção de 50 carimbos em cinco páginas, sem erros JavaScript ou overflow no celular. Revisão visual encontrou texto branco no botão do mapa em uma condição de hover; ajuste final aplica tinta escura aos botões contornados da principal.

Publicação final: `dpl_7Uvo1Mymoza8LKvmqNg8p8wms8vW`, Ready, promovida e confirmada no domínio. Rollback: `dpl_BTk8ZrR1MQAJA8tQWX5cZyijvnK3`.

Conferência final aprovada no build local e no domínio público: estilos compartilhados iguais nas duas rotas, cards de papel, botões legíveis no hover e no celular de 390px, FAQ interativo, edição de nome e coleção de 50 carimbos em cinco páginas. Nenhum erro JavaScript ou overflow no celular. Evidência: `/private/tmp/pistaviva-home-check.json`, capturas `pistaviva-home-desktop.png`, `pistaviva-home-mobile.png` e `pistaviva-home-comunidade.png`.
