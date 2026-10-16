# Cadastro, fotos e consulta administrativa

Implementação local, ainda não publicada. Nenhuma migração foi aplicada em produção nesta etapa.

## Onde fica cada coisa

- Produção: cadastro, telefone, cidade/UF e coleção nas tabelas existentes do Supabase. Identificação personalizada em `pv_selo_identificacoes`, ligada ao mesmo motociclista. Senha e recuperação continuam separados em `pv_selo_acessos` e não entram nos relatórios.
- Retrato de identificação em `selo-fotos`, bucket privado já utilizado pelo site. JPEG de até 1440 px, sem EXIF/GPS. O banco guarda somente caminho interno. Fotos das passagens continuam no mesmo armazenamento e na moderação existente.
- Desenvolvimento: `.selo-local/db.json` e `.selo-local/fotos/`. Não grava no Supabase real.
- Imagens finais do passaporte são regeneradas com identificação, retrato e carimbos salvos. Cada download ou compartilhamento não cria uma cópia extra no servidor.

## Fluxo no celular

1. Abra “Personalizar e compartilhar”. Identificação salva é consultada com o acesso privado do passaporte.
2. Edite piloto, garupa, origem, assinatura e retrato. Edição fica no aparelho até tocar em “Salvar identificação no cadastro”.
3. Depois do salvamento confirmado, entrar em outro celular permite carregar os mesmos dados e retrato. Falha de rede mantém rascunho e permite tentar de novo.
4. “Remover minha foto” altera a edição; salvar confirma remoção no cadastro e no armazenamento. Exclusão do cadastro também remove identificação/retrato.

Amostra preenchida e identidade visual foram preservadas. Personalizar a demonstração não envia dados ou foto. Fotos anteriormente guardadas só no navegador precisam ser salvas pelo próprio usuário: não foram enviadas automaticamente.

## Consulta da equipe

`/admin/selo` → aba **Cadastros**. Busca por nome, telefone, cidade/UF ou número. Inclui pessoas sem visitas, exibe identificação, contagens, data de cadastro e permite ver/baixar o retrato privado. Fotos das passagens seguem nas abas **Fotos** e **Fotos de cidade**.

**Exportar todos os cadastros (CSV)** baixa lista completa, independente do período das visitas e da busca atual. UTF-8 com BOM para Excel; também pode importar no Google Planilhas. Exportação usa allowlist e bloqueia fórmulas. Não inclui imagens em bytes, caminhos de armazenamento, URLs assinadas, senhas, hashes, códigos de recuperação ou links pessoais. As fotos ficam consultáveis pelo painel autenticado, sem links públicos permanentes.

Integração Google Sheets existente passou a incluir aba **Cadastros** na sincronização completa, além de visitas/eventos. Só funciona com credenciais e IDs configurados. Configuração automática não foi ativada nesta etapa; baixar CSV funciona independentemente dela. Planilhas exportadas contêm dados pessoais e devem ficar restritas à equipe. Integração não substitui backup das imagens.

## Segurança e publicação

- Metadados e retratos privados exigem segredo em `Authorization`, nunca na query. Página pública e demonstração não consultam identificação privada. Respostas usam `private, no-store`, `no-referrer` e `nosniff`.
- Upload tem limite aplicado ao stream, validação dos campos, decodificação real, limite de pixels e rejeição de SVG/animação. Limite compartilhado de gravações falha fechado em produção.
- Tabela com RLS, sem acesso `anon`/`authenticated`; função de gravação exclusiva do servidor. Resolve dono sob bloqueio, rejeita link revogado e devolve retrato substituído para limpeza.
- Painel/CSV/foto administrativa usam `requireAdmin` em toda requisição. Token do passaporte não serve como sessão administrativa.
- Storage e banco existentes são reutilizados. Consumo continua sujeito às cotas do plano atual; não foi contratado serviço adicional.

Antes de publicar, aplicar `supabase_selo_identificacoes.sql` e a migração de acessos da etapa anterior. Runner explícito: `PV_SELO_IDENTIFICACOES_MIGRATION=2026-10-15`; build de produção verifica presença da tabela. Nunca ativar flag por padrão. Publicar snapshot isolado das alterações autorizadas, preservando demais trabalhos do workspace.

## Validação

Testes unitários cobrem campos, limites, fotos maliciosas/excessivas, remoção de EXIF, persistência por dono, exclusão, proteção contra fórmulas e ausência de segredos. PostgreSQL/WASM isolado testa migração idempotente, permissões, troca de foto, link revogado e cascata. Chrome local testa upload e consulta reais no store local, outro aparelho simulado limpando navegador, restrições de API, layout móvel e consulta/exportação administrativa com respostas simuladas. Não houve teste de consulta administrativa contra Supabase de produção; relação nova exige migração antes da homologação remota.

Referências técnicas: [relações e consultas aninhadas do Supabase](https://supabase.com/docs/guides/database/joins-and-nesting), [contagem e agregação no PostgREST](https://docs.postgrest.org/en/stable/references/api/aggregate_functions.html). Consulta usa o mesmo padrão de contagem já existente na listagem de parceiros.
