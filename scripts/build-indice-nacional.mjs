// Índice nacional de passagem: compacta o cálculo pesado (.cache) no arquivo
// que a página consome. Três números por município — quantos corredores da
// rede o cruzam, a que distância fica o monumento mais próximo, e em que
// situação isso o coloca.
//
//   node scripts/build-indice-nacional.mjs
//
// Depende de .cache/indice-nacional.json e .cache/corredor/, gerados pelo
// roteamento das 140 ligações entre monumentos vizinhos.
import { readFile, readdir, writeFile } from 'node:fs/promises';
import simplify from '@turf/simplify';
import { MONUMENTOS } from '../app/lib/monumentosBikers.mjs';

const registros = JSON.parse(await readFile(new URL('../.cache/indice-nacional.json', import.meta.url), 'utf8'));

// Corredor cego é o achado que importa: muita passagem, nenhuma parada perto.
const situacao = r => {
  if (r.temMonumento) return 'monumento';
  if (r.passagem >= 3 && r.kmMonumento >= 80) return 'cego';
  if (r.passagem >= 3) return 'servido';
  if (r.passagem > 0) return 'margem';
  return r.kmMonumento > 150 ? 'vazio' : 'fora';
};

const municipios = registros
  .filter(r => r.passagem > 0 || r.temMonumento)
  .map(r => ({
    c: r.codigo,
    n: r.nome,
    u: r.uf,
    lat: Number(r.centro[0].toFixed(4)),
    lng: Number(r.centro[1].toFixed(4)),
    p: r.passagem,
    km: r.kmMonumento,
    s: situacao(r),
  }));

const linhas = [];
for (const nome of await readdir(new URL('../.cache/corredor/', import.meta.url))) {
  const { a, b, km, line } = JSON.parse(await readFile(new URL(`../.cache/corredor/${nome}`, import.meta.url), 'utf8'));
  // Tolerância de ~1 km: a linha é para desenhar a malha, não para navegar.
  const leve = simplify({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: line } }, { tolerance: 0.01, highQuality: false, mutate: false });
  linhas.push({ a, b, km: Math.round(km), l: leve.geometry.coordinates.map(([lng, lat]) => [Number(lat.toFixed(4)), Number(lng.toFixed(4))]) });
}

const resumo = municipios.reduce((acc, m) => { acc[m.s] = (acc[m.s] || 0) + 1; return acc; }, {});
const saida = {
  geradoEm: new Date().toISOString().slice(0, 10),
  corredores: linhas.length,
  totalMunicipiosBrasil: registros.length,
  vaziosAcima150km: registros.filter(r => r.kmMonumento > 150).length,
  resumo,
  monumentos: MONUMENTOS.filter(m => m.coordinates).map(m => ({ id: m.id, nome: m.nome, cidade: m.cidade, uf: m.uf, lat: m.coordinates[0], lng: m.coordinates[1], status: m.status })),
  municipios,
  linhas,
};
await writeFile(new URL('../public/monumentos/indice-nacional.json', import.meta.url), JSON.stringify(saida));
console.log({ ...resumo, corredores: linhas.length, municipios: municipios.length });
