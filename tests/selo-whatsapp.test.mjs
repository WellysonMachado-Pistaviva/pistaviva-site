import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizarWhatsapp, mascararWhatsapp } from '../app/lib/selo/whatsapp.mjs';

test('formatos diferentes do mesmo número viram os mesmos dígitos', () => {
  for (const v of ['(35) 99999-8888', '35999998888', '+55 35 99999-8888', '5535999998888', '035999998888', ' 35 9 9999 8888 ']) {
    assert.equal(normalizarWhatsapp(v), '35999998888', v);
  }
});

test('fixo com 10 dígitos é aceito', () => {
  assert.equal(normalizarWhatsapp('(35) 3622-1234'), '3536221234');
});

test('vazio vira null (campo opcional)', () => {
  assert.equal(normalizarWhatsapp(''), null);
  assert.equal(normalizarWhatsapp(undefined), null);
  assert.equal(normalizarWhatsapp('---'), null);
});

test('número inválido vira false', () => {
  for (const v of ['123', '3599999', '359999988889999', '(10) 99999-8888', '(35) 89999-8888', '(01) 3622-1234']) {
    assert.equal(normalizarWhatsapp(v), false, v);
  }
});

test('máscara acompanha a digitação', () => {
  assert.equal(mascararWhatsapp('3'), '(3');
  assert.equal(mascararWhatsapp('3599'), '(35) 99');
  assert.equal(mascararWhatsapp('3536221234'), '(35) 3622-1234');
  assert.equal(mascararWhatsapp('35999998888'), '(35) 99999-8888');
  assert.equal(mascararWhatsapp('359999988889'), '(35) 99999-8888');
});
