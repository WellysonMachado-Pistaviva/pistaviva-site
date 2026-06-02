import Link from 'next/link';
import Cover from '../components/Cover';
import { getPhotographers, igUrl } from '../lib/photographers';
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
    <div className="wrap section" style={{ paddingTop: 'clamp(28px,5vw,56px)' }}>
      <div className="section-head">
        <div>
          <p className="eyebrow eyebrow--moss">Fotógrafos de estrada</p>
          <h2>Quem fotografa nas curvas</h2>
        </div>
        <Link className="link" href="/mapa">Ver no mapa →</Link>
      </div>
      <p style={{ color: 'var(--paper-dim)', marginBottom: '1.8rem', maxWidth: '60ch' }}>
        Cadastre-se como fotógrafo de um trecho. Quando um motociclista planejar uma rota que passe pelo seu ponto, ele vê seu nome, Instagram e galeria.
      </p>

      {fotos.length === 0 ? (
        <p style={{ color: 'var(--paper-dim)', marginBottom: '2rem' }}>Nenhum fotógrafo cadastrado ainda. Seja o primeiro abaixo.</p>
      ) : (
        <div className="routes" style={{ marginBottom: '2.5rem' }}>
          {fotos.map(f => (
            <article className="route" key={f.id}>
              <Link href={`/fotografo/${f.slug}`} aria-label={f.nome}>
                <div className="thumb">
                  <span className="tag">📸 {f.local || f.cidade || 'Fotógrafo'}</span>
                  {f.cover_url && <Cover src={f.cover_url} alt={f.nome} sizes="(max-width:600px) 100vw, 380px" />}
                </div>
                <div className="body">
                  <h3>{f.nome}</h3>
                  <p>{f.descricao || `Fotógrafo de moto${f.local ? ' · ' + f.local : ''}`}</p>
                  <div className="meta"><span>{[f.cidade, f.uf].filter(Boolean).join(' · ')}</span></div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}

      <NewPhotographerForm />
    </div>
  );
}
