'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../src/lib/supabaseClient';

// Notificação de "prova social" — mostra ATIVIDADE REAL recente da comunidade
// (quem postou, cadastrou parada/rota), com nome + cidade + ação verdadeira.
// Aparece alguns segundos após carregar e vai rotacionando. Não inventa nomes.

const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

export default function LiveToast() {
  const [items, setItems] = useState([]);
  const [cur, setCur] = useState(null);
  const [show, setShow] = useState(false);

  // monta a fila de atividades reais
  useEffect(() => {
    let alive = true;
    (async () => {
      const out = [];
      try {
        const { data: posts } = await supabase.from('pv_posts').select('author_name, content, created_at').order('created_at', { ascending: false }).limit(8);
        (posts || []).forEach(p => {
          let city = ''; try { const c = JSON.parse(p.content); city = [c.city, c.uf].filter(Boolean).join('/'); } catch { /* */ }
          if (p.author_name) out.push({ name: p.author_name, city, action: 'compartilhou uma estrada 🏍️' });
        });
      } catch { /* */ }
      try {
        const { data: spots } = await supabase.from('pv_spots').select('author, nome, cidade, uf').eq('published', true).order('created_at', { ascending: false }).limit(6);
        (spots || []).forEach(s => { if (s.author) out.push({ name: s.author, city: [s.cidade, s.uf].filter(Boolean).join('/'), action: `indicou ${s.nome}` }); });
      } catch { /* */ }
      try {
        const { data: routes } = await supabase.from('pv_user_routes').select('author, nome').eq('published', true).order('created_at', { ascending: false }).limit(6);
        (routes || []).forEach(r => { if (r.author) out.push({ name: r.author, action: `cadastrou a rota ${r.nome}` }); });
      } catch { /* */ }
      if (alive) setItems(shuffle(out).slice(0, 12));
    })();
    return () => { alive = false; };
  }, []);

  // ciclo: 1º aparece após 6s; visível 5,5s; pausa 9s; loop
  useEffect(() => {
    if (items.length === 0) return;
    let i = 0; let t1, t2;
    const tick = () => {
      setCur(items[i % items.length]); setShow(true);
      t1 = setTimeout(() => {
        setShow(false);
        t2 = setTimeout(() => { i++; tick(); }, 9000);
      }, 5500);
    };
    const start = setTimeout(tick, 6000);
    return () => { clearTimeout(start); clearTimeout(t1); clearTimeout(t2); };
  }, [items]);

  if (!cur) return null;
  return (
    <div className={`pv-livetoast${show ? ' show' : ''}`} role="status" aria-live="polite">
      <span className="pv-lt-ico">🪖</span>
      <span className="pv-lt-txt">
        <b>{cur.name}{cur.city ? ` · ${cur.city}` : ''}</b>
        <span>{cur.action}</span>
      </span>
    </div>
  );
}
