// Um passaporte só: carimbos de cidade (GPS) e selos de estação (balcão) no
// mesmo livro, com os mesmos números e as mesmas coleções. Público, privado e
// cartão leem daqui, então os contadores nunca divergem entre as telas.
import { CIDADES, resumoPassaporte } from './cidades.mjs';
import { localPorSlug, nomeDoLocal } from './locais.mjs';
import { CATALOGO, COLECAO_ESTACOES } from './catalogo.mjs';
import { SELOS } from './constantes.mjs';
import { ESTACOES } from './estacao.mjs';
import { urlCarimbo } from './carimboUrl.mjs';

export const POR_PAGINA = 6;
const ORDEM = ['verao', 'outono', 'inverno', 'primavera'];
const slugEstacao = Object.fromEntries(CATALOGO.map((s) => [s.estacao, s.slug]));
const nomeCidade = new Proxy({}, { get: (_, slug) => nomeDoLocal(String(slug)) });
const diaSP = (valor) => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date(valor));

// Inclinação fixa por carimbo: parece tinta de verdade e não muda a cada render.
export const giro = (chave) => ([...chave].reduce((s, c) => s + c.charCodeAt(0), 0) % 13) - 6;

// entradas: carimbos de cidade ({ id, carimbo, uf, dia }).
// estacoes: selos confirmados no balcão ({ estacao, ano, confirmadoEm }).
export function montarPassaporte({ entradas = [], estacoes = [] }, { ano = new Date().getFullYear() } = {}) {
  const r = resumoPassaporte(entradas);
  const vezesEstacao = {};
  const selos = [...estacoes].filter((e) => ESTACOES[e.estacao] && e.confirmadoEm)
    .sort((a, b) => a.ano - b.ano || ORDEM.indexOf(a.estacao) - ORDEM.indexOf(b.estacao))
    .map((e) => ({
      chave: `e-${e.estacao}-${e.ano}`, tipo: 'estacao', uf: 'MG', titulo: `${ESTACOES[e.estacao].nome} ${e.ano}`,
      dia: diaSP(e.confirmadoEm), img: SELOS[e.estacao], href: `/selos/${slugEstacao[e.estacao]}`,
      visita: (vezesEstacao[e.estacao] = (vezesEstacao[e.estacao] || 0) + 1),
    }));
  const cidades = r.entradas.map((e) => ({
    chave: `c-${e.id}`, tipo: 'cidade', uf: localPorSlug(e.carimbo)?.uf || e.uf || '', titulo: nomeCidade[e.carimbo] || e.carimbo, dia: e.dia,
    img: urlCarimbo(e.carimbo, { dia: e.dia, serie: e.serie }), href: `/selo/cidade/${e.carimbo}`, visita: e.visita,
  }));
  // Mais recente primeiro (grade); o livro inverte, como um passaporte de papel.
  const carimbos = [...cidades, ...selos].map((c) => ({ ...c, giro: giro(c.chave) }))
    .sort((a, b) => b.dia.localeCompare(a.dia) || a.chave.localeCompare(b.chave));
  const doAno = new Set(selos.filter((s) => s.chave.endsWith(`-${ano}`)).map((s) => s.chave.split('-')[1]));
  const anosCompletos = new Set(estacoes.map((e) => e.ano)
    .filter((a) => new Set(estacoes.filter((e) => e.ano === a && e.confirmadoEm).map((e) => e.estacao)).size === 4)).size;
  return {
    stats: { cidades: r.cidades, totalCidades: CIDADES.length, ufs: r.ufs, estacoes: selos.length, carimbos: carimbos.length, anosCompletos },
    carimbos,
    paginas: paginar([...carimbos].reverse()),
    colecoes: [
      { id: 'rota-biker', nome: 'Cidades da Rota Biker', feitos: r.rota, total: CIDADES.length, href: '/selo/mapa' },
      { id: `${COLECAO_ESTACOES}-${ano}`, nome: `Itajubá nas 4 Estações · ${ano}`, feitos: doAno.size, total: 4, href: `/selos/colecoes/${COLECAO_ESTACOES}` },
    ],
    faltam: r.faltam,
    vezesEstacao,
  };
}

export function paginar(lista, tamanho = POR_PAGINA) {
  const paginas = [];
  for (let i = 0; i < lista.length; i += tamanho) paginas.push(lista.slice(i, i + tamanho));
  return paginas;
}

// "Nathan Martin" → "N". Avatar de inicial, como no carimbo da capa.
export const inicial = (nome) => (String(nome || '').trim()[0] || '?').toLocaleUpperCase('pt-BR');
