#!/usr/bin/env node
// Bateria de ataques do Selo da Estação (testes de segurança caixa-preta).
// Uso:  BASE=http://localhost:3917 TOKEN_PARCEIRO=<token de teste> node scripts/selo-ataque.mjs
// Por segurança só roda em localhost. Contra outro host exige --autorizado
// (use apenas em ambiente seu, nunca em produção de terceiros).
const BASE = process.env.BASE || 'http://localhost:3917';
const TOKEN = process.env.TOKEN_PARCEIRO || '';
const local = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(BASE);
if (!local && !process.argv.includes('--autorizado')) {
  console.error(`Recusado: ${BASE} não é localhost. Rode com --autorizado só se o ambiente for seu.`);
  process.exit(2);
}

const resultados = [];
async function caso(nome, fn) {
  try {
    const detalhe = await fn();
    resultados.push({ nome, ok: true, detalhe: detalhe || '' });
  } catch (e) {
    resultados.push({ nome, ok: false, detalhe: e.message });
  }
}
const espera = (cond, msg) => { if (!cond) throw new Error(msg); };
const pega = (caminho, opcoes = {}) => fetch(`${BASE}${caminho}`, { redirect: 'manual', signal: AbortSignal.timeout(120_000), ...opcoes });
const status = async (caminho, opcoes) => (await pega(caminho, opcoes)).status;
const aleatorio = (n) => Array.from({ length: n }, () => 'abcdef0123456789'[Math.floor(Math.random() * 16)]).join('');

// ── A05 Configuração: cabeçalhos de segurança ─────────────────────────────
await caso('Cabeçalhos de segurança no site', async () => {
  const r = await pega('/selos');
  for (const [h, v] of [['x-content-type-options', 'nosniff'], ['x-frame-options', 'DENY'], ['strict-transport-security', 'max-age='], ['referrer-policy', ''], ['content-security-policy', "frame-ancestors 'none'"]]) {
    espera((r.headers.get(h) || '').includes(v), `faltou ${h}`);
  }
  espera(!r.headers.get('x-powered-by'), 'x-powered-by expõe a tecnologia');
});
await caso('Link pessoal /selo/m: sem cache, sem referrer, sem indexação', async () => {
  const r = await pega(`/selo/m/${aleatorio(12)}`);
  espera(r.headers.get('referrer-policy') === 'no-referrer', 'referrer-policy');
  espera((r.headers.get('cache-control') || '').includes('no-store'), 'cache-control');
  espera((r.headers.get('x-robots-tag') || '').includes('noindex'), 'x-robots-tag');
});

// ── A01 Controle de acesso ────────────────────────────────────────────────
await caso('Admin API sem token → 401', async () => {
  espera(await status('/api/admin/selo?acao=resumo') === 401, 'GET aberto');
  espera(await status('/api/admin/selo', { method: 'POST', body: '{"acao":"excluir","id":"00000000-0000-0000-0000-000000000000"}', headers: { 'content-type': 'application/json' } }) === 401, 'POST aberto');
});
await caso('Admin API com token forjado → 401', async () => {
  const jwt = 'eyJhbGciOiJub25lIn0.eyJzdWIiOiJhZG1pbiIsImVtYWlsIjoiYWRtaW5AeC5jb20ifQ.';
  espera(await status('/api/admin/selo?acao=csv', { headers: { authorization: `Bearer ${jwt}` } }) === 401, 'aceitou JWT alg=none');
});
await caso('Cron sem segredo / segredo errado → 401', async () => {
  espera(await status('/api/cron/selo-planilhas') === 401, 'sem auth');
  espera(await status('/api/cron/selo-planilhas', { headers: { authorization: 'Bearer chute-qualquer-0123456789' } }) === 401, 'segredo errado');
});
await caso('IDOR: código de coleção inventado → 404 (não vaza dados)', async () => {
  for (let i = 0; i < 5; i++) espera(await status(`/selo/m/${aleatorio(12)}`) === 404, 'respondeu algo para código inventado');
  espera(await status(`/selo/m/${aleatorio(12)}/cartao`) === 404, 'cartão de código inventado');
});
await caso('Link de parceiro inválido ou inventado → 404', async () => {
  espera(await status('/selo/parceiro/curto') === 404, 'formato inválido');
  espera(await status(`/selo/parceiro/${'A'.repeat(32)}`) === 404, 'token inventado');
  espera(await status(`/selo/parceiro/${'A'.repeat(32)}/selo.svg`) === 404, 'prévia sem token válido');
});
await caso('Passaporte público de quem não autorizou → 404', async () => {
  espera(await status('/selo/passaporte/999999999') === 404, 'número inexistente');
  espera(await status('/selo/passaporte/abc') === 404, 'número inválido');
  espera(await status('/selo/conquistadores/abc') === 404, 'link antigo inválido');
  espera([307, 308].includes(await status('/selo/conquistadores/999999999')), 'link antigo redireciona');
  espera(await status('/selo/conquistadores/999999999/cartao') === 404, 'cartão inexistente');
});

