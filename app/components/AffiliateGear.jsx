'use client';

import Image from 'next/image';
import { ExternalLink } from 'lucide-react';

const FEATURED_PRODUCTS = [
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
    name: 'Câmera de ação Insta360 X4 8K',
    shortName: 'Insta360 X4 8K',
    category: 'Registre a viagem',
    description: 'Câmera 360° em 8K para gravar cada trecho da estrada em altíssima definição.',
    image: '/affiliates/camera-insta360-x4.webp',
    href: 'https://meli.la/1AodEJ1',
    itemId: 'MLB4413590409',
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

        <div className="home-affiliate-grid" aria-label="Produtos afiliados Pistaviva">
          {FEATURED_PRODUCTS.map((product, index) => (
            <AffiliateCard product={product} index={index} key={product.itemId} />
          ))}
        </div>

        <p className="home-affiliate-disclosure">
          Publicidade · Links de afiliado. Pistaviva pode receber comissão pela compra, sem custo adicional para você.
        </p>
      </div>
    </section>
  );
}
