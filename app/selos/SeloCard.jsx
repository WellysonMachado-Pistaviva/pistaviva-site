import { pessoas } from './dados';
import CartaoSelo from '../selo/cartao/CartaoSelo';

// Card de selo do catálogo (estação) ou de parada oficial, no padrão único
// dos selos. Sem "+": estação e parada se conquistam no balcão, não por GPS.
export default function SeloCard({ href, arte, nome, etiqueta, total }) {
  const etiquetas = [etiqueta && { texto: etiqueta }, total != null && { texto: pessoas(total), tom: total > 0 ? 'sim' : undefined }].filter(Boolean);
  return <CartaoSelo href={href} arte={arte || '/selo/artes/coruja-selo.svg'} nome={nome} etiquetas={etiquetas} />;
}
