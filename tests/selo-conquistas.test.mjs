import test from 'node:test';
import assert from 'node:assert/strict';
import { conquistaDoAno, conviteWhatsapp, conquistasPublicas } from '../app/lib/selo/conquistas.mjs';
import { criarStoreLocal } from '../app/lib/selo/storeLocal.mjs';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

const estacoes = ['verao', 'outono', 'inverno', 'primavera'];
const agora = new Date('2026-12-20T15:00:00Z');
const visitas = (ano) => estacoes.map((estacao, i) => ({ estacao, ano, retirado_em: `${ano}-${String(i * 3 + 1).padStart(2, '0')}-15T15:00:00Z` }));

test('certificação exige quatro estações do mesmo ano', () => {
  assert.equal(conquistaDoAno(visitas(2026), 2026, agora).completa, true);
  assert.equal(conquistaDoAno([...visitas(2026).slice(0, 2), ...visitas(2025).slice(2)], 2026, agora).completa, false);
  assert.equal(conquistaDoAno([...visitas(2026).slice(0, 2), ...visitas(2025).slice(2)], 2025, agora).completa, false);
});
test('cadastros sem retirada, repetidos e futuros não completam conquista', () => {
  assert.equal(conquistaDoAno(estacoes.map((estacao) => ({ estacao, ano: 2026 })), 2026, agora).total, 0);
  assert.equal(conquistaDoAno(Array(4).fill(visitas(2026)[0]), 2026, agora).total, 1);
  assert.equal(conquistaDoAno(visitas(2027), 2027, agora).total, 0);
  assert.equal(conquistaDoAno(visitas(2026), 2026, new Date('2026-08-20T15:00:00Z')).total, 3);
});
test('resultado inclui comprovação de cada estação e data de conclusão', () => {
  const r = conquistaDoAno(visitas(2025).map(({ retirado_em, ...v }) => ({ ...v, retiradoEm: retirado_em })), 2025, agora);
  assert.equal(r.concluidoEm, '2025-10-15T15:00:00Z');
  assert.equal(r.etapas.length, 4);
});
test('convite aceita apenas grupo WhatsApp https, nunca URL arbitrária', () => {
  assert.equal(conviteWhatsapp('https://chat.whatsapp.com/Abc123Def456'), 'https://chat.whatsapp.com/Abc123Def456');
  for (const url of [undefined, '', 'javascript:alert(1)', 'https://evil.example', 'https://chat.whatsapp.com.evil.test/Abc123Def456', 'https://user@chat.whatsapp.com/Abc123Def456', 'http://chat.whatsapp.com/Abc123Def456']) assert.equal(conviteWhatsapp(url), null);
});

test('autorização, moderação, revogação e exclusão controlam publicação', () => {
  const pasta = mkdtempSync(join(tmpdir(), 'selo-conquista-'));
  const s = criarStoreLocal(pasta);
  try {
    let pessoa;
    for (const [i, v] of visitas(2025).entries()) {
      const d = { chave: randomUUID(), nome: 'Ana', whatsapp: '35999998888', cidade: 'Itajubá', uf: 'MG', passou_por: ['so-itajuba'], estacao: v.estacao, ano: v.ano };
      pessoa = s.registrar(d, new Date(v.retirado_em));
      if (i === 0) assert.equal(s.autorizarConquista(pessoa.codigo, 2025, true), false);
      s.retirar(pessoa.visitaId, v.estacao, v.ano, new Date(v.retirado_em));

    }
    assert.deepEqual(s.listarConquistas(), []);
    assert.equal(s.autorizarConquista(pessoa.codigo, 2025, true), true);
    const [c] = s.listarConquistas();
    assert.equal(c.aprovado_em, null);
    assert.equal(s.publicarConquista(c.id, true), true);
    assert.ok(s.listarConquistas()[0].aprovado_em);
    // Reenvio da mesma autorização é idempotente.
    s.autorizarConquista(pessoa.codigo, 2025, true);
    assert.ok(s.listarConquistas()[0].aprovado_em);
    s.autorizarConquista(pessoa.codigo, 2025, false);
    assert.equal(s.listarConquistas()[0].aprovado_em, null);
    assert.equal(s.publicarConquista(c.id, true), false);
    s.autorizarConquista(pessoa.codigo, 2025, true);
    assert.equal(s.listarConquistas()[0].aprovado_em, null);
    s.publicarConquista(c.id, true);
    s.excluirMotociclista(s.perfil(pessoa.codigo).moto.id);
    assert.deepEqual(s.listarConquistas(), []);
  } finally { rmSync(pasta, { recursive: true, force: true }); }
});

