import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { redigirUrl, rotaPrivada, scriptGa } from '../app/lib/urlPrivada.mjs';

test('credencial na URL nunca vai para analytics', () => {
  assert.equal(redigirUrl('https://pistaviva.com.br/selo/m/a140c62a964e'), 'https://pistaviva.com.br/selo/m/[codigo]');
  assert.equal(redigirUrl('https://pistaviva.com.br/selo/m/a140c62a964e/certificado?ano=2026#x'), 'https://pistaviva.com.br/selo/m/[codigo]/certificado?ano=2026');
  assert.equal(redigirUrl('https://pistaviva.com.br/selo/parceiro/AbCdEfGhIjKlMnOpQrStUvWxYz012345'), 'https://pistaviva.com.br/selo/parceiro/[token]');
  assert.equal(redigirUrl('/api/selo/passaporte?codigo=a140c62a964e'), '/api/selo/passaporte?codigo=redigido');
  assert.equal(redigirUrl('https://pistaviva.com.br/selo/passaporte/12'), 'https://pistaviva.com.br/selo/passaporte/12');
  assert.equal(redigirUrl('https://pistaviva.com.br/selos?uf=MG'), 'https://pistaviva.com.br/selos?uf=MG');
  assert.equal(rotaPrivada('/selo/m/abc'), true);
  assert.equal(rotaPrivada('/selo/mapa'), false);
  assert.equal(rotaPrivada('/selo/passaporte'), false);
});

test('GA desliga na rota privada antes do hit, inclusive em navegação SPA', () => {
  const historico = { pushState() {}, replaceState() {} };
  const ouvintes = {};
  const janela = { location: { pathname: '/selo/m/a140c62a964e', href: 'https://x.test/selo/m/a140c62a964e' }, history: historico, URL };
  janela.window = janela;
  janela.addEventListener = (ev, fn) => { ouvintes[ev] = fn; };
  vm.runInNewContext(scriptGa('G-TESTE123'), janela);
  assert.equal(janela['ga-disable-G-TESTE123'], true);
  assert.equal(janela.dataLayer.length, 2);
  janela.history.pushState({}, '', '/selo/passaporte');
  assert.equal(janela['ga-disable-G-TESTE123'], false);
  janela.history.replaceState({}, '', 'https://x.test/selo/parceiro/AbCdEfGhIjKlMnOpQrStUvWxYz012345');
  assert.equal(janela['ga-disable-G-TESTE123'], true);
  janela.location.pathname = '/';
  ouvintes.popstate();
  assert.equal(janela['ga-disable-G-TESTE123'], false);
  // ID com aspas não quebra o script nem injeta código.
  assert.doesNotThrow(() => vm.runInNewContext(scriptGa("G-1');alert(1);//"), { ...janela, window: janela }));
});
