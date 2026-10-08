import Link from 'next/link';

const SITE_URL = 'https://www.pistavivamototurismo.com.br';
const PORTRAIT = 'https://cnvsooegnraedwmemzgl.supabase.co/storage/v1/object/public/post-images/editorial/2026-10-06/wellyson-pistaviva.webp';
export const revalidate = 600;
export const metadata = {
  title: 'Wellyson Machado — Criador do Pistaviva e encontros de moto',
  description: 'Conheça Wellyson Machado, criador do Pistaviva. Destinos, conteúdo e encontros de moto na Mantiqueira, no Sul de Minas e no Vale do Paraíba.',
  alternates: { canonical: '/sobre' },
  openGraph: { type: 'website', title: 'Wellyson Machado — Conectando pessoas a lugares', description: 'A história, os encontros e o trabalho de Wellyson à frente do Pistaviva.', url: `${SITE_URL}/sobre`, images: [PORTRAIT] },
};

const STORIES = [
  { title: 'BMW Motorrad Fest', location: 'Campos do Jordão · SP', text: 'No 3º BMW Motorrad Fest, Wellyson contribuiu com a divulgação regional e ajudou a mobilizar um grupo de cerca de 800 motos, segundo seu relato. A participação reuniu motociclistas do Sul de Minas, do interior do Rio de Janeiro e do Vale do Paraíba.', href: '/blog/wellyson-pistaviva-bmw-motorrad-fest-2026', cta: 'Ler a história e assistir ao vídeo' },
  { title: 'Garganta do Registro', location: 'Mantiqueira', text: 'A reportagem sobre o encontro no Bar do Miguelzinho mostra a conexão entre comunidade, fotografia e negócios que recebem motociclistas. A parceria com Don Cruz faz parte dessa história.', href: '/blog/o-impacto-do-mototurismo-no-bar-do-miguelzinho-garganta-do-registro', cta: 'Conhecer a reportagem' },
  { title: 'Monumentos da Rota Biker', location: 'Destinos para a próxima parada', text: 'Guias, publicações e um catálogo com mapa ajudam a localizar monumentos e a encontrar os responsáveis pelas paradas. Uma forma de transformar o interesse por uma imagem em planejamento de viagem.', href: '/destinos/roteiros/monumentos-bikers', cta: 'Explorar os monumentos' },
];

