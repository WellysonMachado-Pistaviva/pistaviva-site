import test from 'node:test';
import assert from 'node:assert/strict';
import cobertura from '../app/lib/rotaMunicipios.json' with { type: 'json' };
import { cityByCode } from '../app/lib/municipios.mjs';
import { UF_IBGE } from '../app/lib/ufs.mjs';

const modos = Object.entries(cobertura.modos);

test('cobertura traz os dois modos de rota com totais coerentes', () => {
  assert.deepEqual(modos.map(([nome]) => nome), ['todos', 'prontos']);
  for (const [nome, rota] of modos) {
    const municipios = rota.estados.flatMap(e => e.municipios);
    assert.equal(municipios.length, rota.totalMunicipios, `${nome}: total divergente`);
    assert.equal(rota.estados.length, rota.totalEstados, `${nome}: estados divergentes`);
    assert.ok(rota.distanciaKm > 0 && rota.ids.length > 1, `${nome}: rota vazia`);
    // Travessias por Argentina e Paraguai: declaradas, e sempre menores que a rota.
    assert.ok(rota.kmForaDoBrasil > 0 && rota.kmForaDoBrasil < rota.distanciaKm, `${nome}: km fora do Brasil incoerente`);
  }
});

test('cada município pertence ao estado em que foi listado', () => {
  for (const [nome, rota] of modos) {
    for (const estado of rota.estados) {
      assert.ok(UF_IBGE[estado.uf], `${nome}: UF desconhecida ${estado.uf}`);
      for (const municipio of estado.municipios) {
        assert.match(municipio.codigo, /^[0-9]{7}$/);
        assert.ok(municipio.codigo.startsWith(UF_IBGE[estado.uf]), `${nome}: ${municipio.nome} não é de ${estado.uf}`);
      }
    }
  }
});

test('nomes conferem com o cadastro do IBGE e não se repetem', () => {
  for (const [nome, rota] of modos) {
    const codigos = new Set();
    for (const estado of rota.estados) {
      for (const municipio of estado.municipios) {
        assert.equal(codigos.has(municipio.codigo), false, `${nome}: ${municipio.nome} repetido`);
        codigos.add(municipio.codigo);
        const oficial = cityByCode(estado.uf, municipio.codigo);
        if (oficial) assert.equal(municipio.nome, oficial.name, `${nome}: nome fora do cadastro (${municipio.nome})`);
      }
    }
  }
});

test('a varredura é fina o bastante para não perder municípios', () => {
  // Amostrar só os vértices do traçado (≈410 m) perdia 15 municípios; a linha é
  // densificada e varrida a cada 10 m, passo em que a contagem para de crescer.
  assert.ok(cobertura.modos.todos.totalMunicipios >= 511, `contagem caiu para ${cobertura.modos.todos.totalMunicipios}: a varredura regrediu`);
  const perdidos = ['Sarandi', 'Jaboti', 'Itapeva', 'Barueri', 'Natalândia', 'Louveira', 'Pedro de Toledo'];
  const nomes = new Set(cobertura.modos.todos.estados.flatMap(e => e.municipios.map(m => m.nome)));
  for (const nome of perdidos) assert.ok(nomes.has(nome), `${nome} sumiu da rota`);
});

test('municípios com monumento trazem número oficial e perfil válido', () => {
  const comMonumento = cobertura.modos.todos.estados.flatMap(e => e.municipios).filter(m => m.monumento);
  assert.ok(comMonumento.length > 30);
  for (const municipio of comMonumento) {
    assert.ok(Array.isArray(municipio.monumentos) && municipio.monumentos.length > 0, `${municipio.nome} sem monumento anexado`);
    for (const monumento of municipio.monumentos) {
      assert.equal(Number.isInteger(monumento.id) && monumento.id > 0, true, `${municipio.nome}: número inválido`);
      assert.ok(monumento.nome, `${municipio.nome}: monumento sem nome`);
      if (!monumento.instagram) continue;
      assert.match(monumento.instagram.handle, /^[A-Za-z0-9._]{1,30}$/);
      assert.equal(monumento.instagram.url, `https://www.instagram.com/${monumento.instagram.handle}/`);
    }
  }
  // Só perfis do Instagram entram: o cadastro também traz link de mapa.
  const perfis = comMonumento.flatMap(m => m.monumentos).filter(m => m.instagram);
  assert.ok(perfis.length > 25, `poucos perfis: ${perfis.length}`);
  for (const { instagram } of perfis) assert.equal(new URL(instagram.url).hostname, 'www.instagram.com');
});

test('municípios sem monumento não carregam dados de monumento', () => {
  const sem = cobertura.modos.todos.estados.flatMap(e => e.municipios).filter(m => !m.monumento);
  for (const municipio of sem) assert.equal(municipio.monumentos, undefined, `${municipio.nome} veio com monumentos`);
});

test('as etapas cobrem exatamente a mesma lista de municípios', () => {
  for (const [nome, rota] of modos) {
    const catalogo = new Set(rota.estados.flatMap(e => e.municipios.map(m => m.codigo)));
    const nasEtapas = new Set(rota.etapas.flatMap(e => e.municipios));
    for (const codigo of nasEtapas) assert.ok(catalogo.has(codigo), `${nome}: etapa cita ${codigo} fora da lista`);
    assert.equal(nasEtapas.size, rota.totalMunicipios, `${nome}: etapas e lista divergem`);
    // Uma etapa por par de paradas consecutivas, somando a distância da rota.
    assert.ok(rota.etapas.length >= rota.ids.length - 1, `${nome}: etapas de menos`);
    for (const etapa of rota.etapas) {
      assert.ok(etapa.de && etapa.para, `${nome}: etapa sem origem ou destino`);
      assert.ok(etapa.municipios.length > 0 || etapa.kmForaDoBrasil, `${nome}: etapa ${etapa.de}→${etapa.para} vazia`);
    }
    const somaEtapas = rota.etapas.reduce((total, etapa) => total + etapa.km, 0);
    assert.ok(Math.abs(somaEtapas - rota.distanciaKm) < rota.distanciaKm * 0.02, `${nome}: soma das etapas (${somaEtapas}) longe do total (${rota.distanciaKm})`);
  }
});

test('a rota completa cobre mais chão que a versão só com prontos', () => {
  const { todos, prontos } = cobertura.modos;
  assert.ok(todos.totalMunicipios > prontos.totalMunicipios);
  assert.ok(todos.totalEstados >= prontos.totalEstados);
});

test('municípios de passagem conhecidos aparecem na rota completa', () => {
  const nomes = new Set(cobertura.modos.todos.estados.flatMap(e => e.municipios.map(m => `${m.nome}/${e.uf}`)));
  for (const esperado of ['Itajubá/MG', 'Brasília/DF']) assert.ok(nomes.has(esperado), `faltou ${esperado}`);
  const comMonumento = cobertura.modos.todos.estados.flatMap(e => e.municipios).filter(m => m.monumento);
  assert.ok(comMonumento.length > 30, `poucos municípios com monumento: ${comMonumento.length}`);
});
