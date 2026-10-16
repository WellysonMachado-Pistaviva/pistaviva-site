import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { criarStoreLocal } from '../app/lib/selo/storeLocal.mjs';
import { criarServicoAcesso, hashRecuperacao } from '../app/lib/selo/acessoServico.mjs';
import { erroSenha, validarSenhaAcesso, validarBuscaRecuperacao, confereBuscaRecuperacao } from '../app/lib/selo/acessoRegras.mjs';

const senha = 'Minha frase na estrada 2026';
const nova = 'Outra frase segura na estrada';
const cadastro = { nome: 'Ána Souza', whatsapp: '11900001234', cidade: 'Itajubá', uf: 'MG', senha, confirmacao: senha, aceite_lgpd: true };
const pedido = (codigo, extra = {}) => ({ iniciais: 'ana', finais: '1234', cidade: 'itajuba', uf: 'MG', codigoRecuperacao: codigo, senha: nova, confirmacao: nova, ...extra });
function contexto(t) {
  const pasta = mkdtempSync(join(tmpdir(), 'selo-acesso-'));
  t.after(() => rmSync(pasta, { recursive: true, force: true }));
  const repo = criarStoreLocal(pasta);
  return { pasta, repo, acesso: criarServicoAcesso(repo) };
}

test('cadastro persiste conta e hashes juntos; duplicação não devolve nem sobrescreve credenciais', async (t) => {
  const { repo, pasta, acesso } = contexto(t);
  const r = await acesso.cadastrar(cadastro);
  assert.equal(r.ok, true);
  assert.match(r.codigoRecuperacao, /^([A-F0-9]{4}-){7}[A-F0-9]{4}$/);
  const db = repo.ler();
  assert.equal(db.motociclistas.length, 1);
  assert.match(db.acessos[0].senha_hash, /^\$2b\$12\$/);
  assert.equal(db.acessos[0].recuperacao_hash, hashRecuperacao(r.codigoRecuperacao));
  assert.ok(!JSON.stringify(db).includes(senha));
  assert.ok(!JSON.stringify(db).includes(r.codigoRecuperacao));
  assert.equal((await acesso.cadastrar({ ...cadastro, nome: 'Outra pessoa' })).ok, false);
  assert.deepEqual(repo.ler(), db);
  const reaberto = criarServicoAcesso(criarStoreLocal(pasta));
  assert.equal((await reaberto.entrar({ whatsapp: '+55 (11) 90000-1234', senha })).codigo, r.codigo);
});

test('senha errada e conta inexistente têm mesma resposta, sem número ou código pessoal', async (t) => {
  const { acesso } = contexto(t);
  await acesso.cadastrar(cadastro);
  const errada = await acesso.entrar({ whatsapp: cadastro.whatsapp, senha: nova });
  const ausente = await acesso.entrar({ whatsapp: '11900005678', senha });
  assert.deepEqual(errada, ausente);
  assert.equal(errada.codigo, undefined);
  assert.equal(errada.numero, undefined);
});

test('dados públicos sozinhos ou código errado nunca recuperam; dados divergentes não consomem código', async (t) => {
  const { acesso, repo } = contexto(t);
  const r = await acesso.cadastrar(cadastro);
  const antes = repo.ler();
  for (const extra of [{ codigoRecuperacao: '' }, { codigoRecuperacao: 'A'.repeat(32) }, { iniciais: 'bru' }, { finais: '9999' }, { cidade: 'Outra cidade' }, { uf: 'SP' }]) {
    assert.equal((await acesso.recuperar(pedido(r.codigoRecuperacao, extra))).ok, false);
    assert.deepEqual(repo.ler(), antes);
  }
  assert.equal((await acesso.recuperar(pedido(r.codigoRecuperacao))).ok, true);
});

