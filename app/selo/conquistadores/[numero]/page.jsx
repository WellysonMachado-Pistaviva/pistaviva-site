import Link from 'next/link';
import { notFound } from 'next/navigation';
import { listarConquistas } from '../../../lib/selo/store';
import { montarRanking } from '../../../lib/selo/ranking.mjs';
import { formatarNumero } from '../../../lib/selo/constantes.mjs';
import PassaporteLivro from '../../PassaporteLivro';
import CompartilharPassaporte from '../../CompartilharPassaporte';
import CompartilharCartao from '../../CompartilharCartao';
import '../../selo-publico.css';

export const dynamic = 'force-dynamic';
export async function generateMetadata({ params }) {
  const { numero } = await params;
  const base = { title: 'Passaporte público · Conquistadores de Itajubá', robots: { index: false, follow: false } };
  if (!/^[1-9]\d{0,14}$/.test(numero)) return base;
  const titulo = `Passaporte nº ${formatarNumero(Number(numero))} · Conquistadores de Itajubá`;
  const imagem = { url: `/selo/conquistadores/${numero}/cartao`, width: 1200, height: 630, alt: 'Selos das estações conquistados em Itajubá' };
  return {
    ...base, title: titulo,
    description: 'Quatro estações, um passaporte. Veja a coleção e comece a sua no Parque da Cidade de Itajubá.',
    openGraph: { title: titulo, images: [imagem], type: 'profile' },
    twitter: { card: 'summary_large_image', images: [imagem.url] },
  };
}

export default async function PassaportePublico({ params }) {
  const { numero } = await params;
  if (!/^[1-9]\d{0,14}$/.test(numero)) notFound();
  const ranking = montarRanking(await listarConquistas(true));
  const pessoa = ranking.find((p) => String(p.numero) === numero);
  if (!pessoa) notFound();
  return <div className="pv-study selo-public-page">
    <div className="study-container selo-publico">
      <Link className="selo-publico-voltar" href="/selo/mural">← Todos os Conquistadores</Link>
      <header className="selo-perfil-topo">
        <div><p className="study-kicker">Passaporte público / Nº {formatarNumero(pessoa.numero)}</p><h1>{pessoa.nome}</h1><p>{pessoa.cidade} · {pessoa.uf}</p></div>
        <div className="selo-perfil-posicao"><strong>{pessoa.posicao}º</strong><span>no ranking geral</span></div>
      </header>
      <dl className="selo-perfil-stats">
        <div><dt>Selos confirmados</dt><dd>{pessoa.total}</dd></div>
        <div><dt>Coleções completas</dt><dd>{pessoa.anos.filter((a) => a.total === 4).length}</dd></div>
        <div><dt>Anos publicados</dt><dd>{pessoa.anos.length}</dd></div>
      </dl>
      <PassaporteLivro pessoa={pessoa} />
      <section className="conquista-social" aria-labelledby="conquista-social-titulo">
        <header><p className="study-kicker">Da estrada para a sua turma</p><h2 id="conquista-social-titulo">História boa<br /><em>merece companhia.</em></h2><p>Leve esta coleção para os Stories ou para o grupo de viagem. Quem sabe o próximo carimbo não vem com companhia?</p></header>
      <CompartilharCartao imagem={`/selo/conquistadores/${pessoa.numero}/cartao?formato=story`} link={`/selo/conquistadores/${pessoa.numero}?utm_source=passaporte&utm_medium=stories&utm_campaign=selo`}
        texto="Olha o passaporte desse motociclista em Itajubá." rotulo="Compartilhar esta conquista" />
      </section>
      <div className="selo-perfil-acoes"><CompartilharPassaporte numero={pessoa.numero} nome={pessoa.nome} /><Link className="selo-text-link" href="/selo">Quero começar minha coleção ↗</Link><Link className="selo-text-link" href="/selos">Ver todos os selos ↗</Link></div>
      <p className="selo-dica">Somente anos autorizados pelo participante e aprovados pela equipe. O ranking soma estações confirmadas no balcão; pontuações iguais compartilham a posição.</p>
    </div>
  </div>;
}
