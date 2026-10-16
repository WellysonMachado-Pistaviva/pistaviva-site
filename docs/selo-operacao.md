# Selo da Estação — operação

## Fluxo

1. No painel `/admin/selo`, abra **Imprimir QR do balcão** (rota `/selo/balcao`). Informe o endereço público do site, gere e imprima o cartaz. O QR aponta para `/selo?local=parque` e serve para todas as temporadas. `localhost` é recusado porque não funciona no celular do visitante.
2. No balcão, a pessoa carimba o passaporte e preenche nome, WhatsApp pessoal, cidade/UF e percurso. Foto é opcional.
3. O servidor identifica o cadastro pelo WhatsApp normalizado, calcula a temporada e devolve um único selo. Novo envio, outro ponto de QR ou outra chave de envio na mesma temporada recuperam o mesmo registro.
4. O digital fica no link pessoal, com coleção por ano e download SVG de cada selo conquistado. Guarde esse link: ele permite acesso ao perfil, sem login.
5. Antes de entregar o adesivo físico, o atendente autenticado busca a pessoa no painel **Balcão**, confere o cadastro e o passaporte carimbado e clica em **Confirmar entrega do adesivo**. Só a primeira confirmação grava; posteriores recebem conflito. A entrega só é permitida na estação/ano atual. Reabra o perfil para ver o status atualizado.

## Identificação e limites

A chave de identificação é o WhatsApp pessoal, obrigatório. Não existe verificação por SMS nem identificação documental: outro telefone permite outro cadastro. A equipe deve conferir a pessoa/passaporte na retirada. Telefones compartilhados representam o mesmo cadastro. Não anuncie este mecanismo como prova de identidade civil.

O QR é público e não comprova presença. A conferência e a confirmação autenticada no balcão controlam a entrega física. Abrir o link pessoal ou baixar a imagem não autoriza uma nova entrega. Cadastro repetido não altera o nome da pessoa nem autoriza substituir a foto da visita por uma nova chave de envio.

Mantido calendário trimestral existente: janeiro–março = verão; abril–junho = outono; julho–setembro = inverno; outubro–dezembro = primavera. Ano e mês usam America/Sao_Paulo. A mesma estação no ano seguinte permite um novo selo.

## Banco e implantação

Em desenvolvimento, `.selo-local/` continua sendo o armazenamento padrão. Produção usa Supabase. Esta alteração não executa SQL em produção automaticamente.

Antes de publicar o código, aplique `supabase_selo.sql` no Supabase. A migração é transacional e adiciona:

- índice único `(motociclista_id, estacao, ano)`;
- campo `retirado_em`;
- registro serializado por WhatsApp, sem a antiga janela de dez minutos;
- rejeição de registro sem WhatsApp.

Em banco já preenchido, consulte duplicatas primeiro:

```sql
select motociclista_id, estacao, ano, count(*)
from public.pv_selo_visitas
group by motociclista_id, estacao, ano
having count(*) > 1;
```

Se houver duplicatas legadas, o índice interrompe a transação sem apagar registros ou fotos. Revise esses casos com a operação e preserve o histórico necessário antes da migração. Cadastros legados sem telefone continuam consultáveis; o formulário não cria novos cadastros sem identificação. Não há confirmação retroativa automática de retiradas: concilie entregas anteriores antes de operar.

Sem aplicar a migração, a versão Supabase não está pronta para o novo fluxo. O painel exige uma sessão administrativa válida, inclusive no desenvolvimento.

## Verificação

`npm run check` executa lint, auditoria visual e testes. Testes do selo cobrem validação, normalização de telefone, reenvio, repetição após dias e entre pontos de QR, preservação do nome, estação/ano seguinte, retirada única e bloqueio fora da temporada.

## Desbloqueio e número de colecionador

A coleção distingue **bloqueado** (estação futura), **disponível** (estação atual sem visita), **registrado sem confirmação**, **confirmado** e **não conquistado** (estação encerrada sem visita). A próxima temporada aparece bloqueada inclusive na virada de ano. Desbloquear não emite automaticamente: é necessário registrar a visita da nova estação. O servidor também impede download de selos futuros, mesmo se existirem registros antecipados no banco.

O número único já atribuído à pessoa é o **número de colecionador do Parque**, separado de eventual numeração oficial da Rota Biker. Nenhum cadastro foi renumerado. O mesmo número acompanha todos os adesivos da pessoa. A equipe confere o passaporte físico da Rota Biker, carimba e entrega o adesivo numerado; o site registra e certifica a visita. O download digital inclui “COLECIONADOR Nº” e só fica disponível após confirmação no balcão.

