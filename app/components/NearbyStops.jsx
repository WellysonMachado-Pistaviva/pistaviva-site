'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import Cover from './Cover';

// "Paradas no caminho" — estilo Google Maps: dropdown de categoria
// (Tudo / Restaurantes / Postos / Pousadas / Mirantes / Oficinas) + cards.
// Recebe paradas já filtradas por proximidade (server). Novas aparecem sozinhas.
const CAT = {
  restaurante: { label: 'Restaurantes', ico: '🍽️' },
  posto: { label: 'Postos', ico: '⛽' },
  pousada: { label: 'Pousadas', ico: '🛏️' },
  mirante: { label: 'Mirantes', ico: '🏞️' },
  oficina: { label: 'Oficinas', ico: '🔧' },
  atrativo: { label: 'Atrativos', ico: '📸' },
  outro: { label: 'Outros', ico: '📍' },
};

export default function NearbyStops({ stops = [], titulo = 'Paradas no caminho' }) {
  const [cat, setCat] = useState('todos');

  // categorias presentes (ordenadas por relevância de rolê)
  const order = ['restaurante', 'posto', 'pousada', 'mirante', 'oficina', 'atrativo', 'outro'];
  const presentes = useMemo(() => order.filter((c) => stops.some((s) => s.categoria === c)), [stops]);
  const lista = useMemo(() => (cat === 'todos' ? stops : stops.filter((s) => s.categoria === cat)), [stops, cat]);

  if (!stops.length) return null;

  return (
    <div style={{ marginTop: 30 }}>
      <h2 style={{ fontFamily: 'var(--display)', marginBottom: 6 }}>{titulo}</h2>
      <p style={{ color: 'var(--ink-soft)', fontSize: 14, marginBottom: 12 }}>
        {stops.length} parada{stops.length === 1 ? '' : 's'} da comunidade perto dessa rota. Filtre por tipo:
      </p>

      {/* Dropdown / chips de categoria */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        <button onClick={() => setCat('todos')} className={`ns-chip${cat === 'todos' ? ' on' : ''}`}>
          📍 Tudo ({stops.length})
        </button>
        {presentes.map((c) => {
          const n = stops.filter((s) => s.categoria === c).length;
          return (
            <button key={c} onClick={() => setCat(c)} className={`ns-chip${cat === c ? ' on' : ''}`}>
              {CAT[c].ico} {CAT[c].label} ({n})
            </button>
          );
        })}
      </div>

      <div className="ph-grid">
        {lista.map((s) => {
          const ico = CAT[s.categoria]?.ico, lbl = CAT[s.categoria]?.label || s.categoria;
          const inner = (
            <>
              <div className="pic">
                <span className="spot">{ico} {lbl}</span>
                {s.cover_url ? <Cover src={s.cover_url} alt={`${s.nome} — ${s.cidade}/${s.uf}`} sizes="(max-width:600px) 100vw, 380px" /> : <span className="pic-ph">{ico || '📍'}</span>}
              </div>
              <div className="body">
                <h3>{s.nome}</h3>
                <p className="desc">{s.descricao || `${lbl}${s.cidade ? ` em ${[s.cidade, s.uf].filter(Boolean).join('/')}` : ''}`}</p>
                <div className="foot">
                  <span className="loc">{s.osm ? 'via mapa (OpenStreetMap)' : [s.cidade, s.uf].filter(Boolean).join(' · ')}</span>
                  {s.distKm != null && <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--clay)' }}>~{s.distKm} km</span>}
                </div>
              </div>
            </>
          );
          return s.osm
            ? <a className="ph-card" key={s.id} href={s.mapsUrl} target="_blank" rel="noopener noreferrer">{inner}</a>
            : <Link className="ph-card" key={s.id} href={`/parada/${s.slug}`}>{inner}</Link>;
        })}
      </div>
    </div>
  );
}
