# Café com Moto e saídas compartilhadas

Evento: 2º Café com Moto na Serra, Garganta do Registro, Bar do Miguelzinho, 1/11/2026 às 9h (America/Sao_Paulo). Usar cartaz fornecido, realizadores e apoiadores informados. Vídeo anterior incorporado por Instagram, com link alternativo. Sem inventar preço, encerramento ou confirmação de presença.

## Aceitação

- Evento na agenda, URL individual, mapa por referência e sitemap.
- Visitante publica nome, cidade/UF, data/hora, ponto público de encontro e comentário opcional.
- Outros visitantes marcam Vou junto com nome e podem comentar em cada saída; podem desfazer participação.
- Autor pode excluir sua saída ou comentário no mesmo navegador. Sem cadastro obrigatório.
- Estados de carregamento, vazio, erro e sucesso; formulários acessíveis em celular.

## Arquitetura e segurança

Interface segue estilo da página de eventos. API Next.js filtra campos públicos e valida origem, tamanho e formato. Cookie aleatório HttpOnly, SameSite=Lax, Secure em produção, 32 bytes, identifica propriedade no servidor; apenas SHA-256 persistido, nunca enviado nas respostas. Nomes são autodeclarados, não contas verificadas. Limpar cookies perde controle do conteúdo, informado na interface.

Tabelas novas privadas com RLS, sem acesso anon/authenticated. RPC exclusiva de service_role executa mutações atomicamente e limita frequência por sessão e origem de rede com hash. Chave administrativa só no servidor. Queries parametrizadas; texto exibido via React, sem HTML. Exclusão exige propriedade; FK mantém evento/saída/comentário coerentes. Rate limit persistente, índices e limites de leitura. API administrativa existente poderá moderar novas tabelas.

Verificação: testes de validação e filtragem; integração com duas sessões para criar, comentar, marcar/desmarcar e negar exclusão alheia, limpeza de dados de teste; permissões anon; build e navegador móvel. Publicação isolada preserva mudanças locais não relacionadas.
