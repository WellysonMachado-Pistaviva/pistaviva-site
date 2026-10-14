import Link from 'next/link';
import { ArrowUpRight, BookOpen, MapPinned, Stamp } from 'lucide-react';
import EditorialHero from '../components/EditorialHero';
import Cover from '../components/Cover';
import { localValido } from '../lib/selo/constantes.mjs';
import { ESTACOES, estacaoDe } from '../lib/selo/estacao.mjs';
import SeloForm from './SeloForm';
import PassaporteMockup from './PassaporteMockup';
import Vantagens from './Vantagens';
import Conquistadores from './Conquistadores';
import { PARQUE_COORD, PARQUE_ENDERECO } from '../parque-da-cidade/dados';
import DestinationRoute from '../components/DestinationRoute';
import './selo-landing.css';

export const dynamic = 'force-dynamic';
// A entrada é pública e deve aparecer no Google; as telas internas do Selo seguem fora (layout).
export const metadata = {
  title: 'Selo da Estação · Passaporte do motociclista em Itajubá',
  description: 'Registre sua visita ao Parque da Cidade de Itajubá, colecione o selo de cada estação no passaporte do motociclista e ganhe cafezinho, 10% de desconto e almoço ao fechar o ano.',
  robots: { index: true, follow: true },
  alternates: { canonical: '/selo' },
};

