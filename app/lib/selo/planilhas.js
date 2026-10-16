import 'server-only';
import { after } from 'next/server';
import { CABECALHO_PLANILHA, paraLinhas } from './relatorio.mjs';
import { ABA_EVENTOS, ABA_VISITAS, TIPOS_EVENTO, copiasParaApagar, eventosSemExcluidos, idPlanilhaValido, nomeCopia } from './planilhasRegras.mjs';
import { abas, acrescentar, apagarAbas, garantirAba, ler, sheetsConfigurado, substituir } from './googleSheets';
import { listarVisitasAdmin, MODO, visitaParaPlanilha } from './store';
import { todosCadastros } from './identificacaoServidor';
import { CABECALHO_CADASTROS, cadastrosLinhas } from './identificacaoRegras.mjs';

// Cópia do Selo em Google Sheets. O banco é a fonte da verdade; as planilhas
// são cópias: OFICIAL (atualizada a cada evento + foto completa diária) e
// RESERVA (foto completa diária + 7 cópias datadas). Falha aqui nunca derruba
// o cadastro: o sync diário repõe o que faltar.
const OFICIAL = () => process.env.SELO_PLANILHA_OFICIAL;
const RESERVA = () => process.env.SELO_PLANILHA_RESERVA;
const cabecalhoEventos = () => ['quando', 'evento', ...CABECALHO_PLANILHA];
const dataHoraSP = (d) => new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'medium' }).format(d);

export const planilhasAtivas = () => MODO !== 'local' && sheetsConfigurado() && idPlanilhaValido(OFICIAL());

async function registrarEvento(tipo, visitaId) {
  const v = await visitaParaPlanilha(visitaId);
  if (!v) return;
  if (await garantirAba(OFICIAL(), ABA_EVENTOS)) await acrescentar(OFICIAL(), ABA_EVENTOS, [cabecalhoEventos()]);
  await acrescentar(OFICIAL(), ABA_EVENTOS, [[dataHoraSP(new Date()), tipo, ...paraLinhas([v])[0]]]);
}

// Agenda a cópia para DEPOIS da resposta ao motociclista (não atrasa a tela).
export function copiarEvento(tipo, visitaId) {
  if (!planilhasAtivas() || !TIPOS_EVENTO.includes(tipo) || !visitaId) return;
  after(() => registrarEvento(tipo, visitaId).catch((e) => console.error('[selo] planilha evento', tipo, e.message)));
}

async function fotoCompleta(planilha, linhas, { comCopia, numeros }) {
  await substituir(planilha, ABA_VISITAS, linhas);
  if ((await abas(planilha)).some((a) => a.title === ABA_EVENTOS)) {
    const eventos = await ler(planilha, ABA_EVENTOS);
    const limpos = eventosSemExcluidos(eventos, numeros);
    if (limpos.length !== eventos.length) await substituir(planilha, ABA_EVENTOS, limpos);
  }
  if (!comCopia) return;
  await substituir(planilha, nomeCopia(), linhas);
  await apagarAbas(planilha, copiasParaApagar(await abas(planilha)));
}

// Foto completa nas duas planilhas, cada uma independente da outra.
export async function sincronizarPlanilhas() {
  if (MODO === 'local') return { ok: false, erro: 'Planilhas de produção não são alteradas pelo armazenamento local.' };
  if (!sheetsConfigurado()) return { ok: false, erro: 'Google Sheets não configurado.' };
  const visitas = await listarVisitasAdmin();
  const cadastros = await todosCadastros();
  const linhasCadastros = [CABECALHO_CADASTROS, ...cadastrosLinhas(cadastros)];
  const linhas = [[...CABECALHO_PLANILHA, `atualizado ${dataHoraSP(new Date())}`], ...paraLinhas(visitas)];
  const numeros = new Set(paraLinhas(visitas).map((l) => l[0]));
  const resultado = { ok: true, linhas: visitas.length };
  for (const [nome, id, comCopia] of [['oficial', OFICIAL(), false], ['reserva', RESERVA(), true]]) {
    if (!idPlanilhaValido(id)) { resultado[nome] = 'não configurada'; resultado.ok = false; continue; }
    try {
      await fotoCompleta(id, linhas, { comCopia, numeros });
      await substituir(id, 'Cadastros', linhasCadastros);
      resultado[nome] = 'ok';
    } catch (e) {
      console.error('[selo] planilha', nome, e.message);
      resultado[nome] = 'erro';
      resultado.ok = false;
    }
  }
  return resultado;
}

