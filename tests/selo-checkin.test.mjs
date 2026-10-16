import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { alvoDoLocal, avaliarCheckin, distanciaM, lerAlvo } from '../app/lib/selo/geo.mjs';
import {
  ALFABETO, beneficioApto, soCheckinPorFoto, formatarCodigo, gerarCodigo, normalizarCodigo, validarEndereco,
} from '../app/lib/selo/beneficio.mjs';
import { estadoSelo } from '../app/lib/selo/estacao.mjs';
import { criarStoreLocal } from '../app/lib/selo/storeLocal.mjs';

const PARQUE = { lat: -22.4258, lng: -45.4528, raio: 300 };
// ~0,0009° de latitude ≈ 100 m.
const aNorte = (m) => ({ lat: PARQUE.lat + (m / 111_195), lng: PARQUE.lng });

test('lerAlvo: formato, raio padrão e limites', () => {
  assert.deepEqual(lerAlvo('-22.4258,-45.4528'), { lat: -22.4258, lng: -45.4528, raio: 300 });
  assert.equal(lerAlvo('-22.4258, -45.4528, 500').raio, 500);
  assert.equal(lerAlvo('-22.4258,-45.4528,10').raio, 300);
  assert.equal(lerAlvo(''), null);
  assert.equal(lerAlvo('abc,def'), null);
  assert.equal(lerAlvo('0,0'), null);
  assert.equal(lerAlvo('95,10'), null);
});

test('alvoDoLocal lê a env do local e ignora local desconhecido', () => {
  const env = { SELO_GEO_PARQUE: '-22.4258,-45.4528,250' };
  assert.equal(alvoDoLocal('parque', env).raio, 250);
  assert.equal(alvoDoLocal('posto', env), null);
  assert.equal(alvoDoLocal('__proto__', env), null);
});

test('distância haversine aproximada', () => {
  assert.ok(Math.abs(distanciaM(PARQUE, aNorte(1000)) - 1000) < 2);
});

test('check-in: dentro, borda com folga de precisão, longe e sinal fraco', () => {
  assert.equal(avaliarCheckin({ ...aNorte(100), precisao: 15 }, PARQUE).ok, true);
  // 360 m com ±80 m: 360 − 80 = 280 ≤ 300.
  assert.equal(avaliarCheckin({ ...aNorte(360), precisao: 80 }, PARQUE).ok, true);
  // Folga máxima é 100 m, mesmo com ±190.
  const borda = avaliarCheckin({ ...aNorte(450), precisao: 190 }, PARQUE);
  assert.equal(borda.ok, false);
  assert.equal(borda.motivo, 'longe');
  const longe = avaliarCheckin({ ...aNorte(5000), precisao: 10 }, PARQUE);
  assert.equal(longe.motivo, 'longe');
  assert.ok(longe.distancia > 4900);
  assert.equal(avaliarCheckin({ ...aNorte(10), precisao: 900 }, PARQUE).motivo, 'precisao');
  assert.equal(avaliarCheckin({ lat: 'x', lng: 1, precisao: 5 }, PARQUE).motivo, 'invalido');
  assert.equal(avaliarCheckin({ ...aNorte(10), precisao: 0 }, PARQUE).motivo, 'invalido');
  assert.equal(avaliarCheckin({ ...aNorte(10), precisao: 5 }, null).motivo, 'invalido');
});

test('código de benefício: alfabeto sem ambíguos, formato e normalização', () => {
  for (const ch of 'ILO01') assert.equal(ALFABETO.includes(ch), false);
  const vistos = new Set();
  for (let i = 0; i < 500; i++) {
    const c = gerarCodigo();
    assert.match(c, /^[A-HJKMNP-Z2-9]{8}$/);
    vistos.add(c);
  }
  assert.equal(vistos.size, 500);
  assert.equal(formatarCodigo('K7QM3XPA'), 'K7QM-3XPA');
  assert.equal(normalizarCodigo(' k7qm-3xpa '), 'K7QM3XPA');
  assert.equal(normalizarCodigo('k7qm 3xpa'), 'K7QM3XPA');
  assert.equal(normalizarCodigo('K7QM-3XP'), null);
  assert.equal(normalizarCodigo('K7QM-3XP0'), null);
  assert.equal(normalizarCodigo('0347'), null);
});

test('gerarCodigo descarta bytes ≥ 248 (sem viés)', () => {
  // 255 % 31 = 7 ('H'), 248 % 31 = 0: se não descartasse, começaria com 'H'.
  const c = gerarCodigo((n) => Uint8Array.from([255, 250, 248, ...Array(n - 3).fill(0)]));
  assert.equal(c, 'AAAAAAAA');
});

test('endereço: CEP com máscara, número S/N, complemento opcional', () => {
  const ok = validarEndereco({ cep: '37500-036', logradouro: ' Rua  X ', numero: 'S/N', bairro: 'Centro' });
  assert.equal(ok.ok, true);
  assert.deepEqual(ok.dados, { cep: '37500036', logradouro: 'Rua X', numero: 'S/N', complemento: '', bairro: 'Centro' });
  const ruim = validarEndereco({ cep: '375', logradouro: '', numero: '', bairro: '' });
  assert.equal(ruim.ok, false);
  assert.ok(ruim.erros.cep && ruim.erros.logradouro && ruim.erros.numero && ruim.erros.bairro);
});

