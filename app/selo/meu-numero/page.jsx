import Link from 'next/link';
import '../selo-publico.css';
import RecuperarForm from './RecuperarForm';
import SeloNav from '../SeloNav';

export const metadata = { title: 'Recuperar meu passaporte' };

export default function MeuNumeroPage() {
  return (
    <div className="pv-study selo-public-page passaporte-universo">
      <SeloNav />
      <div className="study-container selo-recuperar">
        <header><p className="study-kicker">Pistaviva / Seu cadastro</p><h1>Seu passaporte.<br /><em>Sua história guardada.</em></h1><p>Entre com telefone e senha. Se esqueceu, recupere com os dados do cadastro e o código que você guardou.</p><Link className="selo-publico-voltar" href="/selo/passaporte">← Voltar ao passaporte</Link></header>
        <section className="selo-recuperar-form" aria-label="Recuperar acesso ao passaporte"><RecuperarForm /></section>
      </div>
    </div>
  );
}
