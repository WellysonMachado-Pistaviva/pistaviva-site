'use client';
import { useState } from 'react';

// Compartilha a IMAGEM (não só o link): no celular abre direto Instagram,
// WhatsApp etc. com o cartão anexado. Sem suporte, baixa o PNG.
export default function CompartilharCartao({ imagem, link, texto, rotulo = 'Compartilhar nos Stories' }) {
  const [estado, setEstado] = useState('pronto');   // pronto | gerando | erro
  const destino = () => new URL(link, window.location.origin).toString();

  async function compartilhar() {
    setEstado('gerando');
    try {
      const r = await fetch(imagem);
      if (!r.ok) throw new Error('cartão');
      const arquivo = new File([await r.blob()], 'passaporte-itajuba.png', { type: 'image/png' });
      const dados = { files: [arquivo], text: `${texto} ${destino()}` };
      if (navigator.canShare?.(dados)) await navigator.share(dados);
      else {
        const url = URL.createObjectURL(arquivo);
        baixar(url);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
      setEstado('pronto');
    } catch (e) {
      setEstado(e?.name === 'AbortError' ? 'pronto' : 'erro');
    }
  }

  function baixar(href) {
    const a = document.createElement('a');
    a.href = href; a.download = 'passaporte-itajuba.png';
    a.click();
  }

  return (
    <div className="selo-compartilhar">
      <img className="selo-compartilhar-previa" src={imagem} alt="Prévia do cartão desta coleção para compartilhar" width={270} height={480} loading="lazy" />
      <div className="selo-pilha">
        <button type="button" className="selo-btn" onClick={compartilhar} disabled={estado === 'gerando'}>{estado === 'gerando' ? 'Preparando…' : rotulo}</button>
        <a className="selo-text-link" href={`${imagem}${imagem.includes('?') ? '&' : '?'}baixar`} download>Baixar imagem</a>
        {estado === 'erro' && <p className="selo-erro" role="alert">Não deu para compartilhar. Baixe a imagem e poste manualmente.</p>}
      </div>
    </div>
  );
}
