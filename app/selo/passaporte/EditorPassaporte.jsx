'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { gerarPaginaColecao, gerarPreviaStory } from './artePassaporte';
import { paginarColecao, zipColecao } from './colecaoCompartilhamento.mjs';
import { lerFotoPerfil, lerPerfil, salvarFotoPerfil, salvarPerfil } from '../perfilLocal';
import { carregarIdentificacao, salvarIdentificacao } from '../identificacaoCliente';
import { CAMPOS_IDENTIFICACAO } from '../../lib/selo/identificacaoRegras.mjs';
import './tipografia-passaporte.css';

const VAZIO = Object.freeze([]);
const limitarFicha = (ficha) => Object.fromEntries(Object.entries(ficha || {})
  .filter(([k, v]) => Object.hasOwn(CAMPOS_IDENTIFICACAO, k) && typeof v === 'string')
  .map(([k, v]) => [k, v.slice(0, CAMPOS_IDENTIFICACAO[k])]));
function fichaInicial(perfil) {
  const nome = typeof perfil?.nome === 'string' ? perfil.nome : '';
  return limitarFicha({
    piloto: nome, garupa: '', origem: perfil?.cidade ? `${perfil.cidade}${perfil.uf ? `/${perfil.uf}` : ''}` : '',
    assinatura: nome.split(' ')[0], ...limitarFicha(perfil?.ficha),
  });
}
const blobDoCanvas = (canvas) => new Promise((resolve, reject) => {
  canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Não foi possível preparar a imagem.')), 'image/jpeg', 0.95);
});

