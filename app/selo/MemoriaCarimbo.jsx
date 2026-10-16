'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { FotoCarimbo } from './CarimboCidade';
import { LIMITE_RELATO } from '../lib/selo/memoria.mjs';

export default function MemoriaCarimbo({ carimbo: c, codigo, rascunho, onRascunho, onFechar, onSalva }) {
  const dialogo = useRef(null);
  const rascunhoInicial = useRef(rascunho);
  const [relato, setRelato] = useState('');
  const [original, setOriginal] = useState('');
  const [carregando, setCarregando] = useState(Boolean(codigo && c.entradaId));
  const [falhaCarga, setFalhaCarga] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [status, setStatus] = useState('');
  const [erro, setErro] = useState('');
  const [fotoErro, setFotoErro] = useState(false);
  const [fotoStatus, setFotoStatus] = useState(null);
  const [foto, setFoto] = useState(null);
  const [tentativa, setTentativa] = useState(0);
  const [tentativaFoto, setTentativaFoto] = useState(0);
  const privado = Boolean(codigo && c.entradaId);
  const endpoint = `/api/selo/memoria?entrada=${encodeURIComponent(c.entradaId || '')}`;

  useEffect(() => { dialogo.current?.showModal(); }, []);
  useEffect(() => {
    if (!privado) return;
    const controle = new AbortController();
    const headers = { Authorization: `Bearer ${codigo}` };
    fetch(endpoint, { headers, cache: 'no-store', signal: controle.signal }).then(async (r) => {
      const d = await r.json();
      if (!r.ok) throw new Error(d.erro);
      setRelato(rascunhoInicial.current ?? d.relato); setOriginal(d.relato); setFotoStatus(d.fotoStatus); setFalhaCarga(false);
    }).catch((e) => { if (e.name !== 'AbortError') { setErro(e.message || 'Não foi possível abrir sua memória.'); setFalhaCarga(true); } })
      .finally(() => { if (!controle.signal.aborted) setCarregando(false); });
    return () => controle.abort();
  }, [privado, codigo, endpoint, tentativa]);

  useEffect(() => {
    if (!privado || !['privada', 'publica'].includes(fotoStatus)) return;
    const controle = new AbortController();
    let url;
    fetch(`${endpoint}&foto=1`, { headers: { Authorization: `Bearer ${codigo}` }, cache: 'no-store', signal: controle.signal })
      .then((r) => { if (!r.ok) throw new Error(); return r.blob(); }).then((b) => {
        if (controle.signal.aborted) return;
        url = URL.createObjectURL(b); setFoto(url); setFotoErro(false);
      }).catch((e) => { if (e.name !== 'AbortError') setFotoErro(true); });
    return () => { controle.abort(); if (url) URL.revokeObjectURL(url); };
  }, [privado, codigo, endpoint, fotoStatus, tentativaFoto]);

  async function salvar(e) {
    e.preventDefault(); setSalvando(true); setErro(''); setStatus('');
    try {
      const r = await fetch(endpoint, { method: 'PUT', headers: { Authorization: `Bearer ${codigo}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ relato }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.erro);
      setRelato(d.relato); setOriginal(d.relato); onRascunho(undefined); setStatus('Memória salva no seu passaporte.'); onSalva();
    } catch (e) { setErro(e.message || 'Não salvou. Seu texto continua aqui para tentar novamente.'); }
    finally { setSalvando(false); }
  }

  return <dialog ref={dialogo} className="jornada-dialogo" aria-labelledby="memoria-titulo" onClose={onFechar} onCancel={(e) => { if (salvando) e.preventDefault(); }} onClick={(e) => { if (e.target === dialogo.current && !salvando) dialogo.current.close(); }}>
    <div className="jornada-memoria">
      <header className="jornada-memoria-topo"><span className="jornada-kicker">Passaporte do motociclista · {privado ? 'minhas memórias' : 'minhas conquistas'}</span><button type="button" aria-label="Fechar memória" onClick={() => dialogo.current.close()} disabled={salvando}>×</button></header>
      <div className="jornada-memoria-carimbo"><img src={c.img} alt={`Carimbo de ${c.titulo}`} width={128} height={128} /><div><h2 id="memoria-titulo">{c.titulo}</h2><time dateTime={c.dia}>{c.dia.split('-').reverse().join('/')}</time>{c.visita > 1 && <span>{c.visita}ª passagem por aqui</span>}{c.serie && <strong>Nº {c.serie}</strong>}</div></div>
      {privado ? <>
        <p className="jornada-privacidade">Seu relato fica só no passaporte pessoal, mesmo se seu perfil for público.</p>
        {carregando ? <p role="status">Abrindo memória…</p> : falhaCarga ? <><p role="alert">{erro}</p><button type="button" className="selo-btn secundario" onClick={() => { setCarregando(true); setErro(''); setTentativa((n) => n + 1); }}>Tentar novamente</button></> : <>
          {foto && <figure className="jornada-foto"><img src={foto} alt={`Foto da passagem por ${c.nome}`} /><figcaption>{fotoStatus === 'publica' ? 'Foto publicada no mapa da cidade.' : 'Foto privada, só no seu passaporte.'}</figcaption></figure>}
          {fotoErro && <p role="alert">Não carregou a foto. <button type="button" className="jornada-ver-todas" onClick={() => setTentativaFoto((n) => n + 1)}>Tentar foto novamente</button></p>}
          {['oculta', 'denunciada'].includes(fotoStatus) && <p className="jornada-dica">Foto indisponível após moderação.</p>}
          {!fotoStatus && <FotoCarimbo codigo={codigo} entradaId={c.entradaId} cidade={{ slug: c.slug, nome: c.nome, uf: c.uf }} publicaInicial={false} onEnviada={setFotoStatus} titulo="Foto desta passagem (opcional)" />}
          <form onSubmit={salvar} className="jornada-relato">
            <label htmlFor="memoria-relato">Minha memória deste lugar</label>
            <textarea id="memoria-relato" value={relato} onChange={(e) => { setRelato(e.target.value); onRascunho(e.target.value); setStatus(''); }} maxLength={LIMITE_RELATO} rows={5} placeholder="Uma estrada, uma companhia, uma história que vale guardar…" disabled={salvando} aria-describedby="memoria-limite" />
            <small id="memoria-limite">{relato.length}/{LIMITE_RELATO} · {relato.trim() !== original ? 'rascunho não salvo' : 'opcional'}</small>
            <button type="submit" className="selo-btn" disabled={salvando || relato.trim() === original}>{salvando ? 'Salvando…' : 'Salvar memória'}</button>
            {status && <p role="status">{status}</p>}{erro && <p className="selo-erro" role="alert">{erro}</p>}
          </form>
        </>}
      </> : <p className="jornada-dica">{c.tipo === 'cidade' ? 'Passagem confirmada pelo GPS dentro do município.' : 'Estação confirmada no balcão.'}</p>}
      {privado && <Link className="selo-btn secundario" href={`/selo/passaporte?story=${encodeURIComponent(c.entradaId)}`}>Montar Story desta conquista</Link>}
      <Link className="selo-text-link" href={c.href}>Conhecer {c.tipo === 'cidade' ? 'a cidade' : 'esta coleção'} →</Link>
      <footer className="pu-rodape"><strong>Conectando pessoas a lugares</strong></footer>
    </div>
  </dialog>;
}
