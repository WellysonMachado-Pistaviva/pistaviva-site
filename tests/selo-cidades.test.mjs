import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { CIDADES, cidadeDoPonto, cidadePorSlug, diaDoCarimbo, resumoPassaporte } from '../app/lib/selo/cidades.mjs';
import { dataCarimbo, linhasDoNome, montarCarimboCidadeSvg } from '../app/lib/selo/carimboCidadeArte.mjs';
import { MONUMENTOS } from '../app/lib/monumentosBikers.mjs';
import { criarStoreLocal } from '../app/lib/selo/storeLocal.mjs';

const ITAJUBA = { lat: -22.4258, lng: -45.4528 };

test('catálogo: 42 cidades brasileiras, slugs únicos, todo monumento do Brasil coberto', () => {
  assert.equal(CIDADES.length, 42);
  assert.equal(new Set(CIDADES.map((c) => c.slug)).size, CIDADES.length);
  const cobertos = new Set(CIDADES.flatMap((c) => c.monumentos));
  for (const m of MONUMENTOS) if (m.coordinates && m.uf !== 'PY') assert.ok(cobertos.has(m.id), `monumento ${m.id}`);
});

test('município sai do ponto, não do nome: Paranoá é Brasília, Cajá é Caldas Brandão', () => {
  assert.deepEqual(cidadePorSlug('brasilia-df').monumentos, [11]);
  assert.deepEqual(cidadePorSlug('caldas-brandao-pb').monumentos, [42]);
  assert.equal(cidadePorSlug('lauro-muller-sc').nome, 'Lauro Müller');
});

test('GPS no monumento cai na cidade dele', () => {
  for (const m of MONUMENTOS.filter((x) => x.coordinates && x.uf !== 'PY')) {
    const [lat, lng] = m.coordinates;
    const r = cidadeDoPonto({ lat, lng, precisao: 20 });
    assert.equal(r.ok, true, `monumento ${m.id}`);
    assert.equal(r.distancia, 0);
    assert.ok(r.cidade.monumentos.includes(m.id), `monumento ${m.id} → ${r.cidade.slug}`);
  }
});

test('fora da Rota: diz a cidade mais perto; sinal fraco e entrada inválida recusam', () => {
  const fora = cidadeDoPonto({ ...ITAJUBA, precisao: 20 });
  assert.equal(fora.ok, false);
  assert.equal(fora.motivo, 'fora');
  assert.ok(fora.distancia > 1000);
  assert.ok(fora.cidade.slug);
  assert.equal(cidadeDoPonto({ lat: -21.61, lng: -45.26, precisao: 500 }).motivo, 'precisao');
  assert.equal(cidadeDoPonto({ lat: 'x', lng: 1, precisao: 10 }).motivo, 'invalido');
  assert.equal(cidadeDoPonto({ lat: 0, lng: 0, precisao: 10 }).motivo, 'invalido');
  assert.equal(cidadeDoPonto({ lat: -21.61, lng: -45.26 }).motivo, 'invalido');
});

test('divisa: folga até a precisão do sinal, no máximo 100 m', () => {
  // Quadrado de ~1,1 km: borda leste em lng 0.01.
  const quadrado = [{ slug: 'teste', poligonos: [[[[0, 0], [0.01, 0], [0.01, 0.01], [0, 0.01], [0, 0]]]] }];
  const leste = (m) => ({ lat: 0.005, lng: 0.01 + m / 111_320 });
  assert.equal(cidadeDoPonto({ ...leste(50), precisao: 60 }, quadrado).ok, true);
  assert.equal(cidadeDoPonto({ ...leste(50), precisao: 30 }, quadrado).ok, false);
  assert.equal(cidadeDoPonto({ ...leste(150), precisao: 190 }, quadrado).ok, false);
});

test('dia do carimbo no fuso de Brasília', () => {
  assert.equal(diaDoCarimbo(new Date('2026-10-15T02:30:00Z')), '2026-10-14');
  assert.equal(diaDoCarimbo(new Date('2026-10-15T03:30:00Z')), '2026-10-15');
});

