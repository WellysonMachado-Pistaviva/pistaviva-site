'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import estados from '../lib/selo/mapaEstados.json';
import { MAPA_ALTURA, MAPA_LARGURA } from '../lib/selo/mapaPessoal.mjs';
import { gerarImagemMapa } from './imagemMapaPessoal';

const data = (dia) => dia.split('-').reverse().join('/');

export default function MapaPessoal({ cidades, pessoa, privado, codigo, demonstracao, onAbrir }) {
  const [uf, setUf] = useState('');
  const [todas, setTodas] = useState(false);
  const [arquivo, setArquivo] = useState(null);
  const [erro, setErro] = useState('');
  const [gerando, setGerando] = useState(false);
  const [tentativa, setTentativa] = useState(0);
  const visitados = new Set(cidades.map((c) => c.uf));
  const lista = cidades.filter((c) => !uf || c.uf === uf);
  const visiveis = todas ? lista : lista.slice(0, 5);
  const contagem = Object.fromEntries([...visitados].map((estado) => [estado, cidades.filter((c) => c.uf === estado).length]));

  useEffect(() => {
    if (!cidades.length) return;
    let ativa = true;
    gerarImagemMapa({ cidades, pessoa, privado, codigo, demonstracao }).then((f) => {
      if (ativa) setArquivo(f);
    }).catch(() => { if (ativa) setErro('Não foi possível preparar a imagem. Tente novamente.'); });
    return () => { ativa = false; };
  }, [cidades, pessoa, privado, codigo, demonstracao, tentativa]);

  function filtrar(estado) { setUf(estado); setTodas(false); }
  function baixar() {
    if (!arquivo) return;
    const url = URL.createObjectURL(arquivo);
    const a = document.createElement('a');
    a.href = url; a.download = arquivo.name; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }
  async function compartilhar() {
    if (!arquivo) return;
    setErro(''); setGerando(true);
    try {
      if (navigator.canShare?.({ files: [arquivo] })) await navigator.share({ files: [arquivo] });
      else baixar();
    } catch (e) {
      if (e.name !== 'AbortError') setErro('Não abriu o compartilhamento. Use “Baixar mapa”.');
    } finally { setGerando(false); }
  }

  return <section className="pu-secao jornada-mapa" aria-labelledby="jornada-mapa-titulo">
    <header><h2 id="jornada-mapa-titulo">{privado ? 'Meu Brasil' : 'Brasil carimbado'}</h2><span>{visitados.size} {visitados.size === 1 ? 'estado' : 'estados'}</span></header>
    <div className="jornada-papel">
      <div className="jornada-manchete"><p className="jornada-kicker">Minhas conquistas</p><h3>{cidades.length ? `${cidades.length} ${cidades.length === 1 ? 'cidade' : 'cidades'} · ${visitados.size} ${visitados.size === 1 ? 'estado' : 'estados'}` : 'Minha história começa aqui'}</h3><p>{cidades.length ? 'Cada carimbo guarda um lugar, um encontro e uma memória.' : 'Seu mapa começa na primeira cidade carimbada.'}</p></div>
      <svg className="jornada-brasil" viewBox={`0 0 ${MAPA_LARGURA} ${MAPA_ALTURA}`} role="img" aria-labelledby="jornada-mapa-descricao">
        <title id="jornada-mapa-descricao">{visitados.size ? `Brasil com ${[...visitados].sort().join(', ')} destacados. Selecione um estado nos filtros abaixo.` : 'Mapa do Brasil, ainda sem cidades carimbadas.'}</title>
        {estados.map((e) => <path key={e.uf} d={e.d} className={`jornada-uf${visitados.has(e.uf) ? ' visitada' : ''}${uf && uf !== e.uf ? ' apagada' : ''}`} />)}
        {cidades.filter((c) => c.ponto && (!uf || uf === c.uf)).map((c) => <circle key={c.slug} cx={c.ponto[0]} cy={c.ponto[1]} r="4" className="jornada-cidade-ponto"><title>{`${c.nome}/${c.uf} · ${c.visitas.length} passagens`}</title></circle>)}
      </svg>
      <div className="jornada-legenda"><span><i />Estados com carimbos</span><small>Mapa: IBGE · cidades visitadas</small></div>
      {cidades.length > 0 && <div className="jornada-ultimos-carimbos"><p className="jornada-kicker">Últimas conquistas</p><ol>{cidades.slice(0, 3).map((c) => <li key={c.slug}><img src={c.visitas[0].img} alt={`Carimbo de ${c.nome}/${c.uf}`} width={80} height={80} loading="lazy" /><time dateTime={c.visitas[0].dia}>{data(c.visitas[0].dia)}</time></li>)}</ol></div>}
      <div className="jornada-assinatura"><strong>{pessoa.nome}</strong><span>Passaporte nº {String(pessoa.numero).padStart(4, '0')}</span></div>
    </div>

    {cidades.length > 0 && <>
      <div className="jornada-filtros" role="group" aria-label="Filtrar cidades por estado">
        <button type="button" aria-pressed={!uf} onClick={() => filtrar('')}>Todos</button>
        {[...visitados].sort().map((estado) => <button key={estado} type="button" aria-pressed={uf === estado} onClick={() => filtrar(estado)}>{estado}<span>{contagem[estado]}</span></button>)}
      </div>
      <p className="jornada-lista-titulo" aria-live="polite">{uf ? `${lista.length} ${lista.length === 1 ? 'cidade' : 'cidades'} em ${uf}` : 'Últimas cidades carimbadas'}{privado && <span>Toque numa cidade para abrir sua memória.</span>}</p>
      <ol className="jornada-cidades">
        {visiveis.map((c) => <li key={c.slug}>
          <button className="jornada-cidade" type="button" onClick={() => onAbrir(c.visitas[0])} aria-label={`${privado ? 'Abrir memória de' : 'Ver carimbo de'} ${c.nome}/${c.uf}, ${data(c.visitas[0].dia)}`}>
            <img src={c.visitas[0].img} alt="" width={56} height={56} loading="lazy" /><span><strong>{c.nome}<small>{c.uf}</small></strong><time dateTime={c.visitas[0].dia}>{data(c.visitas[0].dia)}</time></span><span aria-hidden="true">↗</span>
          </button>
          {c.visitas.length > 1 && <details className="jornada-passagens"><summary>{c.visitas.length} passagens por aqui</summary><ul>{c.visitas.map((v) => <li key={v.chave}><button type="button" onClick={() => onAbrir(v)}>{data(v.dia)} · {v.visita}ª visita</button></li>)}</ul></details>}
        </li>)}
      </ol>
      {lista.length > 5 && <button type="button" className="jornada-ver-todas" onClick={() => setTodas(!todas)}>{todas ? 'Mostrar últimas cidades' : `Ver todas as ${lista.length} cidades`}</button>}
      <div className="jornada-compartilhar">
        <button type="button" className="selo-btn" onClick={compartilhar} disabled={!arquivo || gerando}>{gerando ? 'Abrindo…' : arquivo ? 'Compartilhar mapa' : 'Preparando imagem…'}</button>
        <button type="button" className="selo-btn secundario" onClick={baixar} disabled={!arquivo}>Baixar mapa</button>
      </div>
      <p className="jornada-dica">Imagem em formato Stories, com seu nome e conquistas. Relatos e fotos das memórias ficam fora da imagem.</p>
      {erro && <div role="alert"><p>{erro}</p>{!arquivo && <button type="button" className="jornada-ver-todas" onClick={() => { setErro(''); setTentativa((n) => n + 1); }}>Preparar novamente</button>}</div>}
    </>}
    {!cidades.length && privado && <a className="selo-btn secundario" href="#carimbar">Carimbar primeira cidade</a>}
    {!cidades.length && !privado && <Link className="selo-text-link" href="/selo/mapa">Conhecer o mapa de carimbos →</Link>}
  </section>;
}
