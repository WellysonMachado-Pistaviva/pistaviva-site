import Link from 'next/link';
import EstradaXDownload from '../components/EstradaXDownload';
import EstradaXLogo from '../components/EstradaXLogo';
import { Route, Smartphone, UsersRound } from 'lucide-react';

export const metadata = {
  title: 'Estrada X: app para motociclistas no Android e iPhone',
  description: 'Conheça o app Estrada X, veja como baixar no Android ou iPhone e compartilhar fotos, vídeos e relatos de viagem. Links para Google Play e App Store.',
  alternates: { canonical: '/estrada-x' },
  openGraph: {
    title: 'Estrada X + Pistaviva',
    description: 'App Estrada X para Android e iPhone: comunidade, fotos e relatos de viagem. Acesse as lojas pelo guia da Pistaviva.',
    images: ['/estrada-x-logo.png'],
  },
};

export default function EstradaXPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Estrada X',
    applicationCategory: 'SocialNetworkingApplication',
    operatingSystem: 'iOS, Android',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
    downloadUrl: [
      'https://apps.apple.com/br/app/estrada-x/id6764478794',
      'https://play.google.com/store/apps/details?id=com.cbc.estradax',
    ],
  };

  return (
    <div className="ignis exd-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="exd-hero">
        <div className="wrap">
          <p className="eyebrow eyebrow--moss">Parceria oficial</p>

          <div className="exd-cobrand">
            <span className="exd-brand">PISTA<span className="x">VIVA</span></span>
            <span className="exd-plus">×</span>
            <span className="exd-logo">
              {/* Asset opcional: coloque /public/estrada-x-logo.png */}
              <EstradaXLogo size={64} />
              <span className="exd-brand exd-brand--x">ESTRADA<span className="x">X</span></span>
            </span>
          </div>

          <h1>Estrada X: app para motociclistas no Android e iPhone</h1>
          <p className="exd-lead">
            O <b>Estrada X</b> é uma rede social para compartilhar fotos, vídeos e relatos de viagem.
            Escolha a loja do seu celular para conhecer o aplicativo e instalar.
          </p>

          <EstradaXDownload />

          <p className="exd-note">Download nas lojas oficiais · Confira recursos e condições no aplicativo</p>
        </div>
      </section>

      <section className="exd-body">
        <div className="wrap">
          <h2>Por que Pistaviva + Estrada X</h2>
          <p>
            A Pistaviva organiza o mototurismo. O Estrada X fica responsável por compilar as rotas
            e as paradas amigas do motociclista, e a Pistaviva leva essa informação até o motociclista.
            Uma parceria estratégica e bem curada.
          </p>

          <div className="exd-feats">
            <div className="exd-feat"><span className="ic"><UsersRound size={30} /></span><div><b>Comunidade</b><p>Compartilhe fotos, vídeos e atualizações das suas viagens.</p></div></div>
            <div className="exd-feat"><span className="ic"><Route size={30} /></span><div><b>Rota + galera</b><p>Planeje no Pistaviva, role com a comunidade do Estrada X.</p></div></div>
            <div className="exd-feat"><span className="ic"><Smartphone size={30} /></span><div><b>Android e iPhone</b><p>Confira compatibilidade e condições na loja do seu aparelho.</p></div></div>
          </div>

          <h2>Como baixar o Estrada X</h2>
          <ol>
            <li>Escolha App Store no iPhone ou Google Play no Android.</li>
            <li>Confira nome, compatibilidade e descrição do aplicativo na loja.</li>
            <li>Instale e siga as orientações de cadastro apresentadas no app.</li>
          </ol>
          <h2>O Estrada X é gratuito?</h2>
          <p>A App Store apresenta o download como gratuito. Isso não garante que todos os recursos sejam gratuitos: confira planos e condições dentro do aplicativo antes de contratar.</p>
          <h2>Posso planejar minha viagem na Pistaviva?</h2>
          <p>Sim. Use nosso <Link href="/rotas">planejador de rotas</Link>, consulte os <Link href="/guias">guias de viagem de moto</Link> e encontre <Link href="/eventos">eventos e encontros</Link>. Para compartilhar sua experiência no Estrada X, acesse o aplicativo.</p>
          <h2>Onde encontrar suporte?</h2>
          <p>Dúvidas de conta, acesso e cobrança devem ser encaminhadas ao suporte indicado na loja do aplicativo. A Pistaviva apresenta o parceiro e os links de download.</p>
          <p>Fontes consultadas em 11/09/2026: <a href="https://apps.apple.com/br/app/estrada-x/id6764478794" target="_blank" rel="noopener noreferrer">App Store</a> e <a href="https://play.google.com/store/apps/details?id=com.cbc.estradax" target="_blank" rel="noopener noreferrer">Google Play</a>.</p>

          <div className="exd-cta2">
            <h2>Bora rodar junto?</h2>
            <EstradaXDownload />
          </div>
        </div>
      </section>
    </div>
  );
}
