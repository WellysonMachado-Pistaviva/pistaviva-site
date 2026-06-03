import Link from 'next/link';
import Cover from '../components/Cover';
import { getSpots } from '../lib/spots';
import { SELOS, CATEGORIAS, catNome } from '../lib/spotMeta';
import NewSpotForm from './NewSpotForm';

export const revalidate = 120;

export const metadata = {
  title: 'Paradas da Comunidade — pousadas, restaurantes e pontos para motociclistas',
  description: 'Mapa colaborativo de paradas para motociclistas no Brasil: pousadas, restaurantes, mirantes e oficinas com comodidades indicadas pela comunidade Pistaviva.',
  alternates: { canonical: '/paradas' },
  openGraph: { title: 'Paradas da Comunidade · Pistaviva', description: 'Pontos amigos do motociclista, avaliados pela comunidade.' },
};

const SeloDots = ({ ids = [] }) => (
  <span style={{ display: 'inline-flex', gap: 6 }}>
    {ids.slice(0, 5).map(id => {
      const s = SELOS.find(x => x.id === id);
      if (!s) return null;
      return <span key={id} title={s.nome} style={{ fontSize: 15, lineHeight: 1 }}>{s.sigla}</span>;
    })}
  </span>
);

export default async function Paradas({ searchParams }) {
  const sp = await searchParams;
  const filtro = { uf: sp?.uf, categoria: sp?.categoria, selo: sp?.selo };
  const spots = await getSpots({ ...filtro, limit: 120 });

  const chip = (active) => ({
    fontFamily: 'var(--mono)', fontSize: 12, padding: '8px 14px', borderRadius: 100,
    border: `1.5px solid ${active ? 'var(--clay)' : 'var(--snow-line)'}`, textTransform: 'uppercase', letterSpacing: '.06em',
    color: active ? '#fff' : 'var(--ink-soft)', background: active ? 'var(--clay)' : 'transparent', fontWeight: 600,
  });

  return (
    <div className="ignis ph-list">
      <section className="ph-intro">
        <div className="wrap">
          <div className="head">
            <div>
              <span className="ig-eyebrow" style={{ color: 'var(--ink-soft)' }}>Mapa colaborativo</span>
              <h1>Paradas da<br />comunidade</h1>
            </div>
            <Link className="ph-linkarrow" href="/mapa">Ver no mapa <span className="arr">→</span></Link>
          </div>
          <p className="lede">Pontos amigos do motociclista cadastrados pela comunidade: onde comer, dormir, abastecer e descansar na estrada.</p>
        </div>
      </section>

      <div className="wrap">
        {/* Filtros */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '4px 0 18px' }}>
          <Link href="/paradas" style={chip(!sp?.selo && !sp?.categoria)}>Todos</Link>
          {SELOS.map(s => (
            <Link key={s.id} href={`/paradas?selo=${s.id}`} style={chip(sp?.selo === s.id)}>{s.nome}</Link>
          ))}
          {CATEGORIAS.slice(0, 5).map(c => (
            <Link key={c.id} href={`/paradas?categoria=${c.id}`} style={chip(sp?.categoria === c.id)}>{c.nome}</Link>
          ))}
        </div>

        {spots.length === 0 ? (
          <p style={{ color: 'var(--ink-soft)', padding: '10px 0 30px' }}>Nenhuma parada ainda com esse filtro. Seja o primeiro a cadastrar abaixo.</p>
        ) : (
          <div className="ph-grid">
            {spots.map(s => (
              <Link className="ph-card" key={s.id} href={`/parada/${s.slug}`}>
                <div className="pic">
                  <span className="spot">{catNome(s.categoria)}</span>
                  {s.cover_url ? <Cover src={s.cover_url} alt={s.nome} sizes="(max-width:600px) 100vw, 380px" /> : <span className="pic-ph">📍</span>}
                </div>
                <div className="body">
                  <h3>{s.nome}</h3>
                  <p className="desc">{s.descricao || `${catNome(s.categoria)} em ${s.cidade}/${s.uf}`}</p>
                  <div className="foot">
                    <span className="loc">{[s.cidade, s.uf].filter(Boolean).join(' · ')}</span>
                    <SeloDots ids={s.selos} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="wrap">
        <section className="ph-cta">
          <div className="inner">
            <h2>Conhece uma parada boa?</h2>
            <p>Cadastre o ponto, as comodidades e uma foto — e ajude todo motociclista que passar por lá.</p>
          </div>
        </section>
        <NewSpotForm />
      </div>
    </div>
  );
}
