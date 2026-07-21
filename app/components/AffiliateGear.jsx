'use client';

import Image from 'next/image';
import { ExternalLink } from 'lucide-react';

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

        <div className="affiliate-grid">
          {PRODUCTS.map((product, index) => (
            <article className={`affiliate-card${product.featured ? ' is-featured' : ''}`} key={product.itemId}>
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
                  sizes={product.featured ? '(max-width: 768px) 90vw, 42vw' : '(max-width: 768px) 90vw, 28vw'}
                />
                <span className="affiliate-card-number">0{index + 1}</span>
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
          ))}
        </div>

        <p className="home-affiliate-disclosure">
          Publicidade · Links de afiliado. Pistaviva pode receber comissão pela compra, sem custo adicional para você.
        </p>
      </div>
    </section>
  );
}
