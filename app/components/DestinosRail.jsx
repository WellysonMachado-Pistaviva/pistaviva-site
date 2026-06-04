import Link from 'next/link';
import Cover from './Cover';

// Rail horizontal de destinos (cards lado a lado: foto + nome). Scroll com
// swipe no mobile e trackpad/scroll no desktop, com snap. Gerenciado no admin.
export default function DestinosRail({ items = [] }) {
  const list = items.filter(d => d?.image_url);
  if (list.length === 0) return null;
  return (
    <div className="dr-rail">
      {list.map((d, i) => {
        const inner = (
          <>
            <div className="dr-pic">
              <Cover src={d.image_url} alt={d.nome} sizes="(max-width:600px) 70vw, 300px" />
            </div>
            <div className="dr-name">{d.nome}</div>
          </>
        );
        const cls = 'dr-card';
        if (!d.link) return <div key={d.id || i} className={cls}>{inner}</div>;
        return /^https?:\/\//.test(d.link)
          ? <a key={d.id || i} className={cls} href={d.link} target="_blank" rel="noopener noreferrer">{inner}</a>
          : <Link key={d.id || i} className={cls} href={d.link}>{inner}</Link>;
      })}
    </div>
  );
}
