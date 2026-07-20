import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCommunityPostById } from '../../lib/community';

export const revalidate = 300;
const BASE = 'https://www.pistavivamototurismo.com.br';
const CATEGORY = { viagem: 'Viagem', bateevolta: 'Bate e volta', trilha: 'Trilha', evento: 'Evento' };

export async function generateMetadata({ params }) {
  const { id } = await params;
  const post = await getCommunityPostById(id);
  if (!post) return { title: 'Relato não encontrado', robots: { index: false, follow: true } };
  const place = [post.city, post.uf].filter(Boolean).join('/');
  const title = `${CATEGORY[post.category] || 'Relato'}${place ? ` em ${place}` : ''} — ${post.author}`;
  const description = post.comment.slice(0, 160);
  return {
    title,
    description,
    alternates: { canonical: `/comunidade/${id}` },
    openGraph: { type: 'article', title, description, url: `${BASE}/comunidade/${id}` },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function CommunityPostPage({ params }) {
  const { id } = await params;
  const post = await getCommunityPostById(id);
  if (!post) notFound();
  const place = [post.city, post.uf].filter(Boolean).join('/');

  return (
    <main className="community-story">
      <article className="community-story__card">
        <div className="community-story__media">
          {post.image
            ? <Image src={post.image} alt={place || post.comment} fill priority sizes="(max-width: 760px) 100vw, 720px" />
            : <div className="community-story__empty" />}
        </div>
        <div className="community-story__body">
          <div className="community-story__meta">
            <span>{CATEGORY[post.category] || 'Direto da estrada'}</span>
            {place && <strong>{place}</strong>}
          </div>
          <blockquote>{post.comment}</blockquote>
          <p>Por <strong>{post.author}</strong></p>
          <Link href="/comunidade">← Ver mais relatos da comunidade</Link>
        </div>
      </article>
    </main>
  );
}
