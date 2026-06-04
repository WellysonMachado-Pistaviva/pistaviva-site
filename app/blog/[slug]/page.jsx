import Link from 'next/link';
import Cover from '../../components/Cover';
import { notFound } from 'next/navigation';
import { getPostBySlug, getAllSlugs, getPublishedPosts } from '../../lib/blog';
import ViewPing from '../../components/ViewPing';
import ReadingProgress from '../../components/ReadingProgress';

export const revalidate = 300;

// Renderiza markdown inline: [texto](/link) vira <a>/<Link>, **negrito**, *italico*, e raw URLs.
function renderInline(text) {
  const out = []; 
  // Regex para: [texto](url), **negrito**, *italico*, e raw URLs (https://...)
  const re = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*|(https?:\/\/[^\s]+)/g;
  let i = 0, m, k = 0;
  while ((m = re.exec(text))) {
    if (m.index > i) out.push(text.slice(i, m.index));
    
    if (m[1] !== undefined) {
      // Link markdown
      const href = m[2];
      out.push(href.startsWith('/')
        ? <Link key={k++} className="inl" href={href}>{m[1]}</Link>
        : <a key={k++} className="inl" href={href} target="_blank" rel="noopener noreferrer">{m[1]}</a>);
    } else if (m[3] !== undefined) {
      // Bold
      out.push(<strong key={k++}>{m[3]}</strong>);
    } else if (m[4] !== undefined) {
      // Italic
      out.push(<em key={k++}>{m[4]}</em>);
    } else if (m[5] !== undefined) {
      // Raw URL
      const href = m[5];
      out.push(<a key={k++} className="inl" href={href} target="_blank" rel="noopener noreferrer">{href}</a>);
    }
    i = re.lastIndex;
  }
  if (i < text.length) out.push(text.slice(i));
  return out;
}

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map(s => ({ slug: s.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: 'Post não encontrado' };
  return {
    title: post.title,
    description: post.excerpt || post.title,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.excerpt || post.title,
      images: post.cover_url ? [post.cover_url] : [],
      publishedTime: post.published_at || undefined,
      authors: post.author ? [post.author] : undefined,
    },
  };
}

