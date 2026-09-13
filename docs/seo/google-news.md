# Preparação para Google Notícias

Implementação local em 13/09/2026. Publicado em produção em 13/09/2026; submissão e validação no Search Console ainda pendentes. Não há garantia de inclusão, posição ou frequência. A consideração é automática; não é necessário solicitar inclusão pelo Publisher Center.

## Implementado

- `/news-sitemap.xml`: XML com nome Pistaviva, idioma `pt`, título e data original. Apenas matérias publicadas com tag exata `Notícias`, nas últimas 48 horas; exclui datas futuras e duplicatas. Guias antigos continuam no sitemap geral.
- Endpoint dinâmico, sem cache HTTP: novas publicações entram e matérias antigas saem sem deploy. Falha no banco retorna 503, sem apresentar uma lista vazia como sucesso.
- `robots.txt` anuncia ambos os sitemaps.
- Matérias classificadas usam `NewsArticle`; demais mantêm `BlogPosting`. Data e horário visíveis em Brasília, atualização quando registrada e posterior à publicação.
- Autor conhecido vinculado à página Sobre. Edição pelo painel preserva autor original.
- Canonical, prévias grandes, organização, política editorial e contato já existiam no projeto.

## Rotina editorial

1. Publicar fatos recentes com apuração própria, fontes primárias vinculadas e contribuição original. Não copiar releases ou concorrentes como se fossem reportagem própria.
2. Usar tag `Notícias` somente em cobertura jornalística. Não aplicar em massa a guias, publicidade, agenda enviada por usuários ou conteúdos antigos.
3. Conferir assinatura real, biografia do autor, título fiel, data e horário de primeira publicação. Não renovar data para simular novidade.
4. Registrar atualização apenas quando houver mudança editorial relevante; explicar correções no texto. Auditar usos de `updated_at` no banco antes de tratá-lo como revisão editorial em todos os conteúdos.
5. Usar imagem relevante, com direitos de uso e crédito. Preferir imagem com pelo menos 1200 px de largura para prévias grandes; isso não garante Google Notícias ou Discover.
6. Identificar publicidade, apoio material e conflitos de interesse na própria matéria. Confirmar na página Sobre quem é proprietário e responsável editorial; não inventar equipe, credenciais ou independência.
7. Criar biografia verificável para cada novo colaborador. Validar canal de correções e contato regularmente.

## Após publicar versão

1. Abrir `/robots.txt`, `/sitemap.xml` e `/news-sitemap.xml` em produção. Sitemap de notícias vazio é esperado quando não houver notícias nas últimas 48 horas.
2. Enviar ambos os sitemaps na propriedade correta do Search Console. Verificação está declarada no código; titularidade e acesso à conta não foram confirmados nesta tarefa.
3. Inspecionar URL de uma notícia: HTTP 200, canonical correto, rastreamento permitido, conteúdo disponível no HTML e ausência de noindex.
4. Validar URL no Rich Results Test. Conferir título, imagem, autor, data publicada e atualização contra conteúdo visível.
5. Acompanhar indexação, ações manuais, Core Web Vitals e relatórios Google Notícias e Pesquisa com filtro Notícias quando houver dados. Medir impressões, cliques e CTR; não confundir elegibilidade com aprovação.
6. Limite operacional atual: consulta retorna até 1000 notícias recentes. Antes de ultrapassar esse volume em 48 horas, implementar paginação e índice de sitemaps; não truncar cobertura.

## Fontes oficiais consultadas

- https://support.google.com/news/publisher-center/answer/9606538
- https://support.google.com/news/publisher-center/answer/6204050
- https://support.google.com/news/publisher-center/answer/9607104
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/news-sitemap
- https://developers.google.com/search/docs/appearance/structured-data/article

## Verificação de produção — 13/09/2026

Deployment `dpl_7tg2Kjx2Avwv4vGwfVULnAXDYP2T`, estado READY, associado ao domínio oficial. Build remoto concluiu 163 páginas; migração de banco desativada explicitamente neste build.

Verificação pública: robots, ambos os sitemaps, Sobre, Contato, Política editorial e uma matéria retornaram HTTP 200. XML válido; sitemap geral com 148 URLs. Canonical, H1 e JSON-LD sintaticamente válido nas páginas amostradas; horário em Brasília confirmado na matéria. Não equivale ao Rich Results Test ou à inspeção do Google.

Sitemap de notícias contém zero entradas: nenhuma notícia publicada com a classificação e janela configuradas foi retornada. Não foram criadas notícias artificiais nem alteradas datas para preencher o arquivo.

Resultados: `google-news-producao-2026-09-13.json`. Submissão no Search Console não realizada: sessão sem conector, credencial Google configurada ou ferramenta de navegador controlável. Em Search Console → Sitemaps, enviar `https://www.pistavivamototurismo.com.br/news-sitemap.xml` e confirmar sitemap geral.
