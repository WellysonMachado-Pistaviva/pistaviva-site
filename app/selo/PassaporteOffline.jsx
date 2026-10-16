'use client';
import { useEffect, useState } from 'react';
import { readQueue, saveSnapshot } from '../../public/pwa/store.mjs';
import { esquecerPerfil, lerPerfil, salvarPerfil } from './perfilLocal';

export default function PassaporteOffline({ pessoa, carimbos }) {
  const [saved, setSaved] = useState(null);
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        if (lerPerfil()?.codigo !== pessoa.codigo) salvarPerfil(pessoa);
        saveSnapshot(localStorage, pessoa, carimbos);
        setSaved(true);
      } catch { setSaved(false); }
    }, 0);
    return () => clearTimeout(timer);
  }, [pessoa, carimbos]);

  // Celular emprestado ou compartilhado: a pessoa tira o passaporte daqui.
  function esquecer() {
    let pendentes = 0;
    try { pendentes = readQueue(localStorage, pessoa.codigo).length; } catch { /* storage bloqueado */ }
    const aviso = pendentes ? ` ${pendentes === 1 ? '1 passagem guardada ainda não enviada será apagada.' : `${pendentes} passagens guardadas ainda não enviadas serão apagadas.`}` : '';
    if (!window.confirm(`Tirar este passaporte deste celular? O passaporte continua salvo no site; guarde seu link pessoal antes de sair. Se perder o link, será preciso confirmar sua identidade com a equipe.${aviso}`)) return;
    if (esquecerPerfil()) window.location.assign('/selo/passaporte');
  }

  return <p className="selo-dica">{saved === null ? 'Preparando resumo para este celular. ' : saved ? 'Resumo da coleção salvo neste celular. ' : 'Não foi possível salvar o resumo neste celular. '}
    <a href="/pwa/offline.html">Abrir modo estrada →</a>{' · '}
    <button type="button" className="selo-link" onClick={esquecer} disabled={saved === null}>Esquecer este celular</button>
  </p>;
}