export default async function BlogPost({ params }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  // Parse linha a linha (robusto a 1 ou 2 quebras): blocos h2/h3/img/p.
  const blocks = [];
  let buf = [];
  const flush = () => { if (buf.length) { blocks.push({ t: 'p', v: buf.join(' ') }); buf = []; } };
  for (const raw of String(post.body || '').split('\n')) {
    const l = raw.trim();
    if (!l) { flush(); continue; }
    const img = l.match(/^\[img:(.+)\]$/);
    if (img) { flush(); blocks.push({ t: 'img', v: img[1].trim() }); continue; }
    if (l.startsWith('### ')) { flush(); blocks.push({ t: 'h3', v: l.slice(4) }); continue; }
    if (l.startsWith('## ')) { flush(); blocks.push({ t: 'h2', v: l.slice(3) }); continue; }
    buf.push(l);
  }
  flush();

  // FAQPage: dentro da seção "## Perguntas frequentes", cada h3 (pergunta) + p seguinte (resposta).
  const faq = [];
  let inFaq = false;
  let faqStart = -1;
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.t === 'h2') { inFaq = /perguntas frequentes|faq|d[úu]vidas/i.test(b.v); if (inFaq && faqStart < 0) faqStart = i; }
    else if (inFaq && b.t === 'h3' && blocks[i + 1]?.t === 'p') faq.push({ q: b.v, a: blocks[i + 1].v });
  }
  const bodyBlocks = (faq.length >= 2 && faqStart >= 0) ? blocks.slice(0, faqStart) : blocks;
  const faqLd = faq.length >= 2 ? {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  } : null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt || post.title,
    image: post.cover_url ? [post.cover_url] : undefined,
    datePublished: post.published_at || undefined,
    author: post.author ? { '@type': 'Person', name: post.author } : { '@type': 'Organization', name: 'Pistaviva' },
    publisher: { '@type': 'Organization', name: 'Pistaviva' },
    mainEntityOfPage: `https://www.pistavivamototurismo.com.br/blog/${slug}`,
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: 'https://www.pistavivamototurismo.com.br/' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://www.pistavivamototurismo.com.br/blog' },
      { '@type': 'ListItem', position: 3, name: post.title, item: `https://www.pistavivamototurismo.com.br/blog/${slug}` },
    ],
  };

  const words = String(post.body || '').split(/\s+/).filter(Boolean).length;
  const readMin = Math.max(2, Math.round(words / 200));
  const author = post.author || 'Pistaviva';
  const initials = author.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const dateFmt = post.published_at ? new Date(post.published_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : null;
  const related = (await getPublishedPosts(4)).filter(p => p.slug !== slug).slice(0, 3);
  const url = `https://www.pistavivamototurismo.com.br/blog/${slug}`;
  const share = {
    wa: `https://wa.me/?text=${encodeURIComponent(post.title + ' ' + url)}`,
    x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(url)}`,
    fb: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  };

  return (
    <article className="ignis art">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      {faqLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />}
      <ViewPing kind="blog" id={post.id} />
      <ReadingProgress />

      {/* breadcrumb */}
      <nav className="art-crumb" aria-label="Trilha">
        <div className="wrap">
          <Link href="/">Início</Link><span className="sep">/</span>
          <Link href="/blog">Blog</Link><span className="sep">/</span>
          <span className="here">{post.tags?.[0] || 'Matéria'}</span>
        </div>
      </nav>

      {/* hero da matéria */}
      <header className="art-hero">
        <div className="wrap">
          <div className="art-meta">
            {post.tags?.[0] && <span className="tag">{post.tags[0]}</span>}
            {dateFmt && <span className="date">{dateFmt}</span>}
            <span className="dot" /><span className="read">{readMin} min de leitura</span>
          </div>
          <h1>{post.title}</h1>
          {post.excerpt && <p className="sub">{post.excerpt}</p>}
          <div className="art-byline">
            <span className="av">{initials}</span>
            <span className="who"><b>{author}</b><span>Pistaviva · Mototurismo</span></span>
          </div>
        </div>
      </header>

      {/* imagem principal */}
      {post.cover_url && (
        <figure className="art-lead"><Cover src={post.cover_url} alt={post.title} sizes="100vw" priority /></figure>
      )}

      {/* corpo */}
      <div className="art-body">
        <div className="wrap">
          <div className="art-col">
            {bodyBlocks.map((b, i) => {
              if (b.t === 'img') return <figure key={i} className="art-inline"><img src={b.v} alt="" /></figure>;
              if (b.t === 'h3') return <h3 key={i}>{b.v}</h3>;
              if (b.t === 'h2') return <h2 key={i}>{b.v}</h2>;
              return <p key={i}>{renderInline(b.v)}</p>;
            })}

            {faq.length >= 2 && (
              <>
                <h2>Perguntas frequentes</h2>
                <div className="faq">
                  {faq.map((f, i) => (
                    <details key={i}><summary>{f.q}</summary><div className="ans">{f.a}</div></details>
                  ))}
                </div>
              </>
            )}

            {/* share + tags */}
            <div className="art-share">
              <span className="lbl">Compartilhar</span>
              <a href={share.wa} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">WA</a>
              <a href={share.x} target="_blank" rel="noopener noreferrer" aria-label="X">X</a>
              <a href={share.fb} target="_blank" rel="noopener noreferrer" aria-label="Facebook">f</a>
            </div>
            {post.tags?.length > 0 && (
              <div className="art-tags">{post.tags.map(t => <span key={t} className="t">{t}</span>)}</div>
            )}
          </div>
        </div>
      </div>

      {/* relacionadas */}
      {related.length > 0 && (
        <section className="art-related">
          <div className="wrap">
            <div className="head">
              <div><span className="ig-eyebrow">Continue lendo</span><h2 className="ig-title">Leia também</h2></div>
              <Link href="/blog" className="ig-btn ig-btn--ghost">Todas as matérias</Link>
            </div>
            <div className="rel-grid">
              {related.map(p => (
                <Link key={p.id} className="rel" href={`/blog/${p.slug}`}>
                  <div className="pic">{p.cover_url ? <Cover src={p.cover_url} alt={p.title} sizes="(max-width:600px) 100vw, 380px" /> : <span className="pic-ph">PISTAVIVA</span>}</div>
                  <div className="m">{p.tags?.[0] && <span className="tag">{p.tags[0]}</span>}{p.published_at && <span className="date">{new Date(p.published_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>}</div>
                  <h3>{p.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* band CTA */}
      <section className="ig-band">
        <div className="wrap">
          <div><span className="ig-eyebrow on-accent">Bora rodar junto?</span><h2>Entre na comunidade do Pistaviva.</h2></div>
          <Link href="/comunidade" className="ig-btn ig-btn--ghost on-accent">Entrar agora <span className="arr">→</span></Link>
        </div>
      </section>
    </article>
  );
}
