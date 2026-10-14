'use client';
import { useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UFS } from '../lib/ufs.mjs';
import { PASSOU_POR, formatarNumero } from '../lib/selo/constantes.mjs';
import { mascararWhatsapp } from '../lib/selo/whatsapp.mjs';
import { validarVisita } from '../lib/selo/schema.mjs';
import { confirmarFotoEnviada, enviarVisita, novaUrlFoto } from './actions';
import { lerPerfil, salvarPerfil } from './perfilLocal';
import { comTempo, comprimirFoto, subirFoto } from './fotoCliente';

const RASCUNHO = 'selo:rascunho';     // sessionStorage: sobrevive a recarregar, some ao fechar a aba
const FALHA = 'Não enviou. Tente de novo ou peça a folha no balcão.';
const UFS_ORDEM = ['MG', 'SP', 'RJ', ...UFS.filter((u) => !['MG', 'SP', 'RJ'].includes(u)).sort()];

const vazio = () => ({
  chave: crypto.randomUUID(), nome: '', whatsapp: '', uf: '', cidade: '', passou_por: [],
  foto_autorizada: false, aceite_lgpd: false,
});

function lerRascunho() {
  try {
    const r = JSON.parse(sessionStorage.getItem(RASCUNHO) || 'null');
    if (r?.chave) return r;
  } catch { /* storage bloqueado: segue sem rascunho */ }
  const p = lerPerfil();   // quem já veio: nome, WhatsApp e cidade preenchidos
  return { ...vazio(), ...(p ? { nome: p.nome || '', whatsapp: p.whatsapp || '', uf: p.uf || '', cidade: p.cidade || '' } : {}) };
}

function gravarRascunho(f) {
  try { sessionStorage.setItem(RASCUNHO, JSON.stringify(f)); } catch { /* ignora */ }
}

const semAssinar = () => () => {};

export default function SeloForm({ local }) {
  // false no HTML do servidor e na hidratação; true logo depois → remonta com rascunho/perfil.
  const noNavegador = useSyncExternalStore(semAssinar, () => true, () => false);
  return <Formulario key={noNavegador ? 'nav' : 'srv'} local={local} inicial={noNavegador ? lerRascunho() : null} perfil={noNavegador ? lerPerfil() : null} />;
}

