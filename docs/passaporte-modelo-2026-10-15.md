# Modelo para visitantes

Modelo interativo na entrada `/selo/passaporte`, antes do cadastro, quando visitante não tem passaporte neste aparelho. Link direto `/selo/passaporte/modelo` permite testar mesmo com perfil salvo. Publicado em `dpl_4Zf6sYth5pDXDKopNaccQuLPgQys`; detalhes em `docs/passaporte-modelo-publicacao-2026-10-15.md`.

Reutiliza editor e arte aprovados: ficha com foto e coruja acima, conquista abaixo, papel e fontes existentes. Começa com oito cidades de exemplo; visitante pode editar foto, nome, garupa, origem e assinatura, alternar conquista/coleção e experimentar 50 carimbos paginados.

Exemplo fica identificado na tela e nas imagens exportadas. Testar não chama cadastro/check-in, não publica fotos e não grava perfil ou foto em localStorage. Personalizações permanecem no estado da página; ao criar conta explicitamente, ficha e foto escolhidas são reaproveitadas localmente. Nome confirmado no cadastro prevalece. Carimbos fictícios nunca são enviados ao servidor ou acrescentados à conta criada.

Registro real continua pelo formulário existente; coleção nova nasce vazia. Usuário com perfil salvo continua vendo coleção real na entrada normal. Link direto do modelo ignora perfil salvo apenas para exibir exemplo; testar não altera esse perfil.

Artes ilustrativas são WebP estáticos de 768 px, gerados pelo mesmo renderizador dos carimbos reais. Evitam consultas e geração dinâmica de selos durante demonstração. Regenerar: `node scripts/build-passaporte-exemplos.mjs`. A primeira imagem ilustrativa já existe no HTML enquanto canvas prepara personalização.

Arquivos centrais: `ModeloPassaporte.jsx`, `EditorPassaporte.jsx`, `GeradorPassaporte.jsx`, `CriarPassaporte.jsx` e rota `modelo/page.jsx`. Sem alterações de banco ou migrações nesta etapa.

Validação: ESLint dos arquivos alterados, quatro testes de paginação, build em `.cache/pwa-next`, revisão no Chrome em desktop e celular. Roteiro cobre edição/foto sem gravação, exportação de exemplo, 8/50 carimbos, cadastro local reaproveitando ficha e coleção real vazia. Evidências em `/private/tmp/pistaviva-modelo-*`.
