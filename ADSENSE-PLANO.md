# Plano — Reverter recusa AdSense "Conteúdo de baixo valor"

> Recusa: thin content / conteúdo escalado de baixo valor.
> Causa raiz: site dominado por páginas programáticas templadas (200+ `/parada`,
> hubs de cidade) + telas-tool sem texto. Pouco conteúdo editorial original indexado.

## ✅ Já feito (código)
- [x] `/parada/[slug]`: `noindex,follow` quando sem conteúdo real
      (descrição <80 chars E <2 fotos próprias). Só indexa parada curada.
- [x] `/mototurismo/[uf]/[cidade]`: threshold noindex subiu de <2 → <3 paradas.
- [x] `/mototurismo/[uf]`: já era noindex com <3 itens (ok).
- [x] RRM (Reader Revenue Manager / openaccess) instalado no layout — monetização
      alternativa ao AdSense, barra de aprovação menor.

## 🔴 Ação manual sua (fora do código)
- [ ] **Rodar o seed dos artigos no Supabase**: `supabase_blog_seed_conteudo.sql`.
      O blog ([app/lib/blog.js](app/lib/blog.js)) lê de `pv_blog_posts`. Sem o seed,
      os 12 artigos de `conteudo/` NÃO estão no ar = blog vazio = recusa.
      → Conferir depois em /blog que os 12 aparecem publicados.
- [ ] **Confirmar artigos indexáveis**: cada post precisa estar `published=true`,
      com `body` longo (idealmente 800+ palavras), `author`, `cover_url`, `excerpt`.
- [ ] No Search Console: indexar /blog, /guias e os 12 posts.

## 🟡 Recomendado antes de pedir revisão
- [ ] **Não servir AdSense nas telas-tool** (mapa, comboio, fipe, planner, admin):
      hoje [AdSenseLoader](app/components/AdSenseLoader.jsx) carrega global. Essas
      telas não têm conteúdo — ad nelas reforça "baixo valor". Limitar ads a páginas
      de conteúdo (home, blog, guias, estradas, paradas ricas).
- [ ] **Enriquecer paradas indexáveis**: descrição curada de verdade (3-5 frases
      próprias), horário, dica de pilotagem, foto própria. Páginas finas seguem noindex.
- [ ] **Conteúdo original profundo**: priorizar /blog e /guias com texto único,
      fotos próprias, experiência real. É isso que o revisor procura.
- [ ] Garantir /sobre /contato /privacidade /termos completos (já existem — revisar texto).

## Sequência sugerida
1. Rodar seed Supabase + validar /blog cheio.
2. Deploy (este lote já com noindex + RRM): `npx vercel deploy --prod --yes`.
3. Esperar Google re-crawl (dias) — sitemap já exclui noindex.
4. (Opcional) limitar AdSense às páginas de conteúdo.
5. Só então marcar "Confirmo que corrigi os problemas" → "Pedir revisão".

## Notas
- RRM ≠ AdSense. Instalar RRM não reverte a recusa do AdSense; é caminho paralelo.
- noindex,follow preserva link equity sem indexar a página fina.
- sitemap.js deve refletir só páginas indexáveis (conferir que não lista paradas finas).
