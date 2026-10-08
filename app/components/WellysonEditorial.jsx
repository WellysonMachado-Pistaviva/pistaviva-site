import Link from 'next/link';
import { getPostBySlug } from '../lib/blog';
import './wellyson-editorial.css';

const PORTRAIT = 'https://cnvsooegnraedwmemzgl.supabase.co/storage/v1/object/public/post-images/editorial/2026-10-06/wellyson-pistaviva.webp';
const GUIDES = [
  { slug: 'monumento-rota-biker-27-pedra-do-bau', label: '27', city: 'São Bento do Sapucaí · SP' },
  { slug: 'monumento-rota-biker-35-sao-lourenco', label: '35', city: 'São Lourenço · MG' },
  { slug: 'monumento-rota-biker-29-sao-jose-do-barreiro', label: '29', city: 'São José do Barreiro · SP' },
];

export default async function WellysonEditorial() {
  const guides = (await Promise.all(GUIDES.map(async guide => {
    try {
      const post = await getPostBySlug(guide.slug);
      return post ? { ...guide, post } : null;
    } catch { return null; }
  }))).filter(Boolean);

  return (
    <section className="pv-editorial" aria-labelledby="pv-editorial-title">
      <div className="wrap">
        <div className="pv-editorial-intro">
          <figure className="pv-editorial-portrait">
            <img src={PORTRAIT} alt="Wellyson Machado, criador do Pistaviva" width="1600" height="2400" loading="lazy" />
            <figcaption>Wellyson Machado · Pistaviva</figcaption>
          </figure>
          <div className="pv-editorial-copy">
            <span className="ig-eyebrow">Quem conecta pessoas a lugares</span>
            <h2 id="pv-editorial-title">A próxima viagem começa com uma boa indicação.</h2>
            <p>Sou Wellyson Machado, criador do Pistaviva. Compartilho destinos e organizo encontros para aproximar quem gosta de viajar de moto. A Mantiqueira, o Sul de Minas e o Vale do Paraíba são o ponto de partida dessa história.</p>
            <p>Aqui, você encontra guias com localização e fontes para planejar a visita, além de registros dos encontros que fazem parte da nossa comunidade.</p>
            <div className="pv-editorial-actions">
              <Link href="/sobre" className="ig-btn ig-btn--primary">Conheça minha história →</Link>
              <Link href="/contato#parcerias" className="ig-btn ig-btn--ghost">Proponha uma parceria</Link>
            </div>
            <div className="pv-editorial-stories" aria-label="Histórias do Pistaviva">
              <Link href="/blog/wellyson-pistaviva-bmw-motorrad-fest-2026">BMW Motorrad Fest: nossa participação ↗</Link>
              <Link href="/blog/o-impacto-do-mototurismo-no-bar-do-miguelzinho-garganta-do-registro">Garganta do Registro: encontro e comunidade ↗</Link>
            </div>
          </div>
        </div>
        {guides.length > 0 && (
          <div className="pv-editorial-guides">
            <div>
              <span className="ig-eyebrow">Escolha sua próxima parada</span>
              <h3>Monumentos da Rota Biker</h3>
              <p>Onde fica, como localizar e o que confirmar antes de sair.</p>
              <Link href="/destinos/roteiros/monumentos-bikers">Explorar mapa dos monumentos →</Link>
            </div>
            <ol>
              {guides.map(({ slug, label, city, post }) => (
                <li key={slug}><Link href={`/blog/${slug}`}>
                  <span className="pv-editorial-number" aria-hidden="true">{label}</span>
                  <span><small>{city}</small><strong>{post.title}</strong></span>
                  <span aria-hidden="true">↗</span>
                </Link></li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </section>
  );
}
