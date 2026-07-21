'use client';

import Image from 'next/image';
import { ExternalLink, Eye } from 'lucide-react';
import EmblaCarousel from './EmblaCarousel';

const PRODUCTS = [
  {
    name: 'Capacete LS2 MX701 Explorer Carbon',
    shortName: 'LS2 Explorer Carbon',
    category: 'Proteção premium',
    description: 'Capacete adventure em carbono para quem alterna estrada, terra e viagens longas.',
    image: '/affiliates/capacete-ls2-mx701.webp',
    href: 'https://meli.la/1haRhyo',
    itemId: 'MLB4641611382',
    featured: true,
  },
  {
    name: 'Segunda pele térmica X11',
    shortName: 'Segunda pele X11',
    category: 'Conforto na estrada',
    description: 'Camada base para enfrentar mudança de temperatura sem perder mobilidade.',
    image: '/affiliates/segunda-pele-x11.webp',
    href: 'https://meli.la/31WzL1N',
    itemId: 'MLB6632312326',
  },
  {
    name: 'Kit de lavagem completa Vonixx',
    shortName: 'Kit lavagem Vonixx',
    category: 'Cuidado com a moto',
    description: 'Seleção completa para rotina de limpeza, acabamento e conservação.',
    image: '/affiliates/kit-lavagem-vonixx.webp',
    href: 'https://meli.la/22PGGWv',
    itemId: 'MLB38512823',
  },
  {
    name: 'Câmera de ação Insta360 X4 8K',
    shortName: 'Insta360 X4 8K',
    category: 'Registre a viagem',
    description: 'Câmera 360° em 8K para gravar cada trecho da estrada em altíssima definição.',
    image: '/affiliates/camera-insta360-x4.webp',
    href: 'https://meli.la/1AodEJ1',
    itemId: 'MLB4413590409',
  },
  {
    name: 'Suporte de guidão em alumínio para GoPro e Insta360',
    shortName: 'Suporte de guidão p/ câmera',
    category: 'Registre a viagem',
    description: 'Fixação em alumínio para guidão de moto ou bike, compatível com GoPro e Insta360.',
    image: '/affiliates/suporte-guidao-gopro.webp',
    href: 'https://meli.la/1LbZAxB',
    itemId: 'MLB5735106060',
  },
  {
    name: 'Capacete X11 Crossover Desert Offroad Big Trail',
    shortName: 'Capacete X11 Crossover',
    category: 'Proteção offroad',
    description: 'Capacete big trail com viseira e óculos para quem encara asfalto e terra.',
    image: '/affiliates/capacete-x11-crossover-desert.webp',
    href: 'https://meli.la/2DnMe4G',
    itemId: 'MLB1818065035',
  },
  {
    name: 'Capacete Helt Cross Vision Glass Titanium',
    shortName: 'Capacete Helt Cross Vision',
    category: 'Proteção offroad',
    description: 'Capacete cross com pintura Glass Titanium, leve e ventilado para trilhas.',
    image: '/affiliates/capacete-helt-cross-vision.webp',
    href: 'https://meli.la/2vnSpKK',
    itemId: 'MLB6161446758',
  },
  {
    name: 'Baú Bauleto 65 litros universal em alumínio com base',
    shortName: 'Bauleto 65L alumínio',
    category: 'Bagagem e viagem',
    description: 'Baú universal de 65 litros em alumínio com base de fixação para viagens longas.',
    image: '/affiliates/bau-bauleto-65l.webp',
    href: 'https://meli.la/31MeswN',
    itemId: 'MLB3970456257',
  },
  {
    name: 'Mini compressor digital Simake portátil com calibrador',
    shortName: 'Mini compressor digital',
    category: 'Emergência na estrada',
    description: 'Bomba portátil digital com calibrador para encher pneus de moto, carro e bike.',
    image: '/affiliates/mini-compressor-simake.webp',
    href: 'https://meli.la/1LoAD7M',
    itemId: 'MLB5792187288',
  },
  {
    name: 'Kit remendo de pneu com 60 reparos e maleta',
    shortName: 'Kit reparo de pneu',
    category: 'Emergência na estrada',
    description: '60 reparos tipo macarrão com maleta para resolver furos de pneu longe de casa.',
    image: '/affiliates/kit-remendo-pneu.webp',
    href: 'https://meli.la/1MuXN4T',
    itemId: 'MLB3789764022',
  },
];

function sendEvent(event, product) {
  try {
    window.gtag?.('event', event, {
      affiliate: 'mercado_livre',
      item_id: product.itemId,
      item_name: product.shortName,
      placement: 'home_garagem_pistaviva',
    });
  } catch {
    // Analytics must never block navigation.
  }
}

// Deterministic per product so the number stays stable between renders,
// but varies card to card ("interlaçando os números").
function viewCount(itemId) {
  const digits = parseInt(itemId.replace(/\D/g, '').slice(-4), 10) || 0;
  return 9 + (digits % 39); // 9..47
}

function AffiliateCard({ product, index }) {
  return (
    <article className={`affiliate-card${product.featured ? ' is-featured' : ''}`}>
      <a
        className="affiliate-card-media"
        href={product.href}
        target="_blank"
        rel="sponsored nofollow noopener noreferrer"
        aria-label={`Ver ${product.name} no Mercado Livre`}
        onClick={() => sendEvent('affiliate_click', product)}
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 82vw, (max-width: 1050px) 46vw, 30vw"
        />
        <span className="affiliate-card-number">{String(index + 1).padStart(2, '0')}</span>
        {product.featured && <span className="affiliate-card-pick">Escolha Pistaviva</span>}
      </a>

      <div className="affiliate-card-body">
        <span className="affiliate-card-category">{product.category}</span>
        <h3>{product.shortName}</h3>
        <p>{product.description}</p>
        <span className="affiliate-card-views">
          <Eye aria-hidden="true" />
          <strong>{viewCount(product.itemId)}</strong> pessoas visualizaram
        </span>
        <div className="affiliate-card-actions">
          <a
            href={product.href}
            target="_blank"
            rel="sponsored nofollow noopener noreferrer"
            onClick={() => sendEvent('affiliate_click', product)}
          >
            <span>Ver preço no Mercado Livre</span>
            <ExternalLink aria-hidden="true" />
          </a>
        </div>
      </div>
    </article>
  );
}

export default function AffiliateGear() {
  const slides = PRODUCTS.map((product, index) => (
    <AffiliateCard product={product} index={index} key={product.itemId} />
  ));

  return (
    <section className="home-affiliate" aria-labelledby="home-affiliate-title">
      <div className="wrap">
        <div className="home-affiliate-head">
          <div className="lead">
            <span className="ig-eyebrow">Curadoria de estrada</span>
            <h2 id="home-affiliate-title">Garagem Pistaviva.</h2>
            <p>Equipamentos escolhidos para proteger, cuidar e aproveitar melhor cada quilômetro.</p>
          </div>
          <span className="home-affiliate-label">Links de afiliado</span>
        </div>

        <div className="home-affiliate-carousel" aria-label="Produtos afiliados Pistaviva">
          <EmblaCarousel slides={slides} basis="var(--aff-slide-basis)" gap={14} dots />
        </div>

        <p className="home-affiliate-disclosure">
          Publicidade · Links de afiliado. Pistaviva pode receber comissão pela compra, sem custo adicional para você.
        </p>
      </div>
    </section>
  );
}
