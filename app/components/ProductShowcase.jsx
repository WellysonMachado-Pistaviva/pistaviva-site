import Image from 'next/image';
import { CreditCard, ExternalLink, RefreshCw, ShoppingBag, Truck } from 'lucide-react';

const STORE_URL = 'https://www.pistaviva.com.br/pistaviva';

const PRODUCTS = [
  {
    name: 'Domingo',
    image: '/products/domingo.webp',
    detailImage: '/products/domingo-detalhe.webp',
    href: `${STORE_URL}/product/domingo-26a12a8f-1f24-46d0-a028-9df7ebe4601b`,
  },
  {
    name: 'Piloto Físico',
    image: '/products/piloto-fisico.webp',
    detailImage: '/products/piloto-fisico-detalhe.webp',
    href: `${STORE_URL}/product/piloto-fisico-3d7acc26-8962-4d15-bdfb-7c0cb3bed76b`,
  },
  {
    name: 'Tricampeão',
    image: '/products/tricampeao.webp',
    detailImage: '/products/tricampeao-detalhe.webp',
    href: `${STORE_URL}/product/tricampeao`,
  },
  {
    name: 'Cumprimento Biker',
    image: '/products/cumprimento-biker.webp',
    detailImage: '/products/cumprimento-biker-detalhe.webp',
    href: `${STORE_URL}/product/cumprimento-biker`,
  },
];

const BENEFITS = [
  { icon: RefreshCw, title: 'Primeira troca grátis', copy: 'Até 30 dias para trocar' },
  { icon: CreditCard, title: 'Até 6x sem juros', copy: 'Sem valor mínimo' },
  { icon: Truck, title: 'Entrega nacional', copy: 'Envio para todo Brasil' },
];

export default function ProductShowcase() {
  return (
    <section className="home-shop" aria-labelledby="home-shop-title">
      <div className="wrap">
        <div className="home-shop-head">
          <div className="lead">
            <span className="ig-eyebrow">Coleção Pistaviva</span>
            <h2 className="ig-title" id="home-shop-title">Vista o que te move.</h2>
            <p>Camisetas para carregar paixão por motores, curvas e estrada também fora da moto.</p>
          </div>
          <a className="home-shop-all" href={STORE_URL} target="_blank" rel="noopener noreferrer">
            Ver coleção completa <ExternalLink aria-hidden="true" />
          </a>
        </div>

        <div className="home-shop-grid" aria-label="Produtos em destaque">
          {PRODUCTS.map((product) => (
            <article className="product-card" key={product.name}>
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
                  sizes="(max-width: 640px) 78vw, (max-width: 1024px) 42vw, 25vw"
                  className="product-card-image product-card-image--primary"
                />
                <Image
                  src={product.detailImage}
                  alt=""
                  aria-hidden="true"
                  fill
                  sizes="(max-width: 640px) 78vw, (max-width: 1024px) 42vw, 25vw"
                  className="product-card-image product-card-image--detail"
                />
                <span className="product-card-off">15% OFF</span>
                <span className="product-card-gallery" aria-hidden="true">2 fotos</span>
                <span className="product-card-view">Ver detalhes <span aria-hidden="true">↗</span></span>
              </a>

              <div className="product-card-body">
                <div className="product-card-topline">
                  <span>Camiseta</span>
                  <span className="product-card-colors" aria-label="Disponível em preto, branco e cinza">
                    <i className="is-black" aria-hidden="true" />
                    <i className="is-white" aria-hidden="true" />
                    <i className="is-gray" aria-hidden="true" />
                  </span>
                </div>
                <h3>{product.name}</h3>
                <div className="product-card-price">
                  <del>R$ 105,90</del>
                  <strong>R$ 89,90</strong>
                </div>
                <p><b>+3% OFF</b> pagando no Pix · 6x de R$ 14,98</p>
                <a className="product-card-buy" href={product.href} target="_blank" rel="noopener noreferrer">
                  <ShoppingBag aria-hidden="true" /> Comprar <ExternalLink aria-hidden="true" />
                </a>
              </div>
            </article>
          ))}
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
