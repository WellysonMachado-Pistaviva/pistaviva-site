'use client';
import { useState } from 'react';
import { denunciarFotoCidade } from '../../actions';

// Denúncia anônima: 3 pessoas diferentes escondem a foto até a revisão.
export default function DenunciarFoto({ id }) {
  const [estado, setEstado] = useState('pronto');   // pronto | enviando | feito | erro
  async function denunciar() {
    if (!window.confirm('Denunciar esta foto como imprópria? Ela é revisada pela equipe.')) return;
    setEstado('enviando');
    try {
      const r = await denunciarFotoCidade({ id });
      setEstado(r?.ok ? 'feito' : 'erro');
    } catch {
      setEstado('erro');
    }
  }
  if (estado === 'feito') return <span className="cidade-denuncia" role="status">Denúncia recebida</span>;
  return (
    <button type="button" className="cidade-denuncia" onClick={denunciar} disabled={estado === 'enviando'}>
      {estado === 'erro' ? 'Não enviou. Tentar de novo' : 'Denunciar'}
    </button>
  );
}
