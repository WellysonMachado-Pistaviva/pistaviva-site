'use client';
import { useEffect, useState } from 'react';
import { formatarNumero } from '../lib/selo/constantes.mjs';
import { salvarPerfil } from './perfilLocal';

// Guarda o link no celular e oferece mandar para si mesmo (WhatsApp, notas…).
// Quem envia é a própria pessoa: o sistema não dispara mensagem nenhuma.
export default function SalvarNumero({ codigo, numero }) {
  const [msg, setMsg] = useState('');
  // Não grava o nome aqui: o formulário guarda o nome completo para a próxima visita.
  useEffect(() => { salvarPerfil({ codigo, numero }); }, [codigo, numero]);

  async function salvar() {
    const url = `${window.location.origin}/selo/m/${codigo}`;
    const text = `Sou o colecionador nº ${formatarNumero(numero)} do Selo da Estação — Parque da Cidade de Itajubá.`;
    try {
      if (navigator.share) { await navigator.share({ title: 'Meu Selo da Estação', text, url }); return; }
      await navigator.clipboard.writeText(`${text} ${url}`);
      setMsg('Link copiado. Cole no seu WhatsApp ou nas notas.');
    } catch (e) {
      if (e?.name !== 'AbortError') setMsg(`Anote seu link: ${url}`);
    }
  }

  return (
    <div className="selo-acoes">
      <button type="button" className="selo-btn claro" onClick={salvar}>Salvar minha coleção</button>
      {msg && <p className="selo-dica selo-quebra" role="status">{msg}</p>}
    </div>
  );
}
