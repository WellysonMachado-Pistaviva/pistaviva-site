import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostBySlug, getAllSlugs } from '../../lib/blog';

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

  const paragraphs = String(post.body || '').split(/\n{2,}/).filter(Boolean);

  // FAQPage: dentro de uma seção "## Perguntas frequentes"/"## FAQ", cada "### Pergunta?" + parágrafo seguinte vira Q&A.
  const faq = [];
  let inFaq = false;
  for (let i = 0; i < paragraphs.length; i++) {
    const p = paragraphs[i];
    if (p.startsWith('## ')) inFaq = /perguntas frequentes|faq|d[úu]vidas/i.test(p);
    else if (inFaq && p.startsWith('### ')) {
      const q = p.slice(4).trim();
      const a = (paragraphs[i + 1] && !paragraphs[i + 1].startsWith('#')) ? paragraphs[i + 1].trim() : '';
      if (q && a) faq.push({ q, a });
    }
  }
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
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      {faqLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />}
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
          <div className="post-cover"><img src={post.cover_url} alt={post.title} /></div>
        )}

        <div className="article">
          {post.excerpt && <p className="lead">{post.excerpt}</p>}
          {paragraphs.map((para, i) => {
            const img = para.match(/^\[img:(.+)\]$/);
            if (img) return <img key={i} src={img[1].trim()} alt="" style={{ borderRadius: 12, border: '1px solid var(--line)' }} />;
            if (para.startsWith('### ')) return <h3 key={i}>{para.slice(4)}</h3>;
            if (para.startsWith('## ')) return <h2 key={i}>{para.slice(3)}</h2>;
            return <p key={i}>{para}</p>;
          })}
        </div>

        <div style={{ marginTop: '3rem' }}>
          <Link className="btn btn--ghost" href="/blog">← Voltar ao blog</Link>
        </div>
      </div>
    </article>
  );
}
