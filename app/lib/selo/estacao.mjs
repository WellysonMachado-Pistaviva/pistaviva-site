// Estação do Selo pelo mês no fuso de São Paulo. Calculada sempre no servidor:
// o relógio do celular pode estar errado (ou adiantado de propósito).
//   jan–mar verão · abr–jun outono · jul–set inverno · out–dez primavera
export const FUSO = 'America/Sao_Paulo';

export const ESTACOES = {
  verao:     { nome: 'Verão',     cor: 'var(--pv-selo-verao)' },
  outono:    { nome: 'Outono',    cor: 'var(--pv-selo-outono)' },
  inverno:   { nome: 'Inverno',   cor: 'var(--pv-selo-inverno)' },
  primavera: { nome: 'Primavera', cor: 'var(--pv-selo-primavera)' },
};

const POR_TRIMESTRE = ['verao', 'outono', 'inverno', 'primavera'];

const partes = new Intl.DateTimeFormat('en-CA', { timeZone: FUSO, year: 'numeric', month: 'numeric' });

// Mês e ano civis em São Paulo. 31/dez 23:30 em SP já é 1º/jan em UTC — vale SP.
export function mesAnoSP(data = new Date()) {
  const p = Object.fromEntries(partes.formatToParts(data).map(({ type, value }) => [type, value]));
  return { mes: Number(p.month), ano: Number(p.year) };
}

export function estacaoDe(data = new Date()) {
  const { mes, ano } = mesAnoSP(data);
  return { estacao: POR_TRIMESTRE[Math.floor((mes - 1) / 3)], ano };
}

const dia = new Intl.DateTimeFormat('en-CA', { timeZone: FUSO });

// "2026-10-13" no calendário de São Paulo.
export function diaSP(data = new Date()) {
  return dia.format(new Date(data));
}

// A visita que libera o selo é a de HOJE (em SP). Link reaberto amanhã não libera.
export function visitaDeHoje(visitas, agora = new Date()) {
  const hoje = diaSP(agora);
  return visitas.find((v) => diaSP(v.criadoEm) === hoje) || null;
}

// Calendário do programa, sempre comparado com a temporada do servidor.
export function proximaEstacao({ estacao, ano } = estacaoDe()) {
  const indice = POR_TRIMESTRE.indexOf(estacao);
  return { estacao: POR_TRIMESTRE[(indice + 1) % 4], ano: ano + (indice === 3 ? 1 : 0) };
}

export function estadoSelo({ estacao, ano, visitas }, agora = new Date()) {
  const atual = estacaoDe(agora);
  const posicao = ano * 4 + POR_TRIMESTRE.indexOf(estacao);
  const posicaoAtual = atual.ano * 4 + POR_TRIMESTRE.indexOf(atual.estacao);
  // Mesmo um registro antecipado não permite exibir ou baixar selo futuro.
  if (posicao > posicaoAtual) return 'bloqueado';
  const visita = visitas.find((v) => v.estacao === estacao && v.ano === ano);
  if (visita) {
    const no = (valor) => {
      const t = new Date(valor || '').getTime();
      return Number.isFinite(t) && t <= agora.getTime();
    };
    if (no(visita.retiradoEm || visita.retirado_em)) return 'conquistado';
    // Check-in (GPS ou foto do passaporte) libera o selo digital; o balcão ainda confirma.
    return no(visita.liberadoEm || visita.liberado_em) ? 'liberado' : 'registrado';
  }
  return posicao === posicaoAtual ? 'disponivel' : 'encerrado';
}
