# Publicação do fluxo mobile do passaporte

Publicação solicitada pelo usuário em 15/10/2026 e concluída. URL: <https://www.pistavivamototurismo.com.br/selo/passaporte>.

Correção visual posterior restaurou amostra preenchida na entrada e alinhou páginas relacionadas: [publicação da correção](passaporte-amostra-identidade-correcao-2026-10-15.md).

## Release

- Deploy: `dpl_32TQfknopf8aVVy5FxaMsLVq2mnz`, estado `READY`.
- URL imutável: <https://pistaviva-pfzf129d7-wellysons-projects-b1d6c92a.vercel.app>.
- Aliases `www.pistavivamototurismo.com.br` e `pistavivamototurismo.com.br` confirmados no novo deploy pela API da Vercel.
- Base/rollback: `dpl_7Uvo1Mymoza8LKvmqNg8p8wms8vW` — <https://pistaviva-qegjkkv4k-wellysons-projects-b1d6c92a.vercel.app>.

Release montada em `/private/tmp/pistaviva-fluxo-publicar-P6pFg4`, recuperando a base exata de produção e verificando SHA-1 de seus 1.029 arquivos. Manifesto final: 1.067 arquivos, sem `.env`, dados locais, caches, dependências instaladas ou estado dos agentes. Alterações administrativas e de benefícios pendentes no workspace ficaram fora da release. Nenhum commit, reset ou limpeza do trabalho local foi executado.

Inclui implementação mobile descrita em `passaporte-fluxo-mobile-implementacao-2026-10-15.md` e suas dependências de jornada: mapa pessoal, memórias privadas, identificação com a arte aprovada, modo estrada e proteção das URLs privadas nas métricas. Inclui pré-voo da nova tabela e executor explícito de migração no build.

## Banco e implantação

Aplicada `supabase_selo_memorias.sql`: tabela aditiva `pv_selo_memorias`, chave por entrada, exclusão em cascata, limite de 800 caracteres, RLS habilitada e permissões somente para service role. Executor conferiu permissões no PostgreSQL. Consulta anônima pela API confirmou bloqueio `42501`.

Primeiro build (`dpl_DaQJWJS9PKJxay7W2ZUzyJbupE7f`) aplicou e verificou a migração, mas parou no pré-voo porque o cache de esquema do PostgREST ainda não havia atualizado. O domínio permaneceu na release anterior. Pré-voo passou a repetir consultas que recebem `PGRST205` por até 12 segundos; após confirmação da tabela disponível, novo build passou. Flag `PV_SELO_MEMORIAS_MIGRATION=2026-10-15` foi usada apenas no primeiro build; não foi configurada globalmente.

Novo deploy foi criado com `--prod --skip-domain`, validado em sua URL imutável e depois promovido. Rollback consiste em promover o deploy anterior; tabela nova pode permanecer, sem afetar código antigo.

## Validação

- Release isolada: 246 testes aprovados e lint aprovado. Build realizado pela Vercel com ambiente de produção e pré-voo do banco aprovado. Dívida anterior de 197 desvios na auditoria de design permanece; não se declara aprovação de `npm run check` completo.
- Smoke test em Chrome com toque emulado, antes e depois da promoção: CTA leva ao cadastro e posiciona formulário; máscara de telefone; quatro ações mobile; editor e mapa sob demanda; zoom com 44 px; menu Mais; recuperação assistida.
- Sem transbordamento horizontal em 320, 390, 430 e 844 px em paisagem.
- API do passaporte rejeita credencial em query com `401` e `no-store`; API de memórias sem credencial retorna `401`; prévia de desenvolvimento retorna `404`.
- Modo estrada e service worker publicados com cabeçalhos de atualização. Homologação offline completa anterior permanece documentada em `homologacao/pwa-2026-10-15/RELATORIO.md`; smoke de produção verifica disponibilidade, sem atestar aparelhos físicos.
- Modelo gera download JPEG sem alterar perfil salvo. Editor opcional abre pela navegação e consulta coleção via Bearer, com resposta simulada apenas no navegador de teste.
- Nenhuma conta, relato, foto ou carimbo real foi criado nos testes de produção. Gravações de aplicação foram bloqueadas no navegador. Alterações do banco limitaram-se à migração e ao contador temporário do pré-voo.

Evidências: `/private/tmp/pistaviva-fluxo-cloud/report.json`, `/private/tmp/pistaviva-fluxo-producao/report.json`, capturas e JPEG nas mesmas pastas. Logs e manifesto: `/private/tmp/pistaviva-fluxo-release-*.txt`, `pistaviva-fluxo-build-cloud-final.txt`, `pistaviva-fluxo-manifest.json` e `pistaviva-fluxo-status.json`. Arquivo temporário de variáveis foi removido.

## Pendências operacionais

Recuperação automática por WhatsApp/SMS continua sem provedor configurado. Sem link pessoal salvo, usuário deve falar com a equipe e comprovar identidade. Não reativar recuperação por telefone e nome. Links pessoais continuam sendo credenciais; migração para sessão HttpOnly e homologação em aparelhos físicos seguem pendentes, conforme relatório de implementação.

Pré-voo também manteve avisos anteriores de ausência das variáveis de Google Sheets, cron e salt no ambiente consultado. Publicação não configura essas integrações nem comprova seu funcionamento.
