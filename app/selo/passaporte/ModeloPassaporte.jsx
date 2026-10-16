'use client';
import EditorPassaporte from './EditorPassaporte';
import cidadesExemplo from './previa/cidades-exemplo.json';

// Mesma arte dos carimbos reais, preparada como arquivo estático. O modelo
// abre sem consultar API ou gerar selos no servidor.
const EXEMPLOS = cidadesExemplo.map((c) => ({ ...c, src: `/selo/passaporte/exemplos/${c.slug}.webp`, mini: `/selo/passaporte/exemplos/${c.slug}.webp` }));

// Amostra aberta na entrada, com a mesma arte do passaporte real.
// Dados ilustrativos ficam separados da conta e nunca viram conquistas reais.
export default function ModeloPassaporte({ onPersonalizar }) {
  return <section id="amostra-passaporte" className="sl-modelo" aria-label="Teste um modelo do seu passaporte">
    <header className="sl-modelo-cabecalho"><p className="study-kicker">Veja antes de criar</p><h2>Seu passaporte.<br /><em>Preenchido de histórias.</em></h2><p>Foto, identificação e cidades carimbadas: explore uma amostra do que você vai colecionar.</p></header>
    <div className="sl-modelo-aviso" role="note"><strong>Amostra preenchida · dados ilustrativos</strong><span>Troque nome e foto, folheie os carimbos e veja como ficaria o seu. Teste sem cadastro; nada é publicado.</span></div>
    <EditorPassaporte demonstracao cidadesExemplo={EXEMPLOS} numero={95} quantidadeInicial={8} modoInicial="colecao" onPersonalizar={onPersonalizar} />
    <div className="sl-modelo-criar"><a className="selo-btn" href="#criar-passaporte">Criar meu passaporte</a><p>Seu passaporte começa em branco. Cada cidade visitada vira um carimbo de verdade.</p></div>
  </section>;
}
