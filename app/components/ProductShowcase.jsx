import Image from 'next/image';
import { CreditCard, ExternalLink, RefreshCw, Truck } from 'lucide-react';

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

export default function ProductShowcase() {
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
