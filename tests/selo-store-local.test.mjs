import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { criarStoreLocal } from '../app/lib/selo/storeLocal.mjs';

// Mesmos cenários validados no SQL (pv_selo_registrar), no armazenamento local.
const visita = (extra = {}) => ({
  chave: randomUUID(), nome: 'Ana', whatsapp: '35999998888', cidade: 'Itajubá', uf: 'MG',
  passou_por: ['rota-68'], estacao: 'primavera', ano: 2026, local: 'parque', foto_autorizada: false, ...extra,
});

function comStore(fn) {
  const pasta = mkdtempSync(join(tmpdir(), 'selo-'));
  try { fn(criarStoreLocal(pasta)); } finally { rmSync(pasta, { recursive: true, force: true }); }
}

test('reenvio com a mesma chave devolve a mesma visita', () => comStore((s) => {
  const v = visita();
  const a = s.registrar(v);
  const b = s.registrar(v);
  assert.equal(b.visitaId, a.visitaId);
  assert.equal(b.reaproveitada, true);
}));

test('mesmo WhatsApp não repete selo na mesma estação, mesmo depois de dias', () => comStore((s) => {
  const t0 = new Date('2026-10-13T15:00:00Z');
  const a = s.registrar(visita(), t0);
  const b = s.registrar(visita(), new Date(t0.getTime() + 9 * 60_000));
  assert.equal(b.visitaId, a.visitaId);
  const c = s.registrar(visita(), new Date(t0.getTime() + 11 * 60_000));
  assert.equal(c.visitaId, a.visitaId);
  const diasDepois = s.registrar(visita({ local: 'posto', nome: 'Outro nome' }), new Date('2026-11-20T15:00:00Z'));
  assert.equal(diasDepois.visitaId, a.visitaId);
  assert.equal(s.perfil(a.codigo).moto.nome, 'Ana');
  assert.equal(s.perfil(a.codigo).visitas.length, 1);
}));

test('o número é da pessoa: volta em outra estação com o mesmo nº, sem pular números', () => comStore((s) => {
  const a = s.registrar(visita(), new Date('2026-10-13T15:00:00Z'));
  const b = s.registrar(visita({ estacao: 'verao', ano: 2027 }), new Date('2027-01-20T15:00:00Z'));
  const novo = s.registrar(visita({ whatsapp: '35988887777', nome: 'Beto' }));
  assert.equal(b.numero, a.numero);
  assert.equal(novo.numero, a.numero + 1);
  assert.equal(s.perfil(a.codigo).visitas.length, 2);
}));

test('sem WhatsApp não emite selo nem cria pessoa', () => comStore((s) => {
  assert.throws(() => s.registrar(visita({ whatsapp: null })), /WhatsApp obrigatório/);
  assert.equal(s.motociclistas().length, 0);
}));

test('a mesma estação em outro ano permite novo selo com o mesmo número', () => comStore((s) => {
  const a = s.registrar(visita());
  const b = s.registrar(visita({ ano: 2027 }));
  assert.equal(a.numero, b.numero);
  assert.notEqual(a.visitaId, b.visitaId);
}));

test('retirada é única e só vale na temporada correta', () => comStore((s) => {
  const a = s.registrar(visita());
  assert.equal(s.retirar(a.visitaId, 'verao', 2026), false);
  assert.equal(s.retirar(a.visitaId, 'primavera', 2027), false);
  assert.equal(s.retirar(a.visitaId, 'primavera', 2026), true);
  const data = s.perfil(a.codigo).visitas[0].retirado_em;
  assert.equal(s.retirar(a.visitaId, 'primavera', 2026), false);
  assert.equal(s.perfil(a.codigo).visitas[0].retirado_em, data);
  const repetida = s.registrar(visita());
  assert.equal(repetida.visitaId, a.visitaId);
  assert.equal(s.perfil(a.codigo).visitas[0].retirado_em, data);
}));

test('URL de upload local: assinatura e validade', () => comStore((s) => {
  const url = new URL(s.urlUpload('abc-123.jpg', 'http://localhost'));
  const p = url.searchParams;
  assert.equal(s.uploadValido(p.get('path'), p.get('exp'), p.get('sig')), true);
  assert.equal(s.uploadValido('outra.jpg', p.get('exp'), p.get('sig')), false);
  assert.equal(s.uploadValido('../x.jpg', p.get('exp'), p.get('sig')), false);
  assert.equal(s.uploadValido(p.get('path'), String(Date.now() - 1), p.get('sig')), false);
}));

test('admin: foto sem autorização não pode ser aprovada; recusar pode', () => comStore((s) => {
  const sem = s.registrar(visita({ foto_autorizada: false }));
  const com = s.registrar(visita({ whatsapp: '35988887777', foto_autorizada: true }));
  for (const r of [sem, com]) s.marcarFoto(s.listarVisitas().find((v) => v.id === r.visitaId).chave_envio, `${r.visitaId}.jpg`);
  assert.equal(s.mudarStatusFoto(sem.visitaId, 'aprovada'), false);
  assert.equal(s.mudarStatusFoto(sem.visitaId, 'recusada'), true);
  assert.equal(s.mudarStatusFoto(com.visitaId, 'aprovada'), true);
}));

test('admin: listar une visita e pessoa; excluir apaga pessoa, visitas e foto (LGPD)', () => comStore((s) => {
  const a = s.registrar(visita());
  s.salvarFoto(`${a.visitaId}.jpg`, Buffer.from('jpg'));
  s.marcarFoto(s.listarVisitas()[0].chave_envio, `${a.visitaId}.jpg`);
  const [v] = s.listarVisitas();
  assert.equal(v.nome, 'Ana');
  assert.equal(v.numero, a.numero);
  const id = s.motociclistas()[0].id;
  assert.equal(s.excluirMotociclista(id), true);
  assert.equal(s.listarVisitas().length, 0);
  assert.equal(s.fotoExiste(`${a.visitaId}.jpg`), false);
}));

test('número exclusivo do passaporte permanece em todos os adesivos da pessoa', () => comStore((s) => {
  const primeiro = s.registrar(visita());
  for (const [estacao, ano] of [['verao', 2027], ['outono', 2027], ['inverno', 2027], ['primavera', 2027]]) {
    const selo = s.registrar(visita({ estacao, ano }));
    assert.equal(selo.numero, primeiro.numero);
    assert.equal(selo.codigo, primeiro.codigo);
  }
  const outraPessoa = s.registrar(visita({ whatsapp: '11988887777' }));
  assert.notEqual(outraPessoa.numero, primeiro.numero);
  assert.notEqual(outraPessoa.codigo, primeiro.codigo);
}));
