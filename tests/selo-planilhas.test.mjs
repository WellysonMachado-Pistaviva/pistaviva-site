import test from 'node:test';
import assert from 'node:assert/strict';
import { CABECALHO_PLANILHA, paraLinhas, semFormula } from '../app/lib/selo/relatorio.mjs';
import { COPIAS_GUARDADAS, copiasParaApagar, idPlanilhaValido, nomeCopia } from '../app/lib/selo/planilhasRegras.mjs';

const visita = (extra = {}) => ({
  numero: 7, criado_em: '2026-10-13T15:00:00Z', nome: 'Ana', whatsapp: '35999998888', cidade: 'Itajubá', uf: 'MG',
  estacao: 'primavera', ano: 2026, local: 'parque', passou_por: ['rota-68'], foto_path: null, foto_autorizada: false,
  foto_status: 'pendente', checkin_metodo: 'gps', checkin_distancia_m: 12, liberado_em: '2026-10-13T15:05:00Z', retirado_em: null, ...extra,
});

test('injeção de fórmula: = + - @ viram texto', () => {
  for (const ataque of ['=HYPERLINK("http://mal.com","x")', '+1+1', '-2+3', '@SUM(A1)', '\t=1']) assert.equal(semFormula(ataque)[0], "'");
  assert.equal(semFormula('Ana'), 'Ana');
  assert.equal(semFormula(null), '');
});

test('linhas da planilha: mesma ordem do cabeçalho, nome malicioso neutralizado', () => {
  const [linha] = paraLinhas([visita({ nome: '=IMPORTXML("http://x","//a")' })]);
  assert.equal(linha.length, CABECALHO_PLANILHA.length);
  assert.equal(linha[CABECALHO_PLANILHA.indexOf('nome')], `'=IMPORTXML("http://x","//a")`);
  assert.equal(linha[CABECALHO_PLANILHA.indexOf('numero')], '0007');
  assert.equal(linha[CABECALHO_PLANILHA.indexOf('passou_por')], 'rota-68');
});

test('cópias da reserva: guarda as 7 mais recentes e nunca apaga abas fixas', () => {
  const abas = [{ title: 'Visitas', sheetId: 1 }, { title: 'Eventos', sheetId: 2 }, { title: 'Cópia de anotações', sheetId: 3 },
    ...Array.from({ length: 10 }, (_, i) => ({ title: `Cópia 2026-10-${String(i + 1).padStart(2, '0')}`, sheetId: 100 + i }))];
  const apagar = copiasParaApagar(abas);
  assert.deepEqual(apagar.sort(), [100, 101, 102]);
  assert.equal(10 - apagar.length, COPIAS_GUARDADAS);
  assert.match(nomeCopia(new Date('2026-10-14T02:00:00Z')), /^Cópia 2026-10-13$/);   // 23h em São Paulo
});

test('id de planilha: só formato do Google, bloqueia caminho na URL', () => {
  assert.equal(idPlanilhaValido('1AbC_dEf-1234567890abcdefXYZ'), true);
  for (const ruim of ['', 'curto', '../../etc/passwd', '1AbC/../../values', 'abc?x=1&y=2abcdefghijkl']) assert.equal(idPlanilhaValido(ruim), false);
});

test('LGPD: excluído some da aba Eventos na cópia diária', async () => {
  const { eventosSemExcluidos } = await import('../app/lib/selo/planilhasRegras.mjs');
  const linhas = [['quando', 'evento', 'numero', 'nome'], ['t1', 'cadastro', '0007', 'Ana'], ['t2', 'cadastro', '0009', 'Bia'], ['t3', 'checkin-gps', '0007', 'Ana']];
  assert.deepEqual(eventosSemExcluidos(linhas, new Set(['0007'])).map((l) => l[3]), ['nome', 'Ana', 'Ana']);
  assert.deepEqual(eventosSemExcluidos([], new Set()), []);
});
