'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { mascararWhatsapp } from '../../lib/selo/whatsapp.mjs';
import { recuperarNumero } from '../actions';

export default function RecuperarForm() {
  const router = useRouter();
  const [whatsapp, setWhatsapp] = useState('');
  const [nome, setNome] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setEnviando(true);
    setErro('');
    try {
      const r = await recuperarNumero({ whatsapp, nome });
      if (r.ok) return router.push(`/selo/m/${r.codigo}`);
      setErro(r.erro);
    } catch {
      setErro('Não consultou. Tente de novo ou peça no balcão.');
    }
    setEnviando(false);
  }

  return (
    <form className="selo-form" onSubmit={enviar}>
      <div className="selo-campo">
        <label htmlFor="rec-wa">WhatsApp que você usou</label>
        <input id="rec-wa" className="selo-input" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="(35) 99999-9999"
          value={whatsapp} onChange={(e) => setWhatsapp(mascararWhatsapp(e.target.value))} required />
      </div>
      <div className="selo-campo">
        <label htmlFor="rec-nome">3 primeiras letras do seu nome</label>
        <input id="rec-nome" className="selo-input" autoComplete="off" autoCapitalize="characters" maxLength={3}
          value={nome} onChange={(e) => setNome(e.target.value)} required />
      </div>
      {erro && <div className="selo-falha" role="alert"><p>{erro}</p></div>}
      <button type="submit" className="selo-btn" disabled={enviando}>{enviando ? 'Procurando…' : 'Ver meu número'}</button>
    </form>
  );
}