test('recuperação troca senha, preserva pessoa e coleção, invalida link e código anteriores e exige login', async (t) => {
  const { acesso, repo } = contexto(t);
  const r = await acesso.cadastrar(cadastro);
  const moto = repo.motoPorCodigo(r.codigo);
  const carimbo = repo.carimbarCidade(r.codigo, { carimbo: 'socorro-sp', ibge: '3552106', uf: 'SP', dia: '2026-10-15', metodo: 'gps' });
  const feito = await acesso.recuperar(pedido(r.codigoRecuperacao));
  assert.equal(feito.ok, true);
  assert.equal(feito.codigo, undefined);
  assert.notEqual(feito.codigoRecuperacao, r.codigoRecuperacao);
  assert.equal(repo.motoPorCodigo(r.codigo), null);
  assert.equal((await acesso.recuperar(pedido(r.codigoRecuperacao))).ok, false);
  assert.equal((await acesso.entrar({ whatsapp: cadastro.whatsapp, senha })).ok, false);
  const login = await acesso.entrar({ whatsapp: cadastro.whatsapp, senha: nova });
  assert.equal(login.ok, true);
  assert.equal(login.numero, r.numero);
  assert.deepEqual(repo.motoPorCodigo(login.codigo), moto);
  assert.equal(repo.entradas(moto.id)[0].id, carimbo.id);
});

test('duas recuperações simultâneas usam código somente uma vez', async (t) => {
  const { acesso } = contexto(t);
  const r = await acesso.cadastrar(cadastro);
  const tentativas = await Promise.all([acesso.recuperar(pedido(r.codigoRecuperacao)), acesso.recuperar(pedido(r.codigoRecuperacao))]);
  assert.equal(tentativas.filter(r => r.ok).length, 1);
});

test('colisão de iniciais, finais e cidade não mistura contas: código determina dono', async (t) => {
  const { acesso } = contexto(t);
  const a = await acesso.cadastrar(cadastro);
  const b = await acesso.cadastrar({ ...cadastro, nome: 'Ana Silva', whatsapp: '21900001234' });
  const feito = await acesso.recuperar(pedido(b.codigoRecuperacao));
  assert.equal(feito.ok, true);
  assert.equal((await acesso.entrar({ whatsapp: cadastro.whatsapp, senha })).codigo, a.codigo);
  assert.equal((await acesso.entrar({ whatsapp: '21900001234', senha: nova })).numero, b.numero);
});

test('perfil antigo ativa primeira senha somente com link válido; nova ativação não substitui senha existente', async (t) => {
  const { acesso, repo } = contexto(t);
  const r = repo.criarPassaporte(cadastro);
  assert.equal((await acesso.ativar({ ...cadastro, codigo: '0'.repeat(12) })).ok, false);
  const ativado = await acesso.ativar({ ...cadastro, codigo: r.codigo });
  assert.equal(ativado.ok, true);
  assert.equal((await acesso.ativar({ codigo: r.codigo, senha: nova, confirmacao: nova })).ok, false);
  assert.equal((await acesso.entrar({ whatsapp: cadastro.whatsapp, senha })).ok, true);
  repo.excluirMotociclista(repo.motoPorCodigo(r.codigo).id);
  assert.equal(repo.ler().acessos.length, 0);
  assert.equal((await acesso.recuperar(pedido(ativado.codigoRecuperacao))).ok, false);
});

test('revalidação da senha bloqueia login que perdeu corrida com redefinição', async (t) => {
  const { repo, acesso } = contexto(t);
  const r = await acesso.cadastrar(cadastro);
  const concorrente = criarServicoAcesso({ ...repo, confirmarSenha: async (id, hash) => {
    await acesso.recuperar(pedido(r.codigoRecuperacao));
    return repo.confirmarSenha(id, hash);
  } });
  assert.equal((await concorrente.entrar({ whatsapp: cadastro.whatsapp, senha })).ok, false);
});

test('validação não permite truncamento bcrypt, campos inválidos ou recuperação sem UF; nomes curtos funcionam', () => {
  assert.ok(erroSenha('123456'));
  assert.ok(erroSenha('é'.repeat(37)));
  assert.equal(erroSenha(senha), null);
  assert.ok(validarSenhaAcesso({ senha, confirmacao: nova }).confirmacao);
  assert.ok(validarBuscaRecuperacao({ iniciais: '<s>', finais: '12345', cidade: '<script>', uf: 'XX' }).iniciais);
  assert.equal(confereBuscaRecuperacao({ iniciais: 'Li', finais: '1234', cidade: 'SAO PAULO', uf: 'SP' }, { nome: 'Li', whatsapp: '11900001234', cidade: 'São Paulo', uf: 'SP' }), true);
});
