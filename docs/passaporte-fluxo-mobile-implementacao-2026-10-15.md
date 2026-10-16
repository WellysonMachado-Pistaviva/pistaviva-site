# Passaporte: primeira implementação do fluxo mobile

15/10/2026. Continuação da [revisão mobile](passaporte-revisao-mobile-2026-10-15.md). Registro da implementação local; posteriormente publicada com migração das dependências. Consulte [publicação e validação em produção](passaporte-fluxo-mobile-publicacao-2026-10-15.md).

## O que mudou

- Botão inicial abre diretamente o cadastro. Exemplo passa para `/selo/passaporte/modelo`; não é preciso atravessar editor para criar conta.
- Cadastro tem título menor, máscara de telefone, associação dos erros aos campos e foco no primeiro erro. Dados permanecem após falha. Criar leva à página privada, com carimbo antes da identificação.
- Navegação mobile contextual com Passaporte, Carimbar, Mapa e Mais. Passaporte abre a coleção salva; Carimbar leva à ação ou ao cadastro. Mais mantém selos, comunidade, personalização, privacidade, modo estrada e saída para o site. Barra superior redundante é ocultada no celular. Balcão/parceiro preservam seu contexto operacional.
- Editor é opcional e carregado ao abrir personalização/compartilhamento. Parâmetros de story e edição vêm da página do servidor, inclusive em navegação interna. Demonstração preserva arte aprovada.
- Mapa da página inicial só carrega após escolha explícita. Página própria do mapa continua abrindo diretamente. Contador flutuante deixa de cobrir cadastro, recuperação e passaporte.
- Consulta do aviso global tem limite de 2 segundos. Na homologação, respostas ultrapassaram um minuto com o banco remoto indisponível; o aviso consultava esse banco sem prazo limite. O aviso é opcional e sua falha não deve impedir o uso do passaporte.
- Fotos de passagens começam privadas. Publicação no mapa exige marcar opção.
- Foto de identificação tem dono (código e número), não acompanha troca de perfil e é removida ao esquecer aparelho. Foto antiga sem identificação não é reutilizada; será necessário selecioná-la novamente. Esquecer também remove rascunho da estação, resumo e fila do perfil atual.
- API da coleção usa `Authorization: Bearer`, com `private, no-store`; código em query string é recusado. Páginas antigas abertas antes desta atualização podem precisar ser recarregadas.
- Mensagem offline distingue passagem pendente de carimbo confirmado e orienta abrir com conexão dentro de 72 horas. Informação de privacidade descreve fotos locais, fotos no servidor, relatos e fila GPS.
- Armazenamento local de desenvolvimento não grava eventos nem sincroniza planilhas de produção, mesmo se houver credenciais de Sheets no ambiente.

## Recuperação e compatibilidade

Telefone e três letras do nome deixaram de liberar credencial. A ação antiga continua respondendo com orientação para assistência, sem consultar conta nem devolver código. A página oferece abrir passaporte já salvo ou falar com a equipe em `/contato`. Não foi criado formulário que aparente registrar solicitação sem realmente enviá-la.

Revisão adicional encontrou que o formulário das estações também retornava acesso a conta existente apenas pelo telefone. Agora exige credencial do perfil ou chave idempotente do próprio envio. Após registrar, confere novamente a chave antes de devolver acesso, inclusive em concorrência. Dono com acesso salvo continua registrando visitas. Administrador continua atendendo recuperação pelo painel, após comprovar identidade; conhecer nome e telefone não é comprovação suficiente.

**Atenção operacional:** sem o link pessoal, recuperação automática fica indisponível até configurar canal verificado. Não habilitar fallback por nome/telefone para contornar falta de provedor.

## Limitações que permanecem

- Não há envio de código por WhatsApp/SMS, provedor configurado ou telefone verificado no cadastro. Escolha e configuração do canal continuam pendentes. Nenhuma mensagem foi enviada.
- Links privados existentes continuam sendo credenciais de acesso. Esta etapa não migra páginas e ações para sessão em cookie HttpOnly, não aumenta tokens existentes nem revoga links ao esquecer aparelho.
- Não houve mudança de CSP para nonce/hash, revisão de infraestrutura real ou atestação de presença física. Geofence continua validando coordenadas informadas pelo navegador.
- Não houve teste em aparelho físico, Safari real ou leitor de tela. Chrome emula toque, larguras pequenas e paisagem.
- Este lote não exige nova migração; o workspace já continha alterações de mapa/memórias e sua migração pendente. Publicar o conjunto exige conferir essas dependências e o pré-voo existente.

## Verificação

- `npm test`: 246 testes aprovados, incluindo isolamento de fotos, esquecimento, identificação pública e destinos de navegação. Fixtures de fotos foram atualizadas para exigir vínculo com o dono.
- `npm run lint`: passa. Aviso anterior de `MODULE_TYPELESS_PACKAGE_JSON` permanece.
- Auditoria de design: mesmos 197 desvios anteriores, sem acréscimo pelas novas folhas. `npm run check` completo continua bloqueado nessa auditoria anterior; não tratar como aprovação geral de publicação.
- Build isolado: `PWA_TEST_BUILD=1 npm run build`, saída em `.cache/pwa-next`. Restrições de rede causam fallback de fontes externas de conteúdo durante prerenderização; build não valida conteúdo remoto de produção.
- Teste de navegador: `scripts/e2e/passaporte-fluxo.mjs`. Exige servidor dev com armazenamento local; recusa ambiente de produção. Usa conta fictícia própria e remove essa conta ao terminar. Verifica cadastro, navegação, GPS negado e sucesso, publicação desmarcada, API sem segredo na URL, editor, esquecimento, bloqueio do formulário legado e registro pelo dono autorizado.
- Homologação final: nove grupos do teste de navegador aprovados; sem transbordamento em 320, 430 e 844 × 390 px. Verificação adicional confirmou carregamento do mapa por escolha, zoom de 44 × 44 px e download JPEG do modelo sem alterar perfil salvo. Conta fictícia foi removida e instância exclusiva foi encerrada.

Comando do navegador nesta máquina:

```sh
# Terminal 1: instância exclusiva para homologação. URL de banco inválida
# impede consultas de conteúdo externo; armazenamento do Selo continua local.
PASSAPORTE_FLUXO_TEST=1 NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:9 npm run dev -- --hostname 127.0.0.1 --port 3018

# Terminal 2:
PASSAPORTE_TEST_URL=http://127.0.0.1:3018 PLAYWRIGHT_MODULE=/Users/wellysonmachado/.npm-global/lib/node_modules/@playwright/cli/node_modules/playwright/index.mjs node scripts/e2e/passaporte-fluxo.mjs
```

`PASSAPORTE_FLUXO_TEST=1` usa `.cache/passaporte-fluxo-next`, separado tanto de `.next` quanto de `.cache/pwa-next`. Não combinar servidores dev e produção sobre o mesmo diretório de saída.

Evidências da homologação local: `/private/tmp/pistaviva-fluxo-implementado/`. Logs de testes, lint, design e build: `/private/tmp/pistaviva-fluxo-*.txt`. Publicação posterior documentada no relatório vinculado no início.
