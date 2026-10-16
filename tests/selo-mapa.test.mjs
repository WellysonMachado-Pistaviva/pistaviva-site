import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { CIDADES, cidadePorSlug } from '../app/lib/selo/cidades.mjs';
import { LIMITE_DENUNCIAS, OFFLINE_MAX_MS, autorFoto, codigoSerie, letraSerie, centroCidade, cidadesDoMapa, horaDaCaptura, nomeCurto } from '../app/lib/selo/mapaCidades.mjs';
import { dentroDoPoligono } from '../app/lib/selo/cidades.mjs';
import { validarPassaporte } from '../app/lib/selo/schema.mjs';
import { criarStoreLocal } from '../app/lib/selo/storeLocal.mjs';

const comStore = (fn) => {
  const pasta = mkdtempSync(join(tmpdir(), 'selo-mapa-'));
  try { fn(criarStoreLocal(pasta), pasta); } finally { rmSync(pasta, { recursive: true, force: true }); }
};

test('hora da captura: online usa agora; offline até 72 h; futuro e antigo recusados', () => {
  const agora = new Date('2026-10-14T15:00:00Z');
  assert.deepEqual(horaDaCaptura(undefined, agora), { ok: true, quando: agora, offline: false });
  assert.equal(horaDaCaptura('2026-10-14T14:59:30Z', agora).offline, false);
  const offline = horaDaCaptura('2026-10-13T10:00:00Z', agora);
  assert.equal(offline.offline, true);
  assert.equal(offline.quando.toISOString(), '2026-10-13T10:00:00.000Z');
  assert.equal(horaDaCaptura(new Date(agora - OFFLINE_MAX_MS - 1000).toISOString(), agora).motivo, 'antigo');
  assert.equal(horaDaCaptura('2026-10-14T15:30:00Z', agora).motivo, 'futuro');
  assert.equal(horaDaCaptura('2026-10-14T15:03:00Z', agora).ok, true);   // relógio um pouco adiantado
  assert.equal(horaDaCaptura('ontem', agora).motivo, 'invalido');
  // Vem do cliente: tipo errado é recusado, não derruba o servidor.
  for (const lixo of [{ toString: 1 }, [], 1760000000000, true, 'x'.repeat(41)]) assert.equal(horaDaCaptura(lixo, agora).motivo, 'invalido');
});

test('autoria: primeiro nome + inicial + nº, nunca o nome completo', () => {
  assert.equal(nomeCurto('Ana Maria Souza'), 'Ana Maria S.');
  assert.equal(nomeCurto('Ana'), 'Ana');
  assert.equal(nomeCurto(''), 'Motociclista');
  assert.equal(autorFoto('João Pedro da Silva', 90), 'João Pedro S. · nº 0090');
});

test('mapa: toda cidade tem centro dentro do estado certo e entra mesmo sem carimbo', () => {
  for (const c of CIDADES) {
    const { lat, lng } = centroCidade(c.poligonos);
    assert.ok(lat < 6 && lat > -34 && lng < -34 && lng > -74, `${c.slug} fora do Brasil`);
  }
  const itajuba = cidadePorSlug('itajuba-mg');
  if (itajuba) {
    const { lat, lng } = centroCidade(itajuba.poligonos);
    assert.ok(itajuba.poligonos.some((p) => dentroDoPoligono(lng, lat, p)), 'centro de Itajubá cai no município');
  }
  const lista = cidadesDoMapa(CIDADES, [{ carimbo: CIDADES[5].slug, carimbos: '7', pessoas: '3', fotos: '2' }]);
  assert.equal(lista.length, CIDADES.length);
  assert.deepEqual([lista[0].slug, lista[0].carimbos, lista[0].pessoas, lista[0].fotos], [CIDADES[5].slug, 7, 3, 2]);
  assert.equal(lista[1].carimbos, 0);
});

test('cadastro online: valida identidade e aceite', () => {
  const ok = validarPassaporte({ nome: ' Ana  Souza ', whatsapp: '(35) 99999-0000', cidade: 'Itajubá', uf: 'MG', aceite_lgpd: true });
  assert.equal(ok.ok, true);
  assert.equal(ok.dados.nome, 'Ana Souza');
  assert.equal(ok.dados.whatsapp, '35999990000');
  const ruim = validarPassaporte({ nome: '<b>', whatsapp: '123', cidade: '', uf: 'XX' });
  assert.equal(ruim.ok, false);
  assert.deepEqual(Object.keys(ruim.erros).sort(), ['aceite_lgpd', 'cidade', 'nome', 'uf', 'whatsapp']);
});

