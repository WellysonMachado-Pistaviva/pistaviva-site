import Link from 'next/link';
import { pessoas } from './dados';

// Card de selo do catálogo (estação) ou de parada oficial.
export default function SeloCard({ href, arte, cor, nome, etiqueta, total }) {
  return (
    <Link className="selos-card" href={href}>
      <span className="selos-card-arte" style={cor ? { '--selos-cor': cor } : undefined}>
        {arte ? <img src={arte} alt="" width={160} height={160} loading="lazy" /> : <span aria-hidden="true">{nome.slice(0, 1)}</span>}
      </span>
      <strong>{nome}</strong>
      <small>{etiqueta}</small>
      {total != null && <small className="selos-card-total">{pessoas(total)}</small>}
    </Link>
  );
}
