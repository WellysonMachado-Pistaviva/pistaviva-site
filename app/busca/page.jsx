import Link from 'next/link';
import { supabaseServer } from '../lib/supabaseServer';

export const metadata = {
  title: 'Busca',
  robots: { index: false, follow: true },
};

async function search(q) {
  if (!q || q.trim().length < 2) return { posts: [], spots: [], fotos: [] };
  const sb = supabaseServer();
  const like = `%${q.trim()}%`;
  const [posts, spots, fotos] = await Promise.all([
    sb.from('pv_blog_posts').select('slug, title, excerpt').eq('published', true).ilike('title', like).limit(10).then(r => r.data || []).catch(() => []),
    sb.from('pv_spots').select('slug, nome, cidade, uf').eq('published', true).ilike('nome', like).limit(10).then(r => r.data || []).catch(() => []),
    sb.from('pv_photographers').select('slug, nome, local').eq('published', true).ilike('nome', like).limit(10).then(r => r.data || []).catch(() => []),
  ]);
  return { posts, spots, fotos };
}

export default async function Busca({ searchParams }) {
  const sp = await searchParams;
  const q = sp?.q || '';
  const { posts, spots, fotos } = await search(q);
  const total = posts.length + spots.length + fotos.length;

  return (
    <div className="wrap section page-light" style={{ paddingTop: 'clamp(28px,5vw,56px)' }}>
      <div className="section-head"><div><p className="eyebrow eyebrow--moss">Busca</p><h2>Buscar no Pistaviva</h2></div></div>

      <form action="/busca" method="get" style={{ display: 'flex', gap: 8, marginBottom: '2rem', maxWidth: 520 }}>
        <input name="q" defaultValue={q} placeholder="Rota, parada, matéria, fotógrafo..." autoFocus
          style={{ flex: 1, padding: '12px 14px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontFamily: 'inherit' }} />
        <button className="btn btn--primary" type="submit">Buscar</button>
      </form>

      {q && <p style={{ color: 'var(--paper-mut)', marginBottom: '1.5rem' }}>{total} resultado(s) para "{q}"</p>}

      {posts.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontFamily: 'var(--display)', marginBottom: 10 }}>Blog</h3>
          {posts.map(p => <Link key={p.slug} href={`/blog/${p.slug}`} style={{ display: 'block', padding: '10px 0', borderBottom: '1px solid var(--line)' }}><b>{p.title}</b><br /><span style={{ color: 'var(--paper-dim)', fontSize: 14 }}>{p.excerpt}</span></Link>)}
        </div>
      )}
      {spots.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontFamily: 'var(--display)', marginBottom: 10 }}>Paradas</h3>
          {spots.map(s => <Link key={s.slug} href={`/parada/${s.slug}`} style={{ display: 'block', padding: '10px 0', borderBottom: '1px solid var(--line)' }}><b>{s.nome}</b> <span style={{ color: 'var(--paper-mut)', fontSize: 13 }}>{[s.cidade, s.uf].filter(Boolean).join('/')}</span></Link>)}
        </div>
      )}
      {fotos.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontFamily: 'var(--display)', marginBottom: 10 }}>Fotógrafos</h3>
          {fotos.map(f => <Link key={f.slug} href={`/fotografo/${f.slug}`} style={{ display: 'block', padding: '10px 0', borderBottom: '1px solid var(--line)' }}><b>{f.nome}</b> <span style={{ color: 'var(--paper-mut)', fontSize: 13 }}>{f.local}</span></Link>)}
        </div>
      )}
      {q && total === 0 && <p style={{ color: 'var(--paper-dim)' }}>Nada encontrado. Tente outra palavra.</p>}
    </div>
  );
}
