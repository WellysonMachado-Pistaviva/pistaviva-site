import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatarNumero } from '../../../lib/selo/constantes.mjs';
import { carregarPassaportePublico } from '../../passaportePublico';
import PassaporteUnico from '../../PassaporteUnico';
import CompartilharPassaporte from '../../CompartilharPassaporte';
import CompartilharCartao from '../../CompartilharCartao';
import SeloNav from '../../SeloNav';
import '../../selo-publico.css';

export const dynamic = 'force-dynamic';
const valido = (n) => /^[1-9]\d{0,14}$/.test(n);

export async function generateMetadata({ params }) {
  const { numero } = await params;
  const base = { title: 'Passaporte do motociclista', robots: { index: false, follow: false } };
  if (!valido(numero)) return base;
  const titulo = `Passaporte nº ${formatarNumero(Number(numero))} · Pista Viva`;
  const imagem = { url: `/selo/conquistadores/${numero}/cartao`, width: 1200, height: 630, alt: 'Carimbos do passaporte do motociclista' };
  return {
    ...base, title: titulo,
    description: 'Cidades do Brasil carimbadas pelo GPS, mapa pessoal e estações confirmadas em Itajubá, num passaporte só.',
    openGraph: { title: titulo, images: [imagem], type: 'profile' },
    twitter: { card: 'summary_large_image', images: [imagem.url] },
  };
}

export default async function PassaportePublicoPage({ params }) {
  const { numero } = await params;
  if (!valido(numero)) notFound();
  const dados = await carregarPassaportePublico(numero);
  if (!dados) notFound();
  const { pessoa } = dados;
  return (
    <div className="pv-study selo-public-page">
      <SeloNav />
      <div className="study-container">
        <PassaporteUnico {...dados} acoes={<CompartilharPassaporte numero={pessoa.numero} nome={pessoa.nome} compacto />} />
        <section className="conquista-social" aria-labelledby="conquista-social-titulo">
          <header><p className="study-kicker">Histórias de estrada</p><h2 id="conquista-social-titulo">Cada carimbo,<br /><em>uma conquista.</em></h2><p>Leve este passaporte para os Stories ou para o grupo de viagem.</p></header>
          <CompartilharCartao imagem={`/selo/conquistadores/${pessoa.numero}/cartao?formato=story`} link={`/selo/passaporte/${pessoa.numero}?utm_source=passaporte&utm_medium=stories&utm_campaign=selo`}
            texto="Olha o passaporte desse motociclista na Pista Viva." rotulo="Compartilhar este passaporte" />
        </section>
        <div className="selo-perfil-acoes"><Link className="selo-btn" href="/selo/passaporte">Começar meu passaporte</Link><Link className="selo-text-link" href="/selo/mural">Todos os Conquistadores ↗</Link></div>
        <p className="selo-dica">Cada carimbo de cidade exige estar dentro do município: o GPS é conferido no servidor. Selos de estação só contam depois da confirmação no balcão do Parque.</p>
      </div>
    </div>
  );
}
