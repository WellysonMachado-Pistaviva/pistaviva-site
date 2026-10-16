# Cadastro e recuperação sem provedor de mensagens

Implementação local, não publicada. Nenhuma migração ou conta real foi criada na produção.

Usuário solicitou cadastro persistente e recuperação por três iniciais do nome, quatro últimos dígitos do telefone e cidade, sem custo de provedor. Esses dados foram mantidos na etapa de identificação. A implementação exige também código de recuperação gratuito, gerado pelo próprio site, para autorizar troca de senha. Não se implementou liberação automática somente por dados pessoais: eles podem ser conhecidos por terceiros.

## Fluxo implementado

1. Cadastro: nome, telefone completo com DDD, cidade/UF, senha e confirmação, aceite de privacidade. Conta e credenciais são gravadas na mesma transação.
2. Site mostra código de recuperação uma vez, com opções de copiar e baixar arquivo. Não envia WhatsApp, SMS ou email. Ao confirmar que guardou, pessoa abre passaporte. Senha e código de recuperação não vão para `selo:perfil`.
3. Outro aparelho: telefone completo e senha abrem mesma conta, número e coleção.
4. Esqueci a senha: pessoa informa três iniciais, quatro dígitos finais e cidade/UF do cadastro. Próxima etapa pede código salvo, nova senha e confirmação. Nenhuma existência de conta é revelada na etapa inicial.
5. Recuperação válida substitui senha e código de recuperação e troca segredo do link pessoal. Código anterior é de uso único, inclusive com tentativas simultâneas. Links privados antigos deixam de funcionar. Conta, número e carimbos permanecem. Pessoa guarda novo código e entra com nova senha; recuperação não faz login automático.
6. Cadastro antigo sem senha: dono com link salvo pode abrir “Criar minha senha”. Ativação só cria primeira credencial; nunca substitui senha existente. Quem perdeu link e não tem código precisa confirmar identidade com equipe em `/contato`. Nome e telefone não são comprovação suficiente.

Não há cobrança de mensagens. Continuam existindo custos e limites normais da hospedagem e do banco já utilizados. Código offline não é OTP enviado; não requer conta em provedor. Se pessoa perder código e senha, não há recuperação automática nesta modalidade. Usuário deve guardar arquivo fora do aparelho, por exemplo num gerenciador de senhas.

## Proteções e persistência

- Nova tabela `pv_selo_acessos`, ligada à pessoa por FK, com exclusão em cascata, RLS e permissões somente para service role. Nenhum dado de senha é incluído em perfis, ranking ou respostas da coleção.
- Senha: bcrypt com custo 12 e salt aleatório por senha. Mínimo de 12 caracteres; limite de 72 bytes evita truncamento do bcrypt, inclusive com Unicode. Confirmação obrigatória. Nada de senha em texto puro ou “senha derivada” dos dados pessoais.
- Recuperação: 128 bits aleatórios, exibidos como oito grupos de quatro caracteres. Banco guarda SHA-256 do código aleatório, não código legível. Validação ignora hífens, espaços e caixa. Código offline vale até uso; depois é substituído.
- Nome/cidade: comparação ignora acento, caixa e pontuação. Estado diferencia cidades homônimas. Código único identifica dono mesmo quando duas pessoas têm mesmas iniciais, cidade e dígitos finais.
- Login tem erro genérico para conta ausente e senha errada e executa bcrypt nos dois casos. Serviço revalida hash antes de entregar link, protegendo corrida com redefinição de senha.
- Ativação, login e recuperação: limite de 20 tentativas por IP e 5 por identificador em 15 minutos. Identificadores são guardados no limitador como hash com segredo do servidor. Se limitador compartilhado estiver indisponível em produção, autenticação bloqueia; não cai para limite isolado de instância.
- Logs de acesso não incluem telefone, senha, código de recuperação ou link pessoal. Credenciais são enviadas em ações POST, nunca query string.
- Formulários só aceitam digitação após hidratação. Erros são associados aos campos e recebem foco. Código gerado recebe foco e rolagem; cadastro preserva amostra preenchida e identidade visual do passaporte.

