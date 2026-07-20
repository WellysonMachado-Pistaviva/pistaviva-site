import { Saira, Saira_Condensed, Saira_Semi_Condensed } from 'next/font/google';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;        // ex: G-XXXXXXXXXX
const ADSENSE_ID = 'ca-pub-3461762705627085';
import '../src/index.css';
import '../src/App.css';
import 'leaflet/dist/leaflet.css';
import './globals.css';
import './design-system.css';
import AuthProvider from './components/AuthProvider';
import AdSenseLoader from './components/AdSenseLoader';
import SiteHeader from './components/SiteHeader';
import SiteFooter from './components/SiteFooter';
import AnnouncementBar from './components/AnnouncementBar';
import MobileShell from './components/MobileShell';

// IGNIS spec: Saira (corpo), Saira Condensed (títulos), Saira Semi Condensed (labels/botões)
const display = Saira_Condensed({ subsets: ['latin'], weight: ['600', '700', '800'], variable: '--font-display', display: 'swap' });
const semi = Saira_Semi_Condensed({ subsets: ['latin'], weight: ['600', '700'], variable: '--font-mono', display: 'swap', preload: false });
const poppins = Saira({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-sans', display: 'swap' });
const serif = Saira({ subsets: ['latin'], weight: ['500'], style: ['italic'], variable: '--font-serif', display: 'swap', preload: false });

const SITE_URL = 'https://www.pistavivamototurismo.com.br';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Pistaviva — Mototurismo, Rotas e Cultura sobre Duas Rodas',
    template: '%s · Pistaviva',
  },
  description:
    'O hub do mototurismo no Brasil: estradas icônicas, desafios com certificado, rotas, paradas mapeadas, guias de viagem e a maior comunidade aberta sobre duas rodas.',
  applicationName: 'Pistaviva',
  keywords: ['mototurismo', 'big trail', 'rotas de moto', 'desafios de moto', 'estradas de moto', 'tabela fipe moto', 'Serra da Mantiqueira', 'viagem de moto', 'comunidade motociclista'],
  authors: [{ name: 'Pistaviva' }],
  alternates: { canonical: '/' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, maxImagePreview: 'large', maxSnippet: -1, maxVideoPreview: -1 } },
  openGraph: {
    type: 'website',
    siteName: 'Pistaviva',
    locale: 'pt_BR',
    url: SITE_URL,
    title: 'Pistaviva — Mototurismo, Rotas e Cultura sobre Duas Rodas',
    description: 'Comunidade aberta de mototurismo: rotas, eventos, blog e cultura sobre duas rodas.',
    // images: gerada automaticamente por app/opengraph-image.js (1200×630)
  },
  twitter: { card: 'summary_large_image', title: 'Pistaviva — Mototurismo no Brasil' },
  manifest: '/manifest.webmanifest',
  icons: { icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }, { url: '/favicon.png' }], shortcut: '/favicon.png', apple: '/apple-touch-icon.png' },
  verification: { google: 'zRMuUqP5QA7_s5uKBemw7SOXzZ17i5VNmmYAGrEi0x4' },
  other: { 'google-adsense-account': 'ca-pub-3461762705627085' },
};

export const viewport = {
  themeColor: '#0e1311',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#org`,
        name: 'Pistaviva',
        alternateName: 'Pista Viva Mototurismo',
        url: `${SITE_URL}/`,
        logo: { '@type': 'ImageObject', url: `${SITE_URL}/pwa-512x512.png`, width: 512, height: 512 },
        image: `${SITE_URL}/icon.png`,
        description: 'O hub do mototurismo brasileiro: estradas icônicas, desafios com certificado, rotas, paradas, eventos e a comunidade aberta sobre duas rodas.',
        areaServed: { '@type': 'Country', name: 'Brasil' },
        knowsAbout: ['mototurismo', 'viagem de moto', 'Big Trail', 'rotas de moto', 'motociclismo'],
        sameAs: ['https://www.instagram.com/pistavivaoficial'],
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#site`,
        url: `${SITE_URL}/`,
        name: 'Pistaviva',
        inLanguage: 'pt-BR',
        publisher: { '@id': `${SITE_URL}/#org` },
      },
    ],
  };

  return (
    <html lang="pt-BR" className={`${display.variable} ${serif.variable} ${semi.variable} ${poppins.variable}`}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
        <div className="topo" aria-hidden="true" />
        <AuthProvider>
          <div className="ed-stack">
            <AnnouncementBar />
            <MobileShell />
            <SiteHeader />
            <main id="app" style={{ flex: 1 }}>{children}</main>
            <SiteFooter />
          </div>
        </AuthProvider>
        <Analytics />
        <SpeedInsights />

        {GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="lazyOnload" />
            <Script id="ga4" strategy="lazyOnload">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
            </Script>
          </>
        )}
        <AdSenseLoader client={ADSENSE_ID} />

        {/* Reader Revenue Manager (openaccess) — monetização de leitor via Google */}
        <Script
          async
          type="application/javascript"
          src="https://news.google.com/swg/js/v1/swg-basic.js"
          strategy="afterInteractive"
        />
        <Script id="rrm-swg-basic" strategy="afterInteractive">
          {`(self.SWG_BASIC = self.SWG_BASIC || []).push( basicSubscriptions => {
            basicSubscriptions.init({
              type: "NewsArticle",
              isPartOfType: ["Product"],
              isPartOfProductId: "CAowouvgCw:openaccess",
              clientOptions: { theme: "light", lang: "pt-BR" },
            });
          });`}
        </Script>
      </body>
    </html>
  );
}
