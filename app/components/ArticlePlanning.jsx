import Link from 'next/link';

export default function ArticlePlanning({ slug }) {
  if (slug === 'bate-volta-de-moto-saindo-de-bh') return (
    <section aria-label="Planejamento do bate-volta de moto">
      <h2>Como escolher seu bate-volta de moto perto de BH</h2>
      <p>Comece pelo tempo disponível para a ida, as paradas e a volta. A distância até o destino não é a distância total do passeio: calcule os dois sentidos a partir do seu endereço.</p>
      <ul>
        <li><strong>Pouco tempo:</strong> compare primeiro opções próximas, como Sabará, e reserve tempo para conhecer o destino.</li>
        <li><strong>Dia inteiro:</strong> compare os trajetos para Serra do Cipó, Brumadinho e Ouro Preto antes de decidir.</li>
        <li><strong>Viagem mais longa:</strong> Tiradentes aparece nesta lista como opção esticada. Considere pernoite se o retorno ficar cansativo ou avançar pela noite.</li>
      </ul>
      <p>Distâncias deste artigo são referências aproximadas. Entrada de atrações, acesso, chuva e trânsito podem mudar o planejamento. Consulte o responsável pelo lugar que pretende visitar.</p>
      <p><Link href="/rotas" data-growth-action="plan_route" data-growth-source="bh-guide">Calcular meu percurso de ida e volta</Link> · <Link href="/guias/o-que-levar-na-viagem-de-moto">Checklist do que levar</Link></p>
    </section>
  );
  if (slug === 'serra-do-rio-do-rastro-de-moto-guia') return (
    <section aria-label="Época e planejamento da Serra do Rio do Rastro">
      <h2>Qual a melhor época para ir à Serra do Rio do Rastro de moto?</h2>
      <p>Prefira uma janela com boa visibilidade, sem alertas meteorológicos e com a rodovia liberada. O calendário sozinho não garante essas condições. Para primeira visita, mantenha flexibilidade para mudar o dia da subida.</p>
      <p>A Epagri/Ciram registra ocorrência de neve na serra catarinense entre abril e setembro, mais frequente em julho e agosto. Esse histórico exige cuidado ao planejar o inverno; não informa a condição da pista no dia da sua viagem.</p>
      <ul>
        <li>Confira previsão para Bom Jardim da Serra e Lauro Müller, além do trajeto até a região.</li>
        <li>Reavalie saída diante de frio intenso, chuva, nevoeiro ou avisos de restrição.</li>
        <li>Reserve alternativa de programação caso a subida precise ser adiada.</li>
      </ul>
      <p>Fontes: <a href="https://ciram.epagri.sc.gov.br/index.php/2024/08/25/neve-na-serra-catarinense-2/" target="_blank" rel="noopener noreferrer">histórico de neve da Epagri/Ciram</a> e <a href="https://ciram.epagri.sc.gov.br/" target="_blank" rel="noopener noreferrer">previsões e avisos meteorológicos</a>. Consulta editorial: 11/09/2026.</p>
      <p><Link href="/rotas" data-growth-action="plan_route" data-growth-source="rio-rastro-guide">Planejar percurso e custos da viagem</Link></p>
    </section>
  );
  if (['serra-da-mantiqueira-de-moto-rotas', 'destinos-de-mototurismo-no-sul-de-minas'].includes(slug)) return (
    <section aria-label="Paradas e encontros em Itajubá">
      <h2>Inclua Itajubá no planejamento da Mantiqueira</h2>
      <p>Se o trajeto passar por Itajubá, consulte o <Link href="/parque-da-cidade" data-growth-action="explore_park" data-growth-source={slug}>guia do Parque da Cidade</Link> para avaliar uma parada, alimentação e atrações. Confira horários de cada operação antes de sair.</p>
      <p>Para uma viagem ligada a encontro de motociclistas, veja a edição e o planejamento do <Link href="/motosul" data-growth-action="explore_festival" data-growth-source={slug}>Motosul Festival</Link>. Ajuste datas e hospedagem ao seu roteiro.</p>
    </section>
  );
  return null;
}
