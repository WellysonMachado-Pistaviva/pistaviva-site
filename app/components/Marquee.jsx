// Faixa rolando (CSS puro, pausa no hover). items = lista de strings.
export default function Marquee({ items = [] }) {
  if (!items.length) return null;
  const all = [...items, ...items];
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {all.map((it, i) => (
          <span className="marquee-item" key={i}><span className="dot" />{it}</span>
        ))}
      </div>
    </div>
  );
}
