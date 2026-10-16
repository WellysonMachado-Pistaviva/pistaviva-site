// Artes ilustrativas prontas para a demonstração abrir sem consultar API.
// Usa mesmo renderizador dos carimbos reais. Não cria visitas ou passaportes.
import { mkdirSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';
import { carimboDoMunicipio } from '../app/lib/selo/carimboCidade.mjs';
import exemplos from '../app/selo/passaporte/previa/cidades-exemplo.json' with { type: 'json' };

const pasta = 'public/selo/passaporte/exemplos';
mkdirSync(pasta, { recursive: true });
for (const c of exemplos) {
  const svg = carimboDoMunicipio(c.slug, { dia: c.dia, serie: c.serie });
  const bytes = await sharp(Buffer.from(svg), { density: 192 })
    .resize(768, 768, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 92 }).toBuffer();
  writeFileSync(`${pasta}/${c.slug}.webp`, bytes);
}
console.log(`${exemplos.length} carimbos de exemplo preparados.`);
