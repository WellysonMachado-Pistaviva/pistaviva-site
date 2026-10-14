'use client';
import { useRef, useState } from 'react';
import { formatarNumero } from '../../../lib/selo/constantes.mjs';
import { conferirCodigo, registrarAlmoco, registrarDesconto } from '../actions';

const data = (v) => new Date(v).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
const dataHora = (v) => new Date(v).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
const mascarar = (v) => v.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8).replace(/^(.{4})(.)/, '$1-$2');

const ETAPAS = [
  ['dados', 'Cadastro completo', 'Nome, WhatsApp e endereço preenchidos'],
  ['carimbo', 'Carimbo no Parque', 'Check-in por GPS, foto do passaporte ou balcão'],
  ['beneficio', 'Benefício válido', 'Pode aplicar o desconto'],
];

export default function PainelParceiro({ token }) {
  const [codigo, setCodigo] = useState('');
  const [r, setR] = useState(null);
  const [erro, setErro] = useState('');
  const [nota, setNota] = useState('');
  const [estado, setEstado] = useState('pronto');   // pronto | conferindo | registrando | registrado
  const [almocoFeito, setAlmocoFeito] = useState(false);
  const campo = useRef(null);
  const ocupado = estado === 'conferindo' || estado === 'registrando';

  async function conferir(e) {
    e.preventDefault();
    setErro(''); setR(null); setEstado('conferindo');
    try {
      const resp = await conferirCodigo({ token, codigo });
      if (!resp?.ok) setErro(resp?.erro || 'Não consultou. Tente de novo.');
      else setR(resp.resultado);
    } catch { setErro('Sem conexão. Tente de novo.'); }
    setEstado('pronto');
  }

  async function registrar() {
    setErro(''); setEstado('registrando');
    try {
      const resp = await registrarDesconto({ token, codigo, nota });
      if (!resp?.ok) { setErro(resp?.erro || 'Não registrou.'); setEstado('pronto'); return; }
      setR(resp.resultado); setNota(''); setEstado('registrado');
    } catch { setErro('Sem conexão. Tente de novo.'); setEstado('pronto'); }
  }

  async function concederAlmoco() {
    setErro(''); setEstado('registrando');
    try {
      const resp = await registrarAlmoco({ token, codigo });
      if (!resp?.ok) setErro(resp?.erro || 'Não registrou.');
      else { setR(resp.resultado); setAlmocoFeito(true); }
    } catch { setErro('Sem conexão. Tente de novo.'); }
    setEstado((e) => (e === 'registrando' ? 'pronto' : e));
  }

  function outro() {
    setCodigo(''); setR(null); setErro(''); setNota(''); setEstado('pronto'); setAlmocoFeito(false);
    campo.current?.focus();
  }

  return (
    <div className="selo-pilha">
      <form className="selo-form selo-parceiro-busca" onSubmit={conferir} aria-busy={ocupado}>
        <div className="selo-campo">
          <label htmlFor="parceiro-codigo">Código do colecionador</label>
          <input ref={campo} id="parceiro-codigo" className="selo-input selo-cupom-input" value={codigo} placeholder="K7QM-3XPA"
            onChange={(e) => { setCodigo(mascarar(e.target.value)); setR(null); setEstado('pronto'); setAlmocoFeito(false); }}
            autoComplete="off" autoCapitalize="characters" autoCorrect="off" spellCheck={false} inputMode="text" maxLength={9} enterKeyHint="search" />
        </div>
        <button type="submit" className="selo-btn" disabled={ocupado || codigo.length < 9}>{estado === 'conferindo' ? 'Conferindo…' : 'Conferir código'}</button>
      </form>

      {erro && <p className="selo-erro" role="alert">{erro}</p>}

      {r && (
        <section className={`selo-veredito ${r.valido ? 'ok' : 'nao'}`} aria-live="polite">
          <p className="selo-veredito-titulo">{r.valido ? 'Benefício válido' : 'Não válido'}</p>
          {!r.valido && r.motivo && <p>{r.motivo}</p>}
          {r.pessoa && <>
            <p className="selo-veredito-pessoa"><b>{r.pessoa.nome}</b> · Colecionador nº {formatarNumero(r.pessoa.numero)}</p>
            <ul className="selo-etapas-parceiro">
              {ETAPAS.map(([id, titulo, dica]) => (
                <li key={id} data-ok={r.etapas[id]}>
                  <span aria-hidden="true">{r.etapas[id] ? '✓' : '✕'}</span>
                  <span><strong>{titulo}</strong>{id === 'carimbo' && r.ultimoCarimbo ? `${r.ultimoCarimbo.estacao} ${r.ultimoCarimbo.ano} · ${r.ultimoCarimbo.metodo}` : id === 'beneficio' && !r.etapas.beneficio ? 'Não aplique o desconto' : dica}</span>
                  <span className="sr-only">{r.etapas[id] ? 'sim' : 'não'}</span>
                </li>
              ))}
            </ul>
            <p className="selo-dica">{r.usosAqui ? `Já usado aqui ${r.usosAqui}× · último em ${dataHora(r.ultimoUsoAqui)}` : 'Nenhum uso registrado aqui.'}</p>
            <p className="selo-dica">Confira o nome com a pessoa antes de aplicar.</p>
          </>}
          {r.valido && estado !== 'registrado' && (
            <div className="selo-acoes">
              <input className="selo-input" value={nota} onChange={(e) => setNota(e.target.value)} maxLength={120} placeholder="Nota (opcional): ex. 10% no almoço" aria-label="Nota do desconto" />
              <button type="button" className="selo-btn" onClick={registrar} disabled={ocupado}>{estado === 'registrando' ? 'Registrando…' : 'Registrar desconto aplicado'}</button>
            </div>
          )}
          {estado === 'registrado' && <p role="status"><b>Desconto registrado.</b></p>}
          {r.almoco && (
            <div className="selo-almoco" data-ok={r.almoco.disponivel}>
              <strong>Almoço grátis</strong>
              {almocoFeito ? <p role="status"><b>Almoço de {r.almoco.ano} registrado.</b></p>
                : r.almoco.disponivel ? <>
                  <p>Completou as 4 estações de {r.almoco.ano}. Tem direito a um almoço.</p>
                  <button type="button" className="selo-btn" onClick={concederAlmoco} disabled={ocupado}>Registrar almoço concedido</button>
                </>
                : r.almoco.usadoEm ? <p>Almoço de {r.almoco.ano} já concedido em {data(r.almoco.usadoEm)}.</p>
                : <p>Ainda não. Precisa das 4 estações do mesmo ano confirmadas no balcão.</p>}
            </div>
          )}
          <button type="button" className="selo-btn secundario" onClick={outro}>Conferir outro código</button>
        </section>
      )}
    </div>
  );
}
