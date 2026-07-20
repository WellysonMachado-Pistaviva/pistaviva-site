import EstradaXDownload from '../components/EstradaXDownload';
import EstradaXLogo from '../components/EstradaXLogo';
import { Route, Smartphone, UsersRound } from 'lucide-react';

export const metadata = {
  title: 'Estrada X + Pistaviva — baixe o app da maior comunidade de motociclistas do Brasil',
  description: 'Parceria Pistaviva + Estrada X. Baixe grátis o app da maior comunidade de motociclistas do Brasil e rode com a gente. Disponível para iPhone e Android.',
  alternates: { canonical: '/estrada-x' },
  openGraph: {
    title: 'Estrada X + Pistaviva',
    description: 'Baixe o app da maior comunidade de motociclistas do Brasil. Parceria oficial Pistaviva + Estrada X.',
    images: ['/estrada-x-logo.png'],
  },
};

export default function EstradaXPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Estrada X',
    applicationCategory: 'TravelApplication',
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

          <h1>Baixe o app da maior comunidade de motociclistas do Brasil</h1>
          <p className="exd-lead">
            Pistaviva e <b>Estrada X</b> juntos pela estrada. Baixe grátis o app que conecta
            milhares de motociclistas pelo Brasil — comunidade, encontros e companhia de viagem
            sobre duas rodas. Toque e instale agora:
          </p>

          <EstradaXDownload />

          <p className="exd-note">Grátis · iPhone e Android</p>
        </div>
      </section>

      <section className="exd-body">
        <div className="wrap">
          <h2>Por que Pistaviva + Estrada X</h2>
          <p>
            A Pistaviva organiza o mototurismo — rotas, paradas amigas do motociclista, fotógrafos
            de estrada e o planejador de rolê. O Estrada X reúne a maior comunidade de motociclistas
            do país. Juntos, a gente conecta quem ama rodar: você planeja a viagem aqui e encontra
            a galera lá.
          </p>

          <div className="exd-feats">
            <div className="exd-feat"><span className="ic"><UsersRound size={30} /></span><div><b>Comunidade</b><p>Milhares de motociclistas conectados pelo Brasil.</p></div></div>
            <div className="exd-feat"><span className="ic"><Route size={30} /></span><div><b>Rota + galera</b><p>Planeje no Pistaviva, role com a comunidade do Estrada X.</p></div></div>
            <div className="exd-feat"><span className="ic"><Smartphone size={30} /></span><div><b>Grátis</b><p>Baixe sem pagar nada, no iPhone ou no Android.</p></div></div>
          </div>

          <div className="exd-cta2">
            <h2>Bora rodar junto?</h2>
            <EstradaXDownload />
          </div>
        </div>
      </section>
    </div>
  );
}
