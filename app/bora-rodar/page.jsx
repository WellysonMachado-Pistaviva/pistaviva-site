import SpaIntro from '../components/SpaIntro';
import BoraRodar from '../components/BoraRodar';

const BASE = 'https://www.pistavivamototurismo.com.br';
export const revalidate = 3600;

export const metadata = {
  title: 'Bora Rodar? — Condições pra Andar de Moto na Sua Cidade',
  description: 'Veja se está bom pra rodar de moto hoje e nos próximos 7 dias: clima, chuva, vento e o índice de pilotagem da sua cidade. A previsão do tempo feita pra motociclista.',
  alternates: { canonical: '/bora-rodar' },
  openGraph: { title: 'Bora Rodar? · Pistaviva', description: 'O clima pra andar de moto na sua cidade — hoje e nos próximos 7 dias.', url: `${BASE}/bora-rodar`, type: 'website' },
};

export default function Page() {
  const faqLd = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'Como saber se está bom pra andar de moto hoje?', acceptedAnswer: { '@type': 'Answer', text: 'Informe sua cidade no Bora Rodar do Pistaviva. Ele mostra chuva, vento e temperatura de hoje e dos próximos 7 dias, com um índice de pilotagem (bom, atenção ou ruim) pra você decidir se vale a estrada.' } },
      { '@type': 'Question', name: 'Qual a melhor previsão do tempo pra motociclista?', acceptedAnswer: { '@type': 'Answer', text: 'A que considera o que importa pra moto: probabilidade de chuva, vento e temperatura, não só o ícone do dia. O Bora Rodar do Pistaviva calcula um índice de pilotagem com esses fatores e ainda aponta a melhor janela do dia.' } },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <SpaIntro eyebrow="Antes de cada rolê" title="Bora Rodar?">
        Veja se tá pra rodar de moto na sua cidade — hoje e nos próximos 7 dias. Chuva, vento, temperatura e o índice de pilotagem, do jeito que o motociclista precisa.
      </SpaIntro>
      <div className="wrap" style={{ paddingBottom: 'clamp(28px,5vw,52px)' }}>
        <BoraRodar />
      </div>
    </>
  );
}
