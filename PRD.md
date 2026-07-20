# Pistaviva — Product Requirements Document (PRD)

> Source-of-truth PRD for automated test generation (TestSprite). Describes the
> product, user roles, routes, features, end-to-end flows and acceptance
> criteria. UI is in Brazilian Portuguese; route and label names are kept
> verbatim. Production URL: https://www.pistavivamototurismo.com.br

---

## 1. Product Overview

**Pistaviva** is a Brazilian motorcycle-touring ("mototurismo") web platform. It
is a content + community product that helps motorcyclists discover places to
ride, plan trips, log challenges, find events, and connect with other riders.

Core value props:
- **Discover** — curated roads, destinations, stops ("paradas"), and city guides.
- **Plan** — route/trip planning over an interactive map.
- **Engage** — community feed, events with RSVP, gamified riding challenges.
- **Inform** — blog/news, FIPE price lookup, motorcycle directory.

The site is public-read (most content is browsable without login). Writing
actions (posting, RSVP, check-ins, submitting a stop/event) require a
lightweight user identification/login. An admin area manages content and
moderation.

---

## 2. Target Users / Personas

1. **Rider (anonymous visitor)** — browses content, reads blog, views events,
   roads, destinations and the map without logging in.
2. **Rider (authenticated member)** — posts to the community, RSVPs to events,
   completes riding challenges, submits stops, saves routes.
3. **Organizer** — creates events (line-up, schedule, address, ticketing info).
4. **Admin** — manages blog posts, banners, site config, and moderates
   community content / reports.

---

## 3. Tech Stack

- **Framework:** Next.js (App Router, server components + client components),
  React 18.
- **Backend / DB:** Supabase (PostgreSQL + Storage + Auth). Tables prefixed
  `pv_`.
- **Maps:** Leaflet + react-leaflet, `@turf/turf` for geo calculations.
- **UI:** lucide-react icons, embla-carousel-react carousels, custom CSS
  ("IGNIS" design system, light/dark sections).
- **Media:** Supabase Storage for owned images; external image hosts are loaded
  unoptimized (see `app/lib/img.js`). `next/image` optimizer allowlist lives in
  `next.config.mjs`.
- **Analytics:** @vercel/analytics, @vercel/speed-insights.
- **Hosting:** Vercel (production deploy is manual via Vercel CLI).

---

## 4. User Roles & Authentication

- **Anonymous:** read-only access to all public pages.
- **Authenticated user:** identified via an identification/login popup (branded
  with the Pistaviva logo). Stored in `pv_users` / `pv_profiles`. Required for
  any write action (post, comment, like, RSVP, challenge check-in, submit stop).
- **Admin:** accesses `/admin` and sub-routes. Can create/edit blog posts,
  banners, site config, and moderate content/reports.

**Acceptance criteria**
- Visiting any public route while logged out renders content (HTTP 200) with no
  forced redirect to login.
- Triggering a write action while logged out opens the identification popup and
  does not persist the action until identified.
- `/admin` routes are not usable by anonymous users.

---

## 5. Routes / Information Architecture

### Public pages
| Route | Purpose |
|-------|---------|
| `/` | Home: hero banner carousel, online-visitors counter, community rail, destinations rail, latest blog cards, sections. |
| `/eventos` | Events listing (agenda of moto encounters/festivals). |
| `/eventos/[id]` | Event detail: line-up, schedule, address, organizer IG, RSVP ("vou"). |
| `/eventos/criar` | Create an event (organizer form). |
| `/paradas` | Stops directory, filterable by selo (badge) and category. |
| `/parada/[slug]` | Stop detail (amenities, photo, location). |
| `/destinos` | Destinations listing. |
| `/destinos/[slug]` | Destination detail. |
| `/estradas` | Roads listing. |
| `/estradas/[slug]` | Road detail. |
| `/rotas` | Routes hub / trip planner (also targets of `/calculadora`, `/trechos`, `/expedicoes` redirects). |
| `/desafios` | Riding challenges listing. |
| `/desafios/[slug]` | Challenge detail (check-ins, segments, completion). |
| `/guias` | Guides listing. |
| `/guias/[slug]` | Guide detail. |
| `/blog` | Blog/news listing. |
| `/blog/[slug]` | Blog post detail. |
| `/comunidade` | Community feed (posts, likes, comments). |
| `/comboio` | Live convoy ("comboio") — live group ride view (target of `/pista-ao-vivo` redirect). |
| `/mapa` | Interactive map (Leaflet) with pings/spots. |
| `/mototurismo` | Mototurismo hub (states/cities). |
| `/mototurismo/[uf]` | State page (e.g. `/mototurismo/rj`). |
| `/mototurismo/[uf]/[cidade]` | City stops page (e.g. Teresópolis). |
| `/fotografos` | Photographers listing. |
| `/fotografo/[slug]` | Photographer profile. |
| `/diretorio-duas-rodas` | Curated directory of moto portals/blogs (external links). |
| `/fipe` | FIPE price lookup for motorcycles. |
| `/loja` | Store. |
| `/apoie` | Support/donation page. |
| `/sobre` | About. |
| `/contato` | Contact. |
| `/termos` | Terms. |
| `/privacidade` | Privacy. |

