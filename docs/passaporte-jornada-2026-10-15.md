# Passaporte: mapa pessoal e memórias

Primeira etapa local da comparação com Stampie. Mantém editor e exportação do passaporte publicados anteriormente. Esta etapa ainda não foi publicada.

## Comportamento

- Passaporte completo, privado e público autorizado, recebe mapa do Brasil após estatísticas. Destaca UFs com cidades carimbadas e pontos nos centros municipais. Filtros por UF, lista de cidades e passagens repetidas. Sem trajetos ou coordenadas precisas do GPS.
- Mapa pode ser baixado ou compartilhado como JPEG 1080 × 1920, com nome, número, contagens e últimas três cidades. Toda coleção aparece nos pontos e totais. Relatos, fotos e código pessoal ficam fora da imagem.
- Carimbos, nas três vistas, abrem ficha da passagem. Dono pode escrever até 800 caracteres, salvar, editar e apagar texto. Cada `entradaId` tem memória independente. Rascunho permanece ao fechar/reabrir na mesma página, até recarregar ou navegar.
- Relatos ficam privados no servidor; publicar passaporte não publica relatos. Fotos existentes respeitam visibilidade anterior. Nova foto neste fluxo começa privada; publicação no mapa exige marcar opção. Moderação de foto continua valendo.
- Contador “Cidades” mostra total nacional sem denominador 42. Progresso da Rota Biker permanece separado. Metadados do perfil público passam a usar Pista Viva.

## Revisão local

Servidor: `npm run dev -- --hostname 127.0.0.1`.

Preparar exemplo, sem apagar dados locais: `node scripts/selo-seed-jornada.mjs`.

Abrir: <http://127.0.0.1:3000/selo/passaporte/previa/jornada>.

Exemplo tem 50 cidades e uma memória inicial. Fotos e mudanças de teste permanecem somente no armazenamento local de desenvolvimento. Rota da prévia responde 404 em produção. Demais passaportes reais locais recebem recursos em `/selo/m/[codigo]`.

## Persistência e publicação

Nova migração: `supabase_selo_memorias.sql`. Criar tabela privada antes de publicar código. Migração não foi executada em produção. Sem ela, API de memórias devolve erro de indisponibilidade; coleção e mapa continuam funcionando. Não usar fallback local para fingir salvamento de produção.

Tabela tem uma linha por entrada, limite de 800 caracteres, RLS ativada e acesso somente por service role. Exclusão da entrada ou motociclista elimina memória via cascade. Backend verifica dono da entrada antes de ler/gravar. Código pessoal segue sendo credencial; API recebe em `Authorization`, nunca na URL, com `private, no-store` nas respostas. Modelos públicos não recebem relato.

Fluxo de fotos reutiliza upload existente. API privada de memória também entrega bytes da foto após verificar dono; nenhuma URL de Storage é exposta pela nova API.

Contornos estáticos: [API de malhas do IBGE](https://servicodados.ibge.gov.br/api/v3/malhas/paises/BR?intrarregiao=UF&formato=application/vnd.geo+json&qualidade=minima), simplificados pelo script `scripts/build-mapa-pessoal.mjs`. Tela e imagem usam mesma projeção. Sem dependência de tiles ou download de mapa em tempo de uso.

## Validação

- Testes Node: 241 aprovados, incluindo agrupamento, revisitas, isolamento entre donos, persistência, limpeza e ausência de relatos no modelo público.
- Build de produção em `.cache/pwa-next` para preservar servidor dev. Build passa; fontes externas de conteúdo retornaram fallback por restrição de rede durante geração de páginas estáticas.
- ESLint dos arquivos alterados passa. Auditoria de design mantém dívida anterior; nova folha não introduz desvios.
- Chrome local: mapa com 50 cidades, filtros, listagem completa, edição e releitura, rascunhos, foto privada, acesso por outro dono negado, download JPEG e compartilhamento simulado. Celular 390 px sem transbordamento horizontal. Perfil público sem relato/código pessoal.
- Build servido localmente: prévia retorna 404 e API sem credencial retorna 401.
- Evidências locais: `/private/tmp/pistaviva-jornada-check.json`, `pistaviva-jornada-desktop.png`, `pistaviva-jornada-mobile.png`, `pistaviva-jornada-memoria-mobile.png`, `pistaviva-meu-brasil.jpg`.

## Próximas etapas

Coleções escolhidas pelo motociclista, metas regionais e diretório nacional ainda não foram implementados nesta etapa. Publicação desta etapa requer migração e deploy; nenhum dos dois foi executado.

## Identidade visual unificada

Após revisão do usuário, todas as extensões usam identidade do passaporte aprovado. Não criar uma direção visual diferente para mapa, memórias ou telas do mesmo passaporte.

- Ficha de identificação é gerada pela mesma `paginaIdentidade` do editor: foto, piloto, garupa, origem, assinatura e coruja original de `identidade-feed.webp`. Cabeçalho deixa de usar avatar de inicial. Foto local só é lida quando código e número do perfil salvo correspondem ao dono da página privada; perfil público nunca usa foto de quem visita.
- `passaporte/identidade-passaporte.css` reúne fontes e estilos comuns: Impacted nos títulos, MailartRubberstamp nos carimbos, RobotoSlab nos textos, MrsSaintDelafield na assinatura. `recursosPassaporte.js` compartilha loaders entre ficha, gerador e mapa exportado.
- Papel vem de `papel.webp`, não de uma aproximação lisa. Tinta `#1e1111`, vermelho `#a3281c`, caixa `#f6eee6`; ações preservam laranja do editor aprovado. Memórias usam mesma folha, carimbo e moldura de foto.
- Carimbos abrem no modo livro por padrão; mapa aparece depois, como continuação do passaporte. Navegação usa etiquetas retas. Rodapé preserva “Conectando pessoas a lugares”.
- Exportação do mapa recebe ficha oficial acima e mapa abaixo, com mesmas fontes e textura. A foto de identificação, quando disponível no aparelho do dono, entra nessa composição; fotos e relatos das memórias continuam privados.
- Evidências: `/private/tmp/pistaviva-identidade-abertura.png`, `pistaviva-identidade-mobile.png`, `pistaviva-identidade-carimbos.png`.
