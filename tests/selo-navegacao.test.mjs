import test from 'node:test';
import assert from 'node:assert/strict';
import { contextoPassaporte, destinosPassaporte } from '../app/lib/selo/navegacao.mjs';

test('navegação mantém destinos do dono da página, sem misturar perfil de outro visitante', () => {
  const r = destinosPassaporte('/selo/m/aaaaaaaaaaaa', { codigo: 'bbbbbbbbbbbb' });
  assert.equal(r.passaporte, '/selo/m/aaaaaaaaaaaa');
  assert.equal(r.carimbar, '/selo/m/aaaaaaaaaaaa#carimbar');
  assert.equal(r.privacidade, '/selo/m/aaaaaaaaaaaa#privacidade');
  assert.equal(destinosPassaporte('/selo/mapa', { codigo: 'bbbbbbbbbbbb' }).passaporte, '/selo/m/bbbbbbbbbbbb');
});

test('sem perfil válido carimbar abre cadastro; caminhos externos não entram na navegação', () => {
  for (const codigo of [null, 'javascript:alert(1)', '../../admin', 'a'.repeat(13)]) {
    const r = destinosPassaporte('/selo/passaporte', { codigo });
    assert.equal(r.passaporte, '/selo/passaporte');
    assert.equal(r.carimbar, '/selo/passaporte#criar-passaporte');
  }
  assert.equal(contextoPassaporte('/selos/brasil'), true);
  assert.equal(contextoPassaporte('/selo'), true);
  assert.equal(contextoPassaporte('/selo/meu-numero'), true);
  assert.equal(contextoPassaporte('/selo/m/aaaaaaaaaaaa'), true);
  assert.equal(contextoPassaporte('/selo/parceiro/segredo'), false);
  assert.equal(contextoPassaporte('/selo/balcao'), false);
  assert.equal(contextoPassaporte('/blog'), false);
});
