'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { validarEndereco } from '../lib/selo/beneficio.mjs';
import { salvarMeuEndereco } from './actions';
import { comTempo } from './fotoCliente';
import Vantagens from './Vantagens';

const mascararCep = (v) => v.replace(/\D/g, '').slice(0, 8).replace(/^(\d{5})(\d)/, '$1-$2');

// Código de benefício do colecionador: aparece só com endereço completo + check-in.
export default function Beneficio({ codigo, endereco, beneficio }) {
  const [editando, setEditando] = useState(!beneficio.endereco);
  if (beneficio.codigo && !editando) {
    return (
      <section className="selo-cartao selo-beneficio" aria-labelledby="selo-beneficio-titulo">
        <span className="selo-kicker">Benefício de colecionador</span>
        <h2 id="selo-beneficio-titulo">Seu código exclusivo</h2>
        <p className="selo-cupom" aria-label={`Código ${beneficio.codigo.split('').join(' ')}`}>{beneficio.codigo}</p>
        <Vantagens almoco={beneficio.almoco} comCodigo />
        <p>O parceiro confere o código no sistema na hora.</p>
        <small className="selo-dica">Pessoal e intransferível. Não compartilhe em redes sociais.</small>
        <button type="button" className="selo-btn secundario" onClick={() => setEditando(true)}>Editar endereço</button>
      </section>
    );
  }
  if (beneficio.endereco && !editando) {
    return (
      <section className="selo-cartao selo-beneficio">
        <span className="selo-kicker">Benefício de colecionador</span>
        <h2>Falta o check-in</h2>
        <p>Endereço salvo. Faça o check-in desta estação para liberar seu código exclusivo.</p>
        <Vantagens almoco={beneficio.almoco} />
        <button type="button" className="selo-btn secundario" onClick={() => setEditando(true)}>Editar endereço</button>
      </section>
    );
  }
  return <FormEndereco codigo={codigo} inicial={endereco} almoco={beneficio.almoco} aoSalvar={() => setEditando(false)} />;
}

function FormEndereco({ codigo, inicial, almoco, aoSalvar }) {
  const router = useRouter();
  const [f, setF] = useState({ ...inicial, cep: mascararCep(inicial.cep || '') });
  const [erros, setErros] = useState({});
  const [enviando, setEnviando] = useState(false);
  const mudar = (campo, valor) => setF((x) => ({ ...x, [campo]: valor }));

  // ViaCEP preenche rua e bairro. Fora do ar: a pessoa digita.
  async function buscarCep(valor) {
    const cep = valor.replace(/\D/g, '');
    if (cep.length !== 8) return;
    try {
      const r = await comTempo(fetch(`https://viacep.com.br/ws/${cep}/json/`), 6000);
      const d = r.ok ? await r.json() : null;
      if (!d || d.erro) return setErros((e) => ({ ...e, cep: 'CEP não encontrado. Confira ou preencha o endereço.' }));
      setErros((e) => ({ ...e, cep: undefined }));
      setF((x) => ({ ...x, logradouro: x.logradouro || d.logradouro || '', bairro: x.bairro || d.bairro || '' }));
    } catch { /* sem autocompletar */ }
  }

  async function salvar(e) {
    e.preventDefault();
    const v = validarEndereco(f);
    if (!v.ok) { setErros(v.erros); return; }
    setEnviando(true);
    try {
      const r = await comTempo(salvarMeuEndereco({ codigo, ...v.dados }), 15_000);
      if (!r?.ok) { setErros(r?.erros || { form: r?.erro || 'Não salvou. Tente de novo.' }); return; }
      setErros({});
      aoSalvar();
      router.refresh();
    } catch {
      setErros({ form: 'Não salvou. Tente de novo.' });
    } finally {
      setEnviando(false);
    }
  }

  const campo = (id, rotulo, props = {}) => (
    <div className="selo-campo">
      <label htmlFor={`selo-end-${id}`}>{rotulo}</label>
      <input className="selo-input" id={`selo-end-${id}`} value={f[id] || ''} aria-invalid={Boolean(erros[id])}
        aria-describedby={erros[id] ? `erro-end-${id}` : undefined} onChange={(e) => mudar(id, e.target.value)} {...props} />
      {erros[id] && <p className="selo-erro" id={`erro-end-${id}`}>{erros[id]}</p>}
    </div>
  );

  return (
    <form className="selo-cartao selo-beneficio selo-form" onSubmit={salvar} noValidate aria-busy={enviando}>
      <div>
        <span className="selo-kicker">Benefício de colecionador</span>
        <h2>Complete seu cadastro</h2>
        <p>Com endereço completo e check-in, você recebe um código exclusivo de colecionador.</p>
        <Vantagens almoco={almoco} />
      </div>
      {campo('cep', 'CEP', {
        inputMode: 'numeric', autoComplete: 'postal-code', placeholder: '37500-000',
        onChange: (e) => { const v = mascararCep(e.target.value); mudar('cep', v); buscarCep(v); },
      })}
      {campo('logradouro', 'Rua', { autoComplete: 'address-line1', maxLength: 120 })}
      <div className="selo-linha">
        {campo('numero', 'Número', { inputMode: 'text', maxLength: 12 })}
        {campo('complemento', 'Complemento', { autoComplete: 'address-line2', maxLength: 60, placeholder: 'opcional' })}
      </div>
      {campo('bairro', 'Bairro', { maxLength: 80 })}
      {erros.form && <p className="selo-erro" role="alert">{erros.form}</p>}
      <button type="submit" className="selo-btn" disabled={enviando}>{enviando ? 'Salvando…' : 'Salvar endereço'}</button>
      <small className="selo-dica">Usado só para validar benefícios do Selo. Veja a <a href="/selo/privacidade">privacidade</a>.</small>
    </form>
  );
}
