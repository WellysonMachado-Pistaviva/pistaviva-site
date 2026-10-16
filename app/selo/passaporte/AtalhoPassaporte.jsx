'use client';
import Link from 'next/link';
import usePerfilLocal from '../usePerfilLocal';

// Botões da abertura: quem já tem passaporte neste celular vai direto ao seu;
// quem não tem, cria. Lido só no navegador (o perfil fica no aparelho).
export default function AtalhoPassaporte() {
  const perfil = usePerfilLocal();
  if (perfil?.codigo) {
    return (
      <div className="ph-acoes">
        <Link className="pu-atalho" href={`/selo/m/${perfil.codigo}`}>
          <span><small>Passaporte nº {perfil.numero != null ? String(perfil.numero).padStart(4, '0') : '—'}</small><strong>Abrir meu passaporte</strong>Carimbos, estações, progresso e benefícios.</span>
          <span aria-hidden="true">→</span>
        </Link>
        <Link className="study-button" href={`/selo/m/${perfil.codigo}#carimbar`}>Carimbar uma cidade agora</Link>
        <Link className="selo-text-link" href="/selo/passaporte/modelo#amostra-passaporte">Ver amostra preenchida →</Link>
      </div>
    );
  }
  return (
    <div className="ph-acoes">
      <a className="study-button" href="#criar-passaporte">Criar meu passaporte grátis</a>
      <a className="study-button study-button-outline" href="#amostra-passaporte">Ver passaporte preenchido</a>
      <Link className="selo-text-link" href="/selo/meu-numero">Já tenho passaporte →</Link>
    </div>
  );
}