function Formulario({ local, inicial, perfil }) {
  const router = useRouter();
  const [f, setF] = useState(() => inicial || { ...vazio(), chave: '' });
  const [erros, setErros] = useState({});
  const [estado, setEstado] = useState('editando');   // editando | enviando | falhou | foto-falhou
  const [foto, setFoto] = useState(null);              // { blob, preview } já comprimida
  const [fotoMsg, setFotoMsg] = useState('');
  const [cidades, setCidades] = useState([]);
  const pendente = useRef(null);                       // { codigo, upload } quando só falta a foto
  const hp = useRef(null);

  const mudar = (campo, valor) => setF((atual) => {
    const novo = { ...atual, [campo]: valor };
    gravarRascunho(novo);
    return novo;
  });

  async function carregarCidades(uf) {
    setCidades([]);
    if (!uf) return;
    try {
      const r = await comTempo(fetch(`/api/municipios?uf=${uf}`), 8000);
      if (r.ok) setCidades((await r.json()).cities.map((c) => c.name));
    } catch { /* sem lista: a cidade vira texto livre */ }
  }

  async function escolherFoto(e) {
    const arquivo = e.target.files?.[0];
    e.target.value = '';
    if (!arquivo) return;
    setFotoMsg('Preparando a foto…');
    try {
      const blob = await comprimirFoto(arquivo);
      setFoto((antiga) => {
        if (antiga) URL.revokeObjectURL(antiga.preview);
        return { blob, preview: URL.createObjectURL(blob) };
      });
      setFotoMsg('');
    } catch {
      setFotoMsg('Não deu para usar essa foto. Tente outra ou envie sem foto.');
    }
  }

  function tirarFoto() {
    if (foto) URL.revokeObjectURL(foto.preview);
    setFoto(null);
    mudar('foto_autorizada', false);
  }

  function concluir(codigo, fotoFalhou = false) {
    try { sessionStorage.removeItem(RASCUNHO); } catch { /* ignora */ }
    router.push(`/selo/m/${codigo}${fotoFalhou ? '?foto=0' : ''}`);
  }

  async function tentarFoto() {
    const { codigo } = pendente.current;
    setEstado('enviando');
    try {
      let { upload } = pendente.current;
      if (!upload) {
        const n = await novaUrlFoto(f.chave);
        if (!n.ok) throw new Error('sem url');
        upload = n.upload;
      }
      pendente.current.upload = null;   // URL usada; numa nova tentativa pede outra
      await subirFoto(upload, foto.blob);
      const confirmacao = await confirmarFotoEnviada(f.chave);
      if (!confirmacao.ok) throw new Error('Foto não confirmada');
      concluir(codigo);
    } catch {
      setEstado('foto-falhou');
    }
  }

  async function enviar(e) {
    e.preventDefault();
    if (estado === 'enviando') return;
    const dados = { ...f, local, tem_foto: Boolean(foto), site: hp.current?.value || '' };
    const v = validarVisita(dados);
    if (!v.ok) {
      setErros(v.erros);
      document.getElementById(`selo-${Object.keys(v.erros)[0]}`)?.focus();
      return;
    }
    setErros({});
    setEstado('enviando');
    let r;
    try {
      r = await comTempo(enviarVisita(dados), 20_000);
    } catch {
      setEstado('falhou');
      return;
    }
    if (!r?.ok) {
      if (r?.erros) { setErros(r.erros); setEstado('editando'); return; }
      setErros({ form: r?.erro || FALHA });
      setEstado('falhou');
      return;
    }
    salvarPerfil({ codigo: r.codigo, numero: r.numero, nome: v.dados.nome, whatsapp: f.whatsapp, uf: f.uf, cidade: f.cidade });
    if (!r.upload || !foto) return concluir(r.codigo);
    pendente.current = { codigo: r.codigo, upload: r.upload };
    await tentarFoto();
  }

  const erroDe = (campo) => erros[campo] ? <p className="selo-erro" id={`erro-${campo}`}>{erros[campo]}</p> : null;
  const aria = (campo) => ({ id: `selo-${campo}`, 'aria-invalid': Boolean(erros[campo]), 'aria-describedby': erros[campo] ? `erro-${campo}` : undefined });
  const enviando = estado === 'enviando';

  if (estado === 'foto-falhou') {
    return (
      <div className="selo-falha" role="alert">
        <p>Seu registro foi salvo, mas a foto não subiu. Confirme sua visita no balcão.</p>
        <div className="selo-acoes">
          <button type="button" className="selo-btn" onClick={tentarFoto}>Tentar enviar a foto</button>
          <button type="button" className="selo-btn secundario" onClick={() => concluir(pendente.current.codigo, true)}>Seguir sem foto</button>
        </div>
      </div>
    );
  }

  return (
    <form className="selo-form" onSubmit={enviar} noValidate aria-busy={enviando}>
      {perfil?.codigo && (
        <div className="selo-aviso">
          <span>Seu número de colecionador é <b> {formatarNumero(perfil.numero)}</b></span>
          <Link href={`/selo/m/${perfil.codigo}`}>Ver meu selo</Link>
        </div>
      )}

      <div className="selo-campo">
        <label htmlFor="selo-nome">Nome</label>
        <input className="selo-input" {...aria('nome')} name="nome" autoComplete="name" autoCapitalize="words" enterKeyHint="next"
          value={f.nome} onChange={(e) => mudar('nome', e.target.value)} maxLength={80} required />
        {erroDe('nome')}
      </div>

      <div className="selo-campo">
        <label htmlFor="selo-whatsapp">WhatsApp pessoal</label>
        <input className="selo-input" {...aria('whatsapp')} name="whatsapp" type="tel" required inputMode="numeric" autoComplete="tel-national"
          placeholder="(35) 99999-9999" value={f.whatsapp} onChange={(e) => mudar('whatsapp', mascararWhatsapp(e.target.value))} />
        <small className="selo-dica">Obrigatório para evitar selos repetidos e recuperar sua coleção. Use sempre o mesmo número.</small>
        {erroDe('whatsapp')}
      </div>

      <div className="selo-linha">
        <div className="selo-campo">
          <label htmlFor="selo-uf">Estado</label>
          <select className="selo-select" {...aria('uf')} name="uf" value={f.uf}
            onChange={(e) => { mudar('uf', e.target.value); carregarCidades(e.target.value); }}
            onFocus={() => { if (f.uf && !cidades.length) carregarCidades(f.uf); }}>
            <option value="">UF</option>
            {UFS_ORDEM.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
          </select>
        </div>
        <div className="selo-campo">
          <label htmlFor="selo-cidade">Cidade</label>
          <input className="selo-input" {...aria('cidade')} name="cidade" list="selo-cidades" autoComplete="address-level2"
            value={f.cidade} onChange={(e) => mudar('cidade', e.target.value)} onFocus={() => { if (f.uf && !cidades.length) carregarCidades(f.uf); }} maxLength={80} />
          <datalist id="selo-cidades">{cidades.map((c) => <option key={c} value={c} />)}</datalist>
        </div>
      </div>
      {erroDe('uf')}{erroDe('cidade')}

      <fieldset className="selo-campo" aria-describedby={erros.passou_por ? 'erro-passou_por' : undefined}>
        <legend className="selo-legenda" id="selo-passou_por" tabIndex={-1}>Por onde passou hoje?</legend>
        <div className="selo-opcoes">
          {PASSOU_POR.map((p) => (
            <label key={p.id} className="selo-check">
              <input type="checkbox" name="passou_por" value={p.id} checked={f.passou_por.includes(p.id)}
                onChange={(e) => mudar('passou_por', e.target.checked ? [...f.passou_por, p.id] : f.passou_por.filter((x) => x !== p.id))} />
              {p.nome}
            </label>
          ))}
        </div>
        {erroDe('passou_por')}
      </fieldset>

      <details className="selo-extra"><summary>Adicionar uma foto <small>opcional</small></summary>
      <div className="selo-campo selo-foto">
        <span className="selo-legenda">Foto <small>(opcional)</small></span>
        {foto ? (
          <div className="selo-foto-preview">
            <img src={foto.preview} alt="Sua foto" />
            <button type="button" className="selo-btn secundario" onClick={tirarFoto}>Remover foto</button>
          </div>
        ) : (
          <div className="selo-foto-botao">
            <span className="selo-btn claro" aria-hidden="true">Adicionar foto</span>
            <input type="file" accept="image/*" aria-label="Adicionar foto" onChange={escolherFoto} />
          </div>
        )}
        {fotoMsg && <p className="selo-dica" role="status">{fotoMsg}</p>}
        {foto && (
          <label className="selo-check simples">
            <input type="checkbox" checked={f.foto_autorizada} onChange={(e) => mudar('foto_autorizada', e.target.checked)} />
            Autorizo usar minha foto nas redes do Parque e da Capital da Mantiqueira
          </label>
        )}
      </div>

      </details>

      <div className="selo-campo">
        <label className="selo-check simples">
          <input type="checkbox" {...aria('aceite_lgpd')} checked={f.aceite_lgpd} onChange={(e) => mudar('aceite_lgpd', e.target.checked)} />
          <span>Aceito o uso dos meus dados para o Selo da Estação, conforme a <Link href="/selo/privacidade">política de privacidade</Link>.</span>
        </label>
        {erroDe('aceite_lgpd')}
      </div>

      {/* Honeypot: invisível para gente, irresistível para robô. */}
      <div className="selo-hp" aria-hidden="true">
        <label htmlFor="selo-site">Site</label>
        <input id="selo-site" ref={hp} name="site" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      {estado === 'falhou' && (
        <div className="selo-falha" role="alert">
          <p>{erros.form || FALHA}</p>
          <span className="selo-dica">O que você digitou continua aqui.</span>
        </div>
      )}
      {erroDe('chave')}

      <button type="submit" className="selo-btn" disabled={enviando || !f.chave}>
        {enviando ? 'Enviando…' : estado === 'falhou' ? 'Tentar de novo' : 'Receber meu selo'}
      </button>
      <p className="selo-dica selo-centro">
        <Link href="/selo/meu-numero">Recuperar minha coleção</Link>
      </p>
    </form>
  );
}
