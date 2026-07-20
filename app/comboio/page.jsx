import SpaPage from '../components/SpaPage';
import SpaIntro from '../components/SpaIntro';
import SeoContent from '../components/SeoContent';

export const metadata = {
  title: 'Comboio em Tempo Real — Rode em Grupo com Rastreamento ao Vivo',
  description: 'Crie um comboio e rode em grupo de moto com rastreamento ao vivo, chat e ponto de encontro. Mantenha o grupo junto na estrada sem ninguém se perder.',
  alternates: { canonical: '/comboio' },
  openGraph: { title: 'Comboio em Tempo Real · Pistaviva', description: 'Rode em grupo com rastreamento ao vivo, chat e localização do comboio.', type: 'website' },
};

const SECOES = [
  {
    h: 'O que é o comboio Pistaviva',
    p: [
      'Comboio é o jeito de rodar em grupo sem ninguém ficar pra trás. Você cria uma sala, manda o link pra galera e todo mundo aparece no mapa em tempo real — dá pra ver quem já saiu, quem parou no posto e quem furou a saída. Funciona no navegador do celular, sem instalar app.',
      'A ideia nasceu de um perrengue conhecido de quem viaja de moto em bando: o grupo se espalha no primeiro semáforo, um pega o trevo errado e o rolê vira uma caça ao colega perdido. Com o rastreamento ao vivo, o líder enxerga o pelotão inteiro e ninguém roda no escuro.',
    ],
  },
  {
    h: 'Como funciona, passo a passo',
    lista: [
      'Crie o comboio e dê um nome pro rolê (ex.: "Serra da Canastra · domingo").',
      'Compartilhe o link no grupo do WhatsApp — quem abrir entra na hora, sem cadastro.',
      'Cada piloto aparece no mapa com sua posição ao vivo enquanto roda.',
      'Use o chat pra combinar parada, reagrupar no posto ou avisar de buraco e blitz.',
      'No fim do rolê, é só fechar o comboio — nada fica gravado depois.',
    ],
  },
  {
    h: 'Dicas pra rodar em grupo com segurança',
    p: [
      'Comboio bom é comboio combinado antes de ligar a moto. Defina o piloto da frente (abre caminho e dita o ritmo) e o da varredura (fecha o grupo e não deixa ninguém pra trás). O ritmo é sempre o do mais devagar — pressa em grupo é receita de acidente.',
      'Rode em formação escalonada, um de cada lado da faixa, mantendo distância pra ter espaço de frenagem. Combine sinais de mão pra buraco, redução e parada, e marque um ponto de reagrupamento a cada trecho pra ninguém se perder em cruzamento ou pedágio.',
    ],
  },
];

const FAQS = [
  { q: 'Preciso instalar algum app pra usar o comboio?', a: 'Não. O comboio roda no navegador do celular. Você cria a sala, compartilha o link e a galera entra direto — sem baixar app nem fazer cadastro.' },
  { q: 'O rastreamento ao vivo gasta muita bateria/internet?', a: 'Usa o GPS e uma conexão leve de dados. Pra viagem longa, vale levar um carregador veicular ou power bank, como em qualquer navegação por GPS.' },
  { q: 'Minha localização fica salva depois do rolê?', a: 'Não. A posição é compartilhada só enquanto o comboio está ativo. Ao encerrar, o rastreamento para e nada da rota fica gravado.' },
  { q: 'Quantas pessoas podem entrar num comboio?', a: 'Dá pra rodar de dupla a grupos grandes. Pra grupos muito grandes, o ideal é dividir em sub-comboios com líderes, que é mais seguro na estrada.' },
];

export default function Page() {
  return (
    <>
      <SpaIntro eyebrow="Todo mundo junto" title="Comboio em tempo real">
        Rode em grupo com rastreamento ao vivo, chat e localização do comboio. Acompanhe seu grupo de moto em tempo real e mantenha todos juntos.
      </SpaIntro>
      <SpaPage name="comboio" />
      <SeoContent secoes={SECOES} faqs={FAQS} />
    </>
  );
}
