# Base offline do Pistaviva

## Comportamento

- O service worker é registrado em produção, via HTTPS (localhost funciona para teste).
- Após a primeira visita online concluir a instalação, abrir uma URL sem rede mostra `/pwa/offline.html`.
- O modo estrada funciona sem React, fontes remotas, mapas ou servidor. Exibe nomes e datas do último resumo salvo ao abrir o passaporte pessoal. Não inclui fotos ou artes dos selos.
- Uma leitura de GPS pode ser guardada offline. Ela é uma passagem pendente, não um carimbo confirmado. Ao voltar ao passaporte pessoal online, `CarimboCidade` envia a fila existente; servidor confere município e prazo de 72 horas.
- A tela offline não promete sincronização com aplicativo fechado. O usuário precisa abrir o passaporte online para enviar.
- Sem passaporte salvo, há orientação para criar ou recuperar com conexão. Sem espaço local, a gravação informa falha.
- O manifest abre no passaporte e oferece atalho para modo estrada.

## Dados e cache

O cache `pv-offline-v1` contém somente cinco arquivos públicos: HTML, CSS, JS, módulo de armazenamento e ícone. Nenhuma resposta de API, página privada, POST, payload RSC, foto ou credencial entra no Cache Storage. Páginas online e seus erros HTTP continuam vindo do servidor.

O resumo `selo:offline:v1` guarda primeiro nome, número, nomes/UFs/datas/tipos dos carimbos e data da cópia. Só é exibido quando o número coincide com o perfil local. A credencial permanece no perfil local já usado pelo produto; o resumo não a duplica. A fila existente `selo:pendentes:<codigo>` guarda coordenadas, precisão e horário até envio. Limpar dados do site remove essas cópias e pendências.

## Atualização

Ao alterar qualquer recurso de `public/pwa`, incremente `VERSION` em `public/sw.js`. O novo worker aguarda todas as abas antigas fecharem; não há `skipWaiting`, recarga forçada ou limpeza do localStorage. A interface informa atualização disponível. Ativação remove somente caches antigos com prefixo `pv-offline-`.

Não habilitar cache genérico de documentos Next ou `/api`: páginas pessoais contêm credenciais e cabeçalhos `no-store`.

## Verificação

`node --test tests/pwa.test.mjs` verifica escopo de cache, navegação offline, espera de atualização, isolamento do resumo e persistência/falha da fila.

Em build de produção: visitar online, aguardar `navigator.serviceWorker.ready`, desligar rede e abrir `/selo/passaporte` em nova aba. Conferir modo estrada e reabertura. Simular GPS, guardar passagem, recarregar e conferir pendência. Voltar online e abrir passaporte com conta de teste para verificar confirmação real.

Ainda requer homologação em aparelhos Android e iPhone, especialmente GPS sem sinal, instalação e persistência de armazenamento sob pressão de espaço. Service worker segue ciclo descrito pela [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers).

## Validação desta implementação

- Suite completa: 230 testes passaram; lint passou.
- Build de produção concluído, com avisos de CSS existentes e falhas de DNS do Supabase no ambiente de build. Isso não valida conteúdo remoto.
- Chrome headless com build de produção: registro automático, navegação offline, nova aba offline, resumo com 4 carimbos, GPS simulado, recarga preservando fila, erro de quota, retorno da conexão e estado sem perfil passaram.
- Na simulação CDP, desligar rede tanto da página quanto do target `service_worker`; desligar apenas a aba ainda pode permitir fetch do worker.
- Layout offline conferido em 320 e 390 px. Confirmação real de carimbo não foi disparada durante o teste.

## Homologação automatizada ampliada

Em 15/10/2026, 35 verificações passaram em Chromium e WebKit, incluindo reinício completo offline e ciclo de atualização. Consulte [relatório e pendências físicas](homologacao/pwa-2026-10-15/RELATORIO.md). Executor: `scripts/e2e/pwa-homologacao.mjs`. Use `PWA_TEST_BUILD=1` para separar build de homologação de `.next` usado em desenvolvimento.
