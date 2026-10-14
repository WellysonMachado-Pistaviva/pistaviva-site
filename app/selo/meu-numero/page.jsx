import Link from 'next/link';
import '../selo-publico.css';
import RecuperarForm from './RecuperarForm';

export const metadata = { title: 'Esqueci meu número' };

export default function MeuNumeroPage() {
  return (
    <div className="pv-study selo-public-page">
      <div className="study-container selo-recuperar">
        <header><p className="study-kicker">Pistaviva / Seu passaporte</p><h1>Sua coleção.<br /><em>Sua história.</em></h1><p>Encontre seu número e continue de onde parou.</p><Link className="selo-publico-voltar" href="/selo">← Voltar ao Selo da Estação</Link></header>
        <section className="selo-recuperar-form" aria-label="Recuperar meu número"><p>Digite o WhatsApp que você informou no Selo. Não informou? Peça seu número no balcão: a equipe acha pelo seu nome.</p><RecuperarForm /></section>
      </div>
    </div>
  );
}
