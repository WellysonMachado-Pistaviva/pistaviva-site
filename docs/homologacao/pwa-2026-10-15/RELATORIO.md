# Homologação PWA — 15/10/2026

**Resultado: homologação automatizada aprovada. 35 verificações passaram. Homologação física Android/iPhone ainda pendente.**

Teste executado sobre build de produção local isolado, sem publicar alterações ou gravar carimbos no Supabase. Perfis, coleção e GPS de teste são fictícios.

## Matriz executada

| Ambiente | Verificações | Resultado |
| --- | ---: | --- |
| Chrome/Chromium, perfil mobile Pixel 7 | 15 | Passou |
| WebKit 26.5, perfil mobile iPhone 13 | 14 | Passou |
| Chrome/Chromium, atualização e reinício | 3 | Passou |
| WebKit, atualização e reinício | 3 | Passou |

Versões exatas e verificações individuais: [resultados.json](resultados.json).

Foram verificados:

- Registro automático do service worker no build de produção.
- Manifest, endereço inicial e ícones acessíveis.
- Critérios automáticos de instalação do Chromium: nenhum erro informado por `Page.getInstallabilityErrors`. Isso não representa instalação real no Android.
- Menu mobile começa fechado, abre e fecha.
- Navegação offline e resumo local com seis carimbos.
- GPS negado e timeout, com mensagem e possibilidade de tentar novamente.
- Captura simulada, persistência da fila após recarregar e abertura de nova aba sem rede.
- Layout em 320 px, 390 px e paisagem 844 × 390, sem overflow horizontal da página.
- Falha explícita com armazenamento cheio.
- Cache contendo somente cinco arquivos públicos, sem páginas privadas ou APIs.
- Retorno da conexão, indicação de pendência vencida e tratamento de resumo corrompido.
- Orientação de recuperação e captura desabilitada quando não existe perfil local.
- Atualização permanece aguardando enquanto formulário está aberto; não há reload nem perda do texto.
- Fechar abas permite ativação da nova versão, removendo somente cache antigo e preservando localStorage.
- Fechar completamente o navegador e reabrir com origem inacessível preserva worker, coleção e passagem pendente.

## Evidências

- [Tela mobile Chromium](chromium-mobile.png).
- [Tela mobile WebKit](webkit-mobile.png).
- Resultado estruturado em JSON no mesmo diretório.
- Traces detalhados da execução ficam em `/tmp/pistaviva-pwa-homologacao`; não foram adicionados ao repositório.

## Método e ajustes de ambiente

Emulação de dispositivos configura viewport, toque e identificação do navegador; não reproduz todo o comportamento de um aparelho físico. [Documentação oficial do Playwright](https://playwright.dev/docs/emulation).

Chrome usou perfil persistente descartável: modo anônimo bloqueia elegibilidade para instalação. WebKit apresentou erro interno com a opção de rede offline do executor; a matriz final cortou conexões em um proxy local, preservando comportamento real de falha de rede do service worker. Chrome também recebeu emulação offline do navegador. O teste de ciclo de atualização serve os mesmos arquivos públicos numa origem isolada e altera somente a versão do worker na resposta da fixture, sem modificar arquivos do projeto.

Pasta `.next` foi alterada durante uma execução intermediária. Para evitar disputa com desenvolvimento, `PWA_TEST_BUILD=1` passou a gerar/servir em `.cache/pwa-next`, ignorado pelo Git e pelo lint. O build isolado final concluiu com acesso às fontes externas; permaneceu aviso preexistente de CSS (`align-items: end`). Lint e cinco testes unitários PWA passaram.

A posição do menu fechado no WebKit fica 0,083 px abaixo do limite esperado por arredondamento de transformação. A asserção aceita tolerância de 1 px; inspeção confirmou estado fechado. Nenhuma alteração visual foi necessária.

## Reproduzir

Requer Node, Playwright e navegadores disponíveis. O script aceita `PLAYWRIGHT_MODULE` para reutilizar instalação existente, `PLAYWRIGHT_BROWSERS_PATH` para binários, `CHROME_BIN` para Chrome e `PWA_TEST_OUTPUT` para evidências.

```sh
PWA_TEST_BUILD=1 npm run build
PWA_TEST_BUILD=1 npm run start -- --hostname 127.0.0.1 --port 3001
```

Em outro terminal:

```sh
# Se Playwright não estiver instalado no projeto, informe caminho para index.mjs.
PLAYWRIGHT_MODULE=/caminho/playwright/index.mjs \
PLAYWRIGHT_BROWSERS_PATH=/caminho/browsers \
node scripts/e2e/pwa-homologacao.mjs

node --test tests/pwa.test.mjs
npm run lint
```

## Pendências para homologação física

Não havia ferramentas Android/ADB ou simulador iOS disponíveis neste ambiente. WebKit desktop com perfil iPhone não equivale a Safari instalado num iPhone.

1. **Android/Chrome:** instalar pela interface do aparelho; abrir pelo ícone e confirmar janela standalone.
2. **iPhone/Safari:** adicionar à Tela de Início e abrir pelo ícone. Conferir se perfil e resumo estão disponíveis no contexto instalado; se necessário, recuperar passaporte dentro dele.
3. **Ambos:** abrir passaporte online, ativar modo avião, encerrar app e reabrir. Conferir resumo, controles e orientação sem perfil.
4. **GPS físico:** em área aberta, permitir localização sem sinal e guardar passagem. Medir timeout e precisão. Não concluir que GPS real funciona com base na simulação.
5. **Confirmação ponta a ponta:** reconectar e abrir conta de homologação em ambiente separado; verificar carimbo único no servidor e retirada da fila. Este teste não gravou conquistas reais.
6. **Sistema operacional:** verificar rotação, teclado, área segura, atualização com duas janelas abertas e persistência após pressão de armazenamento.

Até esses itens passarem, o resultado não deve ser apresentado como homologação completa em Android/iPhone físicos.
