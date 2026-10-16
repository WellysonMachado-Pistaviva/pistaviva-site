import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { gerarToken, nomeCurto, resumoParceiro, tokenValido, validarNomeParceiro } from '../app/lib/selo/parceiro.mjs';
import { almocoStatus, anosCompletos, estacoesConfirmadas } from '../app/lib/selo/beneficio.mjs';
import { criarStoreLocal } from '../app/lib/selo/storeLocal.mjs';

const END = { cep: '37500036', logradouro: 'Rua X', numero_endereco: '10', bairro: 'Centro' };

test('token: 32 caracteres base64url, aleatório', () => {
  const a = gerarToken();
  assert.equal(tokenValido(a), true);
  assert.notEqual(a, gerarToken());
  assert.equal(tokenValido('curto'), false);
  assert.equal(tokenValido(`${a.slice(0, 31)}/`), false);
});

test('nome curto e nome de parceiro', () => {
  assert.equal(nomeCurto('Ana Maria souza'), 'Ana S.');
  assert.equal(nomeCurto('Ana'), 'Ana');
  assert.equal(validarNomeParceiro('  Lanchonete   do Parque '), 'Lanchonete do Parque');
  assert.equal(validarNomeParceiro('x'), null);
});

test('resumo: não expõe endereço, telefone nem código do perfil', () => {
  const r = resumoParceiro({
    moto: { id: 'm', nome: 'Ana Souza', numero: 7, whatsapp: '35999998888', codigo: 'abc', ...END },
    visitas: [{ estacao: 'primavera', ano: 2026, liberado_em: '2026-10-13T15:00:00Z', checkin_metodo: 'gps' }],
    usos: [{ parceiro_id: 'p1', usado_em: '2026-10-14T15:00:00Z' }, { parceiro_id: 'p2', usado_em: '2026-10-15T15:00:00Z' }],
  }, 'p1');
  assert.equal(r.valido, true);
  assert.deepEqual(r.etapas, { dados: true, carimbo: true, beneficio: true });
  assert.deepEqual(r.pessoa, { nome: 'Ana S.', numero: 7 });
  assert.equal(r.ultimoCarimbo.metodo, 'GPS');
  assert.equal(r.usosAqui, 1);
  const texto = JSON.stringify(r);
  for (const segredo of ['35999998888', 'Rua X', '37500036', '"abc"']) assert.equal(texto.includes(segredo), false);
});

test('resumo: sem carimbo, sem cadastro, inexistente', () => {
  const semCarimbo = resumoParceiro({ moto: { nome: 'Ana', numero: 1, ...END }, visitas: [{ estacao: 'verao', ano: 2026 }], usos: [] }, 'p');
  assert.equal(semCarimbo.valido, false);
  assert.equal(semCarimbo.motivo, 'Ainda sem carimbo no Parque.');
  assert.deepEqual(semCarimbo.etapas, { dados: true, carimbo: false, beneficio: false });
  const semDados = resumoParceiro({ moto: { nome: 'Ana', numero: 1 }, visitas: [{ estacao: 'verao', ano: 2026, retirado_em: '2026-02-01T10:00:00Z' }], usos: [] }, 'p');
  assert.equal(semDados.motivo, 'Cadastro incompleto.');
  assert.equal(semDados.ultimoCarimbo.metodo, 'balcão');
  assert.deepEqual(resumoParceiro(null, 'p'), { valido: false, motivo: 'Código não encontrado.' });
  const soFoto = resumoParceiro({ moto: { nome: 'Ana', numero: 1, ...END }, visitas: [{ estacao: 'verao', ano: 2026, liberado_em: '2026-02-01T10:00:00Z', checkin_metodo: 'foto' }], usos: [] }, 'p');
  assert.equal(soFoto.valido, false);
  assert.equal(soFoto.motivo, 'Check-in só por foto: confirme no balcão do Parque.');
});

