import Link from 'next/link';
import { getSpots } from '../lib/spots';
import { SELOS, CATEGORIAS, catNome } from '../lib/spotMeta';
import NewSpotForm from './NewSpotForm';

export const revalidate = 120;

export const metadata = {
  title: 'Paradas da Comunidade — pousadas, restaurantes e pontos para motociclistas',
  description: 'Mapa colaborativo de paradas para motociclistas no Brasil: pousadas, restaurantes, mirantes e oficinas com selos de qualidade dados pela comunidade Pistaviva.',
  alternates: { canonical: '/paradas' },
  openGraph: { title: 'Paradas da Comunidade · Pistaviva', description: 'Pontos amigos do motociclista, avaliados pela comunidade.' },
};

const SeloDots = ({ ids = [] }) => (
  <span style={{ display: 'inline-flex', gap: 4 }}>
    {ids.map(id => {
      const s = SELOS.find(x => x.id === id);
      if (!s) return null;
      return <span key={id} title={s.nome} style={{ width: 18, height: 18, borderRadius: '50%', border: '1px solid var(--clay)', color: 'var(--clay)', fontSize: 10, fontWeight: 800, display: 'grid', placeItems: 'center', fontFamily: 'var(--mono)' }}>{s.sigla}</span>;
    })}
  </span>
);

export default async function Paradas({ searchParams }) {
  const sp = await searchParams;
  const filtro = { uf: sp?.uf, categoria: sp?.categoria, selo: sp?.selo };
  const spots = await getSpots({ ...filtro, limit: 120 });

  const chip = (active) => ({
    fontFamily: 'var(--mono)', fontSize: 12, padding: '6px 12px', borderRadius: 6,
    border: '1px solid var(--line)', textTransform: 'uppercase', letterSpacing: '.06em',
    color: active ? 'var(--ink)' : 'var(--paper-dim)', background: active ? 'var(--clay)' : 'transparent',
  });

  return (
    <div className="wrap section" style={{ paddingTop: 'clamp(28px,5vw,56px)' }}>
      <div className="section-head">
        <div>
          <p className="eyebrow eyebrow--moss">Mapa colaborativo</p>
          <h2>Paradas da Comunidade</h2>
        </div>
        <Link className="link" href="/mapa">Ver no mapa →</Link>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: '1.6rem' }}>
        <Link href="/paradas" style={chip(!sp?.selo && !sp?.categoria)}>Todos</Link>
        {SELOS.map(s => (
          <Link key={s.id} href={`/paradas?selo=${s.id}`} style={chip(sp?.selo === s.id)}>{s.nome}</Link>
        ))}
        {CATEGORIAS.slice(0, 5).map(c => (
          <Link key={c.id} href={`/paradas?categoria=${c.id}`} style={chip(sp?.categoria === c.id)}>{c.nome}</Link>
        ))}
      </div>

      {/* Legenda dos selos */}
      <p style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--paper-mut)', marginBottom: '1.6rem', lineHeight: 1.7 }}>
        Selos (dados por quem cadastra): {SELOS.map((s, i) => (
          <span key={s.id}>{i > 0 ? ' · ' : ''}<b style={{ color: 'var(--clay)' }}>{s.sigla}</b> = {s.nome}</span>
        ))}
      </p>

      {/* Lista */}
      {spots.length === 0 ? (
        <p style={{ color: 'var(--paper-dim)', marginBottom: '2rem' }}>Nenhuma parada ainda com esse filtro. Seja o primeiro a cadastrar abaixo.</p>
      ) : (
        <div className="routes" style={{ marginBottom: '2.5rem' }}>
          {spots.map(s => (
            <article className="route" key={s.id}>
              <Link href={`/parada/${s.slug}`} aria-label={s.nome}>
                <div className="thumb">
                  <span className="tag">{catNome(s.categoria)}</span>
                  {s.cover_url && <img src={s.cover_url} alt={s.nome} />}
                </div>
                <div className="body">
                  <h3>{s.nome}</h3>
                  <p>{s.descricao || `${catNome(s.categoria)} em ${s.cidade}/${s.uf}`}</p>
                  <div className="meta" style={{ justifyContent: 'space-between' }}>
                    <span>{s.cidade} · {s.uf}</span>
                    <SeloDots ids={s.selos} />
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}

      <NewSpotForm />
    </div>
  );
}
