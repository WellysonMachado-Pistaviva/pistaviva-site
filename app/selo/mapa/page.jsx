import Link from 'next/link';
import '../selo-publico.css';
import { cidadesNoMapa } from '../../lib/selo/mapaServidor.mjs';
import { resumoMapa } from '../../lib/selo/store';
import { estiloIntercalado, urlMiniCarimbo } from '../../lib/selo/carimboUrl.mjs';
import MapaCarimbos from './MapaCarimbos';
import CartaoSelo from '../cartao/CartaoSelo';
import SeloNav from '../SeloNav';
import ChamadaItajuba from '../chamada/ChamadaItajuba';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Mapa de carimbos',
  description: 'As cidades carimbadas no passaporte do motociclista: as 42 da Rota Biker e todas as que os motociclistas já passaram, com fotos de quem esteve lá.',
};

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
    <div className="pv-study selo-public-page">
      <SeloNav />
      <div className="study-container mapa-pagina">
        <header>
          <p className="study-kicker">Pistaviva / Passaporte do motociclista</p>
          <h1>Mapa de<br /><em>carimbos.</em></h1>
          <p>As 42 cidades da Rota Biker estão sempre no mapa; selo apagado ainda espera o primeiro carimbo. Qualquer outra cidade do Brasil aparece assim que alguém carimbar. Toque para ver as fotos de quem passou por lá.</p>
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
          <h2 id="mapa-lista-titulo">Todas as cidades</h2>
          <ul className="cartao-selo-grade mapa-cartoes">
            {cidades.map((c) => (
              <li key={c.slug}>
                <CartaoSelo href={`/selo/cidade/${c.slug}`} arte={c.mini} nome={c.nome} contador={c.carimbos} apagado={c.carimbos === 0}
                  etiquetas={[{ texto: c.uf }, c.fotos > 0 ? { texto: `${c.fotos} ${c.fotos === 1 ? 'foto' : 'fotos'}`, tom: 'sim' } : { texto: 'Rota Biker', tom: 'rota' }]}
                  cidade={{ slug: c.slug, nome: c.nome, uf: c.uf, mini: c.mini, carimbos: c.carimbos }} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
