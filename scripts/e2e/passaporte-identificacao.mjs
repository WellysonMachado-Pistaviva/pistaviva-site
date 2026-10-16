// Contas fictícias em servidor dev/local. Nenhuma escrita em produção.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';
import { criarStoreLocal } from '../../app/lib/selo/storeLocal.mjs';
import { cadastroConsultavel, cadastrosCsv } from '../../app/lib/selo/identificacaoRegras.mjs';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.PASSAPORTE_TEST_URL || 'http://127.0.0.1:3018';
if (!['127.0.0.1', 'localhost'].includes(new URL(origin).hostname)) throw new Error('Teste exige servidor local.');
const store = criarStoreLocal();
const output = '/private/tmp/pistaviva-identificacao-mobile';
await mkdir(output, { recursive: true });
const phones = ['11900004561', '11900004562'];
if (phones.some((p) => store.porWhatsapp(p))) throw new Error('Conta de teste já existe.');
const checks = [], pessoas = [], errors = [];
let ultimaPagina;
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, acceptDownloads: true });
  assert.equal((await context.request.get(origin + '/selo/passaporte/previa/jornada', { timeout: 90000 })).status(), 200, 'Somente build dev/local.');
  for (let i = 0; i < 2; i++) {
    const p = store.criarPassaporte({ nome: `Teste Arquivo ${i + 1}`, whatsapp: phones[i], cidade: 'Itajubá', uf: 'MG' });
    pessoas.push({ ...p, id: store.motoPorCodigo(p.codigo).id });
  }
  const [a, b] = pessoas;
  await context.route('**/*', (r) => new URL(r.request().url()).origin === origin ? r.continue() : r.abort());
  const page = await context.newPage();
  ultimaPagina = page;
  page.setDefaultTimeout(60000);
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(origin + `/selo/m/${a.codigo}`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForFunction((codigo) => JSON.parse(localStorage.getItem('selo:perfil') || 'null')?.codigo === codigo, a.codigo);
  await page.goto(origin + '/selo/passaporte?editar=1', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.getByRole('button', { name: 'Salvar identificação no cadastro', exact: true }).waitFor();
  await page.locator('#sl-piloto:not([disabled])').waitFor({ timeout: 60000 });
  await page.locator('#sl-piloto').fill('Piloto Arquivo');
  await page.locator('#sl-garupa').fill('Garupa Teste');
  await page.locator('#sl-assinatura').fill('Arquivo');
  const foto = await sharp({ create: { width: 400, height: 500, channels: 3, background: '#935021' } }).png().toBuffer();
  await page.locator('#sl-foto').setInputFiles({ name: 'foto.png', mimeType: 'image/png', buffer: foto });
  await page.locator('.sl-cadastro').getByRole('status').filter({ hasText: 'Foto escolhida' }).waitFor();
  await page.getByRole('button', { name: 'Salvar identificação no cadastro', exact: true }).click();
  await page.locator('.sl-cadastro').getByRole('status').filter({ hasText: 'Identificação guardada no cadastro. Disponível' }).waitFor();
  const registro = store.identificacao(a.codigo).registro;
  assert.equal(registro.garupa, 'Garupa Teste'); assert.ok(store.fotoExiste(registro.foto_path));
  assert.equal(store.identificacao(b.codigo).registro, null);
  await page.screenshot({ path: output + '/salvo-390.png', fullPage: true });
  await page.locator('.sl-cadastro').screenshot({ path: output + '/controle-salvar-390.png' });
  checks.push('Nome, garupa, assinatura e foto persistem no cadastro local, sem visita à Estação');

  const headers = { Authorization: `Bearer ${a.codigo}` };
  const meta = await context.request.get(origin + '/api/selo/identificacao', { headers });
  assert.equal(meta.headers()['cache-control'], 'private, no-store');
  assert.ok(!(await meta.text()).includes(registro.foto_path));
  assert.equal((await context.request.get(origin + '/api/selo/identificacao?foto=1')).status(), 401);
  assert.equal((await context.request.get(origin + `/api/selo/identificacao?foto=1&codigo=${a.codigo}`)).status(), 401);
  assert.equal((await context.request.get(origin + '/api/selo/identificacao?foto=1', { headers: { Authorization: `Bearer ${b.codigo}` } })).status(), 404);
  assert.equal((await context.request.get(origin + '/api/admin/selo/cadastros')).status(), 401);
  assert.equal((await context.request.get(origin + '/api/admin/selo/cadastros?formato=csv')).status(), 401);
  const invalida = await context.request.put(origin + '/api/selo/identificacao', { headers, multipart: { ficha: JSON.stringify({ piloto: 'Teste', garupa: '', origem: 'Itajubá/MG', assinatura: 'Teste' }), foto: { name: 'foto.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>') } } });
  assert.equal(invalida.status(), 400);
  checks.push('Foto exige dono; segredo na URL não autoriza; outro cadastro não vê retrato; admin/CSV exigem sessão; SVG disfarçado recusado');

  await page.evaluate(() => localStorage.clear());
  await page.goto(origin + `/selo/m/${a.codigo}`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction((codigo) => JSON.parse(localStorage.getItem('selo:perfil') || 'null')?.codigo === codigo, a.codigo);
  await page.goto(origin + '/selo/passaporte?editar=1', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.querySelector('#sl-piloto')?.value === 'Piloto Arquivo' && !document.querySelector('#sl-piloto')?.disabled);
  assert.equal(await page.locator('#sl-piloto').inputValue(), 'Piloto Arquivo');
  assert.equal(await page.locator('#sl-garupa').inputValue(), 'Garupa Teste');
  await page.locator('.sl-photo-thumb[src^="data:image/jpeg"]').waitFor();
  checks.push('Após limpar armazenamento do navegador, cadastro restaura identificação e retrato do servidor');
  await page.locator('#sl-garupa').fill('Edição sem rede');
  await page.route('**/api/selo/identificacao', (r) => r.request().method() === 'PUT' ? r.abort() : r.continue());
  await page.getByRole('button', { name: 'Salvar identificação no cadastro', exact: true }).click();
  await page.locator('.sl-cadastro').getByRole('status').filter({ hasText: 'Sem conexão. Sua edição continua' }).waitFor();
  assert.equal(store.identificacao(a.codigo).registro.garupa, 'Garupa Teste');
  await page.unroute('**/api/selo/identificacao');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.querySelector('#sl-garupa')?.value === 'Edição sem rede' && !document.querySelector('#sl-garupa')?.disabled);
  await page.locator('.sl-photo-thumb[src^="data:image/jpeg"]').waitFor();
  checks.push('Falha de rede não confirma salvamento; rascunho e retrato existente sobrevivem ao recarregar');
  for (const width of [320, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `Sem overflow em ${width}px`);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Remover minha foto', exact: true }).click();
  await page.getByRole('button', { name: 'Salvar identificação no cadastro', exact: true }).click();
  await page.locator('.sl-cadastro').getByRole('status').filter({ hasText: 'Identificação guardada no cadastro. Disponível' }).waitFor();
  assert.equal(store.identificacao(a.codigo).registro.foto_path, null);
  assert.equal(store.fotoExiste(registro.foto_path), false);
  checks.push('Remover e salvar apaga retrato do servidor; editor cabe em 320, 390 e 430px');

  // Testa UI administrativa com sessão e respostas simuladas. Backend real acima
  // foi verificado sem sessão; papéis SQL são testados no runner separado.
  const adm = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, acceptDownloads: true });
  const exp = Math.floor(Date.now() / 1000) + 3600;
  const jwt = `eyJhbGciOiJIUzI1NiJ9.${Buffer.from(JSON.stringify({ sub: 'fixture-admin', exp })).toString('base64url')}.fixture`;
  await adm.addInitScript(({ jwt, exp }) => localStorage.setItem('sb-127-auth-token', JSON.stringify({ access_token: jwt, refresh_token: 'fixture', expires_at: exp, expires_in: 3600, token_type: 'bearer', user: { id: 'fixture-admin', email: 'admin@example.test', aud: 'authenticated', role: 'authenticated' } })), { jwt, exp });
  const lista = pessoas.map((p) => cadastroConsultavel(store.ler().motociclistas.find((m) => m.id === p.id), store.identificacao(p.codigo).registro));
  lista[0].temFoto = true;
  await adm.route('**/*', async (route) => {
    const u = new URL(route.request().url());
    if (u.origin !== origin) return route.abort();
    if (u.pathname === '/api/admin/check') return route.fulfill({ json: { isAdmin: true } });
    if (u.pathname === '/api/admin/selo' && u.searchParams.get('acao') === 'resumo') return route.fulfill({ json: { total: 0, motociclistas: 0, hoje: 0, ultimos7: 0, porEstacao: [], passouPor: [], topCidades: [], porUf: [], porLocal: [], porDia: [], modo: 'local' } });
    if (u.pathname === '/api/admin/selo/cadastros') {
      if (u.searchParams.get('foto')) return route.fulfill({ contentType: 'image/jpeg', body: await sharp(foto).jpeg().toBuffer() });
      if (u.searchParams.get('formato') === 'csv') return route.fulfill({ contentType: 'text/csv', body: cadastrosCsv(lista) });
      const termo = u.searchParams.get('q') || '';
      const filtrados = lista.filter((m) => m.nome.includes(termo));
      return route.fulfill({ json: { cadastros: filtrados, total: filtrados.length, pagina: 1, limite: 50, modo: 'local' } });
    }
    if (u.pathname.startsWith('/api/admin/')) return route.fulfill({ json: { reports: [] } });
    return route.continue();
  });
  const painel = await adm.newPage();
  painel.on('pageerror', (e) => errors.push(e.message));
  await painel.goto(origin + '/admin/selo', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await painel.getByRole('tab', { name: 'Cadastros', exact: true }).click();
  await painel.getByRole('heading', { name: 'Todos os cadastros', exact: true }).waitFor();
  await painel.getByText('2 cadastro(s) encontrado(s)', { exact: false }).waitFor();
  await painel.getByRole('button', { name: 'Ver foto de identificação', exact: true }).click();
  await painel.locator('.sa-cadastro-retrato').waitFor();
  await painel.getByRole('button', { name: 'Buscar cadastros', exact: true }).click();
  await painel.getByText('2 cadastro(s) encontrado(s)', { exact: false }).waitFor();
  const download = painel.waitForEvent('download');
  await painel.getByRole('button', { name: 'Exportar todos os cadastros (CSV)', exact: true }).click();
  await (await download).saveAs(output + '/cadastros-ficticios.csv');
  await painel.screenshot({ path: output + '/admin-390.png', fullPage: true });
  for (const width of [320, 390, 430]) {
    await painel.setViewportSize({ width, height: 844 });
    assert.ok(await painel.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `Painel sem overflow em ${width}px`);
  }
  checks.push('UI admin simulada: lista cadastro sem visita, abre retrato, repete busca e baixa CSV em 320, 390 e 430px');
  assert.deepEqual(errors, []);
  await writeFile(output + '/report.json', JSON.stringify({ ok: true, checks }, null, 2));
  console.log(JSON.stringify({ ok: true, checks }, null, 2));
} catch (e) {
  if (ultimaPagina && !ultimaPagina.isClosed()) {
    await ultimaPagina.screenshot({ path: output + '/falha.png', fullPage: true }).catch(() => {});
    await writeFile(output + '/falha.json', JSON.stringify(await ultimaPagina.evaluate(() => ({
      cadastro: document.querySelector('.sl-cadastro')?.innerText,
      piloto: document.querySelector('#sl-piloto')?.value,
      garupa: document.querySelector('#sl-garupa')?.value,
      foto: Boolean(document.querySelector('.sl-photo-thumb[src]')),
    })).catch(() => ({})), null, 2));
  }
  throw e;
} finally {
  await browser.close();
  for (const p of pessoas) if (store.motoPorCodigo(p.codigo)?.id === p.id) store.excluirMotociclista(p.id);
}