### Redirects (must 301)
`/calculadora → /rotas`, `/trechos → /rotas`, `/expedicoes → /rotas?tab=expedicoes`,
`/pista-ao-vivo → /comboio`, `/busca → /`, `/parceiros → /comunidade`.

### Admin pages
| Route | Purpose |
|-------|---------|
| `/admin` | Admin dashboard. |
| `/admin/blog` | Blog post management (CRUD). |
| `/admin/moderacao` | Moderation of community content / reports. |
| `/admin/avancado` | Advanced settings / site config. |

---

## 6. Core Features

### 6.1 Home (`/`)
- Banner carousel (`pv_banners`): autoplay ~6s, dots with progress, arrows,
  swipe, pause on hover.
- "X pessoas online" social-proof counter near the top, brand-colored.
- Community rail: mixed read-only feed of recent posts + new stops.
- Destinations rail: horizontally scrollable cards.
- Latest blog cards.

**Acceptance criteria**
- Carousel advances automatically and on arrow/dot/swipe; pauses on hover.
- Each card links to its detail page; broken external images never block render
  (load directly, unoptimized).

### 6.2 Events (`/eventos`, `/eventos/[id]`, `/eventos/criar`)
- Listing renders future/recent events ordered by date; hidden events excluded.
- Detail shows title, date/time, location, description, gallery, line-up
  (bands), schedule, organizer Instagram, price/status, and a "vou" RSVP that
  increments a going-count (`pv_event_rsvps`, status `going`).
- Each event/listing emits Event JSON-LD (schema.org) including `startDate`,
  `endDate`, `image`, `performer`, and `offers` with `validFrom`.
- `/eventos/criar` lets an organizer submit a new event.

**Acceptance criteria**
- Listing only shows non-hidden events; empty state renders gracefully.
- Detail of a non-existent id returns Not Found (404).
- RSVP requires identification; going-count reflects the new RSVP.
- JSON-LD on event pages contains `startDate`, `endDate`, `image`, `performer`,
  and `offers.validFrom` (Google rich-result fields).

### 6.3 Stops / Paradas (`/paradas`, `/parada/[slug]`, city pages)
- Filterable grid by selo (badge) and category via query params
  (`?selo=`, `?categoria=`).
- Cards show category badge, cover image (or 📍 placeholder when none),
  name, description, city · UF, and selo dots.
- Submission form ("Conhece uma parada boa?") to add a new stop with amenities
  and a photo (`pv_spots`).
- City pages (`/mototurismo/[uf]/[cidade]`) list stops for a city.

**Acceptance criteria**
- Filters update the visible list; "Todos" clears filters.
- Stop without `cover_url` shows the placeholder, not a broken image.
- Submitting a stop requires identification and persists to `pv_spots`.

### 6.4 Challenges / Desafios (`/desafios`, `/desafios/[slug]`)
- v1 is free, with no time-ranking. Challenges have segments
  (`pv_segments`), check-ins (`pv_desafio_checkins`), completions
  (`pv_segment_completions`), and user stamps (`pv_user_stamps`).
- Users check in / mark progress; completion awards stamps.

**Acceptance criteria**
- Challenge detail of an unknown slug returns 404.
- Check-in requires identification; progress/stamps update for that user.
- No time-based ranking/leaderboard is shown in v1.

### 6.5 Routes / Planner (`/rotas`, `/mapa`, `/comboio`)
- Trip/route planning over an interactive Leaflet map; routes stored in
  `pv_routes` / `pv_user_routes`, expeditions in `pv_expeditions`.
