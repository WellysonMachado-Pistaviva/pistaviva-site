import { perfilPorCodigo } from '../../../lib/selo/store';
import { SELOS } from '../../../lib/selo/constantes.mjs';
import { resumoPassaporte } from '../../../lib/selo/cidades.mjs';
import { localPorSlug } from '../../../lib/selo/locais.mjs';
import { dataCarimbo } from '../../../lib/selo/carimboCidadeArte.mjs';
import { ESTACOES, estadoSelo } from '../../../lib/selo/estacao.mjs';
import { urlCarimbo, urlMiniCarimbo } from '../../../lib/selo/carimboUrl.mjs';

export const dynamic = 'force-dynamic';
const SEM_CACHE = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex' };

// Carimbos para o mockup do passaporte (/selo/passaporte). Mesmo segredo do
// link pessoal: quem tem o código já vê esta coleção em /selo/m/[codigo].
export async function GET(req) {
  const codigo = /^Bearer ([a-f0-9]{12})$/.exec(req.headers.get('authorization') || '')?.[1];
  if (!codigo) return Response.json({ error: 'Acesso ao passaporte necessário.' }, { status: 401, headers: SEM_CACHE });
  try {
    const p = await perfilPorCodigo(codigo);
    if (!p) return Response.json({ error: 'Coleção não encontrada.' }, { status: 404, headers: SEM_CACHE });
    const agora = new Date();
    const cidades = resumoPassaporte(p.entradas).entradas.map((e) => {
      const c = localPorSlug(e.carimbo);
      return {
        tipo: 'cidade', entradaId: e.id, slug: e.carimbo, nome: c?.nome || e.carimbo, uf: c?.uf || e.uf,
        src: urlCarimbo(e.carimbo, { dia: e.dia, serie: e.serie, arte: e.arte }),
        mini: urlMiniCarimbo(e.carimbo),
        alt: `Carimbo ${c ? `${c.nome}/${c.uf}` : e.carimbo}, ${dataCarimbo(e.dia)}`,
        dia: e.dia, serie: e.serie, visita: e.visita,
      };
    });
    const estacoes = p.visitas
      .filter((v) => ['liberado', 'conquistado'].includes(estadoSelo({ estacao: v.estacao, ano: v.ano, visitas: p.visitas }, agora)))
      .map((v) => ({ tipo: 'estacao', src: SELOS[v.estacao], mini: SELOS[v.estacao], nome: `${ESTACOES[v.estacao].nome} ${v.ano}`, alt: `Selo ${ESTACOES[v.estacao].nome} ${v.ano}`, dia: String(v.retiradoEm || v.liberadoEm).slice(0, 10) }));
    const carimbos = [...cidades, ...estacoes].sort((a, b) => a.dia.localeCompare(b.dia));
    return Response.json({ nome: p.nome, numero: p.numero, cidade: p.cidade, uf: p.uf, carimbos }, { headers: SEM_CACHE });
  } catch (e) {
    console.error('[selo] passaporte', e);
    return Response.json({ error: 'Passaporte indisponível no momento.' }, { status: 503, headers: SEM_CACHE });
  }
}
