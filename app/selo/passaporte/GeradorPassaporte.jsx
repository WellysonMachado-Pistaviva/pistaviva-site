'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { lerPerfil, salvarFotoPerfil, salvarPerfil } from '../perfilLocal';
import usePerfilLocal from '../usePerfilLocal';
import { autorFoto } from '../../lib/selo/mapaCidades.mjs';
import CarimboCidade from '../CarimboCidade';
import CriarPassaporte from './CriarPassaporte';
import './editor-passaporte.css';

const EditorPassaporte = dynamic(() => import('./EditorPassaporte'), { loading: () => <p role="status">Preparando seu passaporte…</p> });
const ModeloPassaporte = dynamic(() => import('./ModeloPassaporte'), { loading: () => <p role="status">Preparando exemplo…</p> });

// Perfil é lido no aparelho; parâmetros vêm do servidor para funcionar também
// na navegação interna do Next, antes de a barra de endereço ser atualizada.
export default function GeradorPassaporte({ modelo = false, story = null, editar = false }) {
  const perfil = usePerfilLocal();
  return <Passaporte key={`${modelo ? 'modelo' : perfil?.codigo || 'novo'}:${story || ''}:${editar}`} perfil={modelo ? null : perfil} modelo={modelo} storyInicial={story} editarInicial={editar} />;
}

// Sem passaporte: cria aqui mesmo. Com passaporte: carimbar a cidade em cima
// e o passaporte (mockup com os carimbos) logo abaixo, atualizando na hora.
function Passaporte({ perfil, modelo, storyInicial, editarInicial }) {
  const router = useRouter();
  const [conta, setConta] = useState(perfil?.codigo ? perfil : null);
  const [colecao, setColecao] = useState(null);   // { carimbos, numero } da API
  const [erroColecao, setErroColecao] = useState(false);
  const [rascunho, setRascunho] = useState(null);
  // ?story=<carimbo> abre direto no story daquele carimbo (link do check-in).
  const [story, setStory] = useState(storyInicial);
  const [editando, setEditando] = useState(Boolean(storyInicial) || editarInicial);
  const codigo = conta?.codigo;

  const recarregar = useCallback(() => {
    if (!codigo) return;
    fetch('/api/selo/passaporte', { cache: 'no-store', headers: { Authorization: `Bearer ${codigo}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d?.carimbos) throw new Error('Coleção indisponível');
        setColecao(d);
        setErroColecao(false);
        // Quem recuperou o passaporte em outro celular só tinha código e nº salvos.
        const salvo = lerPerfil();
        if (salvo?.codigo === codigo && !salvo.nome) salvarPerfil({ nome: d.nome, numero: d.numero, cidade: d.cidade, uf: d.uf });
        setConta((c) => {
          if (!c || c.nome) return c;
          return { ...c, nome: d.nome, numero: d.numero, cidade: d.cidade, uf: d.uf };
        });
      })
      .catch(() => setErroColecao(true));
  }, [codigo]);
  useEffect(() => { recarregar(); }, [recarregar]);

  function criado(p) {
    const completo = rascunho?.ficha ? { ...p, ficha: { ...rascunho.ficha, piloto: p.nome } } : p;
    salvarPerfil(completo);
    if (rascunho?.fotoSrc) salvarFotoPerfil(rascunho.fotoSrc, completo);
    setConta(completo);
    router.push(`/selo/m/${p.codigo}#carimbar`);
  }

  function personalizar(parcial) {
    setRascunho((anterior) => ({ ...anterior, ...parcial, ficha: { ...anterior?.ficha, ...parcial.ficha } }));
  }

  if (!codigo) return <>
    <ModeloPassaporte onPersonalizar={personalizar} />
    <CriarPassaporte onCriado={criado} nomeSugerido={rascunho?.ficha?.piloto || ''} />
    {!modelo && <p className="selo-dica">Foto, garupa e assinatura podem ficar para depois. <Link href="/selo/passaporte/modelo">Ver um exemplo antes de criar →</Link></p>}
  </>;

  return (
    <>
      {codigo && (
        <Link className="pu-atalho" href={`/selo/m/${codigo}`}>
          <span><small>Passaporte nº {conta.numero != null ? String(conta.numero).padStart(4, '0') : '—'}</small><strong>Abrir meu passaporte completo</strong>Carimbos, estações, progresso e benefícios num lugar só.</span>
          <span aria-hidden="true">→</span>
        </Link>
      )}
      <div id="carimbar"><CarimboCidade codigo={codigo} autor={conta.nome && conta.numero != null ? autorFoto(conta.nome, conta.numero) : null} onCarimbo={recarregar}
        onStory={(id) => { setStory(id); setEditando(true); document.getElementById('personalizar-passaporte')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); }} /></div>
      <details id="personalizar-passaporte" className="pu-grupo" open={editando} onToggle={(event) => setEditando(event.currentTarget.open)}>
        <summary><span>Personalizar e compartilhar<small>Foto, garupa e imagens da sua coleção · opcional</small></span></summary>
        {editando && <div>
          {erroColecao && !colecao ? <div className="selo-pilha" role="alert"><p>Não deu para carregar sua coleção. Seus carimbos continuam guardados.</p><button type="button" className="selo-btn secundario" onClick={() => { setErroColecao(false); recarregar(); }}>Tentar novamente</button></div>
            : !colecao || !conta?.nome ? <p role="status">Carregando sua coleção…</p>
            : <EditorPassaporte key={`${codigo || 'sem'}-${conta?.nome ? 'nome' : ''}-${story || 'colecao'}`} perfil={conta || perfil} carimbos={colecao?.carimbos || []} numero={colecao?.numero ?? conta?.numero ?? perfil?.numero ?? null} story={story} carregando={Boolean(codigo && !colecao)} />}
        </div>}
      </details>
    </>
  );
}
