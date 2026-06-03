'use client';
import { useState } from 'react';
import Link from 'next/link';

const CHIPS = [
  ['all', 'Todas'], ['street', 'Street'], ['trail', 'Trail'],
  ['bigtrail', 'Big Trail'], ['scooter', 'Scooter'], ['naked', 'Naked'], ['sport', 'Esportiva'],
];

export default function MotosFilter({ motos }) {
  const [cat, setCat] = useState('all');
  const list = motos.filter(m => cat === 'all' || m.cat === cat);

  return (
    <>
      <div className="ig-filters">
        {CHIPS.map(([k, l]) => (
          <button key={k} className={`ig-chip${cat === k ? ' active' : ''}`} onClick={() => setCat(k)}>{l}</button>
        ))}
      </div>
      <div className="ig-model-grid">
        {list.map(m => (
          <article key={m.name} className="ig-model">
            <div className="pic">
              <span className="cat-tag">{m.cn}</span>
              <span className="pic-ph">{m.name.split(' ')[0]}</span>
            </div>
            <div className="body">
              <h3>{m.name}</h3>
              <div className="foot">
                <div className="price"><span className="from">Emplacamentos/ano</span><span className="val">{m.un}</span></div>
                <Link href="/fipe" className="more">Ver FIPE <span className="arr">→</span></Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
