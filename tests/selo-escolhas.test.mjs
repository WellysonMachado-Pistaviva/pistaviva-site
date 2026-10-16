import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { criarStoreLocal } from '../app/lib/selo/storeLocal.mjs';
import { artesDaCidade, carimboNaArte, carimboDoMunicipio } from '../app/lib/selo/carimboCidade.mjs';
import { ARTE_PADRAO, urlCarimbo } from '../app/lib/selo/carimboUrl.mjs';
import { NOMES_ARTES } from '../app/lib/selo/artesCarimbo.mjs';

function comStore(fn) {
  const pasta = mkdtempSync(join(tmpdir(), 'selo-escolhas-'));
  try {
    const s = criarStoreLocal(pasta);
    const { codigo } = s.registrar({
      chave: randomUUID(), nome: 'Maria da Silva Souza', whatsapp: '35999990001', cidade: 'Itajubá', uf: 'MG',
      passou_por: [], estacao: 'primavera', ano: 2026, local: 'parque', foto_autorizada: false, aceite_lgpd: true,
    });
    fn(s, codigo);
  } finally {
    rmSync(pasta, { recursive: true, force: true });
  }
}

test('artes da cidade: carimbo do passaporte primeiro, todas com nome e SVG', () => {
  const artes = artesDaCidade('socorro-sp');
  assert.equal(artes[0], ARTE_PADRAO);
  assert.ok(artes.length > 3, 'cidade tem várias opções');
  for (const a of artes) {
    assert.ok(NOMES_ARTES[a], `nome para ${a}`);
    assert.match(carimboNaArte('socorro-sp', a, { dia: '2026-10-15' }), /^<svg/);
  }
  assert.deepEqual(artesDaCidade('nao-existe'), []);
  // Arte que a cidade não tem cai no carimbo do passaporte.
  assert.equal(carimboNaArte('socorro-sp', 'inventada', { dia: '2026-10-15' }), carimboDoMunicipio('socorro-sp', { dia: '2026-10-15' }));
});

test('url do carimbo leva a arte escolhida, menos a padrão', () => {
  assert.match(urlCarimbo('socorro-sp', { dia: '2026-10-15', arte: 'coruja' }), /arte=coruja/);
  assert.doesNotMatch(urlCarimbo('socorro-sp', { arte: ARTE_PADRAO }), /arte=/);
  assert.doesNotMatch(urlCarimbo('socorro-sp', { arte: '<x>' }), /arte=/);
});

test('store local: só o dono grava a arte e ela volta no passaporte', () => comStore((s, codigo) => {
  const { id } = s.carimbarCidade(codigo, { carimbo: 'socorro-sp', ibge: 3552106, uf: 'SP', dia: '2026-10-15', distancia: 0, precisao: 10 });
  assert.deepEqual(s.entradaDoDono(codigo, id), { id, carimbo: 'socorro-sp' });
  assert.equal(s.entradaDoDono('000000000000', id), null);
  assert.equal(s.gravarArte('000000000000', id, 'coruja'), false);
  assert.equal(s.gravarArte(codigo, id, 'coruja'), true);
  assert.equal(s.entradas(s.motoPorCodigo(codigo).id)[0].arte, 'coruja');
  // Repetir o check-in no dia devolve a arte já escolhida.
  assert.equal(s.carimbarCidade(codigo, { carimbo: 'socorro-sp', ibge: 3552106, uf: 'SP', dia: '2026-10-15', distancia: 0, precisao: 10 }).arte, 'coruja');
}));

test('store local: memória pública vai para a cidade; denúncias escondem', () => comStore((s, codigo) => {
  const { id } = s.carimbarCidade(codigo, { carimbo: 'socorro-sp', ibge: 3552106, uf: 'SP', dia: '2026-10-15', distancia: 0, precisao: 10 });
  s.salvarMemoria(codigo, id, 'Serra linda.', false);
  assert.deepEqual(s.memoriasDaCidade('socorro-sp'), []);
  const salvo = s.salvarMemoria(codigo, id, 'Serra linda.', true);
  assert.equal(salvo.carimbo, 'socorro-sp');
  const [m] = s.memoriasDaCidade('socorro-sp');
  assert.equal(m.relato, 'Serra linda.');
  assert.match(m.autor, /^Maria da S\. · nº/);
  assert.equal(s.memoriaPorEntrada(codigo, id).publica, true);
  assert.equal(s.denunciarFoto(id, 'a'.repeat(64)), 'publica');
  s.denunciarFoto(id, 'b'.repeat(64));
  assert.equal(s.denunciarFoto(id, 'c'.repeat(64)), 'denunciada');
  assert.deepEqual(s.memoriasDaCidade('socorro-sp'), []);
}));
