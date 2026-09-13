// Run against a local production server. Set PLAYWRIGHT_MODULE if Playwright is installed outside this project.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const base = process.env.PLANNER_BASE_URL || 'http://127.0.0.1:3100';
const output = process.env.PLANNER_OUTPUT || '/private/tmp/pistaviva-planner-validation';
const cities = {
  Itajuba: { name: 'Itajubá', admin1: 'Minas Gerais', latitude: -22.426, longitude: -45.452 },
  Campos: { name: 'Campos do Jordão', admin1: 'São Paulo', latitude: -22.739, longitude: -45.592 },
  Piranguinho: { name: 'Piranguinho', admin1: 'Minas Gerais', latitude: -22.399, longitude: -45.533 },
};
class PlannerPage {
  constructor(page) { this.page = page; this.summary = page.getByRole('region', { name: 'Estimativas da viagem' }); }
  async city(label, query) {
    await this.page.getByLabel(label, { exact: true }).fill(query);
    await this.page.getByRole('button', { name: `${cities[query].name} ${cities[query].admin1}`, exact: true }).click();
  }
  async calculate() {
    await this.page.getByRole('button', { name: 'GERAR ROTEIRO', exact: true }).click();
    await this.summary.waitFor();
  }
  async stat(label) { return this.summary.locator('dl > div').filter({ has: this.page.getByText(label, { exact: true }) }).locator('dd').innerText(); }
}
(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    // Independent viewports run concurrently with isolated browser contexts.
    await Promise.all([1440, 390].map(async width => {
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      await context.tracing.start({ screenshots: true, snapshots: true });
      const page = await context.newPage();
      const errors = [];
      const requests = [];
      let failRoute = false;
      await context.route('https://news.google.com/**', route => route.fulfill({ body: '', contentType: 'application/javascript' }));
      page.on('pageerror', error => errors.push(error.message));
      await context.route('https://geocoding-api.open-meteo.com/**', route => {
        const city = cities[new URL(route.request().url()).searchParams.get('name')];
        return route.fulfill({ json: { results: city ? [city] : [] } });
      });
      await context.route('https://router.project-osrm.org/**', route => {
        requests.push(route.request().url());
        if (failRoute) return route.fulfill({ status: 503, json: { code: 'Error' } });
        const points = route.request().url().split('/driving/')[1].split('?')[0].split(';').map(p => p.split(',').map(Number));
        const round = points.length > 2 && JSON.stringify(points[0]) === JSON.stringify(points.at(-1));
        return route.fulfill({ json: { code: 'Ok', routes: [{ distance: round ? 510000 : 250000, duration: round ? 24000 : 12000, geometry: { coordinates: points } }] } });
      });
      // Capture the share URL without opening WhatsApp or sending anything.
      await page.addInitScript(() => { window.open = url => { window.__plannerShare = url; return null; }; });
      const planner = new PlannerPage(page);
      try {
        await page.goto(`${base}/rotas`, { waitUntil: 'domcontentloaded' });
        await page.getByLabel('Origem', { exact: true }).waitFor();
        assert.equal(await page.getByRole('button', { name: 'GERAR ROTEIRO', exact: true }).isDisabled(), true);
        await planner.city('Origem', 'Itajuba');
        await planner.city('Destino', 'Campos');
        await planner.calculate();
        assert.equal(await planner.stat('Tempo rodando'), '3h 20min');
        assert.equal(await planner.stat('Tempo reservado para paradas'), '0h 20min');
        assert.equal(await planner.stat('Abastecimentos estimados'), '1');
        const count = requests.length;
        await page.getByLabel('Consumo da moto (km/L)', { exact: true }).fill('25');
        assert.equal(await planner.stat('Autonomia com 20% de reserva'), '280 km');
        assert.equal(requests.length, count, 'cost changes should not refetch routing');
        await page.getByLabel('Tanque cheio (L)', { exact: true }).fill('0');
        await page.getByRole('tabpanel').getByRole('alert').waitFor();
        assert.equal(await planner.summary.count(), 0);
        await page.getByLabel('Tanque cheio (L)', { exact: true }).fill('14');
        await planner.summary.waitFor();
        await page.getByRole('button', { name: 'Adicionar parada', exact: true }).click();
        assert.equal(await planner.summary.count(), 0);
        assert.equal(await page.getByRole('button', { name: 'GERAR ROTEIRO', exact: true }).isDisabled(), true);
        await planner.city('Parada 1', 'Piranguinho');
        await page.getByText('Bate e Volta', { exact: true }).click();
        await page.getByLabel('Outros gastos da viagem (R$)', { exact: true }).fill('100');
        await planner.calculate();
        assert.equal(await planner.stat('Tempo reservado para paradas'), '3h 0min');
        assert.equal(await planner.stat('Orçamento com margem de 10%'), 'R$ 242,17');
        const points = requests.at(-1).split('/driving/')[1].split('?')[0].split(';');
        assert.equal(points.length, 5);
        assert.equal(points[0], points[4]);
        assert.equal(points[1], points[3]);
        await page.getByRole('button', { name: 'Compartilhar no WhatsApp', exact: true }).click();
        const shared = await page.evaluate(() => window.__plannerShare);
        const message = new URL(shared).searchParams.get('text');
        const shareUrl = message.split('\n').at(-1);
        assert.equal(new URL(shareUrl).searchParams.get('rt'), '1');
        await page.goto(shareUrl, { waitUntil: 'domcontentloaded' });
        await planner.summary.waitFor();
        assert.equal(await page.getByLabel('Parada 1', { exact: true }).inputValue(), 'Piranguinho, Minas Gerais');
        assert.equal(await page.getByLabel('Consumo da moto (km/L)', { exact: true }).inputValue(), '25');
        assert.equal(await planner.stat('Tempo reservado para paradas'), '3h 0min');
        assert.equal(await planner.stat('Orçamento com margem de 10%'), 'R$ 242,17');
        await page.screenshot({ path: `${output}/planner-${width}.png`, fullPage: true });
        await planner.summary.scrollIntoViewIfNeeded();
        await page.screenshot({ path: `${output}/planner-${width}-viewport.png` });
        const size = await page.evaluate(() => ({ viewport: innerWidth, content: document.documentElement.scrollWidth }));
        assert.ok(size.content <= size.viewport, `horizontal overflow ${JSON.stringify(size)}`);
        await page.getByRole('button', { name: 'Remover parada 1', exact: true }).click();
        assert.equal(await planner.summary.count(), 0);
        failRoute = true;
        await page.getByRole('button', { name: 'GERAR ROTEIRO', exact: true }).click();
        await page.getByRole('tabpanel').getByRole('alert').waitFor();
        assert.match(await page.getByRole('tabpanel').getByRole('alert').innerText(), /Não foi possível calcular/);
        failRoute = false;
        await planner.calculate();
        assert.equal(errors.length, 0, errors.join('\n'));
        console.log(`PASS ${width}px: calculate, live costs, invalid input, waypoint, roundtrip, share restoration, removal, API failure/recovery, overflow, console`);
      } catch (error) {
        await page.screenshot({ path: `${output}/failure-${width}.png`, fullPage: true });
        throw error;
      } finally {
        await context.tracing.stop({ path: `${output}/trace-${width}.zip` });
        await context.close();
      }
    }));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