export default function SobrePage() {
  const person = { '@context': 'https://schema.org', '@type': 'Person', '@id': `${SITE_URL}/sobre#person`, name: 'Wellyson Machado', url: `${SITE_URL}/sobre`, image: PORTRAIT, jobTitle: 'Criador do Pistaviva', description: 'Criador de conteúdo e organizador de encontros de motociclistas, com atuação na Mantiqueira, no Sul de Minas e no Vale do Paraíba.', knowsAbout: ['Mototurismo', 'Serra da Mantiqueira', 'Sul de Minas', 'Vale do Paraíba', 'Encontros de motociclistas'], sameAs: ['https://www.instagram.com/pistavivaoficial/'] };
  const about = { '@context': 'https://schema.org', '@type': 'AboutPage', name: 'Wellyson Machado e Pistaviva', url: `${SITE_URL}/sobre`, mainEntity: { '@id': `${SITE_URL}/sobre#person` } };
  return (
    <div className="ignis sobre">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(about) }} />
      <section className="ig-hero sobre-hero">
        <div className="ig-hero-media" aria-hidden="true" /><div className="ig-hero-scrim" />
        <div className="wrap ig-hero-inner">
          <span className="ig-eyebrow on-dark">Wellyson Machado · Criador do Pistaviva</span>
          <h1>Conectando pessoas<br /><span className="it">a lugares.</span></h1>
          <p className="ig-lede">Destinos, encontros e histórias de quem compartilha a vontade de viajar de moto. A Mantiqueira, o Sul de Minas e o Vale do Paraíba são o ponto de partida.</p>
          <div className="sobre-cta"><Link className="ig-btn ig-btn--primary" href="#historias">Conheça o trabalho →</Link><Link className="ig-btn ig-btn--ghost on-dark" href="/contato#parcerias">Fale sobre uma parceria</Link></div>
        </div>
      </section>
      <section className="ig-models sobre-bio" aria-labelledby="wellyson-title">
        <div className="wrap sobre-bio-grid">
          <div className="sobre-portrait"><img src={PORTRAIT} alt="Wellyson Machado, criador do Pistaviva" width="1600" height="2400" style={{ height: 'auto', aspectRatio: '2 / 3' }} loading="lazy" /><span className="sobre-badge">Wellyson Machado</span></div>
          <div className="sobre-bio-txt">
            <span className="ig-eyebrow on-dark">Quem está por trás do perfil</span>
            <h2 className="ig-title" id="wellyson-title">De um hobby aos encontros na estrada</h2>
            <p>Wellyson Machado criou o Pistaviva para compartilhar dicas de destinos e organizar encontros. O que começou como um hobby ganhou espaço na rotina de pessoas que procuram um lugar para conhecer e companhia para o próximo passeio.</p>
            <p>Um café em outra cidade, um almoço com a família ou um reencontro com amigos podem ser o motivo da viagem. Essa proximidade com a comunidade orienta a escolha de assuntos e a divulgação de oportunidades para pegar a estrada.</p>
            <p>O portal dá continuidade a esse trabalho: reúne informações de localização, fontes e contatos para que o interesse despertado nas redes sociais possa se transformar em uma visita bem planejada.</p>
            <div className="sobre-cta"><a className="ig-btn ig-btn--primary" href="https://www.instagram.com/pistavivaoficial/" target="_blank" rel="noopener noreferrer">Acompanhar no Instagram ↗</a><Link className="ig-btn ig-btn--ghost on-dark" href="/comunidade">Conhecer a comunidade</Link></div>
          </div>
        </div>
      </section>
      <section className="ig-cats sobre-story" id="historias" aria-labelledby="historias-title">
        <div className="wrap sobre-story-copy">
          <span className="ig-eyebrow">O trabalho em histórias</span><h2 className="ig-title" id="historias-title">Encontros que saem da tela</h2>
          <p>Cada participação tem seu contexto. Nas reportagens, você encontra os registros e o papel do Pistaviva na divulgação, na mobilização e na conexão entre pessoas.</p>
          <div className="sobre-timeline">{STORIES.map((story, i) => <article className="sobre-tl-item" key={story.href}><span className="sobre-tl-n">0{i + 1}</span><div><h3>{story.title}</h3><span className="sobre-tl-loc">{story.location}</span><p>{story.text}</p><Link className="ig-btn ig-btn--ghost" href={story.href}>{story.cta} →</Link></div></article>)}</div>
        </div>
      </section>
      <section className="ig-cats sobre-story sobre-story--alternate" aria-labelledby="guias-title">
        <div className="wrap sobre-story-copy">
          <span className="ig-eyebrow">Informação para escolher a próxima parada</span><h2 className="ig-title" id="guias-title">Do post ao planejamento</h2>
          <p>Os guias do Pistaviva ajudam a responder perguntas concretas: onde fica, como localizar, quem procurar e o que confirmar antes de sair. Informações de atendimento e acesso são acompanhadas de fontes para consulta.</p>
          <p>Relatos pessoais e guias de pesquisa têm funções diferentes. A assinatura identifica a autoria; fotos, vídeos e links permitem conhecer o contexto. Condições de acesso, funcionamento e preços devem ser confirmados com os responsáveis pelo local.</p>
          <div className="sobre-cta"><Link className="ig-btn ig-btn--primary" href="/blog">Ler os guias e histórias →</Link><Link className="ig-btn ig-btn--ghost" href="/politica-editorial">Como tratamos fontes e autoria</Link></div>
        </div>
      </section>
      <section className="ig-cats sobre-story" aria-labelledby="sobre-parceria">
        <div className="wrap sobre-story-copy">
          <span className="ig-eyebrow">Fotografia e comunidade</span><h2 className="ig-title" id="sobre-parceria">Don Cruz: o olhar de quem está junto</h2>
          <p>Fotógrafo e amigo de Wellyson, Don Cruz participa da história do Pistaviva. Seu trabalho registra a chegada, as motos e as pessoas que dão vida aos encontros.</p>
          <p>A parceria na Garganta do Registro é um dos exemplos dessa conexão entre fotografia, estrada e comunidade.</p>
          <div className="sobre-cta"><a className="ig-btn ig-btn--primary" href="https://www.instagram.com/doncruzoficial/" target="_blank" rel="noopener noreferrer">Conhecer Don Cruz ↗</a><Link className="ig-btn ig-btn--ghost" href="/fotografos">Fotógrafos de estrada</Link></div>
        </div>
      </section>
      <section className="ig-cats sobre-story sobre-story--alternate" aria-labelledby="parcerias-title">
        <div className="wrap sobre-story-copy">
          <span className="ig-eyebrow">Destinos, marcas e organizadores</span><h2 className="ig-title" id="parcerias-title">Vamos conversar sobre o próximo encontro?</h2>
          <p>Quer apresentar um destino, propor uma cobertura ou conversar sobre conteúdo e encontros? Envie sua ideia, a cidade e as datas para avaliar possibilidades com Wellyson.</p>
          <p>Projetos comerciais são tratados com identificação de publicidade e parcerias. A proposta começa pela experiência que pode fazer sentido para a comunidade.</p>
          <div className="sobre-cta"><Link className="ig-btn ig-btn--primary" href="/contato#parcerias">Propor uma parceria →</Link><Link className="ig-btn ig-btn--ghost" href="/eventos">Ver agenda de encontros</Link></div>
        </div>
      </section>
    </div>
  );
}
