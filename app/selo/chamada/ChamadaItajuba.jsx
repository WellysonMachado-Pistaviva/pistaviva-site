import Link from 'next/link';
import './chamada.css';

// Chamada fixa das páginas de cidade e região: o selo da estação só se
// conquista em Itajubá. O objetivo é trazer o motociclista para cá.
export default function ChamadaItajuba({ cidade = null }) {
  return (
    <aside className="chamada-itajuba" aria-labelledby="chamada-itajuba-titulo">
      <img src="/selo/artes/verao.svg" alt="" width={120} height={120} loading="lazy" />
      <div>
        <p className="chamada-itajuba-kicker">Itajubá · Serra da Mantiqueira · MG</p>
        <h2 id="chamada-itajuba-titulo">{cidade ? `Saindo de ${cidade}? Sua próxima parada é Itajubá.` : 'Todo caminho leva a Itajubá.'}</h2>
        <p>O selo da estação só se conquista no Parque da Cidade de Itajubá: um por estação do ano, com número único no seu passaporte. Feche as quatro e vire Conquistador.</p>
        <div className="chamada-itajuba-acoes">
          <Link className="chamada-itajuba-btn" href="/selo">Garantir meu selo em Itajubá</Link>
          <Link className="chamada-itajuba-link" href="/parque-da-cidade">Como chegar ao Parque →</Link>
        </div>
      </div>
    </aside>
  );
}
