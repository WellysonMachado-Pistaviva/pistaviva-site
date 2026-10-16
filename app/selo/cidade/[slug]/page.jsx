import Link from 'next/link';
import { notFound } from 'next/navigation';
import '../../selo-publico.css';
import { localPorSlug } from '../../../lib/selo/locais.mjs';
import { urlCarimbo } from '../../../lib/selo/carimboUrl.mjs';
import { fotosDaCidade, resumoMapa } from '../../../lib/selo/store';
import DenunciarFoto from './DenunciarFoto';
import ChamadaItajuba from '../../chamada/ChamadaItajuba';
import { regiaoDoMunicipio } from '../../../lib/selo/regioes.mjs';
import SeloNav from '../../SeloNav';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const c = localPorSlug(slug);
  if (!c) return { title: 'Cidade não encontrada' };
  return { title: `${c.nome}/${c.uf} · Mapa de carimbos`, description: `Carimbos e fotos de motociclistas que passaram por ${c.nome}/${c.uf} na Rota Biker.` };
}

const dataCurta = (dia) => new Date(`${dia}T12:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/\./g, '');

async function dados(slug) {
  try {
    const [totais, fotos] = await Promise.all([resumoMapa(), fotosDaCidade(slug)]);
    return { total: totais.find((t) => t.carimbo === slug) || {}, fotos };
  } catch (e) {
    console.error('[selo] cidade (migração do mapa aplicada?)', e?.message);
    return { total: {}, fotos: [] };
  }
}

export default async function CidadePage({ params }) {
  const { slug } = await params;
  const cidade = localPorSlug(slug);
  if (!cidade) notFound();
  const { total, fotos } = await dados(slug);
  const carimbos = Number(total.carimbos) || 0;
  return (
    <div className="pv-study selo-public-page passaporte-universo">
      <SeloNav />
      <div className="study-container cidade-pagina">
        <Link className="selo-publico-voltar" href="/selo/mapa">← Mapa de carimbos</Link>
        <header className="cidade-topo">
          <img src={urlCarimbo(cidade.slug)} alt={`Carimbo de ${cidade.nome}/${cidade.uf}`} width={200} height={200} />
          <div>
            <p className="study-kicker">Rota Biker · {cidade.uf}</p>
            <h1>{cidade.nome}</h1>
            <dl className="selo-perfil-stats">
              <div><dt>Carimbos</dt><dd>{carimbos}</dd></div>
              <div><dt>Motociclistas</dt><dd>{Number(total.pessoas) || 0}</dd></div>
              <div><dt>Fotos</dt><dd>{fotos.length}</dd></div>
            </dl>
            <Link className="selo-btn" href="/selo/passaporte">{carimbos ? 'Carimbar no meu passaporte' : 'Seja o primeiro a carimbar'}</Link>
            <small className="selo-dica">O carimbo só vale dentro do município: o GPS é conferido na hora.</small>
          </div>
        </header>
        {regiaoDoMunicipio(cidade.slug) && <p><Link className="selo-text-link" href={regiaoDoMunicipio(cidade.slug).href}>Região {regiaoDoMunicipio(cidade.slug).nome} →</Link></p>}
        <ChamadaItajuba cidade={cidade.nome} />
        <section aria-labelledby="cidade-fotos-titulo">
          <h2 id="cidade-fotos-titulo">Quem passou por {cidade.nome}</h2>
          {fotos.length ? (
            <ul className="cidade-fotos">
              {fotos.map((f) => (
                <li key={f.id}>
                  <img src={`/selo/foto/${f.id}`} alt={`Foto de ${f.autor} em ${cidade.nome}`} loading="lazy" />
                  <div>
                    <span><b>{f.autor}</b> · {dataCurta(f.dia)}</span>
                    <DenunciarFoto id={f.id} />
                  </div>
                </li>
              ))}
            </ul>
          ) : <p>Ainda sem fotos. Quem carimbar {cidade.nome} pode postar a primeira.</p>}
        </section>
      </div>
    </div>
  );
}
