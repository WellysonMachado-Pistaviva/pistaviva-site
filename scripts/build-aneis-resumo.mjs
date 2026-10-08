// Derivado leve de aneis.json para a página pública: cada anel vira um card com
// silhueta própria. A silhueta é um caminho SVG pré-calculado — assim a página
// mostra oito mapas sem carregar nenhum mapa.
//
//   node scripts/build-aneis-resumo.mjs
import { readFile, writeFile } from 'node:fs/promises';
import { MONUMENTOS } from '../app/lib/monumentosBikers.mjs';

// Perfil do guardião quando o contato cadastrado é um Instagram. A URL é
// reconstruída limpa, sem os parâmetros de rastreio que vêm colados no link.
function instagram(url) {
  if (!url) return null;
  let parsed;
  try { parsed = new URL(url); } catch { return null; }
  if (!['instagram.com', 'www.instagram.com'].includes(parsed.hostname)) return null;
  const handle = parsed.pathname.split('/').filter(Boolean)[0];
  if (!handle || !/^[A-Za-z0-9._]{1,30}$/.test(handle)) return null;
  return handle;
}
const perfil = new Map(MONUMENTOS.map(m => [m.id, instagram(m.contato)]));

const dados = JSON.parse(await readFile(new URL('../public/monumentos/aneis.json', import.meta.url), 'utf8'));
const LADO = 100, MARGEM = 8;

// Projeção equirretangular local: no tamanho de um card, a distorção é
// invisível e evita trazer uma biblioteca de projeção.
function projetar(linha, monumentos) {
  const lats = linha.map(p => p[0]), lngs = linha.map(p => p[1]);
  const latm = (Math.min(...lats) + Math.max(...lats)) / 2;
  const k = Math.cos((latm * Math.PI) / 180);
  const xs = linha.map(p => p[1] * k), ys = linha.map(p => -p[0]);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const escala = (LADO - MARGEM * 2) / Math.max(maxX - minX, maxY - minY);
  const dx = (LADO - (maxX - minX) * escala) / 2;
  const dy = (LADO - (maxY - minY) * escala) / 2;
  const ponto = (lat, lng) => [
    Number(((lng * k - minX) * escala + dx).toFixed(2)),
    Number(((-lat - minY) * escala + dy).toFixed(2)),
  ];
  // Reduz para ~260 pontos: o suficiente para a silhueta do anel.
  const passo = Math.max(1, Math.round(linha.length / 260));
  const amostra = linha.filter((_, i) => i % passo === 0);
  if (amostra.at(-1) !== linha.at(-1)) amostra.push(linha.at(-1));
  const d = amostra.map((p, i) => `${i ? 'L' : 'M'}${ponto(p[0], p[1]).join(' ')}`).join('');
  return { d, pontos: monumentos.map(m => ponto(m.lat, m.lng)) };
}

const aneis = dados.aneis.map(anel => {
  const { d, pontos } = projetar(anel.linha, anel.monumentos);
  return {
    faixa: anel.faixa,
    km: anel.km,
    horas: anel.horas,
    dias: Math.ceil(anel.km / 300),
    ufs: anel.ufs,
    fechamento: anel.fechamento,
    silhueta: d,
    pontos,
    monumentos: anel.monumentos.map(m => ({
      id: m.id, nome: m.nome, cidade: m.cidade, uf: m.uf,
      lat: Number(m.lat.toFixed(5)), lng: Number(m.lng.toFixed(5)),
      ig: perfil.get(m.id) || null,
    })),
    municipios: anel.municipios.map(m => ({ n: m.n, u: m.u, m: m.m })),
  };
});

await writeFile(new URL('../app/lib/aneisResumo.json', import.meta.url), `${JSON.stringify({
  geradoEm: dados.geradoEm,
  totalProntos: dados.totalProntos,
  trilha: dados.trilha.map(t => ({ anel: t.anel, novos: t.novos, repetidos: t.repetidos, acumulado: t.acumulado })),
  aneis,
})}\n`);
const bytes = (await readFile(new URL('../app/lib/aneisResumo.json', import.meta.url))).length;
console.log({ aneis: aneis.length, kb: Math.round(bytes / 1024) });
