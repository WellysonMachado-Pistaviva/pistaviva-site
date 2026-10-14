import './selos.css';

export const metadata = {
  title: { default: 'Selos colecionáveis', template: '%s · Selos colecionáveis' },
  description: 'Selos colecionáveis do passaporte do motociclista: estações de Itajubá e paradas oficiais da Serra da Mantiqueira, com verificação no local.',
};

export default function SelosLayout({ children }) {
  return <div className="pv-study selos">{children}</div>;
}
