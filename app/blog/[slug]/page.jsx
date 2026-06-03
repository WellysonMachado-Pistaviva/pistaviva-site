import Link from 'next/link';
import Cover from '../../components/Cover';
import { notFound } from 'next/navigation';
import { getPostBySlug, getAllSlugs } from '../../lib/blog';
import ViewPing from '../../components/ViewPing';

export const revalidate = 300;

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
    mainEntityOfPage: `https://moto.pistaviva.com.br/blog/${slug}`,
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: 'https://moto.pistaviva.com.br/' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://moto.pistaviva.com.br/blog' },
      { '@type': 'ListItem', position: 3, name: post.title, item: `https://moto.pistaviva.com.br/blog/${slug}` },
    ],
  };

  return (
    <article className="page-light">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      {faqLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />}
      <ViewPing kind="blog" id={post.id} />
      <div className="wrap">
        <nav className="crumbs"><Link href="/">Início</Link> / <Link href="/blog">Blog</Link> / <span>{post.title}</span></nav>

        <header className="post-hero">
          {post.tags?.[0] && <p className="eyebrow">{post.tags[0]}</p>}
          <h1>{post.title}</h1>
          <div className="post-meta">
            {post.author && <span>Por <b>{post.author}</b></span>}
            {post.published_at && <span>{new Date(post.published_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>}
            {post.tags?.length > 0 && <span>{post.tags.join(' · ')}</span>}
          </div>
        </header>

        {post.cover_url && (
          <div className="post-cover"><Cover src={post.cover_url} alt={post.title} sizes="100vw" priority /></div>
        )}

        <div className="article">
          {post.excerpt && <p className="lead">{post.excerpt}</p>}
          {bodyBlocks.map((b, i) => {
            if (b.t === 'img') return <img key={i} src={b.v} alt="" style={{ borderRadius: 12, border: '1px solid var(--line)' }} />;
            if (b.t === 'h3') return <h3 key={i}>{b.v}</h3>;
            if (b.t === 'h2') return <h2 key={i}>{b.v}</h2>;
            return <p key={i}>{b.v}</p>;
          })}

          {faq.length >= 2 && (
            <>
              <h2>Perguntas frequentes</h2>
              <div className="faq">
                {faq.map((f, i) => (
                  <details key={i}>
                    <summary>{f.q}</summary>
                    <div className="ans">{f.a}</div>
                  </details>
                ))}
              </div>
            </>
          )}
        </div>

        <div style={{ marginTop: '3rem' }}>
          <Link className="btn btn--ghost" href="/blog">← Voltar ao blog</Link>
        </div>
      </div>
    </article>
  );
}
