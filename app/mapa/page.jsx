import SpaPage from '../components/SpaPage';
import SpaIntro from '../components/SpaIntro';
import SeoContent from '../components/SeoContent';

export const metadata = {
  title: 'Mapa Colaborativo de Mototurismo — Paradas e Alertas de Estrada',
  description: 'Mapa vivo da comunidade de moto: paradas amigas do biker, pontos de interesse e alertas de estrada cadastrados por quem roda. Veja e marque pontos pelo Brasil.',
  alternates: { canonical: '/mapa' },
  openGraph: { title: 'Mapa Colaborativo de Mototurismo · Pistaviva', description: 'Paradas, pontos de interesse e alertas de estrada marcados pela comunidade.', type: 'website' },
};

const SECOES = [
  {
    h: 'Um mapa feito por quem roda',
    p: [
      'O mapa colaborativo da Pistaviva reúne, num lugar só, os pontos que importam pra quem viaja de moto: paradas amigas do biker, mirantes, oficinas de confiança, postos com boa estrutura e os perrengues a evitar. Cada ponto é marcado pela própria comunidade — é conhecimento de estrada que normalmente fica preso em grupo de WhatsApp, organizado no mapa.',
      'Em vez de depender só do que o aplicativo de navegação genérico mostra, aqui você enxerga a estrada com olhar de motociclista: onde dá pra esticar a perna com segurança, onde a comida é boa, onde tem sombra pra descansar e onde o asfalto está ruim.',
    ],
  },
  {
    h: 'O que você encontra (e marca) no mapa',
    lista: [
      'Paradas amigas do biker: lanchonetes, pousadas e restaurantes que recebem bem moto.',
      'Pontos de interesse: mirantes, cachoeiras, cidades históricas e curvas clássicas.',
      'Oficinas e postos de confiança pra emergência na estrada.',
      'Alertas da comunidade: trecho de asfalto ruim, ponto de risco, blitz e obras.',
      'Os pontos que você mesmo cadastra pra ajudar quem vem atrás.',
    ],
  },
  {
    h: 'Como usar no planejamento da viagem',
    p: [
      'Antes de cair na estrada, abra o mapa na região do seu destino e veja o que a comunidade já marcou no caminho. Dá pra montar o rolê emendando as melhores paradas, decidir onde abastecer e almoçar e já saber dos trechos que pedem atenção.',
      'Achou um ponto bom que não estava no mapa? Cadastre. Quanto mais piloto contribui, melhor o mapa fica pra todo mundo — é a lógica da comunidade Pistaviva: de quem roda, pra quem roda.',
    ],
  },
];

const FAQS = [
  { q: 'O mapa de mototurismo é gratuito?', a: 'Sim. Ver os pontos e usar o mapa é grátis. Marcar novos pontos também — basta fazer parte da comunidade Pistaviva.' },
  { q: 'Quem cadastra os pontos do mapa?', a: 'A própria comunidade de motociclistas. São paradas, alertas e pontos de interesse marcados por quem roda as estradas do Brasil.' },
  { q: 'Posso usar o mapa pra planejar uma viagem de moto?', a: 'Pode e é a ideia. Veja paradas e alertas no trajeto do seu destino, monte o roteiro emendando os melhores pontos e combine com o planejador de rotas da Pistaviva.' },
  { q: 'Como marco uma parada nova no mapa?', a: 'Abra o mapa, escolha o local e cadastre o ponto com uma descrição. Ele passa a aparecer pra outros motociclistas da comunidade.' },
];

export default function Page() {
  return (
    <>
      <SpaIntro eyebrow="Mapa vivo" title="Mapa Colaborativo de Mototurismo">
        Mapa interativo com paradas, rotas e pontos de interesse para viagens de moto pelo Brasil. Pings, alertas de estrada e pontos da comunidade.
      </SpaIntro>
      <SpaPage name="mapa" />
      <SeoContent secoes={SECOES} faqs={FAQS} />
    </>
  );
}
