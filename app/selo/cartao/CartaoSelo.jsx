'use client';
import { useState } from 'react';
import Link from 'next/link';
import { MapPin, Plus } from 'lucide-react';
import ModalCarimbar from './ModalCarimbar';
import '../selo.css';
import './cartao.css';

// Card padrão de selo (catálogo, mapa e listas): arte em destaque, nome,
// etiquetas e o "+" para carimbar. Sem cidade de check-in (estação, município
// fora da Rota) o card não tem "+".
export default function CartaoSelo({ href, arte, nome, etiquetas = [], cidade = null, contador = null, apagado = false }) {
  const [aberto, setAberto] = useState(false);
  return (
    <div className="cartao-selo" data-apagado={apagado || undefined}>
      <Link href={href} className="cartao-selo-link">
        <span className="cartao-selo-arte">
          <img src={arte} alt="" width={192} height={192} loading="lazy" />
          {contador > 0 && <span className="cartao-selo-contador" title={`${contador} carimbos`}><MapPin size={12} aria-hidden="true" />{contador}</span>}
        </span>
        <strong>{nome}</strong>
        {etiquetas.length > 0 && <span className="cartao-selo-etiquetas">{etiquetas.map((e) => <small key={e.texto} data-tom={e.tom}>{e.texto}</small>)}</span>}
      </Link>
      {cidade && (
        <button type="button" className="cartao-selo-mais" onClick={() => setAberto(true)} aria-label={`Carimbar ${nome} no passaporte`} title="Carimbar no passaporte">
          <Plus size={20} aria-hidden="true" />
        </button>
      )}
      {aberto && <ModalCarimbar cidade={cidade} onFechar={() => setAberto(false)} />}
    </div>
  );
}
