'use client';
import { useEffect, useRef, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { lerPerfil } from '../perfilLocal';
import { autorFoto } from '../../lib/selo/mapaCidades.mjs';
import CarimboCidade from '../CarimboCidade';

const semAssinar = () => () => {};

// Modal do "+" do card: mostra o selo escolhido e faz o check-in pelo GPS.
// Não dá para carimbar do sofá: o servidor confere se a pessoa está na cidade.
export default function ModalCarimbar({ cidade, onFechar }) {
  const dialogo = useRef(null);
  const noNavegador = useSyncExternalStore(semAssinar, () => true, () => false);
  const perfil = noNavegador ? lerPerfil() : null;

  useEffect(() => {
    const d = dialogo.current;
    if (d && !d.open) d.showModal();
    const fechar = () => onFechar();
    d?.addEventListener('close', fechar);
    return () => d?.removeEventListener('close', fechar);
  }, [onFechar]);

  return (
    <dialog ref={dialogo} className="modal-carimbar" aria-labelledby="modal-carimbar-titulo" onClick={(e) => { if (e.target === dialogo.current) dialogo.current.close(); }}>
      <div className="modal-carimbar-caixa">
        <div className="modal-carimbar-topo">
          <div>
            <span className="selo-legenda" id="modal-carimbar-titulo">Carimbar no passaporte</span>
            <p>Esteja na cidade e confirme pelo GPS. O carimbo entra com data e número de série.</p>
          </div>
          <button type="button" className="modal-carimbar-fechar" onClick={() => dialogo.current?.close()} aria-label="Fechar"><X size={20} aria-hidden="true" /></button>
        </div>
        <div className="modal-carimbar-escolhido">
          {cidade.mini ? <img src={cidade.mini} alt="" width={64} height={64} /> : <span aria-hidden="true" />}
          <div><small>Selecionado</small><strong>{cidade.nome}/{cidade.uf}</strong></div>
          {cidade.carimbos != null && <span>{cidade.carimbos === 1 ? '1 carimbo' : `${cidade.carimbos} carimbos`}</span>}
        </div>
        {!noNavegador ? null : perfil?.codigo ? (
          <CarimboCidade compacto codigo={perfil.codigo} esperado={cidade} autor={perfil.nome && perfil.numero != null ? autorFoto(perfil.nome, perfil.numero) : null} />
        ) : (
          <div className="modal-carimbar-sem">
            <p>Para carimbar, você precisa do passaporte. É grátis e leva um minuto.</p>
            <Link className="selo-btn" href="/selo/passaporte">Criar meu passaporte</Link>
            <Link className="selo-text-link" href="/selo/meu-numero">Já tenho passaporte →</Link>
          </div>
        )}
      </div>
    </dialog>
  );
}
