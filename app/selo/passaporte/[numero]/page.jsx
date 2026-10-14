import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CORUJA, SELOS, formatarNumero } from '../../../lib/selo/constantes.mjs';
import { ESTACOES } from '../../../lib/selo/estacao.mjs';
import { passaportePublico } from '../../../lib/selo/store';
import PassaporteCidades from '../../PassaporteCidades';

export const dynamic = 'force-dynamic';
// Página de pessoa: aberta só com autorização, mas fora da busca.
export async function generateMetadata({ params }) {
  const { numero } = await params;
  const base = { title: 'Passaporte do motociclista', robots: { index: false, follow: false } };
  if (!/^[1-9]\d{0,14}$/.test(numero)) return base;
  return { ...base, title: `Passaporte nº ${formatarNumero(Number(numero))} · Rota Biker`, description: 'Cidades da Rota Biker carimbadas com GPS e foto, e estações confirmadas em Itajubá.' };
}

const ORDEM = ['verao', 'outono', 'inverno', 'primavera'];

export default async function PassaportePublicoPage({ params }) {
  const { numero } = await params;
  if (!/^[1-9]\d{0,14}$/.test(numero)) notFound();
  const p = await passaportePublico(Number(numero));
  if (!p) notFound();
  const estacoes = [...p.estacoes].sort((a, b) => a.ano - b.ano || ORDEM.indexOf(a.estacao) - ORDEM.indexOf(b.estacao));
  return (
    <div className="selo-wrap selo-pilha selo-passaporte">
      <header className="selo-topo"><img src={CORUJA} alt="" width={56} height={56} /><div><span className="selo-kicker">Passaporte nº {formatarNumero(p.numero)}</span><h1>{p.nome}</h1><p>{p.cidade} · {p.uf}</p></div></header>
      <PassaporteCidades entradas={p.entradas} titulo="Por onde passou na Rota Biker" />
      {estacoes.length > 0 && <section className="selo-cartao" aria-labelledby="pp-estacoes">
        <span className="selo-kicker">Itajubá nas 4 Estações · confirmadas no balcão</span>
        <h2 id="pp-estacoes">{estacoes.length} {estacoes.length === 1 ? 'estação' : 'estações'} no Parque da Cidade</h2>
        <ol className="selo-carimbos">
          {estacoes.map((e) => <li key={`${e.estacao}-${e.ano}`}><img src={SELOS[e.estacao]} alt={`Selo ${ESTACOES[e.estacao].nome} ${e.ano}`} width={120} height={120} loading="lazy" /><span className="selo-carimbo-vez">{e.ano}</span></li>)}
        </ol>
      </section>}
      <p className="selo-dica">Cada carimbo de cidade exige estar dentro do município (GPS conferido no servidor) e tirar a foto na hora.</p>
      <Link className="selo-btn" href="/selo">Começar meu passaporte</Link>
    </div>
  );
}
