import test from 'node:test';
import assert from 'node:assert/strict';

const mapa = new Map();
const rascunhos = new Map();
globalThis.sessionStorage = {
  getItem: (k) => rascunhos.get(k) ?? null,
  setItem: (k, v) => rascunhos.set(k, String(v)),
  removeItem: (k) => rascunhos.delete(k),
};
globalThis.localStorage = {
  getItem: (k) => (mapa.has(k) ? mapa.get(k) : null),
  setItem: (k, v) => mapa.set(k, String(v)),
  removeItem: (k) => mapa.delete(k),
};
const { esquecerPerfil, lerFotoPerfil, lerPerfil, salvarFotoPerfil, salvarPerfil } = await import('../app/selo/perfilLocal.js');

test('perfil de outra pessoa no mesmo aparelho substitui, não mistura', () => {
  mapa.clear();
  salvarPerfil({ codigo: 'aaaaaaaaaaaa', numero: 1, whatsapp: '35999998888', nome: 'Ana Souza' });
  salvarPerfil({ numero: 1, cidade: 'Itajubá' });
  assert.equal(lerPerfil().whatsapp, '35999998888');   // mesma pessoa: completa
  salvarPerfil({ codigo: 'bbbbbbbbbbbb', numero: 2 });
  assert.deepEqual(lerPerfil(), { codigo: 'bbbbbbbbbbbb', numero: 2 });   // nada da Ana sobra
});

test('esquecer este celular apaga perfil, resumo offline e passagens guardadas', () => {
  mapa.clear();
  salvarPerfil({ codigo: 'aaaaaaaaaaaa', numero: 1 });
  localStorage.setItem('selo:offline:v1', '{}');
  localStorage.setItem('selo:pendentes:aaaaaaaaaaaa', '[]');
  localStorage.setItem('selo:foto', 'foto-antiga');
  sessionStorage.setItem('selo:rascunho', '{"nome":"Ana"}');
  localStorage.setItem('outra:chave', 'fica');
  assert.equal(esquecerPerfil(), true);
  assert.deepEqual([...mapa.keys()], ['outra:chave']);
  assert.equal(sessionStorage.getItem('selo:rascunho'), null);
});

test('foto não acompanha troca de pessoa nem aceita escrita de perfil antigo', () => {
  mapa.clear();
  const ana = { codigo: 'aaaaaaaaaaaa', numero: 1 };
  const bia = { codigo: 'bbbbbbbbbbbb', numero: 2 };
  const foto = 'data:image/jpeg;base64,ZXhlbXBsby1maWN0aWNpbw==';
  salvarPerfil(ana);
  assert.equal(salvarFotoPerfil(foto, ana), true);
  assert.equal(lerFotoPerfil(ana), foto);
  assert.equal(lerFotoPerfil({ ...ana, numero: 3 }), null);
  assert.equal(lerFotoPerfil(bia), null);
  salvarPerfil(bia);
  assert.equal(lerFotoPerfil(bia), null);
  assert.equal(localStorage.getItem('selo:foto'), null);
  assert.equal(salvarFotoPerfil(foto, ana), false);
  assert.equal(salvarFotoPerfil(foto, bia), true);
  esquecerPerfil();
  assert.equal(lerFotoPerfil(bia), null);
  assert.equal(localStorage.getItem('selo:foto'), null);
});

test('foto antiga sem identificação não é atribuída ao dono atual', () => {
  mapa.clear();
  const ana = { codigo: 'aaaaaaaaaaaa', numero: 1 };
  salvarPerfil(ana);
  localStorage.setItem('selo:foto', 'data:image/jpeg;base64,Zm90by1hbnRpZ2E=');
  assert.equal(lerFotoPerfil(ana), null);
});
