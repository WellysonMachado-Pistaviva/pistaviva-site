import Aneis from './Aneis';
import '../camadas/camadas.css';

// Protótipo interno: fora do sitemap e com noindex.
export const metadata = {
  title: 'Anéis da Rota Biker — protótipo',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <main className="lab-page">
    <p className="lab-kicker">Laboratório Pistaviva · protótipo</p>
    <h1>Fechou um anel,<br />entra no próximo.</h1>
    <p>Circuitos fechados ligando só monumentos prontos — os que carimbam. Cada nível compartilha paradas com o anterior, então quem termina um já está dentro do seguinte. A escada vai do fim de semana à viagem de duas semanas, somando monumentos até fechar a rede.</p>
    <Aneis />
  </main>;
}
