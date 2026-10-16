import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { criarStoreLocal } from '../app/lib/selo/storeLocal.mjs';
import { montarPassaporte } from '../app/lib/selo/passaporteUnico.mjs';
import { agruparCidades, projetarBrasil, MAPA_ALTURA, MAPA_LARGURA } from '../app/lib/selo/mapaPessoal.mjs';
import { cidadesDoPassaporte } from '../app/lib/selo/mapaPessoalServidor.mjs';
import { validarRelato } from '../app/lib/selo/memoria.mjs';
import estados from '../app/lib/selo/mapaEstados.json' with { type: 'json' };
import { lerIdentidade } from '../app/selo/passaporte/recursosPassaporte.js';

test('mapa pessoal: cidade repetida entra uma vez (a primeira passagem) e sem incluir estações', () => {
  const entradas = [
    { id: 'um', carimbo: 'socorro-sp', uf: 'SP', dia: '2026-10-11', serie: '0001·B' },
    { id: 'dois', carimbo: 'socorro-sp', uf: 'SP', dia: '2026-10-14' },
    { id: 'tres', carimbo: 'manaus-am', uf: 'AM', dia: '2026-10-12' },
  ];
  const p = montarPassaporte({ entradas, estacoes: [{ estacao: 'verao', ano: 2026, confirmadoEm: '2026-02-01T12:00:00Z' }] });
  const cidades = cidadesDoPassaporte(p.carimbos);
  assert.equal(cidades.length, 2);
  const socorro = cidades.find((c) => c.slug === 'socorro-sp');
  assert.deepEqual(socorro.visitas.map((v) => v.entradaId), ['um']);
  assert.equal(socorro.visitas[0].serie, '0001·B');
  assert.equal(cidades.find((c) => c.slug === 'manaus-am').uf, 'AM');
  assert.equal(p.stats.cidades, 2);
  assert.equal(p.colecoes[0].feitos, 1, 'Manaus não aumenta progresso das 42 cidades');
  for (const c of cidades) {
    assert.ok(c.ponto[0] > 0 && c.ponto[0] < MAPA_LARGURA);
    assert.ok(c.ponto[1] > 0 && c.ponto[1] < MAPA_ALTURA);
    assert.ok(!('lat' in c) && !('lng' in c), 'modelo envia somente centro projetado');
  }
  assert.deepEqual(agruparCidades([]), []);
  assert.equal(estados.length, 27);
  assert.equal(new Set(estados.map((e) => e.uf)).size, 27);
  assert.ok(projetarBrasil(-47.9, -15.8).every(Number.isFinite));
});

test('memória pertence à passagem e ao dono: persiste, edita, limpa e não vaza pelo modelo público', () => {
  const pasta = mkdtempSync(join(tmpdir(), 'selo-memorias-'));
  try {
    const s = criarStoreLocal(pasta);
    const ana = s.criarPassaporte({ nome: 'Ana Souza', whatsapp: '35911112222', cidade: 'Itajubá', uf: 'MG' });
    const bruno = s.criarPassaporte({ nome: 'Bruno Lima', whatsapp: '35933334444', cidade: 'Socorro', uf: 'SP' });
    const d = { carimbo: 'socorro-sp', uf: 'SP', ibge: 3552106, dia: '2026-10-11' };
    const um = s.carimbarCidade(ana.codigo, d);
    const dois = s.carimbarCidade(ana.codigo, { carimbo: 'penha-sc', uf: 'SC', ibge: 4212809, dia: '2026-10-14' });
    assert.equal(s.memoriaPorEntrada(bruno.codigo, um.id), null);
    assert.equal(s.salvarMemoria(bruno.codigo, um.id, 'Tentativa indevida'), null);
    s.salvarMemoria(ana.codigo, um.id, 'Primeira viagem com minha filha.');
    assert.equal(criarStoreLocal(pasta).memoriaPorEntrada(ana.codigo, um.id).relato, 'Primeira viagem com minha filha.');
    assert.equal(s.memoriaPorEntrada(ana.codigo, dois.id).relato, '');
    s.salvarMemoria(ana.codigo, dois.id, 'Voltei pela serra.');
    assert.equal(s.memoriaPorEntrada(ana.codigo, um.id).relato, 'Primeira viagem com minha filha.');
    s.autorizarPassaporte(ana.codigo, true);
    const p = s.passaportePublico(ana.numero);
    const modelo = montarPassaporte({ entradas: p.entradas });
    assert.ok(!JSON.stringify(modelo).includes('Primeira viagem'));
    assert.ok(!JSON.stringify(modelo).includes('memoria_relato'));
    s.salvarMemoria(ana.codigo, um.id, '');
    assert.equal(s.memoriaPorEntrada(ana.codigo, um.id).relato, '');
    s.excluirMotociclista(s.motoPorCodigo(ana.codigo).id);
    assert.equal(s.memoriaPorEntrada(ana.codigo, dois.id), null);
  } finally { rmSync(pasta, { recursive: true, force: true }); }
});

test('relato aceita texto simples e recusa payloads inválidos e longos', () => {
  assert.deepEqual(validarRelato('  Estrada\nboa  '), { ok: true, relato: 'Estrada\nboa' });
  assert.deepEqual(validarRelato(''), { ok: true, relato: '' });
  for (const invalido of [null, {}, [], 5, 'x'.repeat(801)]) assert.equal(validarRelato(invalido).ok, false);
  assert.equal(validarRelato('x'.repeat(800)).ok, true);
});

test('ficha pública e passaporte de outra pessoa nunca usam foto ou identificação local do visitante', () => {
  const anterior = globalThis.localStorage;
  const pessoa = { numero: 42, nome: 'Ana Souza', cidade: 'Itajubá', uf: 'MG' };
  let leituras = 0;
  const perfil = { codigo: 'aabbccddeeff', numero: 42, ficha: { piloto: 'Ana S.', garupa: 'João', origem: 'Itajubá/MG' } };
  globalThis.localStorage = { getItem: (chave) => { leituras++; return chave === 'selo:perfil' ? JSON.stringify(perfil) : JSON.stringify({ codigo: perfil.codigo, numero: perfil.numero, src: 'data:image/jpeg;base64,foto-privada' }); } };
  try {
    const publica = lerIdentidade({ pessoa, privado: false });
    assert.equal(leituras, 0, 'página pública não consulta identidade do visitante');
    assert.equal(publica.fotoSrc, null);
    assert.equal(publica.dados.piloto, 'Ana Souza');
    const outra = lerIdentidade({ pessoa: { ...pessoa, numero: 43 }, privado: true, codigo: 'aabbccddeeff' });
    assert.equal(outra.fotoSrc, null);
    assert.equal(outra.dados.garupa, '');
    assert.equal(lerIdentidade({ pessoa, privado: true, codigo: '112233445566' }).fotoSrc, null);
    const dona = lerIdentidade({ pessoa, privado: true, codigo: 'aabbccddeeff' });
    assert.equal(dona.dados.piloto, 'Ana S.');
    assert.equal(dona.dados.garupa, 'João');
    assert.match(dona.fotoSrc, /^data:image/);
  } finally {
    if (anterior === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = anterior;
  }
});
