'use client';
import { useEffect, useRef, useState } from 'react';

// Secret is deliberately kept only in this component's memory until acknowledged.
export default function CodigoRecuperacao({ codigo, onContinuar, recuperado = false }) {
  const [mensagem, setMensagem] = useState('');
  const painel = useRef(null);
  useEffect(() => { painel.current?.focus(); painel.current?.scrollIntoView({ block: 'start' }); }, [codigo]);
  async function copiar() {
    try { await navigator.clipboard.writeText(codigo); setMensagem('Código copiado. Guarde em um lugar seguro.'); }
    catch { setMensagem('Não foi possível copiar. Use “Baixar código” ou anote.'); }
  }
  function baixar() {
    const arquivo = new Blob([`PISTA VIVA — CÓDIGO DE RECUPERAÇÃO\n\n${codigo}\n\nGuarde fora do celular e não compartilhe. Use para recuperar seu passaporte se esquecer a senha. Após usar, este código será substituído.\n`], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(arquivo);
    const a = document.createElement('a'); a.href = url; a.download = 'pistaviva-codigo-recuperacao.txt'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMensagem('Arquivo preparado. Confirme que foi salvo.');
  }
  return <section ref={painel} tabIndex={-1} className="selo-pilha acesso-codigo" aria-labelledby="acesso-codigo-titulo">
    <h2 id="acesso-codigo-titulo">{recuperado ? 'Senha trocada. Guarde o novo código.' : 'Seu cadastro está pronto. Guarde este código.'}</h2>
    <p>Ele recupera seu acesso se esquecer a senha. Aparece somente agora: baixe ou anote e guarde fora deste celular.</p>
    <code className="acesso-segredo" aria-label="Seu código de recuperação">{codigo}</code>
    <div className="acesso-botoes"><button className="selo-btn secundario" type="button" onClick={copiar}>Copiar código</button><button className="selo-btn secundario" type="button" onClick={baixar}>Baixar código</button></div>
    <p>Não compartilhe: quem tem este código e seus dados de cadastro pode trocar sua senha. Cada uso gera um novo código.</p>
    {mensagem && <p role="status">{mensagem}</p>}
    <button className="selo-btn" type="button" onClick={onContinuar}>{recuperado ? 'Guardei o novo código. Entrar' : 'Guardei o código. Abrir passaporte'}</button>
  </section>;
}
