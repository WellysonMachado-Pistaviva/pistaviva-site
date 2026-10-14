import test from 'node:test';
import assert from 'node:assert/strict';
import { legenda, paraCsv, resumir } from '../app/lib/selo/relatorio.mjs';

// 13/out/2026 15:00 em SP
const AGORA = new Date('2026-10-13T18:00:00Z');
const v = (iso, extra = {}) => ({
  criado_em: iso, cidade: 'Itajubá', uf: 'MG', estacao: 'primavera', ano: 2026, local: 'parque',
  passou_por: ['rota-68'], nome: 'Ana Souza', numero: 7, motociclista_id: 'a', ...extra,
});

const visitas = [
  v('2026-10-13T12:00:00Z'),                                              // hoje
  v('2026-10-13T02:30:00Z', { motociclista_id: 'b', cidade: 'Campinas', uf: 'SP' }), // 12/out 23:30 SP (ontem)
  v('2026-10-08T15:00:00Z', { motociclista_id: 'c', passou_por: ['monumento-27', 'rota-68'] }),
  v('2026-08-10T15:00:00Z', { motociclista_id: 'a', estacao: 'inverno' }),
];

test('hoje e últimos 7 dias usam o dia de São Paulo', () => {
  const r = resumir(visitas, {}, AGORA);
  assert.equal(r.total, 4);
  assert.equal(r.motociclistas, 3);
  assert.equal(r.hoje, 1);
  assert.equal(r.ultimos7, 3);
});

test('filtro de período vale para os agrupamentos, não para hoje/7 dias', () => {
  const r = resumir(visitas, { de: '2026-10-01', ate: '2026-10-13' }, AGORA);
  assert.equal(r.total, 3);
  assert.equal(r.hoje, 1);
  assert.equal(r.porEstacao.find((e) => e.id === 'inverno').total, 0);
  assert.deepEqual(r.topCidades[0], { nome: 'Itajubá/MG', total: 2 });
  assert.deepEqual(r.porUf, [{ nome: 'MG', total: 2 }, { nome: 'SP', total: 1 }]);
  assert.equal(r.passouPor.find((p) => p.id === 'rota-68').total, 3);
  assert.equal(r.passouPor.find((p) => p.id === 'monumento-27').total, 1);
});

test('visitas por dia preenche os dias sem visita com zero', () => {
  const r = resumir(visitas, { de: '2026-10-11', ate: '2026-10-13' }, AGORA);
  assert.deepEqual(r.porDia, [
    { dia: '2026-10-11', total: 0 }, { dia: '2026-10-12', total: 1 }, { dia: '2026-10-13', total: 1 },
  ]);
});

test('sem visitas, nada quebra', () => {
  const r = resumir([], {}, AGORA);
  assert.equal(r.total, 0);
  assert.deepEqual(r.porDia, []);
});

test('legenda no formato do Instagram', () => {
  assert.equal(legenda(v('2026-10-13T12:00:00Z')), 'Ana Souza — Itajubá/MG · Selo Primavera');
});

test('CSV: cabeçalho, BOM, aspas e proteção contra fórmula', () => {
  const csv = paraCsv([v('2026-10-13T12:00:00Z', { nome: '=HYPERLINK("x")', cidade: 'Rio, RJ', whatsapp: '35999998888', foto_path: 'x.jpg', foto_status: 'aprovada', foto_autorizada: true })]);
  assert.ok(csv.startsWith('﻿numero,data,data_hora,nome,'));
  const linha = csv.split('\r\n')[1];
  assert.ok(linha.startsWith('0007,2026-10-13,2026-10-13 09:00:00,'));
  assert.ok(linha.includes(`"'=HYPERLINK(""x"")"`));
  assert.ok(linha.includes('"Rio, RJ"'));
  assert.ok(linha.endsWith('sim,sim,aprovada,,,,'));
  const comCheckin = paraCsv([v('2026-10-13T12:00:00Z', { checkin_metodo: 'gps', checkin_distancia_m: 42, liberado_em: '2026-10-13T12:05:00Z' })]);
  assert.ok(comCheckin.split('\r\n')[0].endsWith('checkin,checkin_distancia_m,liberado_em,entregue_em'));
  assert.ok(comCheckin.split('\r\n')[1].endsWith('gps,42,2026-10-13 09:05:00,'));
});