- `/comboio` shows a live convoy view (`pv_comboio_routes`,
  `pv_comboio_messages`, `pv_map_pings`).

**Acceptance criteria**
- Map loads and renders markers/pings without runtime error.
- Saving a route requires identification and persists.

### 6.6 Community (`/comunidade`)
- Feed of posts (`pv_posts`) with likes (`pv_post_likes`) and comments
  (`pv_post_comments`).
- Reports (`pv_reports`) flow into admin moderation.

**Acceptance criteria**
- Posting/liking/commenting requires identification.
- Reporting a post creates a moderation entry.

### 6.7 Blog (`/blog`, `/blog/[slug]`)
- Listing of posts (`pv_blog_posts` / `pv_posts`) with cover, category badge,
  title, excerpt, author, date.
- Detail renders full post with structured data.

**Acceptance criteria**
- Unknown slug returns 404.
- Cover images from external hosts render (loaded unoptimized).

### 6.8 FIPE lookup (`/fipe`)
- Motorcycle price lookup (brand → model → year → price).

**Acceptance criteria**
- Selecting brand/model/year returns a price result; invalid combos handled.

### 6.9 Directory (`/diretorio-duas-rodas`)
- Curated, filterable list of external moto portals/blogs; emits ItemList
  JSON-LD; links open external sites.

### 6.10 Admin (`/admin`, `/admin/blog`, `/admin/moderacao`, `/admin/avancado`)
- Blog CRUD, banner management, site config (`pv_site_config`), and moderation
  of reported content.

**Acceptance criteria**
- Admin can create/edit/delete a blog post and it appears on `/blog`.
- Admin can hide/approve reported community content.
- Banner changes reflect on the home carousel.

---

## 7. Data Model (key tables)

| Table | Holds |
|-------|-------|
| `pv_users`, `pv_profiles` | User accounts / profiles |
| `pv_events`, `pv_event_rsvps` | Events and RSVPs (`going` count) |
| `pv_spots` | Stops / paradas |
| `pv_destinos` | Destinations |
| `pv_routes`, `pv_user_routes`, `pv_expeditions` | Routes / trips |
| `pv_segments`, `pv_segment_completions`, `pv_desafio_checkins`, `pv_user_stamps`, `pv_stamps_config` | Challenges + gamification |
| `pv_posts`, `pv_post_likes`, `pv_post_comments`, `pv_reports` | Community feed + moderation |
| `pv_blog_posts` | Blog/news posts |
| `pv_banners` | Home carousel banners |
| `pv_site_config` | Site configuration |
| `pv_photographers` | Photographer directory |
| `pv_comboio_routes`, `pv_comboio_messages`, `pv_map_pings` | Live convoy + map |
| `pv_partners` | Partners |

`pv_events` notable columns: `title, category, date, time, local, address,
organizer, organizer_ig, description, image_url, images, tags, type, price,
lineup (jsonb), schedule (jsonb), max_participants, hidden`.

---

## 8. Non-Functional Requirements

- **SEO:** every public page sets canonical, OpenGraph, and JSON-LD structured
  data. Event pages must satisfy Google rich-result fields (`image`, `endDate`,
  `performer`, `offers.validFrom`). Sitemap at `/sitemap.xml`.
- **Performance:** owned images optimized via `next/image`; external images
  loaded directly (unoptimized) to avoid optimizer failures. ISR revalidate on
  content pages (e.g. events 60s, directory 600s).
- **Resilience:** missing/optional DB columns degrade gracefully (event detail
  falls back to a reduced column set). Broken external image URLs must not break
  layout.
- **Localization:** UI language is Brazilian Portuguese (pt-BR).
- **Responsive:** mobile-first; carousels and rails support touch/swipe.

---

## 9. Key End-to-End Journeys (for test scenarios)

1. **Browse → event RSVP:** Home → `/eventos` → open an event → click "vou" →
   identification popup → confirm → going-count increments.
2. **Discover a stop:** `/paradas` → filter by category → open a stop →
   see amenities and location; back to list keeps filter.
3. **Submit a stop:** `/paradas` → fill "Conhece uma parada boa?" form →
   identify → submit → stop persisted.
4. **Complete a challenge step:** `/desafios` → open a challenge → check in →
   identify → progress/stamp updates.
