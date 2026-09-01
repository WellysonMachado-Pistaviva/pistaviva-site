import Link from 'next/link';
import Cover from './Cover';

// Bloco editorial 50/50 — foto de um lado, texto do outro.
// Serve de respiro entre os rails e os grids da home, que hoje se empilham sem
// pausa. `reverse` troca o lado da foto pra alternar quando houver mais de um.
export default function EditorialSplit({
  eyebrow,
  title,
  excerpt,
  href,
  image,
  imageAlt = '',
  meta = [],
  cta = 'Ler matéria',
  reverse = false,
}) {
  if (!title || !href) return null;

  return (
    <section className={`esplit${reverse ? ' esplit--reverse' : ''}`} aria-labelledby="esplit-title">
      <div className="wrap esplit-grid">
        <Link href={href} className="esplit-media" tabIndex={-1} aria-hidden="true">
          {image
            ? <Cover src={image} alt={imageAlt} sizes="(max-width:900px) 92vw, 620px" />
            : <span className="esplit-ph">PISTAVIVA</span>}
        </Link>

        <div className="esplit-body">
          {eyebrow && <span className="ig-eyebrow on-dark">{eyebrow}</span>}
          <h2 id="esplit-title">
            <Link href={href}>{title}</Link>
          </h2>
          {excerpt && <p>{excerpt}</p>}
          {meta.length > 0 && (
            <ul className="esplit-meta">
              {meta.filter(Boolean).map((item) => <li key={item}>{item}</li>)}
            </ul>
          )}
          <Link href={href} className="ig-btn ig-btn--ghost on-dark">
            {cta} <span className="arr">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