test('store local: passaporte online, carimbo sem foto, foto pública, denúncia esconde, admin restaura', () => comStore((s, pasta) => {
  const novo = s.criarPassaporte({ nome: 'Ana Souza', whatsapp: '35999990000', cidade: 'Itajubá', uf: 'MG' });
  assert.equal(novo.existente, false);
  assert.match(novo.codigo, /^[a-f0-9]{12}$/);
  // Mesmo WhatsApp: não devolve o código de outra pessoa.
  assert.deepEqual(s.criarPassaporte({ nome: 'Outro', whatsapp: '35999990000', cidade: 'X', uf: 'MG' }), { numero: novo.numero, codigo: null, existente: true });

  const d = { carimbo: 'socorro-sp', ibge: 3552106, uf: 'SP', dia: '2026-10-14', distancia: 0, precisao: 12, metodo: 'gps_offline', capturadoEm: '2026-10-14T10:00:00.000Z' };
  const c = s.carimbarCidade(novo.codigo, d);
  const e = s.ler().entradas[0];
  assert.equal(e.foto_path, null);
  assert.equal(e.metodo, 'gps_offline');
  assert.deepEqual(s.resumoMapa(), [{ carimbo: 'socorro-sp', carimbos: 1, pessoas: 1, fotos: 0 }]);

  // Foto opcional: só o dono anexa; pública entra no mapa na hora.
  const path = `cidade-x-${c.id}.jpg`;
  mkdirSync(join(pasta, 'fotos'), { recursive: true });
  writeFileSync(join(pasta, 'fotos', path), 'jpg');
  const outro = s.criarPassaporte({ nome: 'Bia Lima', whatsapp: '35988880000', cidade: 'Itajubá', uf: 'MG' });
  assert.equal(s.anexarFotoCidade(outro.codigo, c.id, path, true), null);
  assert.deepEqual(s.anexarFotoCidade(novo.codigo, c.id, path, true), { carimbo: 'socorro-sp', status: 'publica' });
  assert.equal(s.fotoPublica(c.id), path);
  const [foto] = s.fotosDaCidade('socorro-sp');
  assert.equal(foto.autor, `Ana S. · nº ${String(novo.numero).padStart(4, '0')}`);
  assert.equal(s.resumoMapa()[0].fotos, 1);

  // Denúncia: uma por pessoa; a 3ª pessoa diferente esconde.
  assert.equal(s.denunciarFoto(c.id, 'a'.repeat(64)), 'publica');
  assert.equal(s.denunciarFoto(c.id, 'a'.repeat(64)), 'publica');
  assert.equal(s.denunciarFoto(c.id, 'b'.repeat(64)), 'publica');
  assert.equal(LIMITE_DENUNCIAS, 3);
  assert.equal(s.denunciarFoto(c.id, 'c'.repeat(64)), 'denunciada');
  assert.equal(s.fotoPublica(c.id), null);
  assert.deepEqual(s.fotosDaCidade('socorro-sp'), []);
  assert.equal(s.listarFotosCidades('denunciada')[0].denuncias, 3);

  // Admin revisa e devolve ao mapa: denúncias zeradas.
  assert.equal(s.mudarStatusFotoCidade(c.id, 'publica'), true);
  assert.equal(s.fotoPublica(c.id), path);
  assert.equal(s.ler().entradas[0].denuncias, 0);
  assert.equal(s.mudarStatusFotoCidade(c.id, 'oculta'), true);
  assert.equal(s.fotoPublica(c.id), null);

  // LGPD: apagar a pessoa leva carimbo, foto e denúncias.
  const { id } = s.motoPorCodigo(novo.codigo);
  s.denunciarFoto(c.id, 'd'.repeat(64));
  assert.equal(s.excluirMotociclista(id), true);
  assert.equal(s.fotoExiste(path), false);
  assert.equal(s.ler().denuncias.length, 0);
  assert.deepEqual(s.resumoMapa(), []);
}));

