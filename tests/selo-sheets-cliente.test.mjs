// Roda sozinho pelo npm test (o import abaixo neutraliza o server-only).
// Simula a API do Google: valida JWT, sequência de chamadas e modo RAW.
import './helpers/sem-server-only.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync, createVerify } from 'node:crypto';

const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
process.env.GOOGLE_SA_EMAIL = 'selo@projeto.iam.gserviceaccount.com';
process.env.GOOGLE_SA_PRIVATE_KEY = privateKey.export({ type: 'pkcs8', format: 'pem' }).replace(/\n/g, '\\n');

const chamadas = [];
let falhasForcadas = 0;
globalThis.fetch = async (url, opcoes = {}) => {
  chamadas.push({ url: String(url), metodo: opcoes.method || 'GET', corpo: opcoes.body });
  const resp = (status, json) => new Response(JSON.stringify(json), { status });
  if (String(url).includes('oauth2')) return resp(200, { access_token: 'tok-teste', expires_in: 3600 });
  if (falhasForcadas > 0) { falhasForcadas -= 1; return resp(503, { error: 'indisponível' }); }
  if (String(url).includes('fields=sheets')) return resp(200, { sheets: [{ properties: { sheetId: 1, title: 'Visitas' } }] });
  return resp(200, {});
};

const { acrescentar, garantirAba, sheetsConfigurado } = await import('../app/lib/selo/googleSheets.js');

test('JWT da conta de serviço é assinado corretamente (RS256)', async () => {
  assert.equal(sheetsConfigurado(), true);
  await acrescentar('1AbC_dEf-1234567890abcdefXYZ', 'Eventos', [['x']]);
  const pedido = chamadas.find((c) => c.url.includes('oauth2'));
  const jwt = new URLSearchParams(pedido.corpo.toString()).get('assertion');
  const [cab, corpo, assinatura] = jwt.split('.');
  assert.ok(createVerify('RSA-SHA256').update(`${cab}.${corpo}`).verify(publicKey, Buffer.from(assinatura, 'base64url')));
  const dados = JSON.parse(Buffer.from(corpo, 'base64url').toString());
  assert.equal(dados.iss, process.env.GOOGLE_SA_EMAIL);
  assert.equal(dados.scope, 'https://www.googleapis.com/auth/spreadsheets');
});

test('acrescentar usa RAW (texto nunca vira fórmula) e aba com aspas escapada', async () => {
  chamadas.length = 0;
  await acrescentar('1AbC_dEf-1234567890abcdefXYZ', "Aba d'X", [['=1+1']]);
  const append = chamadas.find((c) => c.url.includes(':append'));
  assert.match(append.url, /valueInputOption=RAW/);
  assert.match(decodeURIComponent(append.url), /'Aba d''X'!A1/);
  assert.deepEqual(JSON.parse(append.corpo).values, [['=1+1']]);
});

test('garantirAba cria só quando falta', async () => {
  chamadas.length = 0;
  assert.equal(await garantirAba('1AbC_dEf-1234567890abcdefXYZ', 'Visitas'), false);
  assert.equal(await garantirAba('1AbC_dEf-1234567890abcdefXYZ', 'Eventos'), true);
  assert.ok(chamadas.some((c) => c.url.endsWith(':batchUpdate') && c.corpo.includes('addSheet')));
});

test('falha temporária do Google (503) é repetida e se recupera', async () => {
  falhasForcadas = 2;
  await acrescentar('1AbC_dEf-1234567890abcdefXYZ', 'Eventos', [['ok']]);
  assert.equal(falhasForcadas, 0);
});
