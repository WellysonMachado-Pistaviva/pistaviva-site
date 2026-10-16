import Link from 'next/link';
import '../selo-publico.css';
import { cidadesNoMapa } from '../../lib/selo/mapaServidor.mjs';
import { MUNICIPIOS_BRASIL } from '../../lib/selo/municipiosBrasil.mjs';
import { resumoMapa } from '../../lib/selo/store';
import { estiloIntercalado, urlMiniCarimbo } from '../../lib/selo/carimboUrl.mjs';
import MapaCarimbos from './MapaCarimbos';
import CartaoSelo from '../cartao/CartaoSelo';
import SeloNav from '../SeloNav';
import ChamadaItajuba from '../chamada/ChamadaItajuba';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Mapa de carimbos',
  description: 'Os selos dos 5.571 municípios do Brasil no passaporte do motociclista, com as cidades e os estados mais carimbados em destaque e fotos de quem esteve lá.',
};

// Selos por estado (catálogo inteiro), para o "ver todos" de cada carrossel.
const SELOS_POR_UF = MUNICIPIOS_BRASIL.reduce((t, m) => ({ ...t, [m.uf]: (t[m.uf] || 0) + 1 }), {});

// Cidades da lista agrupadas por UF; estado mais carimbado primeiro.
function porEstado(cidades) {
  const ufs = new Map();
  for (const c of cidades) {
    const e = ufs.get(c.uf) || { uf: c.uf, carimbos: 0, cidades: [] };
    e.carimbos += c.carimbos;
    e.cidades.push(c);
    ufs.set(c.uf, e);
  }
  return [...ufs.values()].sort((a, b) => b.carimbos - a.carimbos || a.uf.localeCompare(b.uf));
}

async function totais() {
  try { return await resumoMapa(); } catch (e) {
    console.error('[selo] mapa (migração do mapa aplicada?)', e?.message);
    return [];
  }
}

export default async function MapaPage() {
  // Miniatura leve da arte de cada cidade (a URL muda quando a arte muda).
  const cidades = cidadesNoMapa(await totais()).map((c, i) => ({ ...c, mini: urlMiniCarimbo(c.slug, estiloIntercalado(i)) }));
  const carimbos = cidades.reduce((s, c) => s + c.carimbos, 0);
  const fotos = cidades.reduce((s, c) => s + c.fotos, 0);
  const visitadas = cidades.filter((c) => c.carimbos > 0).length;
  return (
    <div className="pv-study selo-public-page passaporte-universo">
      <SeloNav />
      <div className="study-container mapa-pagina">
        <header>
          <p className="study-kicker">Pistaviva / Passaporte do motociclista</p>
          <h1>Mapa de<br /><em>carimbos.</em></h1>
          <p>Os selos de todos os 5.571 municípios do Brasil estão no mapa; selo apagado ainda espera o primeiro carimbo. Quanto mais carimbada a cidade ou o estado, mais forte o destaque. Toque para ver as fotos de quem passou por lá.</p>
          <dl className="selo-perfil-stats">
            <div><dt>Carimbos</dt><dd>{carimbos}</dd></div>
            <div><dt>Cidades carimbadas</dt><dd>{visitadas}</dd></div>
            <div><dt>Fotos</dt><dd>{fotos}</dd></div>
          </dl>
          <Link className="selo-btn" href="/selo/passaporte">Carimbar no meu passaporte</Link>
        </header>
        <MapaCarimbos cidades={cidades} />
        <ChamadaItajuba />
        <section aria-labelledby="mapa-lista-titulo">
          <h2 id="mapa-lista-titulo">Selos por estado</h2>
          {porEstado(cidades).map((e) => (
            <section key={e.uf} className="mapa-estado" aria-labelledby={`mapa-uf-${e.uf}`}>
              <header>
                <h3 id={`mapa-uf-${e.uf}`}>{e.uf}</h3>
                <span>{e.carimbos === 1 ? '1 carimbo' : `${e.carimbos} carimbos`}</span>
                <Link href={`/selos/brasil?uf=${e.uf}`}>Ver os {SELOS_POR_UF[e.uf]} selos →</Link>
              </header>
              <ul className="cartao-selo-grade mapa-cartoes mapa-carrossel">
                {e.cidades.map((c) => (
                  <li key={c.slug}>
                    <CartaoSelo href={`/selo/cidade/${c.slug}`} arte={c.mini} nome={c.nome} contador={c.carimbos} apagado={c.carimbos === 0}
                      etiquetas={[{ texto: c.uf }, c.fotos > 0 ? { texto: `${c.fotos} ${c.fotos === 1 ? 'foto' : 'fotos'}`, tom: 'sim' } : { texto: 'Rota Biker', tom: 'rota' }]}
                      cidade={{ slug: c.slug, nome: c.nome, uf: c.uf, mini: c.mini, carimbos: c.carimbos }} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </section>
      </div>
    </div>
  );
}
