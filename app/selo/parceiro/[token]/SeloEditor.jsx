'use client';
import { useEffect, useState } from 'react';
import { validarCor, validarLocal } from '../../../lib/selo/seloParceiro.mjs';
import { salvarSelo } from '../actions';

// Parceiro aprovado escolhe a cor de fundo e o nome do local. A prévia vem do
// servidor (com marca "PRÉVIA"); o selo oficial só existe depois de salvar.
export default function SeloEditor({ token, nome, inicial }) {
  const [cor, setCor] = useState(inicial.cor);
  const [local, setLocal] = useState(inicial.local);
  const [codigo, setCodigo] = useState(inicial.codigo);
  const [previa, setPrevia] = useState('');
  const [estado, setEstado] = useState('pronto');   // pronto | salvando | salvo
  const [erro, setErro] = useState('');
  const vCor = validarCor(cor);
  const vLocal = validarLocal(local);
  const problema = !vCor.ok ? vCor.erro : !vLocal.ok ? vLocal.erro : '';

  // Espera a pessoa parar de digitar antes de pedir outra prévia.
  useEffect(() => {
    if (problema) return undefined;
    const t = setTimeout(() => setPrevia(`/selo/parceiro/${token}/selo.svg?${new URLSearchParams({ cor, local })}`), 400);
    return () => clearTimeout(t);
  }, [token, cor, local, problema]);

  async function salvar(e) {
    e.preventDefault();
    if (problema) return setErro(problema);
    setErro(''); setEstado('salvando');
    try {
      const r = await salvarSelo({ token, cor, local });
      if (!r?.ok) { setErro(r?.erro || 'Não salvou.'); setEstado('pronto'); return; }
      setCodigo(r.codigo); setEstado('salvo');
    } catch { setErro('Sem conexão. Tente de novo.'); setEstado('pronto'); }
  }

  return (
    <section className="selo-cartao selo-selo-parceiro" aria-labelledby="selo-parceiro-titulo">
      <span className="selo-kicker">Parada oficial · {nome}</span>
      <h2 id="selo-parceiro-titulo">Seu selo</h2>
      <p>Escolha a cor de fundo e o nome do local. O selo leva um nº único e um QR que mostra para qualquer pessoa que ele é seu e está ativo.</p>
      <form className="selo-form" onSubmit={salvar} aria-busy={estado === 'salvando'}>
        <div className="selo-campo">
            <label htmlFor="selo-p-local">Nome do local</label>
            <input id="selo-p-local" className="selo-input" value={local} maxLength={32} placeholder="Garganta do Registro"
              onChange={(e) => { setLocal(e.target.value); setEstado('pronto'); }} />
          </div>
          <div className="selo-campo">
            <label htmlFor="selo-p-cor">Cor de fundo</label>
            <input id="selo-p-cor" type="color" className="selo-cor" value={cor}
              onChange={(e) => { setCor(e.target.value); setEstado('pronto'); }} />
          </div>
        {problema && <p className="selo-erro" role="alert">{problema}</p>}
        {previa && <img className="selo-previa" src={previa} alt={`Prévia do selo ${local}`} width={462} height={652} />}
        {erro && <p className="selo-erro" role="alert">{erro}</p>}
        <button type="submit" className="selo-btn" disabled={estado === 'salvando' || Boolean(problema)}>
          {estado === 'salvando' ? 'Salvando…' : codigo ? 'Salvar alterações' : 'Criar meu selo'}
        </button>
        {estado === 'salvo' && <p role="status"><b>Selo salvo.</b></p>}
      </form>
      {codigo && (
        <div className="selo-acoes">
          <a className="selo-btn secundario" href={`/selo/v/${codigo}/selo.svg?baixar`}>Baixar selo oficial</a>
          <a className="selo-text-link" href={`/selo/v/${codigo}`} target="_blank" rel="noreferrer">Ver página de verificação</a>
        </div>
      )}
      <small className="selo-dica">Uso exclusivo de {nome}. Se o parceiro for desativado, a verificação passa a mostrar “revogado”.</small>
    </section>
  );
}
