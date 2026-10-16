import Link from 'next/link';
import '../selo-publico.css';
import './modelo/modelo.css';
import { MapPinned, Share2, Stamp, WifiOff } from 'lucide-react';
import GeradorPassaporte from './GeradorPassaporte';
import AtalhoPassaporte from './AtalhoPassaporte';
import SeloNav from '../SeloNav';
import MapaCarimbos from '../mapa/MapaCarimbos';
import { cidadesNoMapa } from '../../lib/selo/mapaServidor.mjs';
import { SELOS } from '../../lib/selo/constantes.mjs';
import { COLECAO_ESTACOES } from '../../lib/selo/catalogo.mjs';
import { REGIOES } from '../../lib/selo/regioes.mjs';
import { contarPassaportes, resumoMapa } from '../../lib/selo/store';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Passaporte do mototurismo brasileiro',
  description: 'Carimbe o Brasil de moto: um carimbo com número de série para cada cidade do Brasil, um mapa de onde você já rodou e um story para mostrar que esteve lá. Grátis.',
};


const PERGUNTAS = [
  ['Quanto custa?', 'Nada. O passaporte digital é grátis. O passaporte físico da Rota Biker e os adesivos das estações são retirados nos pontos oficiais.'],
  ['Dá para carimbar de casa?', 'Não. O carimbo só entra se o GPS do celular mostrar que você está dentro do município, conferido no servidor contra o contorno oficial do IBGE. Sua posição não fica gravada: só a cidade.'],
  ['E se eu estiver sem sinal na estrada?', 'Com seu passaporte já salvo neste celular, toque em carimbar. A leitura do GPS fica guardada no aparelho. Abra o passaporte com internet em até 72 horas para confirmar a passagem com a data original.'],
  ['O que é o número de série do carimbo?', 'Cada conquista ganha a ordem de chegada naquela cidade e uma letra de conferência, como "Nº 0007·K". O número é seu, nunca se repete e serve para sorteios e ações dos parceiros.'],
  ['Preciso postar foto?', 'Não. A foto é opcional. Se postar e marcar "mostrar no mapa", ela aparece na página da cidade com seu primeiro nome e a inicial. Qualquer foto imprópria pode ser denunciada.'],
  ['Troquei de celular. E agora?', 'Abra seu link pessoal no novo aparelho. Se perdeu o link, entre em “Já tenho passaporte” para falar com a equipe e confirmar sua identidade. Seus carimbos continuam guardados no servidor.'],
];

async function numeros() {
  try {
    const [passaportes, totais] = await Promise.all([contarPassaportes(), resumoMapa()]);
    return { passaportes, totais };
  } catch (e) {
    console.error('[selo] home do passaporte', e?.message);
    return { passaportes: 0, totais: [] };
  }
}

const n = (v) => Number(v).toLocaleString('pt-BR');