test('benefício exige endereço completo e check-in GPS ou balcão', () => {
  const end = { cep: '37500036', logradouro: 'Rua X', numero_endereco: '10', bairro: 'Centro' };
  assert.equal(beneficioApto(end, [{ liberado_em: null, retirado_em: null }]), false);
  assert.equal(beneficioApto(end, [{ liberadoEm: '2026-10-13T15:00:00Z', checkinMetodo: 'gps' }]), true);
  assert.equal(beneficioApto(end, [{ liberado_em: '2026-10-13T15:00:00Z', checkin_metodo: 'gps' }]), true);
  // Foto do passaporte: qualquer arquivo sobe sem revisão, então não libera desconto.
  assert.equal(beneficioApto(end, [{ liberado_em: '2026-10-13T15:00:00Z', checkin_metodo: 'foto' }]), false);
  assert.equal(soCheckinPorFoto([{ liberado_em: '2026-10-13T15:00:00Z', checkin_metodo: 'foto' }]), true);
  assert.equal(soCheckinPorFoto([{ liberado_em: '2026-10-13T15:00:00Z', checkin_metodo: 'foto' }, { retirado_em: '2026-10-13T15:00:00Z' }]), false);
  assert.equal(beneficioApto(end, [{ liberado_em: '2026-10-13T15:00:00Z', checkin_metodo: 'foto', retirado_em: '2026-10-13T16:00:00Z' }]), true);
  assert.equal(beneficioApto(end, [{ retirado_em: '2026-10-13T15:00:00Z' }]), true);
  assert.equal(beneficioApto({ ...end, bairro: '' }, [{ retirado_em: '2026-10-13T15:00:00Z' }]), false);
});

test('estado do selo: liberado entre registrado e conquistado', () => {
  const agora = new Date('2026-10-20T15:00:00Z');
  const base = { estacao: 'primavera', ano: 2026 };
  assert.equal(estadoSelo({ ...base, visitas: [{ ...base }] }, agora), 'registrado');
  assert.equal(estadoSelo({ ...base, visitas: [{ ...base, liberadoEm: '2026-10-13T15:00:00Z' }] }, agora), 'liberado');
  assert.equal(estadoSelo({ ...base, visitas: [{ ...base, liberadoEm: '2026-10-13T15:00:00Z', retiradoEm: '2026-10-13T16:00:00Z' }] }, agora), 'conquistado');
});

// ── store local ──────────────────────────────────────────────────────────
const visita = (extra = {}) => ({
  chave: randomUUID(), nome: 'Ana', whatsapp: '35999998888', cidade: 'Itajubá', uf: 'MG',
  passou_por: ['rota-68'], estacao: 'primavera', ano: 2026, local: 'parque', foto_autorizada: false, ...extra,
});
function comStore(fn) {
  const pasta = mkdtempSync(join(tmpdir(), 'selo-'));
  try { fn(criarStoreLocal(pasta)); } finally { rmSync(pasta, { recursive: true, force: true }); }
}

test('check-in: só com visita da temporada, primeiro vence, revogar volta a pendente', () => comStore((s) => {
  const a = s.registrar(visita());
  assert.equal(s.checkin(a.codigo, 'verao', 2027, { metodo: 'gps' }), null);
  const r1 = s.checkin(a.codigo, 'primavera', 2026, { metodo: 'gps', distancia: 40, precisao: 12 });
  assert.deepEqual(r1, { ok: true, ja: false, visitaId: a.visitaId });
  const r2 = s.checkin(a.codigo, 'primavera', 2026, { metodo: 'foto' });
  assert.equal(r2.ja, true);
  const v = s.perfil(a.codigo).visitas[0];
  assert.equal(v.checkin_metodo, 'gps');
  assert.equal(v.checkin_distancia_m, 40);
  assert.equal('lat' in v || 'lng' in v, false);
  assert.equal(s.revogarCheckin(a.visitaId), true);
  assert.equal(s.perfil(a.codigo).visitas[0].liberado_em, null);
  assert.equal(s.revogarCheckin(a.visitaId), false);
}));

test('entrega no balcão não é desfeita por revogar check-in', () => comStore((s) => {
  const a = s.registrar(visita());
  s.checkin(a.codigo, 'primavera', 2026, { metodo: 'foto' });
  s.retirar(a.visitaId, 'primavera', 2026);
  assert.equal(s.revogarCheckin(a.visitaId), false);
  assert.ok(s.perfil(a.codigo).visitas[0].liberado_em);
}));

test('endereço gera código único e estável; usos ficam registrados e somem na exclusão', () => comStore((s) => {
  const a = s.registrar(visita());
  const b = s.registrar(visita({ whatsapp: '35988887777', nome: 'Beto' }));
  const fila = ['AAAAAAAA', 'AAAAAAAA', 'BBBBBBBB'];
  const gerar = () => fila.shift();
  const end = { cep: '37500036', logradouro: 'Rua X', numero: '10', complemento: '', bairro: 'Centro' };
  assert.equal(s.salvarEndereco(a.codigo, end, gerar).cupom, 'AAAAAAAA');
  assert.equal(s.salvarEndereco(b.codigo, end, gerar).cupom, 'BBBBBBBB');
  assert.equal(s.salvarEndereco(a.codigo, { ...end, numero: '20' }, () => 'CCCCCCCC').cupom, 'AAAAAAAA');
  assert.equal(s.salvarEndereco('000000000000', end, gerar), null);
  const achado = s.porCupom('AAAAAAAA');
  assert.equal(achado.moto.numero_endereco, '20');
  assert.equal(s.porCupom('ZZZZZZZZ'), null);
  assert.equal(s.registrarUso(achado.moto.id, '10% lanchonete'), true);
  assert.equal(s.porCupom('AAAAAAAA').usos.length, 1);
  assert.equal(s.excluirMotociclista(achado.moto.id), true);
  assert.equal(s.ler().usos.length, 0);
}));
