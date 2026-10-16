# Passaporte compartilhável — publicação em 15/10/2026

Editor aprovado na prévia local integrado ao gerador real de `/selo/passaporte`.

- Coleção completa: primeira página com identificação e foto; continuação com nome, número do passaporte, cidade de origem e páginas numeradas.
- Stories: seis carimbos na identificação e doze por folha seguinte. Cinquenta carimbos geram cinco imagens de 1080 × 1920.
- Feed: quatro carimbos na identificação e seis por folha seguinte. Cinquenta carimbos geram nove imagens de 1080 × 1350.
- Exportação da página atual ou coleção inteira. Arquivos JPEG preparados antes do clique preservam gesto necessário ao compartilhamento nativo. Navegadores sem suporte baixam ZIP com imagens numeradas.
- Foto e ficha ficam no dispositivo. Conteúdo vem da coleção já autenticada pelo código local; nenhum código privado é incluído nas imagens ou no texto de compartilhamento.
- Links `?story=<entradaId>` abrem conquista correta após hidratação. Erro ao carregar coleção oferece nova tentativa.
- Sem dados fictícios na produção. Rota `/selo/passaporte/previa` permanece exclusiva do desenvolvimento.

## Isolamento

Base exata do deploy `dpl_4YAfBMvhiYLj6SS5w43mUH3RUWii`, recuperada e verificada por SHA-1 dos 968 arquivos de fonte. Snapshot isolado: `/private/tmp/pistaviva-passaporte-publicar-0e3Fok`.

Somente sete arquivos diferem da produção anterior: gerador, editor, renderização de arte, paginação/ZIP, CSS do editor, tokens e testes de paginação. Outras alterações locais do workspace não entram nesse deploy. Manifesto de envio conferido: 973 arquivos; sem `.env`, `.next`, `node_modules`, `.cache` ou `.selo-local`.

## Verificações

- Build isolado de produção: 268 páginas geradas.
- Testes do snapshot: 229 aprovados, incluindo quatro testes de paginação sem perda ou duplicação, coleção de 500 entradas, visitas repetidas e limites de páginas.
- ESLint dos arquivos novos/alterados: aprovado.
- Auditoria visual dos arquivos alterados: zero desvios. Auditoria global ainda registra 196 desvios em arquivos preexistentes, preservados da versão publicada.
- Chrome sobre build de produção: perfil/coleção via API simulada, 50 carimbos, formatos Stories/feed, JPEG e ZIP, compartilhamento nativo simulado com gesto ativo, edição/foto persistidas após recarga, abertura por ID, selo de estação sem série/UF, coleção vazia, falha de API com recuperação e visitante sem cadastro.
- Desktop e celular sem rolagem horizontal; sem exceções JavaScript ou gravações de teste no servidor.
- ZIPs conferidos com leitor independente; todas as imagens no tamanho de cada formato.

Compartilhamento real pelo seletor do Android/iOS depende do navegador e aplicativo de destino; teste automatizado usa simulação, sem envio a terceiros.

## Deploy

Novo deploy: `dpl_2dD55Kgy82Kkv8MPCRRVQScw2P53`.
URL imutável: https://pistaviva-8kw2t3141-wellysons-projects-b1d6c92a.vercel.app
Status: Ready, promovido e confirmado no domínio principal.
URL pública: https://www.pistavivamototurismo.com.br/selo/passaporte

Conferência pública repetiu cenários do navegador com API de coleção simulada e nenhuma gravação no servidor; todos passaram, sem exceções JavaScript. Passaporte HTTP 200, arte de Socorro HTTP 200 e prévia de desenvolvimento HTTP 404. Alias público confirmado em `dpl_2dD55Kgy82Kkv8MPCRRVQScw2P53`. ZIP exportado pelo editor publicado: nove JPEGs válidos e ordenados.

Rollback disponível: deploy anterior `dpl_4YAfBMvhiYLj6SS5w43mUH3RUWii`.
