export const metadata = {
  title: 'Contato',
  description: 'Fale com o Pistaviva — comunidade de mototurismo. E-mail, Instagram e parcerias.',
  alternates: { canonical: '/contato' },
};

const CONTATOS = [
  { k: 'E-mail', v: 'contatopively@gmail.com', href: 'mailto:contatopively@gmail.com' },
  { k: 'Instagram', v: '@pistavivaoficial', href: 'https://www.instagram.com/pistavivaoficial' },
];

export default function Contato() {
  return (
    <article className="ignis art">
      <header className="art-hero">
        <div className="wrap">
          <div className="art-meta"><span className="tag">Fale com a gente</span></div>
          <h1>Contato</h1>
          <p className="sub">Dúvida, parceria, imprensa ou sugestão de pauta? Chama na comunidade.</p>
        </div>
      </header>
      <div className="art-body">
        <div className="wrap">
          <div className="art-col">
            <p>O Pistaviva é tocado por gente que vive a estrada. Pra falar com a gente — parcerias, eventos, fotógrafos, imprensa ou só trocar ideia — use os canais abaixo. Respondemos o quanto antes.</p>

            {CONTATOS.map(c => (
              <p key={c.k}><strong>{c.k}:</strong> <a className="inline" href={c.href} target="_blank" rel="noopener noreferrer">{c.v}</a></p>
            ))}

            <h2>Parcerias e mídia</h2>
            <p>Quer divulgar um evento, virar parada parceira, cadastrar-se como fotógrafo de estrada ou propor uma colaboração? Manda um e-mail com o assunto “Parceria” que a gente prioriza.</p>

            <h2>Apoie o projeto</h2>
            <p>O site é aberto e gratuito. Se quiser ajudar a manter no ar, dá uma olhada na página <a className="inline" href="/apoie">Apoie</a>.</p>
          </div>
        </div>
      </div>
    </article>
  );
}
