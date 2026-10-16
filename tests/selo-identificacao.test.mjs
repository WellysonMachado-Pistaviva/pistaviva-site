import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';
import { criarStoreLocal } from '../app/lib/selo/storeLocal.mjs';
import { cadastroConsultavel, cadastrosCsv, cadastrosLinhas, validarIdentificacao, LIMITE_FOTO_IDENTIFICACAO } from '../app/lib/selo/identificacaoRegras.mjs';
import { prepararFotoIdentificacao } from '../app/lib/selo/fotoIdentificacao.mjs';
import { carregarIdentidade } from '../app/selo/passaporte/recursosPassaporte.js';

const ficha = { piloto: 'Ana Souza', garupa: '', origem: 'Itajubá/MG', assinatura: 'Ana' };

test('identificação valida campos e limites; não aceita HTML, controles ou tipos inesperados', () => {
  assert.deepEqual(validarIdentificacao({ ...ficha, piloto: ' Ana Souza ', codigo: 'segredo' }), { ok: true, dados: ficha });
  for (const valor of [null, [], {}, { ...ficha, piloto: 'a'.repeat(33) }, { ...ficha, garupa: '<img>' }, { ...ficha, assinatura: 'Ana\n' }, { ...ficha, origem: 123 }]) assert.equal(validarIdentificacao(valor).ok, false);
});

test('retrato real vira JPEG reduzido, sem EXIF nem GPS', async () => {
  const entrada = await sharp({ create: { width: 2000, height: 1600, channels: 3, background: '#995533' } }).withMetadata({ exif: { IFD0: { Artist: 'privado' } } }).png().toBuffer();
  const saida = await prepararFotoIdentificacao(entrada);
  const m = await sharp(saida).metadata();
  assert.equal(m.format, 'jpeg'); assert.equal(m.width, 1440); assert.equal(m.height, 1152);
  assert.equal(m.exif, undefined); assert.equal(m.xmp, undefined);
});

test('retrato recusa arquivo falso, SVG, tamanho excessivo e bomba de pixels', async () => {
  await assert.rejects(() => prepararFotoIdentificacao(Buffer.from('arquivo inválido')));
  await assert.rejects(() => prepararFotoIdentificacao(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"></svg>')));
  await assert.rejects(() => prepararFotoIdentificacao(Buffer.alloc(LIMITE_FOTO_IDENTIFICACAO + 1)));
  const pixels = await sharp({ create: { width: 4100, height: 4000, channels: 3, background: '#000' } }).png().toBuffer();
  await assert.rejects(() => prepararFotoIdentificacao(pixels));
});

test('identificação persiste por dono; nova instância recupera foto; excluir limpa cadastro e retrato', () => {
  const pasta = mkdtempSync(join(tmpdir(), 'pv-identificacao-'));
  try {
    const s = criarStoreLocal(pasta);
    const a = s.criarPassaporte({ nome: 'Ana Souza', whatsapp: '11900001234', cidade: 'Itajubá', uf: 'MG' });
    const b = s.criarPassaporte({ nome: 'Bruno Silva', whatsapp: '11900005678', cidade: 'Socorro', uf: 'SP' });
    const path = 'identidade-aaaaaaaa-bbbb.jpg';
    s.salvarFoto(path, Buffer.from('foto'));
    assert.equal(s.salvarIdentificacao('000000000000', ficha, path, true), null);
    s.salvarIdentificacao(a.codigo, ficha, path, true);
    const nova = criarStoreLocal(pasta);
    assert.deepEqual(nova.identificacao(a.codigo).registro.piloto, 'Ana Souza');
    assert.equal(nova.identificacao(b.codigo).registro, null);
    assert.equal(nova.lerFoto(path).toString(), 'foto');
    nova.salvarIdentificacao(a.codigo, { ...ficha, garupa: 'Bia' }, null, false);
    assert.equal(nova.identificacao(a.codigo).registro.foto_path, path, 'editar texto preserva retrato');
    const antiga = nova.salvarIdentificacao(a.codigo, ficha, null, true);
    assert.equal(antiga.foto_anterior, path, 'remoção retorna retrato anterior para limpeza');
    nova.salvarIdentificacao(a.codigo, ficha, path, true);
    assert.equal(nova.excluirMotociclista(nova.motoPorCodigo(a.codigo).id), true);
    assert.equal(nova.fotoExiste(path), false);
    assert.equal(nova.identificacao(a.codigo), null);
    assert.ok(nova.motoPorCodigo(b.codigo));
  } finally { rmSync(pasta, { recursive: true, force: true }); }
});

test('consulta e CSV usam allowlist, incluem cadastro sem visita e bloqueiam fórmulas', () => {
  const m = { id: 'a', numero: 42, nome: '  =HYPERLINK("segredo")', whatsapp: '11900001234', cidade: 'Itajubá', uf: 'MG', criado_em: '2026-10-15', codigo: 'LINK_PRIVADO', senha_hash: 'HASH_SENHA', recuperacao_hash: 'HASH_CODIGO' };
  const r = cadastroConsultavel(m, { ...ficha, foto_path: 'PATH_PRIVADO', atualizado_em: '2026-10-15', senha_hash: 'HASH_SENHA' });
  assert.equal(r.visitas, 0); assert.equal(r.temFoto, true);
  const json = JSON.stringify(r), csv = cadastrosCsv([r]);
  for (const segredo of ['LINK_PRIVADO', 'HASH_SENHA', 'HASH_CODIGO', 'PATH_PRIVADO']) { assert.ok(!json.includes(segredo)); assert.ok(!csv.includes(segredo)); }
  assert.ok(csv.startsWith('\uFEFFnumero,'));
  assert.equal(cadastrosLinhas([r])[0][2], "'" + m.nome);
  for (const nome of ['=1+1', '+123', '-1', '@SUM(A1)', '\t=1', '\n=1', ' \r@SUM(A1)']) assert.ok(cadastrosLinhas([{ ...r, nome }])[0][2].startsWith("'"));
  assert.ok(csv.includes('Itajubá'));
});

test('amostra e passaporte público não consultam identificação privada no servidor', async () => {
  const original = globalThis.fetch;
  let chamadas = 0;
  globalThis.fetch = () => { chamadas++; throw new Error('Não deveria chamar'); };
  try {
    const pessoa = { numero: 42, nome: 'Ana Souza', cidade: 'Itajubá', uf: 'MG' };
    const publico = await carregarIdentidade({ pessoa, privado: false, codigo: 'aabbccddeeff' });
    const demo = await carregarIdentidade({ pessoa, privado: true, demonstracao: true, codigo: 'aabbccddeeff' });
    assert.equal(chamadas, 0); assert.equal(publico.fotoSrc, null); assert.equal(demo.dados.garupa, 'João Lima');
  } finally { globalThis.fetch = original; }
});