## Conquistadores de Itajubá

Regra definida: quatro estações distintas **no mesmo ano civil**, todas com entrega confirmada pelo atendente. Estações de anos diferentes não se somam. Cada ano completo libera certificado próprio em `/selo/m/{codigo}/certificado?ano=AAAA`, com nome, número e datas das quatro confirmações. A pessoa pode imprimir ou salvar em PDF pelo navegador. O certificado independe de autorizar publicação. Registros sem confirmação e temporadas futuras não qualificam.

Depois de completar o ano, a pessoa pode autorizar na coleção a publicação do nome, cidade/UF, número de colecionador e ano. Não há caixa pré-marcada. Na aba **Conquistadores** de `/admin/selo`, a equipe aprova ou retira a publicação. A lista aprovada aparece em `/selo/mural` e no feed interativo de `/comunidade`. Não são criados posts duplicados: ambos consultam a mesma lista. Telefone, código do perfil, chave de envio e fotos não são incluídos nessa lista pública.

A pessoa pode retirar a autorização na coleção. O servidor remove imediatamente a elegibilidade pública e exige nova aprovação se houver novo consentimento. As telas públicas buscam dados sem cache e atualizam ao retomar foco. Certificado e histórico continuam disponíveis. Exclusão do cadastro também remove as autorizações e publicações.

Aplique novamente `supabase_selo.sql` antes de publicar: além das alterações anteriores, cria `pv_selo_conquistas`, com RLS, vínculo único pessoa/ano, exclusão em cascata e funções que verificam consentimento e conclusão antes da aprovação. Nenhum dado real foi publicado automaticamente.

## Retorno à cidade e WhatsApp

A coleção oferece links para agenda do Parque e planejamento de visita. Quando o grupo existir, configure `SELO_WHATSAPP_GRUPO_URL` no servidor com um convite HTTPS de `chat.whatsapp.com`. Sem convite válido, o botão não aparece. O sistema não cria grupo nem adiciona pessoas; entrada é uma escolha separada e informa que o número pode ficar visível no grupo.

## Check-in por localização e foto do passaporte

Depois do cadastro, a coleção pessoal pede o **check-in** da estação:

- **GPS**: dentro do raio do ponto (`SELO_GEO_PARQUE`, formato `lat,lng[,raio]`, raio padrão 300 m), o selo digital é liberado na hora. Sinal com precisão pior que ±200 m é recusado; até ±100 m de imprecisão desconta da distância. Coordenadas da pessoa não são gravadas: ficam método, distância e precisão.
- **Foto do passaporte carimbado**: alternativa sem GPS (permissão negada, sinal ruim, ponto sem coordenada). Também libera o selo digital na hora.

O check-in **não substitui o balcão**. GPS de navegador é falsificável. Ele libera só o selo digital (download com "CHECK-IN NO PARQUE"). Adesivo físico, "VISITA CONFIRMADA" e o certificado de Conquistador continuam exigindo **Confirmar entrega do adesivo** no Balcão.

No painel, aba **Balcão**, cada visita da estação mostra método, distância e a foto do passaporte. **Recusar check-in** volta o selo digital a pendente (não desfaz entrega já confirmada). A aba **Check-in** mostra quais pontos têm GPS ativo e captura a coordenada: fique no centro do ponto, capture, copie a linha para as variáveis do servidor e publique de novo.

## Código de benefício

Cada pessoa pode receber um código aleatório de 8 caracteres (ex. `K7QM-3XPA`, sem I/L/O/0/1). Diferente do nº de colecionador, não é sequencial nem adivinhável. Ele só aparece na coleção depois de **endereço completo** (CEP, rua, número, bairro) **e** ao menos uma entrega confirmada no balcão ou check-in por **GPS**. Check-in só por foto do passaporte libera o selo digital, mas não o código: qualquer arquivo sobe sem revisão, então o desconto espera a confirmação no balcão.

Na aba **Benefício**, o atendente digita o código: formato errado ou inexistente é recusado sem revelar dados. Código válido mostra nome, número, check-ins e usos anteriores; **Registrar uso** grava data e nota. Ainda não há limite automático de usos: defina a regra do desconto antes de divulgar.

Aplique de novo `supabase_selo.sql`: adiciona colunas de check-in em `pv_selo_visitas`, endereço e `cupom` em `pv_selo_motociclistas`, e a tabela `pv_selo_beneficio_usos`.

## Painel de parceiros (Parque e estabelecimentos)

No admin, aba **Parceiros**, crie um parceiro por estabelecimento (ex.: "Parque da Cidade · Lanchonete", "Restaurante X"). Cada um recebe um link secreto `/selo/parceiro/{token}`. **Copiar link** e envie ao responsável do estabelecimento. Não precisa de login.

