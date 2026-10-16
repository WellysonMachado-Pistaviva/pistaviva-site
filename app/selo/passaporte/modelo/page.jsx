import GeradorPassaporte from '../GeradorPassaporte';
import SeloNav from '../../SeloNav';
import '../../selo-publico.css';
import './modelo.css';

export const metadata = {
  title: 'Teste seu passaporte do motociclista',
  description: 'Veja um modelo preenchido com carimbos e personalize nome e foto antes de criar seu passaporte.',
  robots: { index: false, follow: false },
};

// Link de demonstração aberto a qualquer visitante, inclusive quem já tem
// passaporte salvo no aparelho. Testar não altera a coleção dessa pessoa.
export default function ModeloPassaportePage() {
  return <div className="pv-study selo-public-page passaporte-modelo-page passaporte-identidade">
    <SeloNav />
    <div className="study-container ph">
      <header><p className="study-kicker">Passaporte do motociclista</p><h1 className="ph-h2">Veja como fica<br /><em>o seu passaporte.</em></h1></header>
      <GeradorPassaporte modelo />
    </div>
  </div>;
}
