import Link from 'next/link';
import Cover from './Cover';
import EmblaCarousel from './EmblaCarousel';

// Rail de destinos "onde rodar" (carrossel Embla: setas + arraste + swipe).
// Cards foto + nome, gerenciados no admin.
export default function DestinosRail({ items = [] }) {
  const list = items.filter(d => d?.image_url);
  if (list.length === 0) return null;

  const slides = list.map((d, i) => {
    const inner = (
      <>
        <div className="dr-pic">
          <Cover src={d.image_url} alt={d.nome} sizes="(max-width:600px) 70vw, 300px" />
        </div>
        <div className="dr-name">{d.nome}</div>
      </>
    );
    if (!d.link) return <div key={d.id || i} className="dr-card">{inner}</div>;
    return /^https?:\/\//.test(d.link)
      ? <a key={d.id || i} className="dr-card" href={d.link} target="_blank" rel="noopener noreferrer">{inner}</a>
      : <Link key={d.id || i} className="dr-card" href={d.link}>{inner}</Link>;
  });

  return <EmblaCarousel slides={slides} basis="clamp(220px,72vw,300px)" gap={14} />;
}