function baixar(arquivo, nome = arquivo.name) {
  const url = URL.createObjectURL(arquivo);
  const link = document.createElement('a');
  link.href = url;
  link.download = nome;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function Escolha({ legenda, nome, valor, opcoes, onChange, disabled = false }) {
  return <fieldset className="sl-layout">
    <legend>{legenda}</legend>
    <div className="sl-layout-options">
      {opcoes.map(([id, titulo, detalhe, bloqueado]) => <label key={id} data-selected={valor === id}>
        <input type="radio" name={nome} value={id} checked={valor === id} disabled={disabled || bloqueado} onChange={() => onChange(id)} />
        <b>{titulo}</b><small>{detalhe}</small>
      </label>)}
    </div>
  </fieldset>;
}

export default function EditorPassaporte({ perfil = null, carimbos: carimbosReais = VAZIO, numero = null, story = null, demonstracao = false, cidadesExemplo = VAZIO, standalone = false, carregando = false, quantidadeInicial = 50, modoInicial = 'colecao', onPersonalizar }) {
  const canvas = useRef(null);
  const [dados, setDados] = useState(() => demonstracao
    ? { piloto: 'Ana Souza', garupa: 'João Lima', origem: 'Itajubá/MG', assinatura: 'Ana' }
    : fichaInicial(perfil));
  const [fotoSrc, setFotoSrc] = useState(demonstracao ? '/motosul/g-fila-motos.jpg' : null);
  const [layout, setLayout] = useState('identidade');
  const [cidade, setCidade] = useState(story || (demonstracao ? 'socorro-sp' : ''));
  const [modo, setModo] = useState(story ? 'conquista' : modoInicial);
  const [formato, setFormato] = useState('stories');
  const [quantidade, setQuantidade] = useState(quantidadeInicial);
  const [pagina, setPagina] = useState(0);
  const [escopo, setEscopo] = useState('completo');
  const [mensagem, setMensagem] = useState('');
  const [exibida, setExibida] = useState(null);
  const [preparacao, setPreparacao] = useState(null);
  const [erro, setErro] = useState(null);
  const [exportando, setExportando] = useState(false);
  const [consultando, setConsultando] = useState(!demonstracao && Boolean(perfil?.codigo));
  const [salvandoCadastro, setSalvandoCadastro] = useState(false);
  const [statusCadastro, setStatusCadastro] = useState('');
  const [removerFoto, setRemoverFoto] = useState(false);
  // Carimbos que a pessoa tirou da coleção compartilhada (por chave).
  const [fora, setFora] = useState(() => new Set());
  const codigo = perfil?.codigo;
  const numeroPerfil = perfil?.numero;
  const edicaoBloqueada = exportando || consultando || salvandoCadastro || carregando;
  const colecao = modo === 'colecao';
  const carimbos = useMemo(() => (demonstracao ? cidadesExemplo.slice(0, quantidade) : carimbosReais).map((c, i) => ({ ...c, chave: c.entradaId || `${c.slug || c.tipo || 'carimbo'}-${c.dia}-${i}` })), [demonstracao, cidadesExemplo, quantidade, carimbosReais]);
  const cidades = useMemo(() => carimbos.filter((c) => c.tipo === 'cidade' || c.slug), [carimbos]);
  const inicio = carimbos.length === 0;
  const naColecao = useMemo(() => carimbos.filter((c) => !fora.has(c.chave)), [carimbos, fora]);
  const folhas = useMemo(() => paginarColecao(naColecao, formato), [naColecao, formato]);
  // "Até a viagem anterior": tira os carimbos do dia mais recente.
  const ultimoDia = useMemo(() => carimbos.reduce((m, c) => (c.dia > m ? c.dia : m), ''), [carimbos]);
  const temViagemAnterior = carimbos.some((c) => c.dia && c.dia < ultimoDia);
  function alternarCarimbo(chave) {
    setFora((atual) => { const novo = new Set(atual); if (novo.has(chave)) novo.delete(chave); else novo.add(chave); return novo; });
    setPagina(0); setMensagem('');
  }
  const destaque = cidades.find((c) => c.chave === cidade || c.slug === cidade) || cidades.at(-1) || null;
  const indice = colecao ? Math.min(pagina, folhas.length - 1) : 0;
  const completo = colecao && escopo === 'completo';
  const altura = colecao && formato === 'feed' ? 1350 : 1920;
  const dimensoes = `1080 × ${altura}`;
  const numeroTexto = numero == null ? 'sem-numero' : String(numero).padStart(4, '0');
  const prefixoArquivo = `${demonstracao ? 'previa-' : ''}passaporte-${numeroTexto}`;

  useEffect(() => {
    if (demonstracao || !codigo) return;
    let ativo = true;
    (async () => {
      const local = lerPerfil();
      const pertence = local?.codigo === codigo && String(local.numero) === String(numeroPerfil);
      const fotoLocal = pertence ? lerFotoPerfil(local) : null;
      if (fotoLocal) setFotoSrc(fotoLocal);
      if (pertence && local.ficha) setDados((anterior) => ({ ...anterior, ...limitarFicha(local.ficha) }));
      if (pertence && local.fotoRemovidaPendente) setRemoverFoto(true);
      try {
        const salva = await carregarIdentificacao(codigo);
        if (!ativo) return;
        const pendente = pertence && local.fichaPendente;
        if (!pendente && salva.ficha) {
          setDados(salva.ficha);
        }
        if (salva.ficha && (!pendente || (!fotoLocal && !local.fotoRemovidaPendente))) setFotoSrc(salva.fotoSrc);
        setStatusCadastro(pendente ? 'Edição neste aparelho. Toque em salvar para guardar no cadastro.' : salva.ficha ? 'Identificação guardada no cadastro.' : 'Salve identificação e foto para abrir em outro celular.');
      } catch (e) {
        if (ativo) setStatusCadastro(`${e.message} Sua edição neste aparelho continua disponível.`);
      } finally {
        if (ativo) setConsultando(false);
      }
    })();
    return () => { ativo = false; };
  }, [demonstracao, codigo, numeroPerfil]);

  // Arquivos prontos antes do clique preservam o gesto para o share nativo.
  // Cache guarda JPEGs, sem manter todos os canvases na memória.
  const lote = useMemo(() => {
    const promessas = new Map();
    const total = colecao ? folhas.length : 1;
    const estados = new Set(naColecao.map((c) => c.uf || (c.tipo === 'estacao' ? 'MG' : null)).filter(Boolean)).size;
    return {
      total,
      obter(i) {
        if (!promessas.has(i)) {
          const imagem = colecao
            ? gerarPaginaColecao({ folha: folhas[i], indice: i, totalPaginas: total, dados, fotoSrc, numero, totalCarimbos: naColecao.length, estados, formato })
            : gerarPreviaStory({ destaque, outros: carimbos.filter((c) => c !== destaque), dados, fotoSrc, numero, identidadeAcima: layout === 'identidade', inicio: inicio || !destaque });
          promessas.set(i, imagem.then((tela) => {
            if (demonstracao) {
              const ctx = tela.getContext('2d');
              ctx.save();
              ctx.fillStyle = '#a3281c'; ctx.textAlign = 'center'; ctx.font = '700 18px PassaporteSlab';
              ctx.fillText('MODELO DE EXEMPLO · VISITAS ILUSTRATIVAS', tela.width / 2, 25);
              ctx.restore();
            }
            return blobDoCanvas(tela);
          }).then((blob) => {
            const nome = colecao
              ? `${prefixoArquivo}-${formato === 'feed' ? 'feed-' : ''}${String(i + 1).padStart(2, '0')}-de-${String(total).padStart(2, '0')}.jpg`
              : `${demonstracao ? 'previa-' : ''}passaporte-${inicio || !destaque ? 'minha-historia' : destaque.slug}.jpg`;
            return new File([blob], nome, { type: 'image/jpeg' });
          }));
        }
        return promessas.get(i);
      },
    };
  }, [colecao, folhas, dados, fotoSrc, carimbos, naColecao, destaque, layout, inicio, formato, numero, prefixoArquivo, demonstracao]);

  useEffect(() => {
    let ativo = true;
    let url;
    lote.obter(indice).then((arquivo) => {
      if (!ativo) return;
      const img = new Image();
      url = URL.createObjectURL(arquivo);
      img.onload = () => {
        if (ativo) {
          const elemento = canvas.current;
          elemento.width = img.width;
          elemento.height = img.height;
          elemento.getContext('2d').drawImage(img, 0, 0);
          setExibida({ lote, indice, arquivo });
        }
        URL.revokeObjectURL(url);
      };
      img.onerror = () => { URL.revokeObjectURL(url); if (ativo) setErro({ lote, texto: 'Não deu para abrir esta página. Recarregue para tentar novamente.' }); };
      img.src = url;
    }).catch(() => {
      if (ativo) setErro({ lote, texto: 'Não deu para montar todas as imagens. Recarregue para tentar novamente.' });
    });
    return () => { ativo = false; if (url) URL.revokeObjectURL(url); };
  }, [lote, indice]);

  useEffect(() => {
    let ativo = true;
    async function preparar() {
      const arquivos = [];
      try {
        for (let i = 0; i < lote.total; i++) {
          const arquivo = await lote.obter(i);
          if (!ativo) return;
          arquivos.push(arquivo);
          setPreparacao({ lote, arquivos: [...arquivos] });
        }
      } catch {
        if (ativo) setErro({ lote, texto: 'Não deu para preparar coleção completa. Recarregue para tentar novamente.' });
      }
    }
    preparar();
    return () => { ativo = false; };
  }, [lote]);

  const pronto = exibida?.lote === lote && exibida.indice === indice;
  const arquivos = preparacao?.lote === lote ? preparacao.arquivos : [];
  const todasProntas = arquivos.length === lote.total;
  const podeExportar = (completo ? todasProntas : pronto) && !exportando && !carregando && !consultando && !salvandoCadastro;
  const erroAtual = erro?.lote === lote ? erro.texto : '';

  function atualizar(chave, valor) {
    setMensagem('');
    const novo = { ...dados, [chave]: valor };
    setDados(novo);
    if (demonstracao) onPersonalizar?.({ ficha: { [chave]: valor } });
    else if (perfil?.codigo && lerPerfil()?.codigo === perfil.codigo) {
      salvarPerfil({ ficha: novo, fichaPendente: true });
      setStatusCadastro('Edição neste aparelho. Toque em salvar para guardar no cadastro.');
    }
  }

  function escolherFoto(evento) {
    const arquivo = evento.target.files?.[0];
    if (!arquivo) return;
    if (!arquivo.type.startsWith('image/')) { setMensagem('Escolha um arquivo de imagem.'); return; }
    const leitor = new FileReader();
    leitor.onload = () => {
      const foto = new Image();
      foto.onload = () => {
        const reduzida = document.createElement('canvas');
        const escala = Math.min(1, 1440 / Math.max(foto.width, foto.height));
        reduzida.width = Math.round(foto.width * escala);
        reduzida.height = Math.round(foto.height * escala);
        reduzida.getContext('2d').drawImage(foto, 0, 0, reduzida.width, reduzida.height);
        const src = reduzida.toDataURL('image/jpeg', 0.88);
        setFotoSrc(src);
        if (demonstracao) onPersonalizar?.({ fotoSrc: src });
        if (!demonstracao && perfil?.codigo && lerPerfil()?.codigo === perfil.codigo) {
          salvarFotoPerfil(src, perfil);
          salvarPerfil({ ficha: dados, fichaPendente: true, fotoRemovidaPendente: false });
          setRemoverFoto(false);
          setStatusCadastro('Foto escolhida. Toque em salvar para guardar no cadastro.');
        }
        setMensagem('');
      };
      foto.onerror = () => setMensagem('Essa foto não abriu. Tente outra imagem em JPG, PNG ou WebP.');
      foto.src = leitor.result;
    };
    leitor.onerror = () => setMensagem('Não foi possível ler a foto. Tente novamente.');
    leitor.readAsDataURL(arquivo);
    evento.target.value = '';
  }

  async function guardarCadastro() {
    if (demonstracao || !codigo || edicaoBloqueada) return;
    setSalvandoCadastro(true);
    setStatusCadastro('Salvando identificação e foto…');
    try {
      await salvarIdentificacao(codigo, dados, fotoSrc, removerFoto);
      if (lerPerfil()?.codigo === codigo) salvarPerfil({ ficha: dados, fichaPendente: false, fotoRemovidaPendente: false });
      setStatusCadastro('Identificação guardada no cadastro. Disponível ao entrar em outro celular.');
    } catch (e) { setStatusCadastro(e.message); }
    finally { setSalvandoCadastro(false); }
  }

  async function exportar(compartilhar = false) {
    if (!podeExportar) return;
    const selecionados = completo ? arquivos : [exibida.arquivo];
    setExportando(true);
    try {
      if (compartilhar && navigator.canShare?.({ files: selecionados })) {
        await navigator.share({ files: selecionados, title: 'Meu passaporte do motociclista', text: 'Minha história tem estrada. Conectando pessoas a lugares.' });
        setMensagem(completo && selecionados.length > 1 ? `${selecionados.length} imagens compartilhadas.` : 'Imagem compartilhada.');
      } else if (completo) {
        baixar(await zipColecao(selecionados), `${prefixoArquivo}-${formato === 'feed' ? 'feed-' : ''}completo.zip`);
        setMensagem(`${compartilhar ? 'Compartilhamento direto indisponível. ' : ''}ZIP baixado com ${selecionados.length} ${selecionados.length === 1 ? 'imagem' : 'imagens'}. Extraia para publicar na ordem.`);
      } else {
        baixar(selecionados[0]);
        setMensagem(compartilhar ? 'Imagem baixada. Compartilhamento direto indisponível neste navegador.' : `Página baixada em ${dimensoes}.`);
      }
    } catch (e) {
      if (e.name !== 'AbortError') setMensagem('Não foi possível exportar. Tente novamente.');
    } finally {
      setExportando(false);
    }
  }

  return (
    <div id={standalone ? undefined : 'passaporte-gerador'} className={`story-lab${standalone ? '' : ' sl-embedded'}`}>
      {standalone && <header className="sl-nav">
        <a href="/selo/passaporte" className="sl-brand">PISTA<span>VIVA</span><small>PASSAPORTE DO MOTOCICLISTA</small></a>
        {demonstracao && <span className="sl-local"><i /> Prévia local</span>}
      </header>}
      {standalone && <div className="sl-intro">
        <p className="sl-eyebrow">Lugares, encontros e memórias.</p>
        <h1>Sua história tem <em>estrada.</em></h1>
        <p>Cada conquista no seu lugar. Sua coleção inteira, página por página.</p>
      </div>}
      <div className="sl-workspace">
        <section className="sl-preview" aria-label="Prévia da imagem para compartilhar">
          <div className="sl-preview-label"><span>{demonstracao ? 'MODELO DE EXEMPLO' : colecao ? 'SEU PASSAPORTE' : 'SUA CONQUISTA'}</span><span>{dimensoes}</span></div>
          <div className="sl-phone" data-formato={altura === 1350 ? 'feed' : 'stories'} aria-busy={(!pronto || carregando) && !erroAtual}>
            <canvas ref={canvas} width={1080} height={altura} role="img" aria-hidden={demonstracao && !exibida ? true : undefined} aria-label={colecao ? `Passaporte de ${dados.piloto}, página ${indice + 1} de ${folhas.length}, ${folhas[indice].carimbos.length} carimbos nesta página, ${naColecao.length} no total` : `Passaporte de ${dados.piloto}: ${inicio || !destaque ? 'minha história começa em ' + dados.origem : 'estive em ' + destaque.nome}`} />
            {demonstracao && !exibida && <img className="sl-exemplo-inicial" src="/selo/passaporte/home-story.webp" alt="Modelo ilustrativo preenchido, com foto, identificação e carimbos de cidades" width={540} height={960} />}
            {(!pronto || carregando) && !erroAtual && <div className={`sl-loading${demonstracao && !exibida ? ' sl-loading-exemplo' : ''}`} role="status">{carregando ? 'Carregando sua coleção…' : 'Preparando sua página…'}</div>}
          </div>
          {colecao && <>
            <nav className="sl-pagination" aria-label="Páginas do passaporte">
              <button type="button" aria-label="Página anterior" disabled={indice === 0} onClick={() => setPagina(indice - 1)}>←</button>
              <span aria-live="polite">Página <b>{indice + 1}</b> de {folhas.length}</span>
              <button type="button" aria-label="Próxima página" disabled={indice === folhas.length - 1} onClick={() => setPagina(indice + 1)}>→</button>
            </nav>
            <p className="sl-page-info">{indice === 0 ? 'Identificação' : `Carimbos ${folhas[indice].inicio + 1}–${folhas[indice].inicio + folhas[indice].carimbos.length}`}{indice === 0 && folhas[0].carimbos.length > 0 ? ' e primeiros carimbos' : ''} · {naColecao.length} na coleção</p>
          </>}
          {demonstracao && <p className="sl-example">Foto, número e conquistas de exemplo para visualizar composição.</p>}
        </section>
        <form className="sl-editor" onSubmit={(e) => { e.preventDefault(); exportar(true); }}>
          <Escolha legenda="O que quer mostrar?" nome="modo" valor={modo} disabled={exportando} onChange={(id) => { setModo(id); setPagina(0); setMensagem(''); }} opcoes={[
            ['colecao', 'Meu passaporte', 'Coleção completa, em páginas'],
            ['conquista', 'Uma conquista', 'Cidade e carimbo em destaque', !demonstracao && !cidades.length],
          ]} />
          {colecao && <Escolha legenda="Formato das páginas" nome="formato" valor={formato} disabled={exportando} onChange={(id) => { setFormato(id); setPagina(0); setMensagem(''); }} opcoes={[
            ['stories', 'Stories', '1080 × 1920 · sequência'],
            ['feed', 'Feed', '1080 × 1350 · carrossel'],
          ]} />}
          {colecao && carimbos.length > 1 && <fieldset className="sl-layout sl-escolher">
            <legend>Carimbos no passaporte <small>{naColecao.length} de {carimbos.length}</small></legend>
            <div className="sl-escolher-atalhos">
              <button type="button" disabled={exportando || !fora.size} onClick={() => { setFora(new Set()); setPagina(0); setMensagem(''); }}>Todos</button>
              {temViagemAnterior && <button type="button" disabled={exportando} onClick={() => { setFora(new Set(carimbos.filter((c) => c.dia === ultimoDia).map((c) => c.chave))); setPagina(0); setMensagem(''); }}>Até a viagem anterior</button>}
            </div>
            <div className="sl-escolher-grade">
              {carimbos.map((c) => (
                <label key={c.chave} data-fora={fora.has(c.chave) || undefined} title={`${c.nome || c.alt || 'Carimbo'} · ${c.dia.split('-').reverse().join('/')}`}>
                  <input type="checkbox" checked={!fora.has(c.chave)} disabled={exportando} onChange={() => alternarCarimbo(c.chave)} />
                  <img src={c.mini || c.src} alt="" width={56} height={56} loading="lazy" />
                  <span>{c.nome || c.alt}</span>
                </label>
              ))}
            </div>
          </fieldset>}
          {demonstracao && <div className="sl-field">
            <label htmlFor="sl-quantidade">Coleção de exemplo</label>
            <select id="sl-quantidade" value={quantidade} disabled={exportando} onChange={(e) => { setQuantidade(Number(e.target.value)); if (e.target.value === '0') setLayout('identidade'); setPagina(0); setCidade('socorro-sp'); setMensagem(''); }}>
              <option value={50}>50 carimbos · {paginarColecao(cidadesExemplo, formato).length} páginas</option>
              <option value={8}>8 carimbos · {paginarColecao(cidadesExemplo.slice(0, 8), formato).length} páginas</option>
              <option value={0}>Primeiro dia · ainda sem carimbos</option>
            </select>
          </div>}
          {!colecao && <>
            <div className="sl-field">
              <label htmlFor="sl-cidade">Memória em destaque</label>
              <select id="sl-cidade" value={inicio ? 'inicio' : demonstracao ? destaque?.slug : destaque?.chave} disabled={exportando} onChange={(e) => { if (e.target.value === 'inicio') { setQuantidade(0); setLayout('identidade'); } else { if (inicio && demonstracao) setQuantidade(8); setCidade(e.target.value); } setMensagem(''); }}>
                {(inicio && demonstracao ? cidadesExemplo.slice(0, 8).map((c, i) => ({ ...c, chave: `${c.slug}-${c.dia}-${i}` })) : cidades).map((c) => <option key={c.chave} value={demonstracao ? c.slug : c.chave}>{c.nome}{c.uf ? `/${c.uf}` : ''} · {c.dia.split('-').reverse().join('/')}</option>)}
                {demonstracao && <option value="inicio">Primeiro dia · ainda sem carimbos</option>}
              </select>
            </div>
            <Escolha legenda="O que vem primeiro?" nome="composicao" valor={layout} disabled={exportando} onChange={(id) => { setLayout(id); setMensagem(''); }} opcoes={[
              ['identidade', 'Meu passaporte', 'Foto e identidade em cima'],
              ['conquista', 'Minha conquista', 'Cidade em cima, como referência', inicio],
            ]} />
          </>}
          <div className="sl-photo-field">
            {fotoSrc ? <img className="sl-photo-thumb" src={fotoSrc} alt="Foto escolhida para o passaporte" width={64} height={78} /> : <span className="sl-photo-thumb sl-photo-empty" aria-hidden="true">FOTO</span>}
            <div><label htmlFor="sl-foto" className="sl-upload">Escolher minha foto <span aria-hidden="true">↗</span></label><input id="sl-foto" className="sl-file" type="file" accept="image/*" disabled={edicaoBloqueada} onChange={escolherFoto} /><p>{demonstracao ? 'Foto usada só nesta prévia. Nada é enviado.' : 'Ao salvar, foto e identificação ficam no cadastro privado, acessível por você e pela equipe.'}</p></div>
          </div>
          <div className="sl-fields">
            {[
              ['piloto', 'Nome do piloto', 'Como aparece no passaporte', 32],
              ['garupa', 'Garupa (opcional)', 'Nome de quem acompanha', 32],
              ['origem', 'Cidade de origem', 'Cidade/UF', 32],
              ['assinatura', 'Assinatura', 'Seu nome em letra cursiva', 24],
            ].map(([chave, rotulo, placeholder, max]) => <div className="sl-field" key={chave}>
              <label htmlFor={`sl-${chave}`}>{rotulo}</label>
              <input id={`sl-${chave}`} value={dados[chave]} placeholder={placeholder} maxLength={max} disabled={edicaoBloqueada} onChange={(e) => atualizar(chave, e.target.value)} autoComplete="off" />
            </div>)}
          </div>
          {!demonstracao && codigo && <div className="sl-cadastro">
            <button type="button" className="sl-download" disabled={edicaoBloqueada} onClick={guardarCadastro}>{consultando || carregando ? 'Consultando cadastro…' : salvandoCadastro ? 'Salvando…' : 'Salvar identificação no cadastro'}</button>
            {fotoSrc && <button type="button" className="sl-download" disabled={edicaoBloqueada} onClick={() => {
              setFotoSrc(null); setRemoverFoto(true);
              if (lerPerfil()?.codigo === codigo) { try { localStorage.removeItem('selo:foto'); } catch { /* Edição continua em memória. */ } salvarPerfil({ ficha: dados, fichaPendente: true, fotoRemovidaPendente: true }); }
              setStatusCadastro('Foto removida da edição. Salve para remover também do cadastro.');
            }}>Remover minha foto</button>}
            <p className="sl-status" role="status">{statusCadastro}</p>
          </div>}
          {colecao && <Escolha legenda="Compartilhar ou baixar" nome="escopo" valor={escopo} disabled={exportando} onChange={(id) => { setEscopo(id); setMensagem(''); }} opcoes={[
            ['atual', 'Página atual', `Só imagem ${indice + 1}`],
            ['completo', 'Passaporte completo', `${folhas.length} ${folhas.length === 1 ? 'imagem' : 'imagens'} · ${naColecao.length === carimbos.length ? 'todos os carimbos' : `${naColecao.length} carimbos escolhidos`}`],
          ]} />}
          <div className="sl-actions">
            <button type="submit" className="sl-share" disabled={!podeExportar}>{exportando ? 'Preparando arquivo…' : completo ? `Compartilhar ${folhas.length} ${folhas.length === 1 ? 'imagem' : 'imagens'}` : colecao ? 'Compartilhar página atual' : 'Compartilhar conquista'} <span aria-hidden="true">↗</span></button>
            <button type="button" className="sl-download" disabled={!podeExportar} onClick={() => exportar()}>{completo ? 'Baixar coleção (.zip)' : 'Baixar imagem'} <span aria-hidden="true">↓</span></button>
          </div>
          <p className="sl-status" role="status">{erroAtual || mensagem || (!todasProntas ? `Preparando imagens · ${arquivos.length} de ${lote.total}…` : completo ? 'Imagens numeradas. No ZIP, extraia para publicar na ordem.' : `Imagem pronta em ${dimensoes}.`)}</p>
          <p className="sl-note">Cada carimbo guarda um lugar, um encontro e uma memória.</p>
        </form>
      </div>
      {standalone && <footer className="sl-footer">CONECTANDO PESSOAS A LUGARES <span>PISTA VIVA</span></footer>}
    </div>
  );
}
