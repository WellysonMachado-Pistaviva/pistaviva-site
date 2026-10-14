// Catálogo público de selos e coleções (/selos). Cada selo tem página própria
// para busca orgânica; a coleção agrupa e mostra o progresso da comunidade.
// Só entra aqui o que já pode ser conquistado de verdade (verificação no
// Parque). Paradas oficiais entram dinâmicas, a partir dos parceiros.
import { SELOS } from './constantes.mjs';

export const COLECAO_ESTACOES = 'itajuba-4-estacoes';
export const COLECAO_PARADAS = 'paradas-oficiais';

const PARQUE = 'Parque da Cidade de Itajubá, MG';

export const CATALOGO = [
  {
    slug: 'verao-em-itajuba', estacao: 'verao', nome: 'Verão em Itajubá', periodo: 'janeiro a março', meses: [1, 2, 3],
    resumo: 'O selo de quem chega com o calor da Mantiqueira: céu aberto, serra verde e fim de tarde à beira do lago.',
  },
  {
    slug: 'outono-em-itajuba', estacao: 'outono', nome: 'Outono em Itajubá', periodo: 'abril a junho', meses: [4, 5, 6],
    resumo: 'Luz baixa, estrada seca e o melhor clima para rodar a serra. O selo do motociclista que aproveita a temporada.',
  },
  {
    slug: 'inverno-em-itajuba', estacao: 'inverno', nome: 'Inverno em Itajubá', periodo: 'julho a setembro', meses: [7, 8, 9],
    resumo: 'Frio de serra, café quente e jaqueta fechada. O selo mais disputado de quem encara a Mantiqueira no inverno.',
  },
  {
    slug: 'primavera-em-itajuba', estacao: 'primavera', nome: 'Primavera em Itajubá', periodo: 'outubro a dezembro', meses: [10, 11, 12],
    resumo: 'Ipês, chuva de fim de tarde e a última chance de fechar o ano. O selo que completa o passaporte.',
  },
].map((s) => ({ ...s, colecao: COLECAO_ESTACOES, arte: SELOS[s.estacao], local: PARQUE }));

export const COLECOES = [
  {
    slug: COLECAO_ESTACOES, nome: 'Itajubá nas 4 Estações', curto: '4 estações',
    resumo: 'Quatro selos, um por estação do ano, conquistados no Parque da Cidade de Itajubá. Feche o ano e entre para os Conquistadores.',
    selos: CATALOGO.map((s) => s.slug),
  },
  {
    slug: COLECAO_PARADAS, nome: 'Paradas oficiais', curto: 'Paradas',
    resumo: 'Lugares que recebem bem o motociclista na Serra da Mantiqueira. Cada parada tem selo próprio, com número único e verificação pública.',
    selos: [],
  },
];

export const seloPorSlug = (slug) => CATALOGO.find((s) => s.slug === slug) || null;
export const colecaoPorSlug = (slug) => COLECOES.find((c) => c.slug === slug) || null;
export const selosDaColecao = (slug) => CATALOGO.filter((s) => s.colecao === slug);

// Situação do selo hoje: aberto (estação corrente) ou quando abre de novo.
export function janelaDoSelo(selo, agora = new Date()) {
  const mes = Number(new Intl.DateTimeFormat('en', { timeZone: 'America/Sao_Paulo', month: 'numeric' }).format(agora));
  if (selo.meses.includes(mes)) return { aberto: true, texto: `Disponível agora, até o fim de ${selo.periodo.split(' a ')[1]}.` };
  return { aberto: false, texto: `Abre em ${selo.periodo.split(' a ')[0]}.` };
}

// Selos relacionados: os outros da mesma coleção, começando pelo próximo.
export function relacionados(selo) {
  const lista = selosDaColecao(selo.colecao);
  const i = lista.findIndex((s) => s.slug === selo.slug);
  return [...lista.slice(i + 1), ...lista.slice(0, i)];
}

// contagens: { verao: n, ... } (pessoas com o selo). Ordena para "mais colecionados".
export function maisColecionados(contagens) {
  if (!contagens) return [];
  return CATALOGO.map((s) => ({ ...s, total: contagens[s.estacao] || 0 })).sort((a, b) => b.total - a.total);
}

// Contador de repetição do passaporte: quantas vezes cada estação foi
// confirmada ao longo dos anos (Verão ×2 = dois verões diferentes).
export function repeticoes(anos) {
  const conta = {};
  for (const a of anos || []) for (const e of a.etapas || []) if (e.confirmadoEm) conta[e.estacao] = (conta[e.estacao] || 0) + 1;
  return conta;
}
