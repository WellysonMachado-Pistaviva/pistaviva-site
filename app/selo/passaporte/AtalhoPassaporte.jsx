'use client';
import { useSyncExternalStore } from 'react';
import Link from 'next/link';
import { lerPerfil } from '../perfilLocal';

const semAssinar = () => () => {};

// Botões da abertura: quem já tem passaporte neste celular vai direto ao seu;
// quem não tem, cria. Lido só no navegador (o perfil fica no aparelho).
export default function AtalhoPassaporte() {
  const noNavegador = useSyncExternalStore(semAssinar, () => true, () => false);
  const perfil = noNavegador ? lerPerfil() : null;
  if (perfil?.codigo) {
    return (
      <div className="ph-acoes">
        <Link className="pu-atalho" href={`/selo/m/${perfil.codigo}`}>
          <span><small>Passaporte nº {perfil.numero != null ? String(perfil.numero).padStart(4, '0') : '—'}</small><strong>Abrir meu passaporte</strong>Carimbos, estações, progresso e benefícios.</span>
          <span aria-hidden="true">→</span>
        </Link>
        <a className="study-button" href="#meu-passaporte">Carimbar uma cidade agora</a>
      </div>
    );
  }
  return (
    <div className="ph-acoes">
      <a className="study-button" href="#meu-passaporte">Criar meu passaporte · grátis</a>
      <Link className="study-button study-button-outline" href="/selo/mapa">Ver o mapa de carimbos</Link>
      <Link className="selo-text-link" href="/selo/meu-numero">Já tenho passaporte →</Link>
    </div>
  );
}
