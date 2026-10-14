import './selo.css';

export const metadata = {
  title: { default: 'Selo da Estação', template: '%s · Selo da Estação' },
  description: 'Colecione as estações no Parque da Cidade de Itajubá. Registro presencial, controle dos adesivos e certificação da coleção anual.',
  robots: { index: false, follow: false },
};

// A entrada usa a navegação do site. Telas operacionais mantêm o modo de balcão;
// selo.css identifica a entrada pelo marcador .selo-landing.
export default function SeloLayout({ children }) {
  return <div className="selo-app">{children}</div>;
}
