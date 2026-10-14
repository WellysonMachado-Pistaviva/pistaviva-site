import test from 'node:test';
import assert from 'node:assert/strict';
import { estacaoDe } from '../app/lib/selo/estacao.mjs';

// Datas em UTC; São Paulo é UTC-3 (sem horário de verão desde 2019).
const em = (iso) => estacaoDe(new Date(iso));

test('cada trimestre cai na sua estação', () => {
  assert.equal(em('2026-02-10T15:00:00Z').estacao, 'verao');
  assert.equal(em('2026-05-10T15:00:00Z').estacao, 'outono');
  assert.equal(em('2026-08-10T15:00:00Z').estacao, 'inverno');
  assert.equal(em('2026-11-10T15:00:00Z').estacao, 'primavera');
});

test('virada de trimestre respeita a meia-noite de São Paulo, não a de UTC', () => {
  // 30/set 23:59 em SP = 1º/out 02:59 UTC → ainda inverno
  assert.equal(em('2026-10-01T02:59:00Z').estacao, 'inverno');
  // 1º/out 00:00 em SP = 03:00 UTC → primavera
  assert.equal(em('2026-10-01T03:00:00Z').estacao, 'primavera');
  assert.equal(em('2026-04-01T02:59:59Z').estacao, 'verao');
  assert.equal(em('2026-04-01T03:00:00Z').estacao, 'outono');
  assert.equal(em('2026-07-01T03:00:00Z').estacao, 'inverno');
});

test('réveillon: o ano da temporada é o de São Paulo', () => {
  // 31/dez 23:30 em SP já é 2027 em UTC
  assert.deepEqual(em('2027-01-01T02:30:00Z'), { estacao: 'primavera', ano: 2026 });
  assert.deepEqual(em('2027-01-01T03:00:00Z'), { estacao: 'verao', ano: 2027 });
});

test('visita de hoje usa o dia de São Paulo', async () => {
  const { visitaDeHoje } = await import('../app/lib/selo/estacao.mjs');
  const visitas = [{ criadoEm: '2026-10-13T02:30:00Z' }];      // 12/out 23:30 em SP
  assert.equal(visitaDeHoje(visitas, new Date('2026-10-13T10:00:00Z')), null);   // 13/out em SP
  assert.equal(visitaDeHoje(visitas, new Date('2026-10-13T02:50:00Z')), visitas[0]);
});

test('próximo selo avança uma estação e atravessa o ano', async () => {
  const { proximaEstacao } = await import('../app/lib/selo/estacao.mjs');
  assert.deepEqual(proximaEstacao({ estacao: 'verao', ano: 2026 }), { estacao: 'outono', ano: 2026 });
  assert.deepEqual(proximaEstacao({ estacao: 'primavera', ano: 2026 }), { estacao: 'verao', ano: 2027 });
});

test('selos futuros ficam bloqueados, inclusive com registro antecipado', async () => {
  const { estadoSelo } = await import('../app/lib/selo/estacao.mjs');
  const agora = new Date('2026-05-10T15:00:00Z');
  for (const estacao of ['inverno', 'primavera']) {
    assert.equal(estadoSelo({ estacao, ano: 2026, visitas: [{ estacao, ano: 2026 }] }, agora), 'bloqueado');
  }
});

test('desbloqueia somente na virada do servidor e exige nova visita', async () => {
  const { estadoSelo } = await import('../app/lib/selo/estacao.mjs');
  const selo = { estacao: 'verao', ano: 2027, visitas: [] };
  assert.equal(estadoSelo(selo, new Date('2027-01-01T02:59:59Z')), 'bloqueado');
  assert.equal(estadoSelo(selo, new Date('2027-01-01T03:00:00Z')), 'disponivel');
  assert.equal(estadoSelo({ ...selo, visitas: [{ estacao: 'verao', ano: 2027, retiradoEm: '2027-01-01T03:00:00Z' }] }, new Date('2027-01-01T03:00:00Z')), 'conquistado');
});

test('selos antigos conquistados continuam acessíveis; perdidos não liberam cadastro retroativo', async () => {
  const { estadoSelo } = await import('../app/lib/selo/estacao.mjs');
  const agora = new Date('2026-11-10T15:00:00Z');
  const selo = { estacao: 'outono', ano: 2025, visitas: [] };
  assert.equal(estadoSelo(selo, agora), 'encerrado');
  assert.equal(estadoSelo({ ...selo, visitas: [{ estacao: 'outono', ano: 2025, retiradoEm: '2025-05-10T15:00:00Z' }] }, agora), 'conquistado');
});


test('cadastro sem confirmação presencial não é selo conquistado', async () => {
  const { estadoSelo } = await import('../app/lib/selo/estacao.mjs');
  const dados = { estacao: 'outono', ano: 2026, visitas: [{ estacao: 'outono', ano: 2026 }] };
  assert.equal(estadoSelo(dados, new Date('2026-05-10T15:00:00Z')), 'registrado');
});
