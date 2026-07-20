# Plano SEO — rankear, autoridade e divulgar o Pistaviva

> Objetivo: matérias na 1ª página do Google, domínio com autoridade, site pronto pra divulgar.
> Técnico (código) já está forte. O que falta agora é **conteúdo no ar, capas, indexação e off-page**.

---

## 1. Capas das matérias (faça hoje — alto impacto em CTR e rich results)
Matérias sem capa = sem imagem no Google, no compartilhamento e no card. Resolver:

**Pelo painel admin (mais fácil):**
1. `/admin` → Blog → editar matéria.
2. Colar a URL da imagem no campo **Capa** → salvar.

**Regras da imagem:**
- Hospedar em host permitido: **Supabase Storage** (upload no admin) ou **imgur**.
  (next.config só libera `**.supabase.co`, `images.unsplash.com`, `i.ytimg.com` — fora disso a imagem não carrega via next/image.)
- Tamanho ideal **1200×630** (16:9 paisagem).
- **Foto própria > banco de imagem.** Foto sua da estrada conta como conteúdo original
  e ajuda na reaprovação do AdSense. Use as suas fotos de rolê.

> Sem capa, o site já cai num OG padrão (não quebra) — mas capa própria rankeia e converte mais.

---

## 2. Indexação imediata (Search Console — faça hoje)
O domínio é novo; Google leva dias/semanas. Acelerar:
1. Search Console → **Sitemaps** → enviar `sitemap.xml`.
2. **Inspeção de URL** → colar cada matéria prioritária → **Solicitar indexação**.
   Prioridade (maior intenção de busca):
   - `/blog/serra-do-cipo-de-moto`
   - `/blog/rota-capitao-senra`
   - `/blog/estrada-real-de-moto-roteiro`
   - `/blog/bate-volta-de-moto-saindo-de-bh`
   - `/blog/serra-da-canastra-de-moto`
3. Conferir progresso em **Páginas** (indexadas vs não indexadas).
4. Teste rápido no Google: `site:pistavivamototurismo.com.br`

---

## 3. Autoridade (off-page — a parte que leva tempo, começa já)
Autoridade = outros sites confiáveis linkando pro seu. Plano:

**Backlinks fáceis (semana 1):**
- Diretórios de turismo/moto BR e perfis com link (Instagram bio, YouTube, Google Meu Negócio).
- Cadastrar a marca no **Google Meu Negócio** (Pistaviva Mototurismo).
- Listar em agregadores de blog e portais de mototurismo.

**Parcerias de conteúdo (semana 2+):**
- O Mauro Assumpção (@mgmotosoficial / MG Motos) já está numa matéria — proponha
  parceria: ele linka o artigo, você divulga o canal dele. Backlink + audiência.
- Restaurantes/pousadas citados nas paradas: peça link "amigo do motociclista → Pistaviva".
- Rotas oficiais (Estrada Real, Circuito das Grutas): contato pra ser listado como recurso.

**Sinal social (contínuo):**
- Cada matéria nova → post no Instagram/grupos de moto com o link.
- Compartilhamento gera tráfego e descoberta (não é backlink direto, mas ajuda crawl).

---

## 4. Conteúdo que rankeia (cadência + cluster)
- **Cluster por região:** já há cluster MG forte. Próximos clusters: SP, Sul (Serra do Rio do Rastro), Mantiqueira, Nordeste — já existem alguns posts; aprofundar.
- **Intenção de busca:** títulos com "de moto", "roteiro", "como chegar", "melhor época" — já segue. Manter.
- **Profundidade:** 800+ palavras, H2/H3, FAQ (vira rich snippet — já implementado).
- **Atualização:** revisar e republicar matérias antigas (dateModified atualiza no schema).
- **Cadência:** 1–2 matérias originais/semana sustenta crescimento.

---

## 5. Link interno (reforça autoridade entre páginas)
- Cada matéria deve linkar 2–3 outras relacionadas no corpo (use `[texto](/blog/slug)`).
- Linkar matéria → hub de cidade (`/mototurismo/uf/cidade`) e → paradas relevantes.
- Home e /blog já listam matérias (ok).
- "Relacionadas por tag" já automatizado no rodapé do artigo.

---

## ✅ Já feito no código (técnico)
- Schema BlogPosting completo (publisher.logo, dateModified, image, FAQPage, breadcrumb).
- OG + Twitter card com imagem (capa própria ou fallback).
- Relacionadas por tag.
- Sitemap com matérias; robots liberado; canonical por página.
- Páginas finas em noindex (não diluem autoridade).

## 🔴 Depende de você (não dá pra fazer no código)
- [ ] Rodar seed no Supabase (se ainda não) e conferir /blog cheio.
- [ ] Setar capas das matérias (admin, foto própria).
- [ ] Search Console: enviar sitemap + solicitar indexação.
- [ ] Google Meu Negócio + backlinks de diretórios.
- [ ] Parceria de link com Mauro/MG Motos e parceiros.
- [ ] Divulgar cada matéria nas redes/grupos.
