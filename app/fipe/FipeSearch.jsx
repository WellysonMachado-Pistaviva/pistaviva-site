'use client';
import { useState, useEffect } from 'react';

const API = 'https://parallelum.com.br/fipe/api/v1/motos/marcas';

export default function FipeSearch() {
  const [marcas, setMarcas] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [anos, setAnos] = useState([]);
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [ano, setAno] = useState('');
  const [res, setRes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    fetch(API).then(r => r.json()).then(setMarcas).catch(() => setErr('Falha ao carregar marcas. Tente recarregar.'));
  }, []);

  const selMarca = async (cod) => {
    setMarca(cod); setModelo(''); setAno(''); setModelos([]); setAnos([]); setRes(null);
    if (!cod) return;
    setLoading(true);
    try { const d = await fetch(`${API}/${cod}/modelos`).then(r => r.json()); setModelos(d.modelos || []); }
    catch { setErr('Falha ao carregar modelos.'); }
    setLoading(false);
  };
  const selModelo = async (cod) => {
    setModelo(cod); setAno(''); setAnos([]); setRes(null);
    if (!cod) return;
    setLoading(true);
    try { const d = await fetch(`${API}/${marca}/modelos/${cod}/anos`).then(r => r.json()); setAnos(d || []); }
    catch { setErr('Falha ao carregar anos.'); }
    setLoading(false);
  };
  const selAno = async (cod) => {
    setAno(cod); setRes(null);
    if (!cod) return;
    setLoading(true); setErr('');
    try { const d = await fetch(`${API}/${marca}/modelos/${modelo}/anos/${cod}`).then(r => r.json()); setRes(d); }
    catch { setErr('Falha ao consultar valor.'); }
    setLoading(false);
  };

  const sel = { width: '100%', padding: '12px 14px', marginBottom: 12, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontFamily: 'inherit', fontSize: 15 };

  return (
    <div style={{ maxWidth: 560 }}>
      <select style={sel} value={marca} onChange={e => selMarca(e.target.value)}>
        <option value="">1. Escolha a marca</option>
        {marcas.map(m => <option key={m.codigo} value={m.codigo}>{m.nome}</option>)}
      </select>
      <select style={sel} value={modelo} onChange={e => selModelo(e.target.value)} disabled={!marca || !modelos.length}>
        <option value="">2. Escolha o modelo</option>
        {modelos.map(m => <option key={m.codigo} value={m.codigo}>{m.nome}</option>)}
      </select>
      <select style={sel} value={ano} onChange={e => selAno(e.target.value)} disabled={!modelo || !anos.length}>
        <option value="">3. Escolha o ano</option>
        {anos.map(a => <option key={a.codigo} value={a.codigo}>{a.nome}</option>)}
      </select>

      {loading && <div className="spinner-wrap"><span className="loading-spinner" /></div>}
      {err && <p style={{ color: 'var(--danger)' }}>{err}</p>}

      {res && (
        <div style={{ marginTop: 18, background: 'linear-gradient(160deg,var(--ink-3),var(--ink-2))', border: '1px solid var(--clay)', borderRadius: 14, padding: '24px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--paper-mut)' }}>Tabela FIPE · {res.MesReferencia?.trim()}</div>
          <div style={{ fontFamily: 'var(--display)', fontSize: 'clamp(2rem,7vw,3rem)', color: 'var(--clay)', lineHeight: 1.1, margin: '8px 0' }}>{res.Valor}</div>
          <div style={{ fontWeight: 700, fontSize: 17 }}>{res.Marca} {res.Modelo}</div>
          <div style={{ color: 'var(--paper-dim)', fontSize: 14, marginTop: 4 }}>{res.AnoModelo === 32000 ? 'Zero KM' : res.AnoModelo} · {res.Combustivel} · cód. {res.CodigoFipe}</div>

          <div style={{ marginTop: 20, paddingTop: 18, borderTop: '1px solid var(--line)' }}>
            <p style={{ color: 'var(--paper-dim)', fontSize: 14, marginBottom: 12 }}>Te ajudou? Segue a gente e bora rodar junto 🏍️</p>
            <a className="btn btn--primary" href="https://www.instagram.com/pistavivaoficial" target="_blank" rel="noopener noreferrer" style={{ margin: '0 auto' }}>Seguir @pistavivaoficial</a>
          </div>
        </div>
      )}

      <p style={{ fontSize: 12, color: 'var(--paper-mut)', marginTop: 16, fontFamily: 'var(--mono)' }}>Valores da Tabela FIPE (referência nacional). Fonte: API pública FIPE.</p>
    </div>
  );
}
