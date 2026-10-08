import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ROTEIROS_CURADOS, getRoteiro, COLECOES } from '../../../lib/roteirosCurados.mjs';
import RouteAccess from '../RouteAccess';
import MonumentExplorer from '../../monumentos/MonumentExplorer';
import MonumentPage from '../../monumentos/MonumentPage';
import '../roteiros.css';
export const dynamicParams = false;
export function generateStaticParams() { return ROTEIROS_CURADOS.filter(r => r.entradas).map(r => ({slug:r.slug})); }
export async function generateMetadata({ params }) {
  const r = getRoteiro((await params).slug);
  if(!r?.entradas) return { title:'Roteiro não encontrado' };
  return { title:`${r.nome} — Roteiro de moto e como chegar`, description:r.resumo, alternates:{canonical:r.href} };
}
export default async function Page({ params }) {
  const r = getRoteiro((await params).slug); if(!r?.entradas) notFound();
  if (r.colecao === 'bikers') return <MonumentPage />;
  const peers = ROTEIROS_CURADOS.filter(p => p.colecao === r.colecao && p.slug !== r.slug);
  return <div className="rc-page"><div className="wrap"><nav className="rc-crumb" aria-label="Trilha de navegação"><Link href="/">Início</Link><span>/</span><Link href="/destinos#explorar">Destinos</Link><span>/ {r.nome}</span></nav><header className={`rc-hero ${r.image || r.colecao === 'bikers' ? 'has-map' : ''}`}><div><p className="rc-kicker">{COLECOES.find(c=>c.id === r.colecao)?.label} / {r.regiao}</p><h1>{r.nome}</h1><p className="rc-lead">{r.resumo}</p><p className="rc-piso">{r.piso}</p>{r.km && <p className="rc-metrics"><strong>{r.km} km</strong><span>{r.etapas} etapas oficiais</span></p>}<a href="#como-chegar" className="rc-button">Planejar minha saída ↗</a></div>{r.colecao === 'bikers' && <figure><img src="/destinos/monumento-biker.png" alt="Escultura do cumprimento biker, referência visual da Rota Biker" width="660" height="1024" /><figcaption>Imagem de referência · <a href={r.fonte} target="_blank" rel="noopener noreferrer">Rota Biker</a></figcaption></figure>}{r.image && <figure><img src={r.image} alt={`Mapa esquemático do ${r.nome}, fornecido como referência visual`} width="246" height="396" /><figcaption>Estrada Real · mapa esquemático</figcaption></figure>}</header>
    <aside className="rc-notice"><strong>Antes de sair</strong><p>{r.alerta}</p>{r.colecao === 'vinicolas' && <p>Vai pilotar? Escolha visita sem degustação alcoólica. Para degustar, deixe a moto estacionada e combine outro transporte.</p>}</aside>
    {r.colecao === 'bikers' ? <MonumentExplorer /> : <RouteAccess roteiro={r} />}
    <section className="rc-notes"><p className="rc-kicker">O que saber sobre este roteiro</p><h2>{r.colecao === 'estrada-real' ? 'Piso, trechos e fontes.' : 'Planeje as paradas.'}</h2>{r.notas.map(n => <p key={n}>{n}</p>)}{r.colecao === 'estrada-real' && <p className="rc-small">Informações históricas do Instituto Estrada Real; não representam levantamento em tempo real. Distâncias de acesso, desvios e pavimentação atual podem diferir.</p>}</section>
    {r.colecao === 'bikers' ? null : r.planilhas ? <section className="rc-stop-list"><h2>Etapas oficiais</h2><p>Abra a planilha de cada etapa para consultar piso, observações e alternativas.</p><ol>{r.planilhas.map(p=><li key={p.url}><a href={p.url} target="_blank" rel="noopener noreferrer">{p.nome} ↗</a></li>)}</ol></section> : <section className="rc-stop-list"><h2>{r.colecao === 'bikers' ? 'Paradas para conhecer' : 'Vinícolas e experiências'}</h2><p>Escolha uma parada no planejador acima para calcular seu acesso.</p>{r.entradas.map((p,i)=><article key={p.query}><span className="rc-stop-number">{String(i+1).padStart(2,'0')}</span><div><h3>{p.nome}</h3><p>{p.nota}</p><p className="rc-small">Localização de referência: {p.query}</p><a className="rc-link" href={p.fonte} target="_blank" rel="noopener noreferrer">Conferir na fonte ↗</a></div></article>)}</section>}
    <section className="rc-sources"><h2>Leve as referências.</h2><a href={r.fonte} target="_blank" rel="noopener noreferrer">Fonte principal do roteiro ↗</a>{r.fontes?.map(f=><a key={f.url} href={f.url} target="_blank" rel="noopener noreferrer">{f.nome} ↗</a>)}{r.gpx && <a href={r.gpx} target="_blank" rel="noopener noreferrer">GPX oficial — confira restrições antes de usar ↗</a>}{r.mapaExterno && <a href={r.mapaExterno} target="_blank" rel="noopener noreferrer">Mapa completo da Rota Biker ↗</a>}<p className="rc-small">Consulta editorial: 13/09/2026. Seleção independente Pista Viva. Confirme condições, endereço e disponibilidade na fonte.</p></section>
    <section className="rc-more"><p className="rc-kicker">Mais destinos na mesma coleção</p>{peers.map(p=><Link key={p.slug} href={p.href}>{p.nome} ↗</Link>)}<Link href="/destinos#explorar">Voltar a todos os destinos ↗</Link></section>
  </div></div>;
}