test('ranking aceita primeira entrega, exige consentimento e aprovação e acompanha novas conquistas', () => {
  const pasta = mkdtempSync(join(tmpdir(), 'selo-ranking-'));
  const s = criarStoreLocal(pasta);
  try {
    const dados = { chave: randomUUID(), nome: 'Ana', whatsapp: '35999998888', cidade: 'Itajubá', uf: 'MG', passou_por: ['so-itajuba'], estacao: 'verao', ano: 2025 };
    const pessoa = s.registrar(dados, new Date('2025-02-01T15:00:00Z'));
    assert.equal(s.autorizarConquista(pessoa.codigo, 2025, true), false);
    s.retirar(pessoa.visitaId, 'verao', 2025, new Date('2025-02-01T15:00:00Z'));
    assert.equal(s.autorizarConquista(pessoa.codigo, 2025, true), true);
    assert.deepEqual(conquistasPublicas(s.listarConquistas()), []);
    const [c] = s.listarConquistas();
    assert.equal(c.total, 1);
    s.publicarConquista(c.id, true);
    assert.equal(conquistasPublicas(s.listarConquistas())[0].total, 1);
    const segunda = s.registrar({ ...dados, chave: randomUUID(), estacao: 'outono' }, new Date('2025-05-01T15:00:00Z'));
    s.retirar(segunda.visitaId, 'outono', 2025, new Date('2025-05-01T15:00:00Z'));
    const [publico] = conquistasPublicas(s.listarConquistas());
    assert.equal(publico.total, 2);
    assert.equal(publico.concluidoEm, null);
    assert.equal(publico.etapas.filter((e) => e.confirmadoEm).length, 2);
    s.autorizarConquista(pessoa.codigo, 2025, false);
    assert.deepEqual(conquistasPublicas(s.listarConquistas()), []);
    s.autorizarConquista(pessoa.codigo, 2025, true);
    assert.deepEqual(conquistasPublicas(s.listarConquistas()), []);
    s.publicarConquista(c.id, true);
    s.excluirMotociclista(s.perfil(pessoa.codigo).moto.id);
    assert.deepEqual(conquistasPublicas(s.listarConquistas()), []);
  } finally { rmSync(pasta, { recursive: true, force: true }); }
});

test('projeção pública exclui credenciais, contato, endereço e fotos', () => {
  const c = { id: 'publico', nome: 'Ana', numero: 4, cidade: 'Itajubá', uf: 'MG', ano: 2025, total: 1, etapas: [{ estacao: 'verao', confirmadoEm: '2025-02-01T15:00:00Z', prova_path: 'privado' }], autorizado_em: 'sim', aprovado_em: 'sim', concluidoEm: null, codigo: 'segredo', whatsapp: 'telefone', cep: 'endereco', motociclista_id: 'interno', prova_path: 'foto' };
  const [p] = conquistasPublicas([c]);
  assert.deepEqual(Object.keys(p).sort(), ['id', 'nome', 'numero', 'cidade', 'uf', 'ano', 'total', 'concluidoEm', 'etapas'].sort());
  assert.deepEqual(Object.keys(p.etapas[0]).sort(), ['confirmadoEm', 'estacao']);
  assert.deepEqual(conquistasPublicas([{ ...c, autorizado_em: null }, { ...c, aprovado_em: null }, { ...c, total: 0 }]), []);
});
