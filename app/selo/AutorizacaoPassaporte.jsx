'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { autorizarMeuPassaporte } from './actions';

export default function AutorizacaoPassaporte({ codigo, numero, publico }) {
  const router = useRouter();
  const [aceite, setAceite] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  async function salvar(valor) {
    setEnviando(true); setErro('');
    try {
      const r = await autorizarMeuPassaporte({ codigo, publico: valor });
      if (!r.ok) setErro(r.erro);
      else { setAceite(false); router.refresh(); }
    } catch { setErro('Não salvou. Tente novamente.'); }
    finally { setEnviando(false); }
  }
  return <section className="selo-cartao selo-pilha" aria-labelledby="selo-pp-titulo">
    <span className="selo-kicker">Passaporte público</span>
    <h2 id="selo-pp-titulo">Mostre por onde você passou</h2>
    {publico ? <>
      <p>Seu passaporte está aberto em <a href={`/selo/passaporte/${numero}`}>/selo/passaporte/{numero}</a>. Mande o link para os amigos da estrada.</p>
      <button className="selo-btn secundario" disabled={enviando} onClick={() => salvar(false)}>Fechar meu passaporte</button>
    </> : <>
      <label className="selo-check simples"><input type="checkbox" checked={aceite} onChange={(e) => setAceite(e.target.checked)} /><span>Autorizo mostrar meu primeiro nome com a inicial do sobrenome, cidade/UF, número de colecionador, cidades carimbadas com as datas e estações confirmadas numa página pública. Fotos, WhatsApp e endereço nunca aparecem.</span></label>
      <button className="selo-btn secundario" disabled={!aceite || enviando} onClick={() => salvar(true)}>{enviando ? 'Salvando…' : 'Abrir meu passaporte'}</button>
    </>}
    <small>Opcional. Você pode fechar quando quiser.</small>
    {erro && <p role="alert" className="selo-erro">{erro}</p>}
  </section>;
}
