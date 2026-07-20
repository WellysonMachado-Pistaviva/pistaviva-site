import SpaIntro from '../components/SpaIntro';
import RotasHub from '../components/RotasHub';

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
        Trace a rota com modo curvas, calcule distância, combustível e custo, salve seus roteiros e veja trechos lendários e expedições da comunidade. Tudo num lugar só, antes de cair na estrada.
      </SpaIntro>
      <RotasHub initial={tab} />
    </>
  );
}
