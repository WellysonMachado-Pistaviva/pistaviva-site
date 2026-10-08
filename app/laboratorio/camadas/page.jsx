import CamadasLab from './CamadasLab';
import './camadas.css';

// Protótipo interno: fora do sitemap e com noindex. Testa o modelo de camadas
// sobre o anel do Sudeste antes de levar a ideia para as páginas públicas.
export const metadata = {
  title: 'Teste de camadas — Anel do Sudeste',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <main className="lab-page">
    <p className="lab-kicker">Laboratório Pistaviva · protótipo</p>
    <h1>Anel do Sudeste<br />em camadas.</h1>
    <p>Teste do modelo de camadas: o mesmo mapa muda de leitura conforme o que você acende. A camada 1 mostra o circuito fechado que liga os monumentos de São Paulo e Minas. A camada 2 acende o chão que esse circuito atravessa — o que o motociclista cruza entre uma parada e a seguinte.</p>
    <CamadasLab />
  </main>;
}