export default async function SeloPage({ searchParams }) {
  const { local } = await searchParams;
  const { estacao, ano } = estacaoDe();
  return (
    <div className="pv-study selo-landing">
      <EditorialHero id="selo-titulo" eyebrow="Pistaviva / Selo da Estação"
        title={<>Itajubá.<br />Quatro estações.<br /><em>Sua história.</em></>}
        image="/selo/parque-aereo.webp" imageAlt="Vista aérea do Parque da Cidade de Itajubá, com o lago e as montanhas da Mantiqueira"
        action={{ href: '#selo-cadastro', label: 'Registrar minha visita' }}
        footer={<><span>Parque da Cidade · Itajubá, MG</span><span>{ESTACOES[estacao].nome} / {ano}</span></>}>
        Cada chegada merece uma lembrança. Carimbo no passaporte da Rota Biker, adesivo da estação e mais uma história para levar com você.
      </EditorialHero>
      <nav className="study-container study-shortcuts" aria-label="Explore o Selo da Estação">
        {[
          { href: '#selo-cadastro', icon: Stamp, title: 'Registre sua visita', subtitle: 'Comece sua coleção em Itajubá' },
          { href: '/selo/meu-numero', icon: BookOpen, title: 'Acesse sua coleção', subtitle: 'Já veio? Encontre seu selo' },
          { href: '#selo-mapa', icon: MapPinned, title: 'Encontre sua parada', subtitle: 'Veja o Parque no mapa e trace sua rota' },
        ].map(({ href, icon: Icon, title, subtitle }, index) => (
          <Link href={href} key={href}><Icon aria-hidden="true" /><span><small>0{index + 1} / SEU PASSAPORTE</small><strong>{title}</strong><span>{subtitle}</span></span><ArrowUpRight aria-hidden="true" /></Link>
        ))}
      </nav>
      <section className="study-container selo-jornada" aria-labelledby="selo-jornada-titulo">
        <header className="study-heading">
          <div><p className="study-kicker">Memórias da Mantiqueira</p><h2 id="selo-jornada-titulo">O passeio passa.<br />A história fica.</h2></div>
          <p>Uma parada no Parque, uma nova marca no passaporte. Colecione as estações e acompanhe suas visitas a Itajubá.</p>
        </header>
        <section className="selo-vitrine" aria-labelledby="selo-vitrine-titulo">
          <div className="selo-vitrine-copy">
            <p className="study-kicker">Passaporte Rota Biker / Itajubá</p>
            <h3 id="selo-vitrine-titulo">Tem lembrança<br />que a gente<br /><em>guarda no papel.</em></h3>
            <p>O carimbo da chegada. O adesivo escolhido com cuidado. As páginas que, aos poucos, viram um pedaço da sua história.</p>
            <span className="selo-edicao">EDIÇÃO {ano}<br />QUATRO ESTAÇÕES · MUITOS CAMINHOS</span>
            <Link className="selo-text-link" href="#selo-cadastro">Começar minha coleção <ArrowUpRight size={18} aria-hidden="true" /></Link>
          </div>
          <div className="selo-passaporte-mesa">
            <span className="selo-mesa-nota">Lembranças de uma boa estrada.</span>
            <PassaporteMockup estacao={estacao} ano={ano} />
          </div>
        </section>
        <div className="selo-registro-grid">
          <div className="selo-passaporte-editorial">
            <div className="selo-como">
              <p className="study-kicker">Do caminho para a coleção</p>
              <ol>
                <li><b>01</b><span><strong>Faça sua parada no Parque</strong>Registre sua passagem pelo Parque da Cidade de Itajubá.</span></li>
                <li><b>02</b><span><strong>Leve a estação com você</strong>Confirme sua visita no balcão para receber o carimbo e o adesivo no passaporte da Rota Biker.</span></li>
                <li><b>03</b><span><strong>Guarde cada conquista</strong>Acesse sua coleção digital e acompanhe a certificação das suas visitas.</span></li>
              </ol>
              <p className="study-kicker selo-vantagens-titulo">Itajubá recebe bem o motociclista</p>
              <Vantagens />
              <p className="selo-regra">1 adesivo físico + versão digital por pessoa, em cada estação do ano. Já cadastrou? Seu selo continua o mesmo. Os próximos ficam bloqueados até a estação chegar.</p>
              <Link className="selo-text-link" href="/selo/mural">Conheça os Conquistadores de Itajubá <ArrowUpRight size={18} aria-hidden="true" /></Link>
              <Link className="selo-text-link" href="/selos">Veja todos os selos colecionáveis <ArrowUpRight size={18} aria-hidden="true" /></Link>
            </div>
          </div>
          <section id="selo-cadastro" className="selo-cadastro" aria-labelledby="selo-cadastro-titulo">
            <header className="selo-cadastro-topo"><p className="study-kicker">Sua próxima conquista / {ESTACOES[estacao].nome} · {ano}</p><h2 id="selo-cadastro-titulo">Registre<br />sua visita.</h2><p>Use sempre seu WhatsApp pessoal para manter uma única coleção.</p></header>
            <SeloForm local={localValido(local)} />
          </section>
        </div>
      </section>
      <section id="selo-mapa" className="study-container selo-mapa" aria-labelledby="selo-mapa-titulo">
        <header className="study-heading">
          <div><p className="study-kicker">Sua próxima parada / Mantiqueira</p><h2 id="selo-mapa-titulo">O caminho leva.<br />Itajubá recebe.</h2></div>
          <p>Coloque o Parque da Cidade no roteiro. A próxima página do seu passaporte começa aqui.</p>
        </header>
        <DestinationRoute name="Parque da Cidade de Itajubá" coordinates={[PARQUE_COORD.lat, PARQUE_COORD.lng]} />
        <p className="selo-mapa-endereco">{PARQUE_ENDERECO}</p>
      </section>
      <div className="study-container selo-comunidade"><Conquistadores compacto /></div>
      <section className="study-editorial selo-parque" aria-labelledby="selo-parque-titulo">
        <div className="study-container study-editorial-grid">
          <div className="study-editorial-photo"><Cover src="/selo/parque-circuito.webp" alt="Caminhos à beira do lago e espaços de convivência do Parque da Cidade de Itajubá" sizes="(max-width: 640px) 100vw, 50vw" /></div>
          <div><p className="study-kicker">Itajubá / Capital da Mantiqueira</p><h2 id="selo-parque-titulo">Uma parada.<br /><em>Muitos encontros.</em></h2><p>Entre o lago e as montanhas, faça uma pausa no caminho. Conheça o Parque da Cidade e deixe espaço no passaporte para a próxima estação.</p><Link className="study-button study-button-outline" href="/parque-da-cidade">Conheça o Parque <ArrowUpRight size={20} aria-hidden="true" /></Link></div>
        </div>
      </section>
    </div>
  );
}
