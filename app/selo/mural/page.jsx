import Link from 'next/link';
import EditorialHero from '../../components/EditorialHero';
import Conquistadores from '../Conquistadores';
import SeloNav from '../SeloNav';
import '../selo-publico.css';
export const metadata = { title: 'Conquistadores de Itajubá' };

export default function MuralPage() {
  return <div className="pv-study selo-public-page">
    <SeloNav />
    <EditorialHero id="conquistadores-titulo" eyebrow="Pistaviva / Passaportes da comunidade"
      title={<>A estrada conhece<br /><em>o seu nome.</em></>}
      image="/motosul/g-chegada.jpg" imageAlt="Motociclistas chegando a um encontro em Itajubá"
      action={{ href: '#ranking', label: 'Conheça os conquistadores' }}
      footer={<><span>Conquistadores de Itajubá</span><a href="#ranking">Conheça as coleções ↓</a></>}>
      O carimbo prova a chegada. O passaporte conta a história. Conheça quem está deixando sua marca em Itajubá — e venha escrever a sua.
    </EditorialHero>
    <div className="study-container selo-publico" id="ranking"><Conquistadores /><p className="selo-dica">O passaporte físico é da Rota Biker. Esta coleção registra as visitas ao Parque da Cidade de Itajubá.</p><Link className="selo-publico-voltar" href="/parque-da-cidade">Planejar minha visita ao Parque →</Link></div>
  </div>;
}