No link, o atendente do parceiro digita o código que o colecionador mostra e vê:

- **Cadastro completo** (endereço preenchido);
- **Carimbo no Parque** (check-in por GPS, foto do passaporte ou balcão, com a última estação);
- **Benefício válido**: só quando os dois anteriores estão ok.

Aparecem só o primeiro nome + inicial e o nº de colecionador, para conferir com a pessoa. Endereço, telefone e link pessoal não aparecem. **Registrar desconto aplicado** grava o uso ligado ao parceiro (com nota opcional) e mostra quantas vezes o código já foi usado ali. O servidor confere de novo antes de gravar.

Se um link vazar, **Desativar** derruba o acesso na hora (a página passa a responder 404); crie outro. A página não é indexada, não é guardada em cache e não envia o link como referência a outros sites. As consultas têm limite por IP para impedir varredura de códigos.

Aplique de novo `supabase_selo.sql`: cria `pv_selo_parceiros` e adiciona `parceiro_id` em `pv_selo_beneficio_usos`.

## Identidade visual da entrada

`/selo` usa o mesmo `EditorialHero`, navegação global, faixa de atalhos e tokens visuais da home e dos Monumentos da Rota Biker. Fotos do Parque e mockup enviados pelo projeto ficam em `public/selo/` como WebP; o mockup tem legenda de imagem ilustrativa. Estilos exclusivos ficam em `app/selo/selo-landing.css`.

O marcador `.selo-landing` mantém cabeçalho e rodapé somente na entrada. Recuperação, balcão, coleção e demais subrotas continuam no modo operacional. O CTA do hero leva direto a `#selo-cadastro`; `SeloForm`, identificação do local e estação dinâmica permanecem no fluxo existente.

O mockup animado `PassaporteMockup` aparece antes da foto na entrada, como demonstração da coleção completa. Nas coleções anuais, recebe nome, número, visitas e horário do servidor: aplica somente selos digitais liberados ou confirmados, mantendo espaços futuros vazios. Etiquetas diferenciam entrega física confirmada de liberação digital. Animação pessoal carimba uma vez e mantém o selo visível; movimento reduzido exibe o estado final sem animação.

## Benefícios do motociclista

| Benefício | Regra | Onde registra |
|---|---|---|
| Cafezinho de boas-vindas | Para quem chega de moto. Sem conferência no sistema. | — |
| 10% de desconto | Código do colecionador (endereço completo + balcão ou check-in GPS; foto não vale). | Painel do parceiro → "Registrar desconto aplicado" |
| Almoço grátis | 4 estações do **mesmo ano** confirmadas **no balcão** (`retirado_em`). Check-in por GPS/foto não conta. Um almoço por ano completo, em qualquer parceiro. | Painel do parceiro → "Registrar almoço concedido" |

- O banco impede dois almoços do mesmo ano (`pv_selo_beneficio_usos_almoco_uidx`). Dois caixas ao mesmo tempo: o segundo recebe "Almoço de {ano} já foi registrado".
- Usos antigos sem `tipo` contam como desconto.
- Depois de atualizar o código, rode de novo `supabase_selo.sql` (cria `tipo`, `ano` e o índice).


## Planilhas (Google Sheets): oficial + reserva

O banco (Supabase) é a fonte da verdade. As planilhas são cópias:
- **Oficial:** aba `Eventos` recebe cada cadastro, check-in, entrega no balcão e check-in revogado **na hora**; aba `Visitas` é refeita todo dia às 03h (Brasília).
- **Reserva:** aba `Visitas` refeita todo dia + 7 abas datadas (`Cópia AAAA-MM-DD`), a mais antiga sai sozinha.
- Se o Google falhar, o cadastro não é afetado; a cópia diária repõe tudo.
- Sincronizar na hora: no admin, ação `planilhas-sincronizar` (POST `/api/admin/selo` com `{"acao":"planilhas-sincronizar"}`).

### Configurar (uma vez)
1. Google Cloud → novo projeto → ativar **Google Sheets API**.
2. IAM → Contas de serviço → criar → Chaves → **JSON**.
3. Criar 2 planilhas, de preferência em contas/pastas diferentes. Compartilhar as duas com o e-mail da conta de serviço como **Editor**.
4. Na Vercel (Production), definir: `GOOGLE_SA_EMAIL`, `GOOGLE_SA_PRIVATE_KEY` (campo `private_key` do JSON), `SELO_PLANILHA_OFICIAL`, `SELO_PLANILHA_RESERVA` (ID entre `/d/` e `/edit` da URL), `CRON_SECRET` e `RATE_LIMIT_SALT` (aleatórios, 32+ caracteres).
5. Apagar o JSON do computador depois de colar a chave.

