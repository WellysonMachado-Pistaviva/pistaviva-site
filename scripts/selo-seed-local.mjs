#!/usr/bin/env node
// Gera visitas de exemplo no banco LOCAL do Selo (.selo-local/) para testar o
// painel e o mural sem Supabase. Uso: npm run selo:seed   (apaga e recria)
import { randomUUID } from 'node:crypto';
import { readFileSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { criarStoreLocal } from '../app/lib/selo/storeLocal.mjs';
import { estacaoDe } from '../app/lib/selo/estacao.mjs';

const pasta = join(process.cwd(), '.selo-local');
rmSync(pasta, { recursive: true, force: true });
const s = criarStoreLocal(pasta);

const CIDADES = [
  ['Itajubá', 'MG'], ['Pouso Alegre', 'MG'], ['São Paulo', 'SP'], ['Campinas', 'SP'], ['Taubaté', 'SP'],
  ['Rio de Janeiro', 'RJ'], ['Resende', 'RJ'], ['Belo Horizonte', 'MG'], ['Curitiba', 'PR'], ['São José dos Campos', 'SP'],
  ['Santa Rita do Sapucaí', 'MG'], ['Varginha', 'MG'], ['Guaratinguetá', 'SP'],
];
const NOMES = ['Ana Souza', 'Bruno Lima', 'Carla Dias', 'Diego Rocha', 'Elaine Prado', 'Fábio Nunes', 'Gisele Araújo', 'Hugo Martins', 'Íris Campos', 'João Pedro Silva', 'Karen Melo', 'Luiz Fernando', 'Marta Ribeiro', 'Nilton Castro'];
const PASSOU = ['monumento-27', 'monumento-29', 'rota-68', 'so-itajuba', 'outro'];
const fotos = readdirSync('public/parque').filter((f) => f.endsWith('.jpg')).map((f) => join('public/parque', f));

let n = 0;
const sorteio = (lista) => lista[Math.floor(Math.random() * lista.length)];
for (let i = 0; i < 80; i++) {
  const quando = new Date(Date.now() - Math.floor(Math.random() * 75) * 864e5 - Math.floor(Math.random() * 8) * 36e5);
  const [cidade, uf] = sorteio(CIDADES);
  const nome = `${sorteio(NOMES)}${i > 40 ? ` ${i}` : ''}`;
  const temFoto = Math.random() < 0.4;
  const { estacao, ano } = estacaoDe(quando);
  const r = s.registrar({
    chave: randomUUID(), nome, whatsapp: `359${String(90000000 + i * 7919).slice(0, 8)}`,
    cidade, uf, passou_por: [...new Set([sorteio(PASSOU), ...(Math.random() < 0.3 ? [sorteio(PASSOU)] : [])])],
    estacao, ano, local: Math.random() < 0.8 ? 'parque' : 'posto', foto_autorizada: temFoto && Math.random() < 0.8,
  }, quando);
  if (temFoto && fotos.length) {
    const path = `${r.visitaId}.jpg`;
    s.salvarFoto(path, readFileSync(sorteio(fotos)));
    s.marcarFoto(s.listarVisitas().find((v) => v.id === r.visitaId).chave_envio, path);
    if (Math.random() < 0.4) s.mudarStatusFoto(r.visitaId, 'aprovada');
  }
  n++;
}
console.log(`Selo local: ${n} visitas de exemplo em ${pasta}`);