export default async function PassaporteHomePage({ searchParams }) {
  const query = await searchParams || {};
  const story = typeof query.story === 'string' && /^[0-9a-f-]{36}$/i.test(query.story) ? query.story : null;
  const { passaportes, totais } = await numeros();
  // Sem 'mini': a home não mostra a arte dos selos (fica na biblioteca e no mapa completo).
  const cidades = cidadesNoMapa(totais);
  const carimbos = cidades.reduce((s, c) => s + c.carimbos, 0);
  const visitadas = cidades.filter((c) => c.carimbos > 0);
  const estados = new Set(visitadas.map((c) => c.uf)).size;

  return (
    <div className="pv-study selo-public-page passaporte-home-page passaporte-identidade">
      <SeloNav />
      <div className="study-container ph">
        {/* Abertura: a ideia antes do cadastro. */}
        <section className="ph-hero" aria-labelledby="ph-titulo">
          <div className="ph-hero-texto">
            <p className="study-kicker">O passaporte do mototurismo brasileiro</p>
            <h1 id="ph-titulo">Carimbe o Brasil<br /><em>de moto.</em></h1>
            <p className="ph-lead">Um carimbo para cada cidade em que você chega de moto, um mapa de onde já rodou e um story para mostrar que esteve lá. Grátis.</p>
            <AtalhoPassaporte />
          </div>
          <figure className="ph-hero-livro">
            <img src="/selo/passaporte/home-passaporte.webp" alt="Passaporte do motociclista aberto: identificação com foto, piloto e cidade de origem; na outra página, carimbos de Urubici, Foz do Iguaçu, Barretos, Penha, Brasília, Jundiaí, Três Corações e Socorro" width={1040} height={660} />
            <span className="ph-hero-serie" aria-hidden="true">Nº 0001·K</span>
          </figure>
        </section>

        <section id="meu-passaporte" className="passaporte-pagina ph-meu" aria-labelledby="ph-meu-titulo">
          <header>
            <p className="study-kicker">Seu passaporte</p>
            <h2 id="ph-meu-titulo" className="ph-h2">Seu próximo carimbo começa aqui.</h2>
          </header>
          <GeradorPassaporte story={story} editar={query.editar === '1'} />
        </section>

        <dl className="ph-numeros" aria-label="O passaporte agora">
          <div><dt>Passaportes</dt><dd>{n(passaportes)}</dd></div>
          <div><dt>Carimbos</dt><dd>{n(carimbos)}</dd></div>
          <div><dt>Cidades carimbadas</dt><dd>{visitadas.length}</dd></div>
          <div><dt>Estados</dt><dd>{estados}</dd></div>
        </dl>

        <section aria-labelledby="ph-como">
          <p className="study-kicker">Como funciona</p>
          <h2 id="ph-como" className="ph-h2">Chegou, carimbou.</h2>
          <ol className="ph-passos">
            <li><Stamp size={28} aria-hidden="true" /><b>Crie seu passaporte</b><span>Nome, WhatsApp e cidade. Leva um minuto e vale para o Brasil inteiro.</span></li>
            <li><MapPinned size={28} aria-hidden="true" /><b>Carimbe na cidade</b><span>Chegou numa cidade? Toque em carimbar. Vale em qualquer cidade do Brasil: o GPS confere e o carimbo entra com data e número de série.</span></li>
            <li><WifiOff size={28} aria-hidden="true" /><b>Sem sinal? Guarde a passagem</b><span>Com o passaporte salvo no aparelho, registre pelo GPS. Abra de novo com internet em até 72 horas para confirmar.</span></li>
            <li><Share2 size={28} aria-hidden="true" /><b>Mostre nos Stories</b><span>Um story pronto com o carimbo do dia, seu passaporte com foto e garupa, e as outras cidades que você já conquistou.</span></li>
          </ol>
        </section>

        <section className="ph-serie" aria-labelledby="ph-serie-titulo">
          <div className="ph-serie-carimbo" aria-hidden="true"><small>Série Socorro</small><strong>Nº 0007·K</strong></div>
          <div>
            <p className="study-kicker">Cada conquista é única</p>
            <h2 id="ph-serie-titulo" className="ph-h2">Seu carimbo tem número.</h2>
            <p>O 1º motociclista a carimbar uma cidade fica com o nº 0001 dela, o 2º com o 0002… Com a letra de conferência, o número não se repete e não troca de dono. É ele que vale nos sorteios e nas ações dos parceiros da rota.</p>
          </div>
        </section>

        <section aria-labelledby="ph-colecoes">
          <p className="study-kicker">Coleções</p>
          <h2 id="ph-colecoes" className="ph-h2">O que dá para colecionar.</h2>
          <div className="ph-colecoes">
            <Link className="ph-colecao" href="/selo/mapa">
              <span className="ph-fileira ph-fileira-texto"><b>5.570</b></span>
              <strong>Cidades do Brasil</strong><span>Carimbe qualquer cidade pelo GPS, com data e número de série. As 42 da Rota Biker são o desafio.</span>
            </Link>
            <Link className="ph-colecao" href="/selos#selos-regioes">
              <span className="ph-fileira ph-fileira-texto"><b>{REGIOES.length}</b></span>
              <strong>Regiões do Brasil</strong><span>Mantiqueira, Serras Catarinenses, Tríplice Fronteira e mais.</span>
            </Link>
            <Link className="ph-colecao" href={`/selos/colecoes/${COLECAO_ESTACOES}`}>
              <span className="ph-fileira">{Object.values(SELOS).map((src) => <img key={src} src={src} alt="" width={64} height={64} loading="lazy" />)}</span>
              <strong>Itajubá nas 4 Estações</strong><span>Um selo por estação no Parque da Cidade. Feche o ano e vire Conquistador.</span>
            </Link>
            <Link className="ph-colecao" href="/selos/brasil">
              <span className="ph-fileira ph-fileira-texto"><b>5.570</b></span>
              <strong>Selos do Brasil</strong><span>Todos os municípios, com história e arte para baixar.</span>
            </Link>
          </div>
        </section>

        <section aria-labelledby="ph-mapa">
          <p className="study-kicker">Mapa de carimbos</p>
          <h2 id="ph-mapa" className="ph-h2">Cada carimbo, num mapa só.</h2>
          <p className="ph-lead">Veja quantos motociclistas já passaram por cada cidade e as fotos de quem esteve lá.</p>
          <MapaCarimbos cidades={cidades} adiado />
          <Link className="study-button" href="/selo/mapa">Abrir o mapa completo</Link>
        </section>

        <section className="ph-stories" aria-labelledby="ph-stories-titulo">
          <img src="/selo/passaporte/home-story.webp" alt="Exemplo de story: Estive em Socorro, com o carimbo do dia, o número de série, o passaporte com foto e as outras cidades conquistadas" width={540} height={960} loading="lazy" />
          <div>
            <p className="study-kicker">Stories</p>
            <h2 id="ph-stories-titulo" className="ph-h2">Estive aqui.<br />E tenho o carimbo.</h2>
            <p>Depois de carimbar, um toque gera o story: o nome da cidade, o carimbo com data e número, seu passaporte com foto, piloto e garupa, e as outras cidades que você já conquistou. A foto fica só no seu celular.</p>
            <a className="study-button" href="#meu-passaporte">Fazer o meu</a>
          </div>
        </section>

        <section className="ph-comunidade" aria-labelledby="ph-comunidade-titulo">
          <p className="study-kicker">Comunidade</p>
          <h2 id="ph-comunidade-titulo" className="ph-h2">Quem já está rodando.</h2>
          <p>Passaportes públicos, ranking e quem fechou as quatro estações. Você escolhe se o seu aparece.</p>
          <Link className="study-button study-button-outline" href="/selo/mural">Ver os Conquistadores</Link>
        </section>

        <section aria-labelledby="ph-faq">
          <h2 id="ph-faq" className="ph-h2">Perguntas frequentes</h2>
          <div className="ph-faq">
            {PERGUNTAS.map(([p, r]) => <details key={p}><summary>{p}</summary><p>{r}</p></details>)}
          </div>
        </section>


      </div>
    </div>
  );
}