// ── A03 Injeção ───────────────────────────────────────────────────────────
await caso('Path traversal na foto local', async () => {
  for (const p of ['../../package.json', '..%2F..%2F.env.local', '/etc/passwd', 'a/../../db.json', 'x.jpg%00.png']) {
    espera(await status(`/api/selo/foto-local?path=${encodeURIComponent(p)}`) === 404, `leu ${p}`);
  }
});
await caso('Upload com assinatura falsa ou vencida → 403', async () => {
  const corpo = new FormData();
  corpo.append('file', new Blob([Buffer.from([0xff, 0xd8, 0xff])], { type: 'image/jpeg' }), 'a.jpg');
  const exp = Date.now() + 60_000;
  espera([403, 404].includes(await status(`/api/selo/foto-local?path=x.jpg&exp=${exp}&sig=${'0'.repeat(64)}`, { method: 'PUT', body: corpo })), 'assinatura falsa aceita');
  // 404 = rota local desligada (produção usa Supabase Storage): também seguro.
  espera([403, 404].includes(await status(`/api/selo/foto-local?path=x.jpg&exp=1&sig=abc`, { method: 'PUT', body: corpo })), 'vencida aceita');
  espera([403, 404].includes(await status(`/api/selo/foto-local?path=../x.jpg&exp=${exp}&sig=abc`, { method: 'PUT', body: corpo })), 'caminho fora aceito');
});
await caso('XSS no código da URL é rejeitado', async () => {
  for (const p of ['/selo/m/%3Cscript%3Ealert(1)%3C%2Fscript%3E', '/selo/v/%3Cimg%20src%3Dx%3E', '/selo/v/%22%3E%3Csvg%20onload%3D1%3E/selo.svg']) {
    const r = await pega(p);
    const corpo = await r.text();
    espera(!/<script>alert\(1\)|<img src=x>|<svg onload=1>/.test(corpo), `refletiu payload em ${p}`);
  }
});
if (TOKEN) {
  await caso('XSS no nome do local do selo (SVG) sai escapado', async () => {
    const r = await pega(`/selo/parceiro/${TOKEN}/selo.svg?cor=%23ffd166&local=${encodeURIComponent('<script>alert(1)</script>')}`);
    espera(r.status === 200, `status ${r.status}`);
    const svg = await r.text();
    espera(!svg.includes('<script>'), 'script cru no SVG');
    espera(svg.includes('&lt;SCRIPT&gt;'), 'não escapou');
    espera((r.headers.get('content-security-policy') || '').includes("default-src 'none'"), 'SVG sem CSP própria');
  });
  await caso('Cor maliciosa no SVG é ignorada', async () => {
    const svg = await (await pega(`/selo/parceiro/${TOKEN}/selo.svg?cor=${encodeURIComponent('red"/><script>x</script>')}&local=Teste`)).text();
    espera(!svg.includes('<script>x'), 'injetou pela cor');
  });
}
await caso('Parâmetros malformados no cartão não quebram o servidor', async () => {
  for (const q of ['?ano=%3Cscript%3E', '?ano=99999999999999', '?formato=../../etc', '?ano=-1']) {
    const s = await status(`/selo/conquistadores/1/cartao${q}`);
    espera(s < 500, `500 com ${q}`);
  }
});

// ── Robustez / métodos ────────────────────────────────────────────────────
await caso('Métodos não previstos → recusados', async () => {
  for (const [m, p] of [['DELETE', '/api/admin/selo'], ['PUT', '/api/cron/selo-planilhas'], ['POST', '/selo/v/AAAAAAAA/selo.svg']]) {
    const s = await status(p, { method: m });
    espera(s === 405 || s === 401 || s === 404, `${m} ${p} → ${s}`);
  }
});
await caso('Corpo gigante no admin é barrado antes de processar', async () => {
  const s = await status('/api/admin/selo', { method: 'POST', body: 'x'.repeat(2_000_000), headers: { 'content-type': 'application/json' } });
  espera(s === 401 || s === 413, `status ${s}`);
});
await caso('Páginas públicas não expõem dados pessoais', async () => {
  for (const p of ['/selos', '/selos/inverno-em-itajuba', '/selo/mural']) {
    const corpo = await (await pega(p)).text();
    espera(!/\b\d{2}9\d{8}\b/.test(corpo), `possível WhatsApp em ${p}`);
    espera(!/cep|logradouro/i.test(corpo.replace(/<script[\s\S]*?<\/script>/g, '')), `endereço em ${p}`);
  }
});

const falhas = resultados.filter((r) => !r.ok);
for (const r of resultados) console.log(`${r.ok ? 'OK  ' : 'FALHA'}  ${r.nome}${r.detalhe ? ` — ${r.detalhe}` : ''}`);
console.log(`\n${resultados.length - falhas.length}/${resultados.length} defesas confirmadas.`);
process.exit(falhas.length ? 1 : 0);
