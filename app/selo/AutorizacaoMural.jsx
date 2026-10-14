'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { autorizarMeuMural } from './actions';

export default function AutorizacaoMural({ codigo, ano, autorizado, publicado }) {
  const router = useRouter();
  const [aceite, setAceite] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  async function salvar(autorizar) {
    setEnviando(true); setErro('');
    try {
      const r = await autorizarMeuMural({ codigo, ano, autorizar });
      if (!r.ok) setErro(r.erro);
      else { setAceite(false); router.refresh(); }
    } catch { setErro('Não salvou. Tente novamente.'); }
    finally { setEnviando(false); }
  }
  return <div className="selo-pilha">
    {autorizado ? <>
      <p>{publicado ? 'Seu passaporte está no ranking, no perfil público e no feed do site.' : 'Você autorizou a publicação. Seu passaporte aguarda aprovação da equipe.'}</p>
      <button className="selo-btn secundario" disabled={enviando} onClick={() => salvar(false)}>Retirar autorização de publicação</button>
    </> : <>
      <label className="selo-check simples"><input type="checkbox" checked={aceite} onChange={(e) => setAceite(e.target.checked)} /><span>Autorizo publicar meu nome, cidade/UF, número de colecionador e estações confirmadas de {ano}, com datas e progresso, no perfil público, ranking dos Conquistadores e feed do site.</span></label>
      <button className="selo-btn secundario" disabled={!aceite || enviando} onClick={() => salvar(true)}>{enviando ? 'Salvando…' : 'Quero participar do ranking'}</button>
    </>}
    <small>Opcional. Seu certificado independe da publicação. Você pode retirar a autorização aqui.</small>
    {erro && <p role="alert" className="selo-erro">{erro}</p>}
  </div>;
}
