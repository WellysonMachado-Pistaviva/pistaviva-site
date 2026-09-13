import Link from 'next/link';

const TOPICS = [
  { href: '/guias', title: 'Planeje sua viagem de moto', label: 'Mototurismo', text: 'Preparação, bagagem e planejamento de rotas: consulte os guias antes de escolher o próximo caminho.' },
  { href: '/parque-da-cidade', title: 'Conheça o Parque da Cidade de Itajubá', label: 'Itajubá · Minas Gerais', text: 'Veja o mapa, as atrações, as opções de alimentação e as informações para organizar sua visita.' },
  { href: '/motosul', title: 'Organize sua ida ao Motosul Festival', label: 'Encontro na Mantiqueira', text: 'Consulte a edição do festival, os caminhos de chegada e as opções para aproveitar Itajubá.' },
];

export default function TopicNavigation({ current }) {
  const topics = TOPICS.filter((topic) => topic.href !== current);
  return (
    <section className="ignis ig-cats pv-topic-navigation" aria-label="Guias para sua próxima viagem">
      <div className="wrap">
        <div className="ig-sechead">
          <div className="lead">
            <span className="ig-eyebrow">Da estrada ao encontro</span>
            <h2 className="ig-title">Mototurismo, Itajubá e Motosul</h2>
            <p>Escolha o próximo passo: preparar a moto, conhecer o parque ou encontrar a turma no festival.</p>
          </div>
        </div>
        <div className="ig-news-grid">
          {topics.map((topic) => (
            <article className="ig-post" key={topic.href}>
              <Link href={topic.href}>
                <div className="meta"><span className="tag">{topic.label}</span></div>
                <h3>{topic.title}</h3>
                <p>{topic.text}</p>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
