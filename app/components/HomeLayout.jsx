import Link from 'next/link';
import { ArrowUpRight, Compass, Route, Users } from 'lucide-react';
import Cover from './Cover';
import HomeExperiences from './HomeExperiences';
import DestinationGallery from './HomeDestinationGallery';
import HomeMonuments from './HomeMonuments';
import '../home-experience.css';
import './home-layout.css';

export default function HomeLayout({ preview = false }) {
  return (
    <div className="pv-study">
      {preview && <div className="study-note"><span>Layout aprovado · Pistaviva</span><Link href="/preview-layout/anterior">Comparar com home anterior ↗</Link></div>}
      <section className="study-hero" aria-labelledby="study-title">
        <Cover src="/materias/bmw-motorrad-fest-2026/comboio-serra.jpg" alt="Comboio de motociclistas percorrendo a serra" priority />
        <div className="study-hero-shade" aria-hidden="true" />
        <div className="study-container study-hero-content">
          <p className="study-kicker">Pistaviva / Pessoas. Lugares. Histórias.</p>
          <h1 id="study-title">A estrada chama.<br /><em>Viva o caminho.</em></h1>
          <p>Uma serra, uma boa parada, gente para encontrar.<br />Sua próxima história começa quando você sai.</p>
          <a className="study-button" href="#descobrir">Encontre seu destino <ArrowUpRight aria-hidden="true" /></a>
          <div className="study-hero-foot"><span>01 / Pelo caminho, novas histórias</span><a href="#descobrir">Explore mais ↓</a></div>
        </div>
      </section>
      <nav className="study-container study-shortcuts" aria-label="Planeje sua próxima saída">
        {[{ href: '#descobrir', icon: Compass, title: 'Escolha o destino', subtitle: 'Encontre seu próximo horizonte' }, { href: '/rotas', icon: Route, title: 'Desenhe o caminho', subtitle: 'Planeje sua rota e suas paradas' }, { href: '/eventos', icon: Users, title: 'Encontre sua turma', subtitle: 'Veja a agenda de encontros' }].map(({ href, icon: Icon, title, subtitle }, index) => <Link key={href} href={href}><Icon aria-hidden="true" /><span><small>0{index + 1} / ANTES DE SAIR</small><strong>{title}</strong><span>{subtitle}</span></span><ArrowUpRight aria-hidden="true" /></Link>)}
      </nav>
      <DestinationGallery />
      <HomeMonuments />
      <section className="study-campaign" aria-labelledby="study-festival">
        <Cover src="/motosul/hero-publico.jpg" alt="Público reunido no Motosul Festival em Itajubá" sizes="100vw" />
        <div className="study-campaign-shade" aria-hidden="true" />
        <div className="study-container study-campaign-content">
          <p className="study-kicker">Itajubá · Minas Gerais</p>
          <h2 id="study-festival">Vá pela estrada.<br />Fique pelo <em>encontro.</em></h2>
          <p>Motosul Festival. Música, motos e sabores da Mantiqueira.<br />Tem viagem que continua mesmo depois de estacionar.</p>
          <Link className="study-button" href="/motosul">Conheça o Motosul <ArrowUpRight aria-hidden="true" /></Link>
        </div>
        <span className="study-campaign-mark" aria-hidden="true">MOTOSUL / EXPERIÊNCIAS</span>
      </section>
      <HomeExperiences />
      <section className="study-editorial">
        <div className="study-container study-editorial-grid">
          <div className="study-editorial-photo"><Cover src="/motosul/g-chegada.jpg" alt="Motociclistas chegando ao encontro" sizes="(max-width: 760px) 100vw, 50vw" /></div>
          <div><p className="study-kicker">Caderno de bordo / Antes da partida</p><h2>Sua primeira viagem.<br /><em>Uma história inteira.</em></h2><p>Escolha o caminho, prepare a bagagem e deixe espaço para as boas paradas. Um guia para transformar vontade em viagem.</p><Link className="study-button study-button-outline" href="/guias/primeira-viagem-de-moto">Prepare sua viagem <ArrowUpRight aria-hidden="true" /></Link></div>
        </div>
      </section>
      <section className="study-container study-closing"><p className="study-kicker">O próximo capítulo é seu</p><h2>Qual caminho<br />a gente pega?</h2><Link className="study-button" href="/rotas">Planejar minha rota <ArrowUpRight aria-hidden="true" /></Link></section>
    </div>
  );
}
