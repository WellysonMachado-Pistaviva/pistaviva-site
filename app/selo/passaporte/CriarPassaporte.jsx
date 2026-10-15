'use client';
import { useState } from 'react';
import Link from 'next/link';
import { UFS } from '../../lib/ufs.mjs';
import { criarMeuPassaporte } from '../actions';

const UFS_ORDEM = ['MG', 'SP', 'RJ', ...UFS.filter((u) => !['MG', 'SP', 'RJ'].includes(u)).sort()];

// Passaporte criado de qualquer lugar: sem isso, quem está longe do Parque
// não teria como carimbar a primeira cidade.
export default function CriarPassaporte({ onCriado }) {
  const [f, setF] = useState({ nome: '', whatsapp: '', cidade: '', uf: '', aceite_lgpd: false, site: '' });
  const [erros, setErros] = useState({});
  const [msg, setMsg] = useState(null);   // { texto, existente }
  const [enviando, setEnviando] = useState(false);
  const campo = (k) => ({ value: f[k], onChange: (e) => setF((v) => ({ ...v, [k]: e.target.value })), 'aria-invalid': Boolean(erros[k]) });

  async function enviar(e) {
    e.preventDefault();
    setEnviando(true);
    setErros({});
    setMsg(null);
    try {
      const r = await criarMeuPassaporte(f);
      if (r?.ok) return onCriado({ codigo: r.codigo, numero: r.numero, nome: r.nome, whatsapp: f.whatsapp, cidade: r.cidade, uf: r.uf });
      if (r?.erros) setErros(r.erros);
      else setMsg({ texto: r?.erro || 'Não criou. Tente de novo.', existente: r?.existente });
    } catch {
      setMsg({ texto: 'Sem conexão. Tente de novo quando tiver sinal.' });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="selo-cartao passaporte-criar" aria-labelledby="pp-criar-titulo">
      <span className="selo-kicker">Passaporte do motociclista · grátis</span>
      <h2 id="pp-criar-titulo">Crie seu passaporte para carimbar as cidades</h2>
      <p>Leva um minuto. Depois é só tocar em carimbar quando chegar numa cidade da Rota Biker.</p>
      <form className="selo-form" onSubmit={enviar} noValidate>
        {/* Honeypot: invisível para gente, irresistível para robô. */}
        <div className="selo-hp" aria-hidden="true">
          <label htmlFor="pc-site">Site</label>
          <input id="pc-site" name="site" tabIndex={-1} autoComplete="off" {...campo('site')} />
        </div>
        <div className="selo-campo">
          <label htmlFor="pc-nome">Seu nome</label>
          <input id="pc-nome" className="selo-input" autoComplete="name" maxLength={80} {...campo('nome')} />
          {erros.nome && <small className="selo-erro">{erros.nome}</small>}
        </div>
        <div className="selo-campo">
          <label htmlFor="pc-wa">WhatsApp com DDD</label>
          <input id="pc-wa" className="selo-input" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="(35) 99999-9999" {...campo('whatsapp')} />
          <small>É com ele que você recupera o passaporte se trocar de celular. Não mandamos mensagem.</small>
          {erros.whatsapp && <small className="selo-erro">{erros.whatsapp}</small>}
        </div>
        <div className="passaporte-criar-local">
          <div className="selo-campo">
            <label htmlFor="pc-cidade">Sua cidade</label>
            <input id="pc-cidade" className="selo-input" autoComplete="address-level2" maxLength={80} {...campo('cidade')} />
            {erros.cidade && <small className="selo-erro">{erros.cidade}</small>}
          </div>
          <div className="selo-campo">
            <label htmlFor="pc-uf">UF</label>
            <select id="pc-uf" className="selo-select" {...campo('uf')}>
              <option value="">—</option>
              {UFS_ORDEM.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
            {erros.uf && <small className="selo-erro">{erros.uf}</small>}
          </div>
        </div>
        <label className="selo-check">
          <input type="checkbox" checked={f.aceite_lgpd} onChange={(e) => setF((v) => ({ ...v, aceite_lgpd: e.target.checked }))} />
          <span>Aceito o uso dos meus dados para o passaporte, como explica a <Link href="/selo/privacidade">privacidade</Link>.</span>
        </label>
        {erros.aceite_lgpd && <small className="selo-erro">{erros.aceite_lgpd}</small>}
        {msg && (
          <div className="selo-falha" role="alert">
            <p>{msg.texto}</p>
            {msg.existente && <Link className="selo-btn secundario" href="/selo/meu-numero">Recuperar meu passaporte</Link>}
          </div>
        )}
        <button type="submit" className="selo-btn" disabled={enviando}>{enviando ? 'Criando…' : 'Criar meu passaporte'}</button>
        <Link className="selo-text-link" href="/selo/meu-numero">Já tenho passaporte →</Link>
      </form>
    </section>
  );
}
