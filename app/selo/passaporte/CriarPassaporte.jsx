'use client';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { UFS } from '../../lib/ufs.mjs';
import { criarMeuPassaporte } from '../actions';
import { mascararWhatsapp, normalizarWhatsapp } from '../../lib/selo/whatsapp.mjs';
import CodigoRecuperacao from '../CodigoRecuperacao';
import '../meu-numero/acesso.css';

const UFS_ORDEM = ['MG', 'SP', 'RJ', ...UFS.filter((u) => !['MG', 'SP', 'RJ'].includes(u)).sort()];
const semAssinar = () => () => {};
const noCliente = () => true;
const noServidor = () => false;

// Passaporte criado de qualquer lugar: sem isso, quem está longe do Parque
// não teria como carimbar a primeira cidade.
export default function CriarPassaporte({ onCriado, nomeSugerido = '' }) {
  const form = useRef(null);
  const pronto = useSyncExternalStore(semAssinar, noCliente, noServidor);
  const [f, setF] = useState({ nome: null, whatsapp: '', cidade: '', uf: '', senha: '', confirmacao: '', aceite_lgpd: false, site: '' });
  const [criado, setCriado] = useState(null);
  const [erros, setErros] = useState({});
  const [msg, setMsg] = useState(null);   // { texto, existente }
  const [enviando, setEnviando] = useState(false);
  const campo = (k) => ({ name: k, disabled: !pronto || enviando, value: k === 'nome' ? f.nome ?? nomeSugerido : f[k], onChange: (e) => setF((v) => ({ ...v, [k]: k === 'whatsapp' ? mascararWhatsapp(normalizarWhatsapp(e.target.value) || e.target.value) : e.target.value })), 'aria-invalid': Boolean(erros[k]), 'aria-describedby': [k === 'whatsapp' && 'pc-whatsapp-ajuda', erros[k] && `pc-${k}-erro`].filter(Boolean).join(' ') || undefined });
  useEffect(() => { if (Object.keys(erros).length) form.current?.querySelector('[aria-invalid="true"]')?.focus(); }, [erros]);

  async function enviar(e) {
    e.preventDefault();
    if (enviando) return;
    setEnviando(true);
    setErros({});
    setMsg(null);
    try {
      const r = await criarMeuPassaporte({ ...f, nome: f.nome ?? nomeSugerido });
      if (r?.ok) {
        setCriado({ ...r, whatsapp: f.whatsapp });
        setF((atual) => ({ ...atual, senha: '', confirmacao: '' }));
        return;
      }
      if (r?.erros) setErros(r.erros);
      else setMsg({ texto: r?.erro || 'Não criou. Tente de novo.', existente: r?.existente });
    } catch {
      setMsg({ texto: 'Sem conexão. Tente de novo quando tiver sinal.' });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section id="criar-passaporte" className="selo-cartao passaporte-criar" aria-labelledby="pp-criar-titulo">
      {criado ? <><h2 id="pp-criar-titulo" className="sr-only">Cadastro criado</h2><CodigoRecuperacao codigo={criado.codigoRecuperacao} onContinuar={() => {
        const { codigoRecuperacao: _descartado, ok: _ok, ...perfil } = criado;
        onCriado(perfil);
      }} /></> : <>
      <span className="selo-kicker">Passaporte do motociclista · grátis</span>
      <h2 id="pp-criar-titulo">Crie seu passaporte</h2>
      <p>Leva um minuto. Depois é só tocar em carimbar quando chegar numa cidade do Brasil.</p>
      <form ref={form} className="selo-form" onSubmit={enviar} noValidate aria-busy={!pronto || enviando}>
        {/* Honeypot: invisível para gente, irresistível para robô. */}
        <div className="selo-hp" aria-hidden="true">
          <label htmlFor="pc-site">Site</label>
          <input id="pc-site" tabIndex={-1} autoComplete="off" {...campo('site')} />
        </div>
        <div className="selo-campo">
          <label htmlFor="pc-nome">Seu nome</label>
          <input id="pc-nome" className="selo-input" autoComplete="name" maxLength={80} {...campo('nome')} />
          {erros.nome && <small id="pc-nome-erro" className="selo-erro">{erros.nome}</small>}
        </div>
        <div className="selo-campo">
          <label htmlFor="pc-wa">WhatsApp com DDD</label>
          <input id="pc-wa" className="selo-input" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="(35) 99999-9999" {...campo('whatsapp')} />
          <small id="pc-whatsapp-ajuda">Use seu número pessoal para identificar o passaporte. Ele não aparece no perfil público.</small>
          {erros.whatsapp && <small id="pc-whatsapp-erro" className="selo-erro">{erros.whatsapp}</small>}
        </div>
        <div className="passaporte-criar-local">
          <div className="selo-campo">
            <label htmlFor="pc-cidade">Sua cidade</label>
            <input id="pc-cidade" className="selo-input" autoComplete="address-level2" maxLength={80} {...campo('cidade')} />
            {erros.cidade && <small id="pc-cidade-erro" className="selo-erro">{erros.cidade}</small>}
          </div>
          <div className="selo-campo">
            <label htmlFor="pc-uf">UF</label>
            <select id="pc-uf" className="selo-select" {...campo('uf')}>
              <option value="">—</option>
              {UFS_ORDEM.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
            {erros.uf && <small id="pc-uf-erro" className="selo-erro">{erros.uf}</small>}
          </div>
        </div>
        <div className="selo-campo">
          <label htmlFor="pc-senha">Crie sua senha</label>
          <input id="pc-senha" className="selo-input" type="password" autoComplete="new-password" maxLength={72} {...campo('senha')} />
          <small>Use pelo menos 12 caracteres. Pode ser uma frase fácil de lembrar.</small>
          {erros.senha && <small id="pc-senha-erro" className="selo-erro">{erros.senha}</small>}
        </div>
        <div className="selo-campo">
          <label htmlFor="pc-confirmacao">Repita sua senha</label>
          <input id="pc-confirmacao" className="selo-input" type="password" autoComplete="new-password" maxLength={72} {...campo('confirmacao')} />
          {erros.confirmacao && <small id="pc-confirmacao-erro" className="selo-erro">{erros.confirmacao}</small>}
        </div>
        <label className="selo-check">
          <input type="checkbox" disabled={!pronto || enviando} aria-invalid={Boolean(erros.aceite_lgpd)} aria-describedby={erros.aceite_lgpd ? 'pc-aceite-erro' : undefined} checked={f.aceite_lgpd} onChange={(e) => setF((v) => ({ ...v, aceite_lgpd: e.target.checked }))} />
          <span>Aceito o uso dos meus dados para o passaporte, como explica a <Link href="/selo/privacidade">privacidade</Link>.</span>
        </label>
        {erros.aceite_lgpd && <small id="pc-aceite-erro" className="selo-erro">{erros.aceite_lgpd}</small>}
        {msg && (
          <div className="selo-falha" role="alert">
            <p>{msg.texto}</p>
            <Link className="selo-btn secundario" href="/selo/meu-numero">Já tem cadastro? Entrar ou recuperar</Link>
          </div>
        )}
        <button type="submit" className="selo-btn" disabled={!pronto || enviando}>{!pronto ? 'Preparando formulário…' : enviando ? 'Criando…' : 'Criar meu passaporte'}</button>
        <Link className="selo-text-link" href="/selo/meu-numero">Já tenho passaporte →</Link>
      </form>
      </>}
    </section>
  );
}
