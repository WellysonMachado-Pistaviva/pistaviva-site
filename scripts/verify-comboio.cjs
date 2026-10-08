// Local app, real Supabase, two isolated riders. Only geolocation/search are simulated.
// PLAYWRIGHT_MODULE may point to an external Playwright installation.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
require('@next/env').loadEnvConfig(process.cwd());
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_DATABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
const nativeFetch = globalThis.fetch;
globalThis.fetch = (url, options = {}) => nativeFetch(url, { ...options, signal: options.signal || AbortSignal.timeout(15000) });
const base = process.env.COMBOIO_BASE_URL || 'http://127.0.0.1:3110';
const output = process.env.COMBOIO_OUTPUT || '/private/tmp/pistaviva-comboio-validation';
const pause = ms => new Promise(r => setTimeout(r, ms));
async function until(check, label, timeout = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeout) { if (await check()) return; await pause(250); }
  throw new Error(`Timeout: ${label}`);
}
(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  let code;
  const errors = [];
  const checks = [];
  const pass = label => { checks.push(label); console.log('PASS', label); };
  try {
    async function rider(name, width) {
      const context = await browser.newContext({ viewport: { width, height: 1000 }, permissions: ['geolocation'], geolocation: { latitude: -22.426, longitude: -45.452 } });
      if (process.env.COMBOIO_PROTECTION_BYPASS) {
        await context.route(`${base}/**`, r => r.continue({ headers: { ...r.request().headers(), 'x-vercel-protection-bypass': process.env.COMBOIO_PROTECTION_BYPASS } }));
      }
      await context.route('https://news.google.com/**', r => r.fulfill({ body: '', contentType: 'application/javascript' }));
      await context.route('https://nominatim.openstreetmap.org/search?**', r => r.fulfill({ json: [{ display_name: 'Posto Teste Comboio, Itajubá', lat: '-22.427', lon: '-45.453' }] }));
      const page = await context.newPage();
      page.on('pageerror', e => errors.push(e.message));
      page.on('response', r => { if (r.url().includes('/pv_comboio_') && r.status() >= 400) console.log('BACKEND',r.status(),new URL(r.url()).pathname); });
      console.log('STEP identify', name);
      await page.goto(`${base}/comboio`, { waitUntil: 'domcontentloaded' });
      await page.getByRole('button', { name: 'IDENTIFICAR-SE', exact: true }).click();
      await page.getByPlaceholder('Seu nome', { exact: true }).fill(name);
      await page.getByRole('button', { name: 'Continuar', exact: true }).click();
      return { page, context };
    }
    const a = await rider('Validação Líder', 1440);
    const b = await rider('Validação Piloto', 390);
    console.log('STEP create');
    await a.page.getByRole('button', { name: 'CRIAR NOVO COMBOIO', exact: true }).click();
    code = await a.page.evaluate(() => sessionStorage.getItem('activeComboio'));
    assert.match(code, /^[A-Z0-9]{6}$/);
    await b.page.getByPlaceholder('Ex: X7K9A2').fill(code);
    await b.page.getByRole('button', { name: 'ENTRAR NO COMBOIO', exact: true }).click();
    await until(async () => (await a.page.getByRole('button', { name: 'MAPA (2)', exact: true }).count()) && (await b.page.getByRole('button', { name: 'MAPA (2)', exact: true }).count()), 'two riders online');
    pass('Criação, entrada e presença real de dois participantes (desktop/mobile)');
    const message = `Validação ${code}`;
    await a.page.getByPlaceholder('Mensagem pro Comboio...').fill(message);
    await a.page.getByRole('button', { name: 'Enviar mensagem', exact: true }).click();
    await b.page.getByText(message, { exact: true }).waitFor();
    const history = await sb.from('pv_comboio_messages').select('id').eq('comboio_id', code).eq('text', message);
    assert.ifError(history.error); assert.equal(history.data.length, 1);
    pass('Chat entregue via Realtime e persistido sem duplicação');
    await a.page.getByRole('button', { name: /^ROTA/ }).click();
    await b.page.getByRole('button', { name: /^ROTA/ }).click();
    await a.page.getByPlaceholder('Buscar lugar (cidade, posto, mirante...)').fill('Posto');
    await a.page.locator('.autocomplete-list li').filter({ hasText: 'Posto Teste Comboio' }).click();
    await a.page.getByRole('button', { name: 'Salvar rota do comboio', exact: true }).click();
    await b.page.getByText('Posto Teste Comboio, Itajubá', { exact: true }).waitFor();
    const route = await sb.from('pv_comboio_routes').select('stops').eq('comboio_code', code).single();
    assert.ifError(route.error); assert.equal(route.data.stops[0].lat, -22.427); assert.equal(route.data.stops[0].lng, -45.453);
    pass('Busca preserva coordenadas; rota salva e atualiza participante com aba aberta');
    // A denied save must preserve the editable draft and expose retry.
    await a.page.getByRole('button', { name: 'Remover Posto Teste Comboio, Itajubá', exact: true }).click();
    const rejectWrite = r => r.request().method() === 'POST' ? r.fulfill({ status: 503, json: { message: 'Validation simulated outage' } }) : r.continue();
    await a.context.route('**/rest/v1/pv_comboio_routes*', rejectWrite);
    await a.page.getByRole('button', { name: 'Salvar rota do comboio', exact: true }).click();
    await a.page.getByRole('alert').filter({ hasText: 'Não foi possível salvar' }).waitFor();
    await a.context.unroute('**/rest/v1/pv_comboio_routes*', rejectWrite);
    await a.page.getByRole('button', { name: 'Salvar rota do comboio', exact: true }).click();
    await b.page.getByText('O líder ainda não montou a rota.', { exact: true }).waitFor();
    const empty = await sb.from('pv_comboio_routes').select('stops').eq('comboio_code', code).single();
    assert.ifError(empty.error); assert.deepEqual(empty.data.stops, []);
    pass('Falha de salvamento mantém rascunho; tentativa seguinte salva remoção da última parada');
    // Observe actual transport without changing send behavior. Supabase uses binary broadcasts.
    await a.page.evaluate(() => {
      window.__comboioFrames = [];
      const original = WebSocket.prototype.send;
      WebSocket.prototype.send = function(data) {
        try {
          if (data instanceof ArrayBuffer) {
            const bytes = new Uint8Array(data);
            if (bytes[0] === 3 && bytes[6] === 1) {
              const offset = 7 + bytes[1] + bytes[2] + bytes[3] + bytes[4] + bytes[5];
              const payload = JSON.parse(new TextDecoder().decode(bytes.slice(offset)));
              if (payload.location) window.__comboioFrames.push(payload.location);
            }
          }
        } catch { /* Ignore unrelated traffic. */ }
        return original.call(this, data);
      };
    });
    await a.page.locator('a[href="/comunidade"]:visible').first().click();
    await a.page.waitForURL('**/comunidade');
    await pause(3000);
    await a.context.setGeolocation({ latitude: -22.44, longitude: -45.46 });
    await until(() => a.page.evaluate(() => window.__comboioFrames?.some(p => p.lat === -22.44 && p.lng === -45.46)), 'GPS after navigating');
    await b.page.getByText(/Você ficou pra trás/).waitFor();
    pass('GPS continua transmitindo após navegar; participante recebe posição e alerta de distância');
    await a.page.goto(`${base}/comboio`, { waitUntil: 'domcontentloaded' });
    await a.page.getByRole('button', { name: 'MAPA (2)', exact: true }).waitFor();
    await a.page.getByText(message, { exact: true }).waitFor();
    pass('Recarregamento restaura identificação, grupo e histórico');
    await a.page.screenshot({ path: `${output}/desktop.png`, fullPage: true });
    await b.page.screenshot({ path: `${output}/mobile.png`, fullPage: true });
    await b.page.getByRole('button', { name: 'Sair', exact: true }).click();
    await a.page.getByRole('button', { name: 'MAPA (1)', exact: true }).waitFor();
    await a.page.getByRole('button', { name: 'Sair', exact: true }).click();
    assert.equal(await a.page.evaluate(() => sessionStorage.getItem('activeComboio')), null);
    pass('Saída remove presença e encerra sessão');
    assert.deepEqual(errors, []);
    fs.writeFileSync(`${output}/result.json`, JSON.stringify({ checks, errors }, null, 2));
  } finally {
    if (code) {
      for (const [table, column] of [['pv_comboio_messages', 'comboio_id'], ['pv_comboio_routes', 'comboio_code']]) {
        const { error } = await sb.from(table).delete().eq(column, code);
        if (error) console.error('Cleanup failed:', table, error.message);
      }
    }
    await browser.close();
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
