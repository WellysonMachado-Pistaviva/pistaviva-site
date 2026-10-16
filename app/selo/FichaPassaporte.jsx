'use client';
import { useEffect, useRef, useState } from 'react';
import { gerarFichaPassaporte } from './passaporte/artePassaporte';
import { carregarIdentidade } from './passaporte/recursosPassaporte';

export default function FichaPassaporte({ pessoa, privado, codigo, demonstracao }) {
  const canvas = useRef(null);
  const [pronta, setPronta] = useState(false);
  useEffect(() => {
    let ativo = true;
    carregarIdentidade({ pessoa, privado, codigo, demonstracao }).then(gerarFichaPassaporte).then((ficha) => {
      if (!ativo) return;
      canvas.current.getContext('2d').drawImage(ficha, 0, 0);
      setPronta(true);
    }).catch(() => { /* A ficha em HTML mantém identificação legível. */ });
    return () => { ativo = false; };
  }, [pessoa, privado, codigo, demonstracao]);
  return <div className="pu-ficha" data-pronta={pronta}>
    <div className="pu-ficha-base" aria-hidden="true"><img src="/selo/passaporte/identidade-feed.webp" alt="" width={1080} height={1350} /><span className="pu-ficha-nome">{pessoa.nome}</span><span className="pu-ficha-origem">{[pessoa.cidade, pessoa.uf].filter(Boolean).join('/')}</span></div>
    <canvas ref={canvas} width={1080} height={690} role="img" aria-label={`Identificação do passaporte: ${pessoa.nome}${pessoa.cidade ? `, ${pessoa.cidade}/${pessoa.uf}` : ''}, com a coruja oficial do motociclista.`} />
  </div>;
}