5. **Read blog:** `/blog` → open a post → content + cover render.
6. **Plan a route:** `/rotas` → interact with map → save route (requires
   identification).
7. **Admin publishes a post:** `/admin/blog` → create post → appears on `/blog`.
8. **Redirects:** hitting `/calculadora`, `/trechos`, `/pista-ao-vivo`, etc.
   301-redirects to the correct destination.

---

## 10. Edge Cases & Error States

- Unknown detail slug/id (`/eventos/[id]`, `/blog/[slug]`, `/desafios/[slug]`,
  `/parada/[slug]`) → 404 Not Found.
- Empty listings (no events / no stops for a filter) → friendly empty state, not
  an error.
- Write action while logged out → identification popup; action not persisted
  until identified.
- External cover image returns 403/404 (source blocks hotlinking) → image fails
  to load but layout/card remains intact.
- Event with missing optional columns (price/lineup/schedule) → detail still
  renders with available data.

---

## 11. Architecture & Testing Notes (READ BEFORE GENERATING TESTS)

**This is a server-rendered Next.js (App Router) website backed by Supabase —
NOT a REST/JSON API.** Pages return HTML, not JSON. Generate browser/URL-level
assertions (status code, redirects, rendered HTML), not `response.json()` checks.

- **No page-level write endpoints.** Mutations (community post, like, comment,
  RSVP "vou", challenge check-in, stop submission, event creation) are performed
  client-side via the Supabase JS SDK, or as in-page form handlers. There is no
  `POST /eventos/criar`, `POST /desafios/{id}/checkin`, `POST /fipe`, etc.
  **Sending POST/PUT/DELETE to a page URL correctly returns `405 Method Not
  Allowed` — this is expected, not a defect.** Do not assert 4xx validation
  bodies from these URLs.
- **Detail routes 404 for nonexistent slugs.** `/parada/{slug}`,
  `/fotografo/{slug}`, `/desafios/{slug}`, `/blog/{slug}`, `/destinos/{slug}`,
  `/estradas/{slug}`, `/eventos/{id}` return **404 for any slug that is not a
  real record** (e.g. a placeholder UUID `00000000-...`). To test the 200 happy
  path, use the real slugs in §12. A 404 on a fake slug is correct behavior.
- **`/mototurismo/{uf}/{cidade}` uses state/city slugs, not UUIDs** — e.g.
  `/mototurismo/rj/teresopolis`. UUID placeholders will 404 (correct).
- **FIPE (`/fipe`) is a read-only client page.** Brand/model/year selection and
  validation happen in the browser; there is no server validation endpoint.
  Expect `200 HTML`, not JSON or 4xx.
- **Admin pages (`/admin`, `/admin/blog`, `/admin/moderacao`, `/admin/avancado`)
  are client-gated and return `200` HTML shell to anonymous requests** (a login
  prompt, no admin data is server-rendered). They are `noindex`. Auth is a
  client-side Supabase session (localStorage), so the server cannot return
  401/403 for these page URLs — **do not assert 401/403 on admin page GETs.**
  Privileged data operations are guarded at the data layer.
- **Sitemap** (`/sitemap.xml`) uses the standard namespace
  `http://www.sitemaps.org/schemas/sitemap/0.9` (plus the Google image
  namespace). Parse with that namespace; it currently lists listing pages
  (`/`, `/blog`, `/paradas`, `/rotas`, `/comunidade`, `/desafios`, `/guias`, …).

## 12. Real slugs for happy-path (200) detail tests

Use these existing public records instead of placeholder UUIDs:

| Route | Real example |
|-------|--------------|
| `/parada/{slug}` | `/parada/caldo-de-piranha-tereso-i34j` |
| `/fotografo/{slug}` | `/fotografo/don-cruz-o41d` |
| `/desafios/{slug}` | `/desafios/desafio-serras-catarinenses` |
| `/blog/{slug}` | `/blog/primeiros-socorros-acidente-de-moto-na-estrada` |
| `/estradas/{slug}` | `/estradas/serra-do-rio-do-rastro` |
| `/destinos/{slug}` | `/destinos/patagonia-de-moto` |
| `/mototurismo/{uf}/{cidade}` | `/mototurismo/rj/teresopolis` |

(These are live records; if one is later removed, pull a fresh slug from the
corresponding listing page.)
