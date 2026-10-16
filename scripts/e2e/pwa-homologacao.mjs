// Usage: PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node scripts/e2e/pwa-homologacao.mjs
// Requires a production server at PWA_TEST_URL (default http://127.0.0.1:3001).
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
const { chromium, webkit, devices } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.PWA_TEST_URL || 'http://127.0.0.1:3001';
const output = resolve(process.env.PWA_TEST_OUTPUT || '/tmp/pistaviva-pwa-homologacao');
await mkdir(output, { recursive: true });
const reports = [];

class EstradaPage {
  constructor(page, origin) { this.page = page; this.origin = origin; }
  async open() {
    await this.page.goto(`${this.origin}/pwa/offline.html`);
    await this.page.getByRole('heading', { name: 'Coleção salva' }).waitFor();
  }
  async capture() { await this.page.getByRole('button', { name: 'Guardar passagem pelo GPS' }).click(); }
  async mockGps(error) {
    await this.page.evaluate((code) => {
      navigator.geolocation.getCurrentPosition = (ok, fail) => code ? fail({ code }) : ok({ coords: { latitude: -22.425, longitude: -45.453, accuracy: 12 } });
    }, error);
  }
  async noOverflow() {
    assert.equal(await this.page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  }
}
async function seed(page) {
  await page.evaluate(async () => {
    const { saveSnapshot } = await import('/pwa/store.mjs');
    const pessoa = { codigo: 'homologacao-local-1234', numero: 77, nome: 'Ana Teste' };
    localStorage.setItem('selo:perfil', JSON.stringify(pessoa));
    saveSnapshot(localStorage, pessoa, Array.from({ length: 6 }, (_, i) => ({ titulo: `Cidade ${i + 1}`, dia: '2026-10-15', uf: i < 4 ? 'MG' : 'SP', tipo: 'cidade' })));
  });
}
async function mobile(name, type, device, options = {}) {
  const report = { name, checks: [], errors: [] };
  reports.push(report);
  // Persistent, disposable profile: Chrome suppresses installation in incognito.
  let disconnected = false;
  const proxy = createServer(async (req, res) => {
    if (disconnected) { req.socket.destroy(); return; }
    try {
      const response = await fetch(`${base}${req.url}`, { redirect: 'manual' });
      res.statusCode = response.status;
      for (const [key,value] of response.headers) if (!['content-encoding','content-length','transfer-encoding'].includes(key)) res.setHeader(key,value);
      res.end(Buffer.from(await response.arrayBuffer()));
    } catch { res.writeHead(502).end(); }
  });
  await new Promise(r => proxy.listen(0, '127.0.0.1', r));
  const origin = `http://127.0.0.1:${proxy.address().port}`;
  const profile = await mkdtemp(`${output}/${name}-profile-`);
  const context = await type.launchPersistentContext(profile, { ...options, ...devices[device], locale: 'pt-BR', timezoneId: 'America/Sao_Paulo' });
  report.version = context.browser()?.version() || 'persistent';
  await context.tracing.start({ screenshots: true, snapshots: true });
  const page = await context.newPage();
  const ui = new EstradaPage(page, origin);
  const ok = (check) => { report.checks.push(check); console.log(`${name}: ${check}`); };
  try {
    await page.goto(`${origin}/selo/passaporte`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
    ok('registro automático em produção');
    const more = page.getByRole('button', { name: 'Mais', exact: true });
    assert.equal(await more.getAttribute('aria-expanded'), 'false');
    await page.waitForFunction(() => {
      const sheet = document.getElementById('igm-more-sheet');
      return getComputedStyle(sheet).display === 'none' || sheet.getBoundingClientRect().top >= innerHeight - 1; // WebKit rounds fixed transforms to fractional pixels.
    });
    await more.click();
    await page.getByRole('button', { name: 'Fechar mais opções' }).click();
    assert.equal(await more.getAttribute('aria-expanded'), 'false');
    ok('menu mobile fechado inicialmente, abre e fecha');
    const manifest = await (await context.request.get(`${origin}/manifest.webmanifest`)).json();
    assert.equal(manifest.display, 'standalone');
    assert.equal(manifest.start_url, '/selo/passaporte');
    for (const icon of manifest.icons) assert.equal((await context.request.get(`${origin}${icon.src}`)).status(), 200);
    ok('manifest, start_url e ícones acessíveis');
    if (name === 'chromium-mobile') {
      const cdp = await context.newCDPSession(page);
      const result = await cdp.send('Page.getInstallabilityErrors');
      report.installability = result.installabilityErrors;
      assert.equal(result.installabilityErrors.length, 0);
      ok('critérios de instalação Chromium sem erros');
    }
    await seed(page);
    disconnected = true;
    if (name === 'chromium-mobile') await context.setOffline(true);
    await page.goto(`${origin}/selo/m/homologacao-local-1234`);
    await page.getByRole('heading', { name: 'Coleção salva' }).waitFor();
    assert.equal(await page.getByRole('listitem').count(), 6);
    await ui.noOverflow();
    ok('navegação offline com resumo e sem overflow');
    await ui.mockGps(1); await ui.capture();
    await page.getByRole('alert').filter({ hasText: 'Localização bloqueada' }).waitFor();
    await ui.mockGps(3); await ui.capture();
    await page.getByRole('alert').filter({ hasText: 'Não foi possível obter' }).waitFor();
    ok('GPS negado e timeout com recuperação');
    await ui.mockGps(); await ui.capture();
    await page.getByText('Passagem guardada neste aparelho.', { exact: false }).waitFor();
    await page.reload();
    await page.getByText('1 passagem aguardando confirmação.', { exact: true }).waitFor();
    ok('GPS simulado salvo e fila preservada após reload');
    const second = await context.newPage();
    await second.goto(`${origin}/`);
    await second.getByText('1 passagem aguardando confirmação.', { exact: true }).waitFor();
    await second.close();
    ok('nova aba offline');
    for (const viewport of [{width:320,height:844},{width:390,height:844},{width:844,height:390}]) {
      await page.setViewportSize(viewport); await ui.noOverflow();
    }
    await page.setViewportSize({width:390,height:844});
    await page.screenshot({ path: `${output}/${name}.png`, fullPage: true });
    ok('320 px, 390 px e paisagem');
    await ui.mockGps();
    await page.evaluate(() => { window.restoreStorage = Storage.prototype.setItem; Storage.prototype.setItem = () => { throw new Error('quota'); }; });
    await ui.capture();
    await page.getByRole('alert').filter({hasText:'Não foi possível guardar'}).waitFor();
    await page.evaluate(() => { Storage.prototype.setItem = window.restoreStorage; });
    ok('armazenamento cheio informa falha');
    const cacheKeys = await page.evaluate(async () => (await (await caches.open('pv-offline-v1')).keys()).map((r) => new URL(r.url).pathname));
    assert.equal(cacheKeys.length, 5);
    assert.equal(cacheKeys.some((k) => k.startsWith('/api') || k.startsWith('/selo/m')), false);
    ok('cache sem páginas privadas ou APIs');
    disconnected = false;
    if (name === 'chromium-mobile') await context.setOffline(false);
    await ui.open();
    await page.getByText('Modo estrada · conexão detectada', {exact:true}).waitFor();
    ok('retorno da conexão');
    await page.evaluate(() => {
      const key = 'selo:pendentes:homologacao-local-1234';
      const queue = JSON.parse(localStorage.getItem(key)); queue[0].capturadoEm = '2020-01-01T00:00:00Z';
      localStorage.setItem(key, JSON.stringify(queue));
    });
    await page.reload();
    await page.getByText('fora do prazo de 72 horas', {exact:false}).waitFor();
    ok('pendência vencida identificada');
    await page.evaluate(() => localStorage.setItem('selo:offline:v1', '{broken'));
    await page.reload();
    await page.getByRole('button', {name:'Guardar passagem pelo GPS'}).waitFor();
    assert.equal(await page.getByRole('button', {name:'Guardar passagem pelo GPS'}).isEnabled(), true);
    ok('resumo corrompido não impede captura');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    assert.equal(await page.getByRole('button', {name:'Guardar passagem pelo GPS'}).isDisabled(), true);
    ok('sem perfil: recuperação orientada');
  } catch (error) {
    report.errors.push(error.stack);
    await page.screenshot({path:`${output}/${name}-failure.png`,fullPage:true}).catch(()=>{});
  } finally {
    await context.tracing.stop({path:`${output}/${name}-trace.zip`});
    await context.close();
    await new Promise(r => proxy.close(r));
  }
}

// Real update lifecycle on an isolated local origin, serving the exact offline
// assets; only worker cache version is changed by the fixture, never project files.
async function lifecycle(name, type, options={}) {
  const report={name:`${name}-update`,checks:[],errors:[]}; reports.push(report);
  let revision=1;
  let disconnected=false;
  const worker=await readFile('public/sw.js','utf8');
  const server=createServer(async(req,res)=>{
    if(disconnected){req.socket.destroy();return;}
    try {
      res.setHeader('Cache-Control','no-store');
      if(req.url==='/sw.js') {res.setHeader('Content-Type','text/javascript');res.end(worker.replace('pv-offline-v1',`pv-offline-homolog-${revision}`));return;}
      if(req.url==='/') {res.setHeader('Content-Type','text/html');res.end('<!doctype html><label>Rascunho<input aria-label="Rascunho"></label><script>navigator.serviceWorker.register("/sw.js")</script>');return;}
      const path = new URL(req.url,'http://local').pathname;
      if(!['/pwa/offline.html','/pwa/offline.css','/pwa/offline.js','/pwa/store.mjs','/pwa-192x192.png'].includes(path)){res.writeHead(404).end();return;}
      const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.mjs':'text/javascript','.png':'image/png'};
      res.setHeader('Content-Type',mime[extname(path)]);res.end(await readFile(resolve('public',`.${path}`)));
    }catch{res.writeHead(500).end();}
  });
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const url=`http://127.0.0.1:${server.address().port}`;
  const profile=await mkdtemp(`${output}/${name}-restart-profile-`);
  let context=await type.launchPersistentContext(profile,options);
  let tracing=true;
  await context.tracing.start({screenshots:true,snapshots:true});
  try {
    const page=await context.newPage(); await page.goto(url);
    await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
    await page.getByLabel('Rascunho').fill('Não perder este texto');
    await page.evaluate(()=>localStorage.setItem('pending-test','preservado'));
    revision=2;
    await page.evaluate(async()=>{const r=await navigator.serviceWorker.getRegistration();await r.update()});
    await page.waitForFunction(async()=>!!(await navigator.serviceWorker.getRegistration()).waiting);
    assert.equal(await page.getByLabel('Rascunho').inputValue(),'Não perder este texto');
    assert.equal(await page.evaluate(()=>localStorage.getItem('pending-test')),'preservado');
    assert.equal(await page.evaluate(async()=> (await caches.keys()).includes('pv-offline-homolog-1')),true);
    report.checks.push('update aguarda, sem reload e preservando formulário');
    await page.close();
    const next=await context.newPage();await next.goto(url);
    await next.waitForFunction(async()=>!(await navigator.serviceWorker.getRegistration()).waiting);
    await next.waitForFunction(async()=>!(await caches.keys()).includes('pv-offline-homolog-1'));
    assert.equal(await next.evaluate(()=>localStorage.getItem('pending-test')),'preservado');
    report.checks.push('ativação ao fechar abas remove só cache antigo e preserva storage');
    console.log(`${name}: update lifecycle passed`);
    await seed(next);
    await next.evaluate(async()=>{
      const {appendReading}=await import('/pwa/store.mjs');
      appendReading(localStorage,'homologacao-local-1234',{lat:-22,lng:-45,precisao:12,capturadoEm:new Date().toISOString()});
    });
    await context.tracing.stop({path:`${output}/${name}-update-trace.zip`});
    tracing=false;
    await context.close();
    disconnected=true;
    context=await type.launchPersistentContext(profile,options);
    await context.tracing.start({screenshots:true,snapshots:true});
    tracing=true;
    const reopened=await context.newPage();
    await reopened.goto(url);
    await reopened.getByRole('heading',{name:'Coleção salva'}).waitFor();
    await reopened.getByText('1 passagem aguardando confirmação.',{exact:true}).waitFor();
    assert.equal(await reopened.getByRole('listitem').count(),6);
    report.checks.push('navegador reiniciado sem rede preserva worker, coleção e pendência');
    console.log(`${name}: cold offline restart passed`);
  }catch(error){report.errors.push(error.stack)}finally{
    if(tracing)await context.tracing.stop({path:`${output}/${name}-restart-trace.zip`});
    await context.close();await new Promise(r=>server.close(r));
  }
}
const chromeOptions={executablePath:process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'};
await Promise.allSettled([
 mobile('chromium-mobile',chromium,'Pixel 7',chromeOptions),
 mobile('webkit-mobile',webkit,'iPhone 13'),
 lifecycle('chromium',chromium,chromeOptions),
 lifecycle('webkit',webkit),
]).then(results=>results.forEach((r)=>{if(r.status==='rejected')reports.push({name:'runner',errors:[String(r.reason)]})}));
await writeFile(`${output}/results.json`,JSON.stringify(reports,null,2));
console.log(JSON.stringify(reports.map(({name,checks=[],errors=[]})=>({name,passed:checks.length,errors})),null,2));
if(reports.some(r=>r.errors?.length))process.exitCode=1;