## Compatibilidade e limites

Links privados continuam sendo credenciais de acesso; quem tem link ainda abre passaporte. Esta etapa acrescenta senha para reencontrar acesso e rotaciona links na recuperação, sem migrar todas as páginas e ações antigas para sessão HttpOnly. “Esquecer este celular” continua removendo cópias locais, sem revogar link no servidor. Telefone de cadastro não passa a ser verificado: não existe prova de posse da linha sem canal ou outra confirmação independente.

Senhas e códigos não podem ser recuperados pelo painel como texto. Código exibido no cadastro não reaparece ao recarregar página. Quem perdeu arquivo precisa usar senha ou atendimento; não existe fallback por dados públicos. Cadastros já existentes não recebem senha ou código inventado automaticamente.

## Validação local

- Suite Node: 255 testes passaram, incluindo nove testes de autenticação: persistência dos hashes, duplicação, negativa uniforme, recuperação sem código rejeitada, preservação de conta/carimbos, invalidação, concorrência, colisão de dados, ativação de cadastro antigo e exclusão.
- PostgreSQL temporário em WASM (`PGlite`): migração aplicada duas vezes; cadastro transacional, rollback de falha, duplicação, confirmação, reset único, bloqueio de leitura/execução por `anon` e `authenticated` e cascade passaram. Usa tabela mínima de teste e função de cadastro original, sem conexão externa.
- Chrome com conta fictícia exclusivamente local: cadastro, download do código, novo acesso, senha errada, recuperação sem código, código incorreto, reset, link antigo 404, senha antiga recusada, conta preservada e limite de tentativas passaram. Conta removida ao final.
- Sem transbordamento em 320, 390, 430 e 844 px em paisagem. Fontes e papel oficiais conferidos. Não houve teste em aparelho físico.
- Lint e build local passaram. Auditoria de design mantém os 197 desvios anteriores. Build final usa `PASSAPORTE_ACESSO_BUILD=1 npm run build`, com saída exclusiva em `.cache/passaporte-acesso-build`, sem executar migrações nem pré-voo contra banco real. Primeiro build nessa pasta nova não conseguiu baixar fontes na rede restrita; repetição com rede autorizada concluiu. Instância exclusiva de desenvolvimento foi encerrada após testes; demais servidores foram preservados.

Executores: `tests/selo-acesso.test.mjs`, `scripts/e2e/passaporte-acesso.mjs` e `scripts/e2e/passaporte-acesso-sql.mjs`. Biblioteca PGlite é ferramenta temporária de teste, não dependência da aplicação. Única dependência nova de produção: `bcryptjs`.

Evidências: `/private/tmp/pistaviva-acesso-mobile/report.json`, capturas na mesma pasta, `/private/tmp/pistaviva-acesso-sql-report.json` e logs `/private/tmp/pistaviva-acesso-*.txt`.

## Preparação para publicar

Revisar release isolada sobre deploy vigente; workspace contém alterações pendentes de outros lotes. Incluir tabela, quatro funções, dependência/lockfile, novas telas e integração. Executar `supabase_selo_acessos.sql` antes de servir novos formulários. Executor `scripts/migrate-selo-acessos.mjs` exige flag explícita `PV_SELO_ACESSOS_MIGRATION=2026-10-15` no build, confere projeto e privilégios. Pré-voo passa a exigir tabela nova. Nenhuma flag foi configurada e nenhum SQL de produção foi executado nesta tarefa.

O banco de produção deverá confirmar também consulta da relação usada pelo PostgREST e permissões do service role antes da promoção. Publicar com `--skip-domain`, verificar autenticação em ambiente de homologação e só então promover. Evitar contas/carimbos fictícios em produção; testes destrutivos fornecidos recusam domínio público.

Referências: [OWASP — recuperação de senha](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html), [bcrypt.js — limite de 72 bytes](https://github.com/dcodeIO/bcrypt.js), [PostgREST — relações e filtros por alias](https://docs.postgrest.org/en/v13/references/api/resource_embedding.html).
