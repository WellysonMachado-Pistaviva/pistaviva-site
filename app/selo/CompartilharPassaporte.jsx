'use client';
import { useState } from 'react';
import { Share2 } from 'lucide-react';

export default function CompartilharPassaporte({ numero, nome, compacto = false }) {
  const [mensagem, setMensagem] = useState('');
  async function compartilhar() {
    const url = `${window.location.origin}/selo/conquistadores/${numero}?utm_source=passaporte&utm_medium=compartilhamento&utm_campaign=conquistadores`;
    try {
      if (navigator.share) {
        await navigator.share({ title: nome ? `Passaporte de ${nome} · Itajubá` : 'Passaporte de Itajubá', text: 'Uma coleção de caminhos vividos. Conheça este passaporte e venha colecionar histórias em Itajubá.', url });
      } else {
        await navigator.clipboard.writeText(url);
        setMensagem('Link copiado. Pronto para compartilhar.');
      }
    } catch (e) {
      if (e.name !== 'AbortError') setMensagem(`Link público: ${url}`);
    }
  }
  return <div className={compacto ? 'conquista-share' : 'selo-pilha'}><button type="button" className={compacto ? 'conquista-share-btn' : 'selo-btn'} onClick={compartilhar} aria-label={nome ? `Compartilhar coleção de ${nome}` : 'Compartilhar passaporte'}><Share2 size={16} aria-hidden="true" /> {compacto ? 'Compartilhar' : 'Compartilhar passaporte'}</button>{mensagem && <p className="selo-dica selo-quebra" role="status">{mensagem}</p>}</div>;
}
