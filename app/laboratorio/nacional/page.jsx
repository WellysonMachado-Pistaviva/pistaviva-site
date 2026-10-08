import IndiceNacional from './IndiceNacional';
import '../camadas/camadas.css';

// Protótipo interno: fora do sitemap e com noindex.
export const metadata = {
  title: 'Índice nacional de passagem — protótipo',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <main className="lab-page">
    <p className="lab-kicker">Laboratório Pistaviva · protótipo</p>
    <h1>O mapa que falta:<br />onde a rede passa<br />e ninguém atende.</h1>
    <p>O mapa dos monumentos mostra onde alguém decidiu erguer um. Este mostra o contrário: por onde o mototurismo realmente circula no Brasil, município por município, e onde essa passagem não encontra nenhuma parada. Cada corredor é a rota rodoviária real entre dois monumentos vizinhos.</p>
    <IndiceNacional />
  </main>;
}
