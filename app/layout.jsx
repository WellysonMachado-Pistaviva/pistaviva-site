import { Bricolage_Grotesque, Newsreader, Space_Mono, Poppins } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import '../src/index.css';
import '../src/App.css';
import 'leaflet/dist/leaflet.css';
import './globals.css';
import AuthProvider from './components/AuthProvider';
import SiteHeader from './components/SiteHeader';
import SiteFooter from './components/SiteFooter';
import AnnouncementBar from './components/AnnouncementBar';

const display = Bricolage_Grotesque({ subsets: ['latin'], weight: ['700', '800'], variable: '--font-display', display: 'swap' });
const serif = Newsreader({ subsets: ['latin'], weight: ['400', '500', '600'], style: ['normal', 'italic'], variable: '--font-serif', display: 'swap' });
const mono = Space_Mono({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-mono', display: 'swap' });
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-sans', display: 'swap' });

const SITE_URL = 'https://moto.pistaviva.com.br';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Pistaviva — Mototurismo, Rotas e Cultura sobre Duas Rodas',
    template: '%s · Pistaviva',
  },
  description:
    'A maior comunidade aberta de mototurismo do Brasil. Rotas Big Trail com GPX, preparação de viagem, blog, eventos e cultura de quem vive sobre duas rodas.',
  applicationName: 'Pistaviva',
  keywords: ['mototurismo', 'big trail', 'rotas de moto', 'GPX', 'Serra da Mantiqueira', 'viagem de moto', 'comunidade motociclista'],
  authors: [{ name: 'Pistaviva' }],
  alternates: { canonical: '/' },
  robots: { index: true, follow: true, 'max-image-preview': 'large' },
  openGraph: {
    type: 'website',
    siteName: 'Pistaviva',
    locale: 'pt_BR',
    url: SITE_URL,
    title: 'Pistaviva — Mototurismo, Rotas e Cultura sobre Duas Rodas',
    description: 'Comunidade aberta de mototurismo: rotas, GPX, eventos, blog e cultura sobre duas rodas.',
    images: [{ url: '/icon.png', width: 800, height: 800, alt: 'Pistaviva Mototurismo' }],
  },
  twitter: { card: 'summary_large_image', title: 'Pistaviva — Mototurismo no Brasil', images: ['/icon.png'] },
  manifest: '/manifest.webmanifest',
  icons: { icon: '/favicon.png', shortcut: '/favicon.png', apple: '/apple-touch-icon.png' },
  verification: { google: '3dZUKqyMzKSjim6TjsEW-9JgEhf-JyVBHef_SU7hFUI' },
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
        description: 'Comunidade aberta de mototurismo do Brasil: rotas com GPX, paradas, eventos, blog e cultura sobre duas rodas.',
        areaServed: { '@type': 'Country', name: 'Brasil' },
        knowsAbout: ['mototurismo', 'viagem de moto', 'Big Trail', 'rotas de moto', 'motociclismo'],
        sameAs: ['https://www.instagram.com/pistaviva'],
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#site`,
        url: `${SITE_URL}/`,
        name: 'Pistaviva',
        inLanguage: 'pt-BR',
        publisher: { '@id': `${SITE_URL}/#org` },
        potentialAction: {
          '@type': 'SearchAction',
          target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/busca?q={search_term_string}` },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };

  return (
    <html lang="pt-BR" className={`${display.variable} ${serif.variable} ${mono.variable} ${poppins.variable}`}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
        <div className="topo" aria-hidden="true" />
        <AuthProvider>
          <div className="ed-stack">
            <AnnouncementBar />
            <SiteHeader />
            <main id="app" style={{ flex: 1 }}>{children}</main>
            <SiteFooter />
          </div>
        </AuthProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