LGPD: as planilhas têm nome e WhatsApp. Acesso só para a equipe, com 2FA. Ao excluir uma pessoa no admin, a próxima cópia diária já sai sem ela (a reserva guarda até 7 dias).

## Publicar sem susto (ordem obrigatória)
1. `npm run check` (tudo verde) e `npm run selo:ataque` com `npm run dev` rodando.
2. No Supabase → SQL Editor: rodar `supabase_selo.sql` inteiro, depois `supabase_selo_cidades.sql` e depois `supabase_selo_mapa.sql` (os três idempotentes). O último libera passaporte criado pelo site, carimbo de cidade sem foto obrigatória, check-in offline, fotos públicas no mapa e denúncias.
3. `npm run selo:preflight` → precisa terminar em "Banco pronto para publicar".
4. Configurar as variáveis da Vercel (acima) e fazer o deploy. O build roda o pré-voo de novo: se o banco não estiver pronto, o deploy **falha e o site atual continua no ar**.
5. Depois do deploy: abrir `/selos`, fazer um cadastro de teste, conferir a linha na aba `Eventos` e chamar `planilhas-sincronizar`.

## Carimbos de cidade da Rota Biker
Uma cidade por município com monumento (42). Catálogo e contornos em `app/lib/selo/cidadesRotaBiker.json`, gerados por `node scripts/build-selo-cidades.mjs` (rode de novo quando o catálogo de monumentos mudar).

- Link pessoal → "Tirar foto e carimbar": foto + GPS. O servidor descobre a cidade pelo GPS dentro do contorno do IBGE (folga de até 100 m na divisa, sinal pior que 200 m é recusado). Coordenada não é gravada.
- A foto sobe para `selo-fotos/cidade-{pessoa}-{dia}-{cidade}.jpg`; o carimbo só grava se a foto existir nesse caminho, que só é liberado depois do GPS conferido. Um carimbo por cidade por dia.
- GPS de navegador é falsificável: o carimbo de cidade é digital, sem adesivo nem benefício.
- Passaporte público em `/selo/passaporte/{nº}`: só com autorização no link pessoal (`passaporte_publico_em`). Mostra primeiro nome + inicial, cidade/UF, cidades com datas e estações confirmadas no balcão. Nunca fotos, WhatsApp ou endereço. Fora da busca (noindex).
- Excluir a pessoa no admin apaga os carimbos e as fotos deles.


## Carimbo de cidade, mapa e fotos (2026-10-14)

> Atualização local de 15/10: [fluxo mobile e mudanças de recuperação](passaporte-fluxo-mobile-implementacao-2026-10-15.md). O lote ainda não foi publicado. Recuperação por telefone e três letras foi desativada; fotos novas começam privadas e passagens offline exigem retomar com conexão para confirmar. As notas abaixo descrevem a versão anterior.

Fluxo da pessoa:
1. Abre `/selo/passaporte` (ícone de passaporte no topo do site). Sem passaporte, cria ali mesmo: nome, WhatsApp, cidade e aceite. WhatsApp já cadastrado não abre o passaporte; manda para `/selo/meu-numero`.
2. Numa cidade da Rota Biker, toca em **Carimbar esta cidade**. O GPS é conferido no servidor contra o contorno do IBGE (precisão ≤ 200 m, folga ≤ 100 m na divisa). A posição não é gravada.
3. Sem sinal: a leitura fica no celular (selo amarelo "guardado sem sinal") e vai sozinha quando a rede volta. Vale até 72 h e carimba no dia da leitura (`metodo = gps_offline`).
4. Foto é opcional. Logo depois do carimbo (ou mais tarde, pelo passaporte), a pessoa posta; marcada "mostrar no mapa", aparece na hora em `/selo/cidade/[slug]` como "Primeiro nome + inicial · nº".
5. `/selo/mapa` mostra as 42 cidades com o total de carimbos; cada cidade tem página com totais e fotos.

Moderação: qualquer pessoa denuncia uma foto (uma vez por IP, só o hash é gravado). Com 3 denúncias a foto sai do mapa e vai para **Admin → Selo → Fotos de cidade → Denunciadas**. Lá: **Voltar ao mapa** (zera denúncias) ou **Ocultar**. A aba **No mapa** permite ocultar qualquer foto pública a qualquer momento. A rota `/selo/foto/[id]` confere o status a cada pedido, então ocultar vale em até 2 min (cache).
