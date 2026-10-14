import test from 'node:test';
import assert from 'node:assert/strict';
import { validarVisita } from '../app/lib/selo/schema.mjs';

const base = () => ({
  chave: '7d1f8f3e-2b5a-4c3e-9a1d-3f2b1c0d9e8a', nome: 'Ana Souza', whatsapp: '(35) 99999-8888',
  uf: 'MG', cidade: 'Itajubá', passou_por: ['rota-68'], aceite_lgpd: true,
});

test('envio completo passa e normaliza', () => {
  const r = validarVisita({ ...base(), nome: '  Ana   Souza ', passou_por: ['rota-68', 'rota-68', 'so-itajuba'] });
  assert.equal(r.ok, true);
  assert.equal(r.dados.nome, 'Ana Souza');
  assert.equal(r.dados.whatsapp, '35999998888');
  assert.deepEqual(r.dados.passou_por, ['rota-68', 'so-itajuba']);
  assert.equal(r.dados.local, 'parque');
});

test('WhatsApp é obrigatório para identificar a pessoa', () => {
  const r = validarVisita({ ...base(), whatsapp: '' });
  assert.equal(r.ok, false);
  assert.ok(r.erros.whatsapp);
});

test('sem aceite da LGPD não envia', () => {
  assert.equal(validarVisita({ ...base(), aceite_lgpd: false }).erros.aceite_lgpd !== undefined, true);
  assert.equal(validarVisita({ ...base(), aceite_lgpd: 'true' }).ok, false);
});

test('campos obrigatórios e inválidos apontam o campo certo', () => {
  const r = validarVisita({ ...base(), nome: 'A', whatsapp: '123', uf: 'XX', cidade: '', passou_por: [] });
  assert.equal(r.ok, false);
  assert.deepEqual(Object.keys(r.erros).sort(), ['cidade', 'nome', 'passou_por', 'uf', 'whatsapp']);
});

test('opção de "por onde passou" fora da lista é recusada', () => {
  assert.equal(validarVisita({ ...base(), passou_por: ['monumento-99'] }).ok, false);
});

test('autorização de foto só vale se houver foto', () => {
  assert.equal(validarVisita({ ...base(), foto_autorizada: true }).dados.foto_autorizada, false);
  assert.equal(validarVisita({ ...base(), tem_foto: true, foto_autorizada: true }).dados.foto_autorizada, true);
});

test('local desconhecido vira parque; local da lista é mantido', () => {
  assert.equal(validarVisita({ ...base(), local: 'posto' }).dados.local, 'posto');
  assert.equal(validarVisita({ ...base(), local: '<script>' }).dados.local, 'parque');
});

test('chave de envio precisa ser UUID', () => {
  assert.equal(validarVisita({ ...base(), chave: 'abc' }).ok, false);
});

test('nome e cidade: barram HTML, fórmula e controle; aceitam nomes reais', () => {
  for (const nome of ["Maria D'Ávila", 'João-Pedro Jr.', 'Ângela Müller', 'Zé 2º'.replace('º', '')]) {
    assert.equal(validarVisita({ ...base(), nome }).ok, true, nome);
  }
  for (const nome of ['<img src=x onerror=alert(1)>', '=HYPERLINK("x")', '+5511', 'Ana\u0000Souza', 'Ana{x}', '@admin']) {
    const r = validarVisita({ ...base(), nome });
    assert.equal(r.ok, false, nome);
    assert.ok(r.erros.nome, nome);
  }
  assert.equal(validarVisita({ ...base(), cidade: '"><svg onload=1>' }).ok, false);
  assert.equal(validarVisita({ ...base(), cidade: "Santa Rita d'Oeste" }).ok, true);
});
