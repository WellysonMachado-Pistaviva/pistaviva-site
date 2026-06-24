import Link from 'next/link';
import Cover from '../components/Cover';
import LiveBadge from '../components/LiveBadge';
import { getPhotographers } from '../lib/photographers';
import NewPhotographerForm from './NewPhotographerForm';

export const revalidate = 120;

export const metadata = {
  title: 'Fotógrafos de Estrada — registre sua passagem nas curvas',
  description: 'Fotógrafos de moto cadastrados nos melhores trechos do Brasil (Serra do Rio do Rastro, Mantiqueira e mais). Veja quem fotografa onde você vai passar, com Instagram e galeria.',
  alternates: { canonical: '/fotografos' },
  openGraph: { title: 'Fotógrafos de Estrada · Pistaviva', description: 'Quem fotografa motociclistas nas curvas do Brasil.' },
};

export default async function Fotografos() {
  const fotos = await getPhotographers();
  return (
    <div className="ignis ph-list">
      <section className="ph-intro">
        <div className="wrap">
          <div className="head">
            <div>
              <span className="ig-eyebrow" style={{ color: 'var(--ink-soft)' }}>Fotógrafos de estrada</span>
              <h1>Quem fotografa<br />nas curvas</h1>
            </div>
            <Link className="ph-linkarrow" href="/mapa">Ver no mapa <span className="arr">→</span></Link>
          </div>
          <p className="lede">Cadastre-se como fotógrafo de um trecho. Quando um motociclista planeja uma rota que passa pelo seu ponto, ele vê seu nome, Instagram e galeria.</p>
        </div>
      </section>

      <div className="wrap">
        {fotos.length === 0 ? (
          <p style={{ color: 'var(--ink-soft)', padding: '20px 0 40px' }}>Nenhum fotógrafo cadastrado ainda. Seja o primeiro abaixo.</p>
        ) : (
          <div className="ph-grid">
            {fotos.map(f => (
              <Link className="ph-card" key={f.id} href={`/fotografo/${f.slug}`}>
                <div className="pic">
                  <span className="spot">📸 {f.local || f.cidade || 'Fotógrafo'}</span>
                  <span className="ph-live"><LiveBadge dias={f.horario_dias} inicio={f.horario_inicio} fim={f.horario_fim} showSchedule={false} /></span>
                  {f.cover_url ? <Cover src={f.cover_url} alt={f.nome} sizes="(max-width:600px) 100vw, 380px" /> : <span className="pic-ph">📷</span>}
                </div>
                <div className="body">
                  <h3>{f.nome}</h3>
                  <p className="desc">{f.descricao || `Fotógrafo de moto${f.local ? ' · ' + f.local : ''}`}</p>
                  <div className="foot">
                    <span className="loc">{[f.cidade, f.uf].filter(Boolean).join(' · ') || 'Brasil'}</span>
                    <span className="ph-linkarrow" style={{ fontSize: 12 }}>Ver perfil <span className="arr">→</span></span>
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
            <h2>É fotógrafo de estrada?</h2>
            <p>Cadastre seu ponto e sua galeria — e seja visto por todo motociclista que passar por lá.</p>
          </div>
        </section>
        <NewPhotographerForm />
      </div>
    </div>
  );
}
