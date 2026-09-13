import SpaIntro from '../components/SpaIntro';
import RotasHub from '../components/RotasHub';
import Link from 'next/link';

export const metadata = {
  title: 'Planejar Rota de Moto — Roteiros, Combustível e Trechos',
  description: 'Planeje sua viagem de moto: trace a rota, calcule distância, combustível e custo, salve roteiros, veja trechos lendários e expedições da comunidade Pistaviva.',
  alternates: { canonical: '/rotas' },
};

export default async function Page({ searchParams }) {
  const sp = await searchParams;
  const tab = typeof sp?.tab === 'string' ? sp.tab : 'planejar';

  return (
    <>
      <SpaIntro eyebrow="Antes de sair" title="Planeje sua próxima viagem">
        Escolha o caminho, estime combustível e custos e salve seu roteiro. Sua próxima viagem começa aqui.
      </SpaIntro>
      <div className="wrap" style={{ paddingBlock: 24 }}><Link href="/rotas/caminho-dos-diamantes" className="btn btn--primary">Caminho dos Diamantes: mapa, terra e asfalto ↗</Link></div>
      <RotasHub initial={tab} />
    </>
  );
}
