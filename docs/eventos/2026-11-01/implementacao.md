# 2º Café com Moto — implementação

Evento: cbb79f85-3cbf-4dea-8dda-1df38d2c0261.
Data: 1 de novembro de 2026, às 9h, horário de Brasília.
Local: Bar do Miguelzinho, Garganta do Registro.

## Conteúdo

Informações fornecidas pelo organizador; cartaz original localizado em Downloads e publicado sem alteração. Realização e apoio com todos os perfis fornecidos. Fotografia oficial Don Cruz. Vídeo anterior incorporado pelo Instagram com link alternativo; reprodução sujeita à disponibilidade da plataforma. Não foi afirmada gratuidade porque o texto não informa preço; campo exibe Consultar organização. Horário de encerramento não informado no Event da página individual.

## Saídas

Publicação com nome, cidade/UF, data, hora, ponto de encontro e recado. Participação Vou junto, nomes públicos, comentários por saída, desfazer participação e exclusão própria. Não exige cadastro. Cookie HttpOnly identifica o navegador; seu hash fica privado no banco. Limpeza de cookies perde controle das publicações, conforme aviso na interface. Moderação administrativa permitida pela API existente para três tabelas novas.

Saídas são combinadas pelos participantes e não aumentam o contador Eu vou do evento. Zero participantes de demonstração são mantidos.

## Validação

- 70 testes unitários aprovados; auditoria de design sem desvios.
- Integração com duas sessões: criar, marcar sem duplicação, comentar, atualizar, negar exclusão alheia, excluir próprio conteúdo, negar origem externa, cooldown, limite persistente e remoção após limite.
- Acesso anônimo direto às tabelas e RPC bloqueado.
- Fluxo real no navegador em 390 e 1440 pixels; sem overflow horizontal. Atualizar saídas trouxe nome e comentário da outra sessão.
- Cartaz e imagem de capa carregados; endereço do iframe Instagram conferido.
- Build de produção concluído. Lint local não executou devido a dependência preexistente incompleta de zod/external.cjs; compilação remota e testes passaram.

Release isolado construído a partir de dpl_AxySY5mQRXmGzD6nSRSrPByiGsc4. Mantidas alterações locais não relacionadas. Migração aditiva em supabase_event_departures.sql, restrita a novas tabelas e RPC, opt-in no build PV_EVENT_MIGRATION=2026-10-07.
