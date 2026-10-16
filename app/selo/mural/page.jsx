import Link from 'next/link';
import Conquistadores from '../Conquistadores';
import SeloNav from '../SeloNav';
import '../selo-publico.css';
export const metadata = { title: 'Conquistadores de Itajubá' };

export default function MuralPage() {
  return <div className="pv-study selo-public-page passaporte-universo">
    <SeloNav />
    <div className="study-container selo-publico">
      <header className="passaporte-cabecalho" aria-labelledby="conquistadores-titulo">
        <p className="study-kicker">Passaporte do motociclista / Comunidade</p>
        <h1 id="conquistadores-titulo">Conquistadores.<br /><em>Histórias na estrada.</em></h1>
        <p>Cada nome tem um passaporte. Conheça as coleções publicadas por quem passou por Itajubá e conquistou seus selos.</p>
        <a className="study-button" href="#ranking">Ver os conquistadores</a>
        <Link className="passaporte-amostra-link" href="/selo/passaporte/modelo#amostra-passaporte">Ver uma amostra do passaporte preenchido →</Link>
      </header>
      <div id="ranking"><Conquistadores /></div><p className="selo-dica">Esta coleção registra as visitas ao Parque da Cidade de Itajubá.</p><Link className="selo-publico-voltar" href="/parque-da-cidade">Planejar minha visita ao Parque →</Link>
    </div>
  </div>;
}
