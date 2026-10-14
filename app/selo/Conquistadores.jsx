'use client';
import { useEffect, useId, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, BookOpen, Search } from 'lucide-react';
import { formatarNumero, SELOS } from '../lib/selo/constantes.mjs';
import { ESTACOES } from '../lib/selo/estacao.mjs';
import { montarRanking } from '../lib/selo/ranking.mjs';
import CompartilharPassaporte from './CompartilharPassaporte';
import './conquistadores.css';

export default function Conquistadores({ compacto = false }) {
  const id = useId();
  const [lista, setLista] = useState(null);
  const [erro, setErro] = useState(false);
  const [tentativa, setTentativa] = useState(0);
  const [ano, setAno] = useState('todos');
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState('todos');
  useEffect(() => {
    let controller;
    async function carregar() {
      controller?.abort();
      const atual = new AbortController(); controller = atual;
      try {
        const r = await fetch('/api/selo/conquistadores', { cache: 'no-store', signal: atual.signal });
        if (!r.ok) throw new Error('mural');
        const dados = await r.json();
        if (!Array.isArray(dados.conquistas)) throw new Error('mural');
        if (!atual.signal.aborted) { setLista(dados.conquistas); setErro(false); }
      } catch (e) { if (e.name !== 'AbortError') { setLista(null); setErro(true); } }
    }
    const atualizar = () => { if (document.visibilityState === 'visible') carregar(); };
    carregar();
    document.addEventListener('visibilitychange', atualizar);
    window.addEventListener('focus', atualizar);
    return () => { controller?.abort(); document.removeEventListener('visibilitychange', atualizar); window.removeEventListener('focus', atualizar); };
  }, [tentativa]);
  const anos = [...new Set((lista || []).map((item) => item.ano))].sort((a, b) => b - a);
  const comunidade = montarRanking(lista);
  const ranking = montarRanking(lista, { ano, busca }).filter(p => filtro === 'todos' || (filtro === 'completos' ? p.anos.some(a => a.total === 4) : !p.anos.some(a => a.total === 4)));
  const cidades = new Set(comunidade.map(p => `${p.cidade}/${p.uf}`)).size;
  const completos = comunidade.reduce((n, p) => n + p.anos.filter(a => a.total === 4).length, 0);
  const retry = () => { setErro(false); setTentativa((valor) => valor + 1); };
  return <section className={`selo-mural${compacto ? ' selo-mural--compacto' : ''}`} aria-labelledby={`${id}-titulo`}>
    <header className="selo-mural-header"><span className="selo-mural-kicker">Pessoas reais. Caminhos vividos.</span><h2 id={`${id}-titulo`}>{compacto ? <>Quem já está<br /><em>fazendo história.</em></> : <>Nomes que ficam.<br /><em>Histórias que inspiram.</em></>}</h2><p>Tem quem esteja no primeiro carimbo. Tem quem já tenha voltado nas quatro estações. Cada passaporte guarda um motivo para pegar a estrada de novo.</p></header>
    {!compacto && lista && !erro && comunidade.length > 0 && <dl className="conquista-numeros"><div><dd>{comunidade.length}</dd><dt>{comunidade.length === 1 ? 'passaporte publicado' : 'passaportes publicados'}</dt></div><div><dd>{cidades}</dd><dt>{cidades === 1 ? 'cidade representada' : 'cidades representadas'}</dt></div><div><dd>{completos}</dd><dt>{completos === 1 ? 'coleção anual completa' : 'coleções anuais completas'}</dt></div></dl>}
    {!compacto && <div className="selo-ranking-filtros">
      <label htmlFor={`${id}-busca`}>Encontre um motociclista<span className="selo-ranking-busca"><Search size={18} aria-hidden="true" /><input id={`${id}-busca`} type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Nome ou cidade" /></span></label>
      <label htmlFor={`${id}-ano`}>Coleção<select id={`${id}-ano`} value={ano} onChange={(e) => setAno(e.target.value)}><option value="todos">Todos os anos</option>{anos.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
    </div>}
    {!compacto && <div className="conquista-filtros" role="group" aria-label="Filtrar conquistas">{[['todos', 'Todos os passaportes'], ['completos', 'Anos completos'], ['caminho', 'Em coleção']].map(([valor, texto]) => <button key={valor} type="button" aria-pressed={filtro === valor} onClick={() => setFiltro(valor)}>{texto}</button>)}</div>}
    <div className="selo-ranking-legenda"><span>Ranking / {ano === 'todos' ? 'Todas as coleções' : ano}</span><span>1 selo confirmado = 1 ponto</span></div>
    {erro ? <div className="selo-mural-vazio" role="status"><p>Não foi possível carregar os conquistadores.</p><button type="button" onClick={retry}>Tentar novamente</button></div>
      : !lista ? <p className="selo-ranking-status" role="status">Carregando histórias e conquistas…</p>
      : !ranking.length ? <div className="selo-mural-vazio" role="status"><BookOpen size={32} aria-hidden="true" /><h3>{busca ? 'Nenhum motociclista encontrado.' : 'A próxima história pode ser a sua.'}</h3><p>{busca || filtro !== 'todos' ? 'Tente outro nome, cidade ou filtro.' : 'Visite o Parque, confirme seus selos e autorize sua coleção. Seu nome também pode estar aqui.'}</p>{(busca || filtro !== 'todos') ? <button type="button" onClick={() => { setBusca(''); setFiltro('todos'); }}>Limpar filtros</button> : <Link className="study-button" href="/selo">Começar minha história ↗</Link>}</div>
      : <><p className="selo-ranking-contagem" aria-live="polite">{ranking.length} {ranking.length === 1 ? 'motociclista' : 'motociclistas'}{compacto && ranking.length > 3 ? ' · 3 em destaque' : ''}</p><ol className="selo-ranking-lista">{ranking.slice(0, compacto ? 3 : ranking.length).map((pessoa) => {
        const colecao = pessoa.anos[0];
        const fechados = pessoa.anos.filter(a => a.total === 4).length;
        return <li key={pessoa.numero}><article className="selo-ranking-pessoa">
          <div className="selo-ranking-posicao"><span className="sr-only">Posição </span>{pessoa.posicao}<small>posição</small></div>
          <div className="selo-ranking-identidade"><span className="selo-mural-kicker">Passaporte nº {formatarNumero(pessoa.numero)}</span><h3><Link href={`/selo/conquistadores/${pessoa.numero}`}>{pessoa.nome}<ArrowUpRight size={18} aria-hidden="true" /></Link></h3><p>{pessoa.cidade} / {pessoa.uf}</p><span className="conquista-distincao">{fechados ? `${fechados} ${fechados === 1 ? 'ano completo' : 'anos completos'} · Conquistador de Itajubá` : 'Colecionando histórias'}</span><span className="selo-ranking-pontos"><strong>{pessoa.total}</strong> {pessoa.total === 1 ? 'selo confirmado' : 'selos confirmados'}</span></div>
          <div className="selo-ranking-passaporte"><div className="selo-ranking-passaporte-topo"><BookOpen size={15} aria-hidden="true" /><span>Coleção {colecao.ano}</span><b>{colecao.total}/4</b></div><div className="selo-ranking-selos">{Object.entries(ESTACOES).map(([chave, estacao]) => {
            const confirmado = colecao.etapas.some((etapa) => etapa.estacao === chave && etapa.confirmadoEm);
            return <div key={chave} className={confirmado ? 'is-confirmado' : ''} title={`${estacao.nome}: ${confirmado ? 'confirmado' : 'não confirmado'}`}>{confirmado ? <img src={SELOS[chave]} alt={`${estacao.nome}: selo confirmado`} width={52} height={60} loading="lazy" /> : <span className="conquista-espaco" aria-label={`${estacao.nome}: ainda não confirmado`}>+</span>}<span>{estacao.nome}</span></div>;
          })}</div><progress value={colecao.total} max={4} aria-label={`Coleção ${colecao.ano}: ${colecao.total} de 4 estações confirmadas`} /><small>{colecao.total === 4 ? 'Quatro estações. Uma história completa.' : colecao.total === 3 ? 'Falta uma estação para fechar este ano.' : colecao.total === 0 ? 'Toda história começa com uma chegada.' : 'O próximo carimbo já tem lugar reservado.'}</small></div>
          <div className="conquista-card-acoes"><Link href={`/selo/conquistadores/${pessoa.numero}`}>Abrir passaporte <ArrowUpRight size={18} aria-hidden="true" /></Link><CompartilharPassaporte numero={pessoa.numero} nome={pessoa.nome} compacto /></div>
        </article></li>;
      })}</ol></>}
    <p className="selo-ranking-nota">Somente selos confirmados entram no ranking. Empates compartilham a mesma posição.</p>
    {!compacto && <aside className="conquista-convite"><div><p className="study-kicker">O próximo capítulo é seu</p><h3>Imagine seu nome.<br /><em>Seu passaporte. Sua história.</em></h3><p>Faça sua visita, confirme o selo e autorize a publicação da coleção. Depois da aprovação, seu passaporte ganha lugar aqui.</p></div><div><Link className="study-button" href="/selo">Quero fazer parte <ArrowUpRight size={19} aria-hidden="true" /></Link><Link className="conquista-recuperar" href="/selo/meu-numero">Já tenho passaporte →</Link></div></aside>}
    <footer><Link href={compacto ? '/selo/mural' : '/selo'}>{compacto ? 'Ver todos os conquistadores' : 'Começar minha coleção'}<ArrowUpRight size={19} aria-hidden="true" /></Link></footer>
  </section>;
}
