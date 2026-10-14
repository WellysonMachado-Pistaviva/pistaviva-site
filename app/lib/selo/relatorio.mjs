// Números do painel do Selo, CSV e legenda — funções puras sobre as linhas de
// visita já unidas ao motociclista ({ criado_em, cidade, uf, estacao, ano,
// passou_por, nome, numero, ... }). Dias sempre no calendário de São Paulo.
import { ESTACOES, diaSP } from './estacao.mjs';
import { PASSOU_POR, formatarNumero } from './constantes.mjs';

const DIA_MS = 24 * 60 * 60 * 1000;
const CHECKIN = { balcao: 'Confirmado no balcão', gps: 'GPS', foto: 'Foto do passaporte', nenhum: 'Sem check-in' };

const contar = (itens, chave) => {
  const m = new Map();
  for (const it of itens) {
    const k = chave(it);
    if (k) m.set(k, (m.get(k) || 0) + 1);
  }
  return [...m.entries()].map(([nome, total]) => ({ nome, total })).sort((a, b) => b.total - a.total || a.nome.localeCompare(b.nome));
};

// "2026-10-01".."2026-10-13" → lista de dias inclusive.
function diasEntre(de, ate) {
  const out = [];
  for (let t = Date.parse(`${de}T12:00:00Z`); t <= Date.parse(`${ate}T12:00:00Z`); t += DIA_MS) {
    out.push(new Date(t).toISOString().slice(0, 10));
  }
  return out;
}

// periodo: { de?: 'AAAA-MM-DD', ate?: 'AAAA-MM-DD' } (inclusive, dias de SP).
// "hoje" e "últimos 7 dias" não dependem do filtro: são o pulso da operação.
export function resumir(visitas, periodo = {}, agora = new Date()) {
  const hoje = diaSP(agora);
  const seteDias = diaSP(new Date(agora.getTime() - 6 * DIA_MS));
  const comDia = visitas.map((v) => ({ ...v, dia: diaSP(v.criado_em) }));
  const noPeriodo = comDia.filter((v) => (!periodo.de || v.dia >= periodo.de) && (!periodo.ate || v.dia <= periodo.ate));

  const nomeEstacao = Object.fromEntries(Object.entries(ESTACOES).map(([id, e]) => [id, e.nome]));
  const nomePassou = Object.fromEntries(PASSOU_POR.map((p) => [p.id, p.nome]));

  const porDiaMapa = new Map(contar(noPeriodo, (v) => v.dia).map((d) => [d.nome, d.total]));
  const dias = noPeriodo.length
    ? diasEntre(periodo.de || noPeriodo.reduce((a, v) => (v.dia < a ? v.dia : a), hoje), periodo.ate || hoje)
    : [];

  return {
    total: noPeriodo.length,
    motociclistas: new Set(noPeriodo.map((v) => v.motociclista_id)).size,
    hoje: comDia.filter((v) => v.dia === hoje).length,
    ultimos7: comDia.filter((v) => v.dia >= seteDias && v.dia <= hoje).length,
    porEstacao: Object.keys(ESTACOES).map((id) => ({
      id, nome: nomeEstacao[id], total: noPeriodo.filter((v) => v.estacao === id).length,
    })),
    topCidades: contar(noPeriodo, (v) => `${v.cidade}/${v.uf}`).slice(0, 10),
    porUf: contar(noPeriodo, (v) => v.uf),
    passouPor: PASSOU_POR.map((p) => ({
      id: p.id, nome: nomePassou[p.id], total: noPeriodo.filter((v) => v.passou_por?.includes(p.id)).length,
    })),
    porLocal: contar(noPeriodo, (v) => v.local),
    porCheckin: contar(noPeriodo, (v) => CHECKIN[v.retirado_em ? 'balcao' : v.checkin_metodo || 'nenhum']),
    porDia: dias.map((dia) => ({ dia, total: porDiaMapa.get(dia) || 0 })),
  };
}

// "Ana Souza — Itajubá/MG · Selo Primavera"
export function legenda(v) {
  return `${v.nome} — ${v.cidade}/${v.uf} · Selo ${ESTACOES[v.estacao]?.nome || v.estacao}`;
}

const dataHoraSP = new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
});

const COLUNAS = [
  ['numero', (v) => formatarNumero(v.numero)],
  ['data', (v) => diaSP(v.criado_em)],
  ['data_hora', (v) => dataHoraSP.format(new Date(v.criado_em))],
  ['nome', (v) => v.nome],
  ['whatsapp', (v) => v.whatsapp || ''],
  ['cidade', (v) => v.cidade],
  ['uf', (v) => v.uf],
  ['estacao', (v) => v.estacao],
  ['ano', (v) => v.ano],
  ['local', (v) => v.local],
  ['passou_por', (v) => (v.passou_por || []).join('|')],
  ['tem_foto', (v) => (v.foto_path ? 'sim' : 'nao')],
  ['foto_autorizada', (v) => (v.foto_autorizada ? 'sim' : 'nao')],
  ['foto_status', (v) => (v.foto_path ? v.foto_status : '')],
  ['checkin', (v) => v.checkin_metodo || ''],
  ['checkin_distancia_m', (v) => v.checkin_distancia_m ?? ''],
  ['liberado_em', (v) => (v.liberado_em ? dataHoraSP.format(new Date(v.liberado_em)) : '')],
  ['entregue_em', (v) => (v.retirado_em ? dataHoraSP.format(new Date(v.retirado_em)) : '')],
];

// Texto que começa com = + - @ vira fórmula no Excel/Sheets (injeção de fórmula).
export const semFormula = (valor) => {
  const s = String(valor ?? '');
  return /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
};

const celula = (valor) => {
  const s = semFormula(valor);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

// Mesmas colunas do CSV, em linhas para planilha (Google Sheets).
export const CABECALHO_PLANILHA = COLUNAS.map(([nome]) => nome);
export const paraLinhas = (visitas) => visitas.map((v) => COLUNAS.map(([, f]) => semFormula(f(v))));

// CSV com vírgula e BOM UTF-8: abre com acento no Excel e importa direto no Looker Studio.
export function paraCsv(visitas) {
  const linhas = [COLUNAS.map(([nome]) => nome).join(',')];
  for (const v of visitas) linhas.push(COLUNAS.map(([, f]) => celula(f(v))).join(','));
  return `﻿${linhas.join('\r\n')}\r\n`;
}
