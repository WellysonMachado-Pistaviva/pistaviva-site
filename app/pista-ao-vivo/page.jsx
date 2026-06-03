import SpaPage from '../components/SpaPage';
import SpaIntro from '../components/SpaIntro';

export const metadata = {
  title: 'Pista ao Vivo',
  description: 'Acompanhe a estrada em tempo real com a comunidade Pistaviva.',
  alternates: { canonical: '/pista-ao-vivo' },
};

export default function Page() {
  return (
    <>
      <SpaIntro eyebrow="GPS ao vivo" title="Pista ao Vivo — Motociclistas na Estrada">
        Acompanhe a estrada em tempo real com a comunidade Pistaviva. Transmissão de localização GPS ao vivo de motociclistas rodando agora.
      </SpaIntro>
      <SpaPage name="pistaAoVivo" />
    </>
  );
}
