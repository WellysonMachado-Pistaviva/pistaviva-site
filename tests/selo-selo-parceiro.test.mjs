import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { COR_PADRAO, validarCor, validarLocal } from '../app/lib/selo/seloParceiro.mjs';
import { montarSeloSvg } from '../app/lib/selo/seloParceiroArte.mjs';
import { gerarToken } from '../app/lib/selo/parceiro.mjs';
import { gerarCodigo } from '../app/lib/selo/beneficio.mjs';
import { criarStoreLocal } from '../app/lib/selo/storeLocal.mjs';

test('cor: hex válido e claro o bastante para a coruja preta', () => {
  assert.deepEqual(validarCor(' #3DA8E4 '), { ok: true, cor: '#3da8e4' });
  assert.equal(validarCor(COR_PADRAO).ok, true);
  assert.equal(validarCor('#ffd166').ok, true);
  assert.equal(validarCor('#1b1b3a').ok, false);
  assert.equal(validarCor('red').ok, false);
  assert.equal(validarCor('#fff').ok, false);
});

test('local: 2 a 32 caracteres, espaços normalizados', () => {
  assert.deepEqual(validarLocal('  Garganta   do Registro '), { ok: true, local: 'Garganta do Registro' });
  assert.equal(validarLocal('x').ok, false);
  assert.equal(validarLocal('x'.repeat(33)).ok, false);
});

test('svg: aplica a cor, escapa o texto e marca a prévia', () => {
  const base = { cor: '#ffd166', local: 'Bar <do> "Zé"', codigo: 'K7QM3XPA', parceiro: 'Bar do Zé', url: 'https://x/selo/v/K7QM3XPA' };
  const svg = montarSeloSvg(base);
  assert.ok(svg.includes('#ffd166'));
  assert.equal(svg.includes('#3da8e4'), false);
  assert.ok(svg.includes('BAR &lt;DO&gt; &quot;ZÉ&quot;'));
  assert.ok(svg.includes('K7QM-3XPA'));
  assert.equal(svg.includes('PRÉVIA'), false);
  assert.ok(montarSeloSvg({ ...base, previa: true }).includes('PRÉVIA'));
});

test('store local: nº do selo é gerado uma vez e fica com o parceiro', () => {
  const pasta = mkdtempSync(join(tmpdir(), 'selo-'));
  try {
    const s = criarStoreLocal(pasta);
    const p = s.criarParceiro('Bar do Zé', gerarToken());
    const a = s.salvarSeloParceiro(p.id, { cor: '#ffd166', local: 'Garganta do Registro' }, gerarCodigo);
    const b = s.salvarSeloParceiro(p.id, { cor: '#9be564', local: 'Garganta' }, gerarCodigo);
    assert.equal(a.selo_codigo, b.selo_codigo);
    assert.equal(s.parceiroPorSelo(a.selo_codigo).selo_local, 'Garganta');
    s.ativarParceiro(p.id, false);
    assert.equal(s.salvarSeloParceiro(p.id, { cor: '#ffd166', local: 'X1' }, gerarCodigo), null);
    assert.equal(s.parceiroPorSelo(a.selo_codigo).ativo, false);   // verificação mostra "revogado"
  } finally { rmSync(pasta, { recursive: true, force: true }); }
});