test('série: número por cidade na ordem de chegada, nunca reaproveitado, letra estável', () => comStore((s) => {
  const a = s.criarPassaporte({ nome: 'Ana Souza', whatsapp: '35999990001', cidade: 'Itajubá', uf: 'MG' });
  const b = s.criarPassaporte({ nome: 'Bia Lima', whatsapp: '35999990002', cidade: 'Itajubá', uf: 'MG' });
  const d = { carimbo: 'socorro-sp', ibge: 3552106, uf: 'SP', dia: '2026-10-14', distancia: 0, precisao: 12 };
  const a1 = s.carimbarCidade(a.codigo, d);
  assert.equal(a1.serie, 1);
  assert.equal(s.carimbarCidade(a.codigo, d).serie, 1);            // mesmo dia: mesmo carimbo, mesmo nº
  assert.equal(s.carimbarCidade(b.codigo, d).serie, 2);
  assert.equal(s.carimbarCidade(a.codigo, { ...d, dia: '2026-10-20' }).serie, 3);
  assert.equal(s.carimbarCidade(a.codigo, { ...d, carimbo: 'barretos-sp' }).serie, 1);   // cada cidade conta a sua
  // LGPD apaga a Bia: o nº 2 não volta para ninguém.
  s.excluirMotociclista(s.motoPorCodigo(b.codigo).id);
  assert.equal(s.carimbarCidade(a.codigo, { ...d, dia: '2026-10-21' }).serie, 4);
  assert.match(codigoSerie(7, a1.id), /^0007·[A-HJ-NP-Z]$/);
  assert.equal(letraSerie(a1.id), letraSerie(a1.id));
  assert.equal(codigoSerie(null, a1.id), null);
}));

test('carimbo do passaporte: as 42 cidades têm molde e saem com texto em contorno', async () => {
  const { montarCarimboPassaporte, moldeDaCidade, MOLDES_CARIMBO } = await import('../app/lib/selo/carimboPassaporte.mjs');
  for (const c of CIDADES) {
    const m = moldeDaCidade(c.slug);
    assert.ok(m && MOLDES_CARIMBO.includes(m.molde), `${c.slug} sem molde`);
    const svg = montarCarimboPassaporte(c, { dia: '2026-10-14', serie: '0007·K' });
    assert.doesNotMatch(svg, /NaN|undefined|<text/, c.slug);
    assert.match(svg, /14 OUT 2026/);
    assert.match(svg, /Nº 0007·K/);
  }
  const catalogo = montarCarimboPassaporte(CIDADES[0]);
  assert.doesNotMatch(catalogo, /OUT 2026/);
});

test('carimbo em moldura original: 42 cidades e amostra do Brasil, sem texto solto', async () => {
  const { carimboDoMunicipio } = await import('../app/lib/selo/carimboCidade.mjs');
  const { MUNICIPIOS_BRASIL } = await import('../app/lib/selo/municipiosBrasil.mjs');
  for (const c of CIDADES) {
    const svg = carimboDoMunicipio(c.slug, { dia: '2026-10-14', serie: '0007·K' });
    assert.doesNotMatch(svg, /NaN|undefined|<text/, c.slug);
    assert.match(svg, /14 OUT 2026, Nº 0007·K/);
  }
  for (const m of MUNICIPIOS_BRASIL.filter((_, i) => i % 97 === 0)) assert.doesNotMatch(carimboDoMunicipio(m.slug), /NaN|undefined|<text/, m.slug);
  assert.equal(carimboDoMunicipio('nao-existe-xx'), null);
});

test('regiões: todo município do Brasil tem região; Itajubá é Mantiqueira', async () => {
  const { REGIOES, regiaoDoMunicipio, municipiosDaRegiao } = await import('../app/lib/selo/regioes.mjs');
  const { MUNICIPIOS_BRASIL } = await import('../app/lib/selo/municipiosBrasil.mjs');
  for (const m of MUNICIPIOS_BRASIL) assert.ok(regiaoDoMunicipio(m.slug), `${m.slug} sem região`);
  assert.equal(regiaoDoMunicipio('itajuba-mg').arquivo, 'mg-mantiqueira');
  assert.equal(REGIOES.reduce((s, r) => s + municipiosDaRegiao(r.arquivo).length, 0), MUNICIPIOS_BRASIL.length);
});

test('check-in no Brasil inteiro: acha o município pelo GPS; fora do país não carimba', async () => {
  const { municipioDoPonto, centroDoMunicipio } = await import('../app/lib/selo/malhaBrasil.mjs');
  const r = (lat, lng, precisao = 20) => municipioDoPonto({ lat, lng, precisao });
  assert.equal(r(-22.4258, -45.4528).municipio.slug, 'itajuba-mg');
  assert.equal(r(-3.119, -60.0217).municipio.slug, 'manaus-am');
  assert.equal(r(-22.59857, -46.51179).municipio.slug, 'socorro-sp');
  assert.equal(r(-23.0, -40.0).motivo, 'fora');            // alto-mar
  assert.equal(r(-34.6037, -58.3816).motivo, 'fora');      // Buenos Aires
  assert.equal(r(-22.4258, -45.4528, 500).motivo, 'precisao');
  assert.equal(r(999, 0).motivo, 'invalido');
  const c = centroDoMunicipio(3132404);
  assert.ok(Math.abs(c.lat + 22.43) < 0.2 && Math.abs(c.lng + 45.4) < 0.2);
});
