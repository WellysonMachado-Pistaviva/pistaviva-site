import Image from 'next/image';
import { CreditCard, ExternalLink, RefreshCw, ShoppingBag, Truck } from 'lucide-react';
import EmblaCarousel from './EmblaCarousel';

const STORE_URL = 'https://www.pistaviva.com.br/pistaviva';

const BEST_SELLERS = [
  {
    name: 'Eu amo meu Piloto',
    image: '/products/eu-amo-meu-piloto.webp',
    href: `${STORE_URL}/product/eu-amo-meu-piloto-7e272706-1d6e-4705-a50e-0085636d6bd8`,
  },
  {
    name: 'Hoje não posso, vou andar de moto',
    image: '/products/hoje-nao-posso.webp',
    href: `${STORE_URL}/product/hoje-nao-posso-vou-andar-de-moto-28757bcc-096e-468f-a0e6-3f3a7545e499`,
  },
  {
    name: 'Eu amo minha garupa',
    image: '/products/eu-amo-minha-garupa.webp',
    href: `${STORE_URL}/product/eu-amo-minha-garupa-ab2ac4c8-a43b-4b75-8f78-db814a2beac5`,
  },
  {
    name: 'O melhor caminho se faz de moto',
    image: '/products/melhor-caminho.webp',
    href: `${STORE_URL}/product/o-melhor-caminho-se-faz-de-moto-9fb7eb3d-d5dc-423e-9f72-70c67fbd394e`,
  },
];

const MORE_PRODUCTS = [
  {
    name: 'Domingo',
    image: '/products/domingo.webp',
    href: `${STORE_URL}/product/domingo-26a12a8f-1f24-46d0-a028-9df7ebe4601b`,
  },
  {
    name: 'Piloto Físico',
    image: '/products/piloto-fisico.webp',
    href: `${STORE_URL}/product/piloto-fisico-3d7acc26-8962-4d15-bdfb-7c0cb3bed76b`,
  },
  {
    name: 'Tricampeão',
    image: '/products/tricampeao.webp',
    href: `${STORE_URL}/product/tricampeao`,
  },
  {
    name: 'Cumprimento Biker',
    image: '/products/cumprimento-biker.webp',
    href: `${STORE_URL}/product/cumprimento-biker`,
  },
];

const BENEFITS = [
  { icon: RefreshCw, title: 'Primeira troca grátis', copy: 'Até 30 dias para trocar' },
  { icon: CreditCard, title: 'Até 6x sem juros', copy: 'Sem valor mínimo' },
  { icon: Truck, title: 'Entrega nacional', copy: 'Envio para todo Brasil' },
];

const COMMUNITY_PHOTO = {
  src: '/products/community/casal-moto-real.jpg',
  alt: 'Casal motociclista usando camisetas Pistaviva ao lado de uma moto',
  caption: 'Paixão que vai junto.',
};

function PriorityProductCard({ product }) {
  return (
    <a
      className="priority-product"
      href={product.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Comprar camiseta ${product.name}`}
    >
      <span className="priority-product-media">
        <Image
          src={product.image}
          alt={`Camiseta ${product.name}`}
          fill
          sizes="(max-width: 850px) 42vw, (max-width: 1050px) 22vw, 18vw"
        />
        <small>Mais vendido</small>
      </span>
      <span className="priority-product-body">
        <strong>{product.name}</strong>
        <span className="priority-product-price">
          <b>R$ 89,90</b>
          <i>Comprar <span aria-hidden="true">↗</span></i>
        </span>
      </span>
    </a>
  );
}

function ProductCard({ product }) {
  return (
    <article className="product-card">
      <a
        className="product-card-media"
        href={product.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Ver camiseta ${product.name}`}
      >
        <Image
          src={product.image}
          alt={`Camiseta ${product.name} da Pistaviva`}
          fill
          sizes="(max-width: 768px) 78vw, (max-width: 1050px) 32vw, 25vw"
          className="product-card-image"
        />
        <span className="product-card-off">15% OFF</span>
        <span className="product-card-view">Ver detalhes <span aria-hidden="true">↗</span></span>
      </a>

      <div className="product-card-body">
        <span className="product-card-category">Camiseta Pistaviva</span>
        <h3>{product.name}</h3>
        <div className="product-card-price">
          <del>R$ 105,90</del>
          <strong>R$ 89,90</strong>
        </div>
        <p><b>+3% OFF</b> no Pix · 6x de R$ 14,98</p>
        <a className="product-card-buy" href={product.href} target="_blank" rel="noopener noreferrer">
          <ShoppingBag aria-hidden="true" /> Comprar <ExternalLink aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}

export default function ProductShowcase() {
  const slides = MORE_PRODUCTS.map((product) => <ProductCard product={product} key={product.name} />);

  return (
    <section className="home-shop" aria-labelledby="home-shop-title">
      <div className="wrap">
        <div className="home-shop-head">
          <div className="lead">
            <span className="ig-eyebrow">Feita para gente de verdade</span>
            <h2 className="ig-title" id="home-shop-title">Quem veste, vive.</h2>
            <p>Camisetas que saem da tela e vão para a pista, a estrada e as histórias de quem ama esse mundo.</p>
          </div>
          <a className="home-shop-all" href={STORE_URL} target="_blank" rel="noopener noreferrer">
            Ver coleção completa <ExternalLink aria-hidden="true" />
          </a>
        </div>

        <div className="home-shop-social-commerce">
          <figure className="community-carousel community-carousel-story community-carousel-story--1">
            <Image
              src={COMMUNITY_PHOTO.src}
              alt={COMMUNITY_PHOTO.alt}
              fill
              sizes="(max-width: 1050px) 100vw, 56vw"
            />
            <figcaption>
              <span>Gente real · paixão real</span>
              <strong>{COMMUNITY_PHOTO.caption}</strong>
              <small>Pistaviva na estrada</small>
            </figcaption>
          </figure>

          <div className="home-shop-priority">
            <div className="home-shop-priority-head">
              <div>
                <span>Favoritos da comunidade</span>
                <strong>Os 4 que mais aceleram</strong>
              </div>
              <small>Mais vendidos</small>
            </div>
            <div className="priority-product-grid">
              {BEST_SELLERS.map((product) => (
                <PriorityProductCard product={product} key={product.name} />
              ))}
            </div>
          </div>
        </div>

        <div className="home-shop-rail-head">
          <div>
            <span className="ig-eyebrow">Mais modelos</span>
            <h3>Escolha a sua.</h3>
          </div>
          <p>Quatro estampas diferentes dos favoritos acima.</p>
        </div>

        <div className="home-shop-carousel" aria-label="Mais camisetas da coleção Pistaviva">
          <EmblaCarousel slides={slides} basis="var(--product-slide-basis)" gap={18} dots />
        </div>

        <div className="home-shop-benefits" aria-label="Benefícios da loja Pistaviva">
          {BENEFITS.map(({ icon: Icon, title, copy }) => (
            <div className="home-shop-benefit" key={title}>
              <Icon aria-hidden="true" />
              <span><strong>{title}</strong><small>{copy}</small></span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