test('store local: parceiro desativado perde o link; uso fica ligado ao parceiro', () => {
  const pasta = mkdtempSync(join(tmpdir(), 'selo-'));
  try {
    const s = criarStoreLocal(pasta);
    const token = gerarToken();
    const p = s.criarParceiro('Lanchonete', token);
    assert.equal(s.parceiroPorToken(token).id, p.id);
    const a = s.registrar({ chave: randomUUID(), nome: 'Ana', whatsapp: '35999998888', cidade: 'Itajubá', uf: 'MG', passou_por: ['rota-68'], estacao: 'primavera', ano: 2026, local: 'parque' });
    const m = s.perfil(a.codigo).moto;
    s.registrarUso(m.id, '10%', p.id);
    assert.equal(s.listarParceiros()[0].usos, 1);
    assert.equal(s.ativarParceiro(p.id, false), true);
    assert.equal(s.parceiroPorToken(token), null);
    assert.equal(s.ativarParceiro(randomUUID(), true), false);
  } finally { rmSync(pasta, { recursive: true, force: true }); }
});

const ano4 = (ano, extra = {}) => ['verao', 'outono', 'inverno', 'primavera'].map((estacao) => ({ estacao, ano, retirado_em: `${ano}-11-01T10:00:00Z`, ...extra }));

test('almoço: só com as 4 estações do mesmo ano confirmadas no balcão', () => {
  assert.deepEqual(anosCompletos(ano4(2026)), [2026]);
  // GPS/foto não basta: almoço custa dinheiro.
  const soGps = ano4(2026).map(({ retirado_em, ...v }) => ({ ...v, liberado_em: retirado_em, checkin_metodo: 'gps' }));
  assert.deepEqual(anosCompletos(soGps), []);
  // Estações de anos diferentes não somam.
  assert.deepEqual(anosCompletos([...ano4(2025).slice(0, 2), ...ano4(2026).slice(2)]), []);
  assert.equal(estacoesConfirmadas(ano4(2026).slice(1), 2026), 3);
});

test('almoço: um por ano completo; usos sem tipo são desconto', () => {
  const visitas = [...ano4(2025), ...ano4(2026)];
  assert.deepEqual(almocoStatus(visitas, [{ usado_em: '2026-01-01' }]), { disponivel: true, ano: 2026, usadoEm: null });
  assert.deepEqual(almocoStatus(visitas, [{ tipo: 'almoco', ano: 2026, usado_em: 'x' }]), { disponivel: true, ano: 2025, usadoEm: null });
  const usados = [{ tipo: 'almoco', ano: 2026, usado_em: 'a' }, { tipo: 'almoco', ano: 2025, usado_em: 'b' }];
  assert.deepEqual(almocoStatus(visitas, usados), { disponivel: false, ano: 2026, usadoEm: 'a' });
  assert.deepEqual(almocoStatus([], []), { disponivel: false, ano: null, usadoEm: null });
});

test('resumo: almoço exige cadastro completo e não conta como desconto', () => {
  const usos = [{ parceiro_id: 'p', tipo: 'almoco', ano: 2026, usado_em: '2026-11-02T12:00:00Z' }];
  const r = resumoParceiro({ moto: { nome: 'Ana', numero: 1, ...END }, visitas: ano4(2026), usos }, 'p');
  assert.equal(r.usosAqui, 0);
  assert.deepEqual(r.almoco, { disponivel: false, ano: 2026, usadoEm: '2026-11-02T12:00:00Z' });
  const semEndereco = resumoParceiro({ moto: { nome: 'Ana', numero: 1 }, visitas: ano4(2026), usos: [] }, 'p');
  assert.equal(semEndereco.almoco.disponivel, false);
});

test('store local: segundo almoço do mesmo ano é recusado', () => {
  const pasta = mkdtempSync(join(tmpdir(), 'selo-'));
  try {
    const s = criarStoreLocal(pasta);
    const a = s.registrar({ chave: randomUUID(), nome: 'Ana', whatsapp: '35999998888', cidade: 'Itajubá', uf: 'MG', passou_por: ['rota-68'], estacao: 'primavera', ano: 2026, local: 'parque' });
    const m = s.perfil(a.codigo).moto;
    assert.equal(s.registrarUso(m.id, null, null, { tipo: 'almoco', ano: 2026 }), true);
    assert.equal(s.registrarUso(m.id, null, null, { tipo: 'almoco', ano: 2026 }), 'duplicado');
    assert.equal(s.registrarUso(m.id, null, null, { tipo: 'almoco', ano: 2027 }), true);
    assert.equal(s.registrarUso(m.id, '10%'), true);
    assert.deepEqual(s.perfil(a.codigo).usos.map((u) => u.ano), [2026, 2027]);
  } finally { rmSync(pasta, { recursive: true, force: true }); }
});
