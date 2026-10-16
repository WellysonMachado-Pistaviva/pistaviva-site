'use client';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import usePerfilLocal from '../usePerfilLocal';
import { esquecerPerfil, salvarPerfil } from '../perfilLocal';
import { entrarNoPassaporte, ativarSenhaPassaporte, redefinirSenhaPassaporte } from '../actions';
import { UFS } from '../../lib/ufs.mjs';
import { validarBuscaRecuperacao } from '../../lib/selo/acessoRegras.mjs';
import CodigoRecuperacao from '../CodigoRecuperacao';
import './acesso.css';

const VAZIO = { whatsapp: '', senha: '', confirmacao: '', iniciais: '', finais: '', cidade: '', uf: '', codigoRecuperacao: '', site: '' };
const semAssinar = () => () => {};
const noCliente = () => true;
const noServidor = () => false;
export default function RecuperarForm() {
  const pronto = useSyncExternalStore(semAssinar, noCliente, noServidor);
  const router = useRouter();
  const perfil = usePerfilLocal();
  const codigo = /^[a-f0-9]{12}$/.test(perfil?.codigo || '') ? perfil.codigo : null;
  const [modo, setModo] = useState('entrar');
  const [etapa, setEtapa] = useState(0);
  const [d, setD] = useState(VAZIO);
  const [erros, setErros] = useState({});
  const [mensagem, setMensagem] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [feito, setFeito] = useState(null);
  const form = useRef(null);
  useEffect(() => { if (Object.keys(erros).length) form.current?.querySelector('[aria-invalid="true"]')?.focus(); }, [erros]);
  useEffect(() => { if (modo === 'recuperar' && etapa === 1) form.current?.querySelector('#acesso-codigoRecuperacao')?.focus(); }, [modo, etapa]);
  function mudar(novo) {
    setModo(novo); setEtapa(0); setErros({}); setMensagem(''); setD(VAZIO); setFeito(null);
  }
  function campo(nome, rotulo, opcoes = {}) {
    const id = `acesso-${nome}`;
    return <label className="acesso-campo" htmlFor={id}>
      <span>{rotulo}</span>
      <input id={id} name={nome} className="selo-input" value={d[nome]} disabled={!pronto || enviando}
        onChange={(e) => setD((atual) => ({ ...atual, [nome]: nome === 'finais' ? e.target.value.replace(/\D/g, '').slice(0, 4) : e.target.value }))}
        aria-invalid={Boolean(erros[nome])} aria-describedby={erros[nome] ? `${id}-erro` : undefined} {...opcoes} />
      {erros[nome] && <small className="selo-erro" id={`${id}-erro`}>{erros[nome]}</small>}
    </label>;
  }
  async function enviar(e) {
    e.preventDefault();
    if (!pronto || enviando) return;
    setMensagem(''); setErros({});
    if (modo === 'recuperar' && etapa === 0) {
      const encontrados = validarBuscaRecuperacao(d);
      if (Object.keys(encontrados).length) return setErros(encontrados);
      setEtapa(1);
      return;
    }
    setEnviando(true);
    try {
      const r = modo === 'entrar' ? await entrarNoPassaporte(d)
        : modo === 'ativar' ? await ativarSenhaPassaporte({ ...d, codigo }) : await redefinirSenhaPassaporte(d);
      if (!r.ok) { setErros(r.erros || {}); setMensagem(r.erro || 'Confira os campos para continuar.'); return; }
      setD((atual) => ({ ...atual, senha: '', confirmacao: '', codigoRecuperacao: '' }));
      if (modo === 'entrar') {
        salvarPerfil({ codigo: r.codigo, numero: r.numero, nome: r.nome, cidade: r.cidade, uf: r.uf, whatsapp: d.whatsapp });
        router.push(`/selo/m/${r.codigo}#carimbar`);
      } else {
        if (modo === 'recuperar') esquecerPerfil();
        setFeito({ codigoRecuperacao: r.codigoRecuperacao, recuperado: modo === 'recuperar' });
      }
    } catch { setMensagem('Sem conexão. Seus dados continuam aqui para tentar novamente.'); }
    finally { setEnviando(false); }
  }
  if (feito) return <CodigoRecuperacao codigo={feito.codigoRecuperacao} recuperado={feito.recuperado} onContinuar={() => {
    if (!feito.recuperado && codigo) router.push(`/selo/m/${codigo}`);
    else mudar('entrar');
  }} />;
  return <div className="selo-pilha">
    {codigo && <><Link className="selo-btn secundario" href={`/selo/m/${codigo}`}>Abrir passaporte salvo neste celular</Link><p className="selo-dica">Seu link pessoal continua abrindo o passaporte. Crie uma senha para entrar também em outro aparelho.</p></>}
    <div className="acesso-modos" role="group" aria-label="Escolher acesso">
      <button type="button" disabled={!pronto || enviando} aria-pressed={modo === 'entrar'} onClick={() => mudar('entrar')}>Entrar</button>
      <button type="button" disabled={!pronto || enviando} aria-pressed={modo === 'recuperar'} onClick={() => mudar('recuperar')}>Esqueci a senha</button>
      {codigo && <button type="button" disabled={!pronto || enviando} aria-pressed={modo === 'ativar'} onClick={() => mudar('ativar')}>Criar minha senha</button>}
    </div>
    <form ref={form} className="acesso-form" noValidate onSubmit={enviar} aria-busy={!pronto || enviando}>
      <div className="selo-hp" aria-hidden="true">{campo('site', 'Site', { tabIndex: -1, autoComplete: 'off' })}</div>
      {modo === 'entrar' ? <>
        <h2>Volte para sua coleção.</h2>
        {campo('whatsapp', 'Telefone com DDD', { type: 'tel', inputMode: 'tel', autoComplete: 'username', maxLength: 40 })}
        {campo('senha', 'Sua senha', { type: 'password', autoComplete: 'current-password', maxLength: 72 })}
      </> : modo === 'recuperar' && etapa === 0 ? <>
        <h2>Vamos encontrar seu cadastro.</h2>
        <p>Use os dados informados quando criou o passaporte. Na próxima etapa, você usa o código de recuperação que guardou.</p>
        {campo('iniciais', '3 primeiras letras do nome', { maxLength: 3, autoComplete: 'off' })}
        {campo('finais', 'Últimos 4 dígitos do telefone', { inputMode: 'numeric', maxLength: 4, autoComplete: 'off' })}
        {campo('cidade', 'Cidade do cadastro', { maxLength: 80, autoComplete: 'address-level2' })}
        <label className="acesso-campo" htmlFor="acesso-uf"><span>Estado do cadastro</span><select className="selo-select" id="acesso-uf" disabled={enviando} value={d.uf} onChange={(e) => setD((atual) => ({ ...atual, uf: e.target.value }))} aria-invalid={Boolean(erros.uf)} aria-describedby={erros.uf ? 'acesso-uf-erro' : undefined}><option value="">Escolha o estado</option>{UFS.map((uf) => <option key={uf}>{uf}</option>)}</select>{erros.uf && <small className="selo-erro" id="acesso-uf-erro">{erros.uf}</small>}</label>
      </> : <>
        <h2>{modo === 'ativar' ? 'Proteja seu passaporte com uma senha.' : 'Confirme e crie uma nova senha.'}</h2>
        {modo === 'recuperar' ? <>
          <p>Digite o código entregue pelo site no cadastro. Ele não é enviado por mensagem. A nova senha encerra o acesso pelos links antigos.</p>
          {campo('codigoRecuperacao', 'Código de recuperação salvo', { maxLength: 64, autoComplete: 'off', spellCheck: false, autoCapitalize: 'characters' })}
          <button className="selo-text-link" type="button" disabled={enviando} onClick={() => { setEtapa(0); setErros({}); setMensagem(''); }}>Corrigir dados do cadastro</button>
        </> : <p>Você já tem acesso pelo link salvo. Escolha a primeira senha e guarde o código que aparecerá em seguida. Se já criou uma senha antes, use “Entrar” ou “Esqueci a senha”.</p>}
        {campo('senha', 'Nova senha', { type: 'password', autoComplete: 'new-password', maxLength: 72 })}
        <p className="selo-dica">Use pelo menos 12 caracteres. Pode ser uma frase fácil de lembrar.</p>
        {campo('confirmacao', 'Repita a nova senha', { type: 'password', autoComplete: 'new-password', maxLength: 72 })}
      </>}
      {mensagem && <p className="selo-erro" role="alert">{mensagem}</p>}
      <button className="selo-btn" type="submit" disabled={!pronto || enviando || (modo === 'ativar' && !codigo)}>{!pronto ? 'Preparando formulário…' : enviando ? 'Conferindo…' : modo === 'entrar' ? 'Entrar no meu passaporte' : modo === 'ativar' ? 'Salvar minha senha' : etapa === 0 ? 'Continuar recuperação' : 'Trocar senha e recuperar'}</button>
    </form>
    {modo === 'recuperar' && <p>Perdeu também o código? <Link className="selo-text-link" href="/contato">Falar com a equipe</Link>. Será necessário confirmar sua identidade.</p>}
    <Link className="selo-text-link" href="/selo/passaporte#criar-passaporte">Ainda não tenho cadastro →</Link>
  </div>;
}