test('arte: nome longo em duas linhas, data impressa e texto escapado', () => {
  assert.deepEqual(linhasDoNome('JUNDIAÍ'), ['JUNDIAÍ']);
  assert.deepEqual(linhasDoNome('SANTO ANTÔNIO DA ALEGRIA'), ['SANTO ANTÔNIO', 'DA ALEGRIA']);
  assert.equal(dataCarimbo('2026-10-14'), '14 OUT 2026');
  const svg = montarCarimboCidadeSvg(cidadePorSlug('tres-coracoes-mg'), { dia: '2026-10-14' });
  assert.match(svg, /^<svg /);
  assert.match(svg, /TRÊS CORAÇÕES/);
  assert.match(svg, /14 OUT 2026/);
  const malicioso = montarCarimboCidadeSvg({ ...cidadePorSlug('penha-sc'), nome: '<script>x</script>' });
  assert.doesNotMatch(malicioso, /<script>/);
});

test('resumo: conta cidades, estados e "2ª visita" em dias diferentes', () => {
  const r = resumoPassaporte([
    { id: 'a', carimbo: 'socorro-sp', uf: 'SP', dia: '2026-01-02' },
    { id: 'b', carimbo: 'socorro-sp', uf: 'SP', dia: '2026-05-02' },
    { id: 'c', carimbo: 'penha-sc', uf: 'SC', dia: '2026-03-01' },
  ]);
  assert.equal(r.cidades, 2);
  assert.equal(r.ufs, 2);
  assert.equal(r.faltam.length, 40);
  assert.equal(r.faltam[0].poligonos, undefined);
  assert.deepEqual(r.entradas.map((e) => [e.id, e.visita]), [['b', 2], ['c', 1], ['a', 1]]);
});

test('store local: carimbo idempotente no dia, passaporte só com autorização, LGPD apaga tudo', () => {
  const pasta = mkdtempSync(join(tmpdir(), 'selo-cidades-'));
  try {
    const s = criarStoreLocal(pasta);
    const { codigo, numero } = s.registrar({
      chave: randomUUID(), nome: 'Maria da Silva Souza', whatsapp: '35999990000', cidade: 'Itajubá', uf: 'MG',
      passou_por: [], estacao: 'primavera', ano: 2026, local: 'parque', foto_autorizada: false, aceite_lgpd: true,
    });
    const { id } = s.motoPorCodigo(codigo);
    const foto = `cidade-${id}-2026-10-14-socorro-sp.jpg`;
    mkdirSync(join(pasta, 'fotos'), { recursive: true });
    writeFileSync(join(pasta, 'fotos', foto), 'jpg');
    const d = { carimbo: 'socorro-sp', ibge: 3552106, uf: 'SP', dia: '2026-10-14', distancia: 0, precisao: 12, foto };
    assert.deepEqual(s.carimbarCidade(codigo, d), { ok: true, ja: false });
    assert.deepEqual(s.carimbarCidade(codigo, d), { ok: true, ja: true });
    assert.deepEqual(s.carimbarCidade(codigo, { ...d, dia: '2026-10-20' }), { ok: true, ja: false });
    assert.equal(s.carimbarCidade('000000000000', d), null);
    assert.equal(s.entradas(id).length, 2);

    assert.equal(s.passaportePublico(numero), null);
    assert.equal(s.autorizarPassaporte(codigo, true), true);
    assert.equal(s.passaportePublico(numero).entradas.length, 2);
    s.autorizarPassaporte(codigo, false);
    assert.equal(s.passaportePublico(numero), null);

    assert.equal(s.excluirMotociclista(id), true);
    assert.equal(s.fotoExiste(foto), false);
    assert.equal(s.ler().entradas.length, 0);
  } finally {
    rmSync(pasta, { recursive: true, force: true });
  }
});
