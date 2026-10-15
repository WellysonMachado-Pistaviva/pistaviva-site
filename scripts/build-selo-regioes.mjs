#!/usr/bin/env node
// Liga cada município à sua coleção regional (selos em public/selo/colecoes).
// Fonte: IBGE (mesorregião e microrregião). Uso: node scripts/build-selo-regioes.mjs [ibge.json]
// Grava app/lib/selo/regioesMunicipios.json ({ slug: índice em REGIOES }).
import { readFileSync, writeFileSync } from 'node:fs';
import { MUNICIPIOS_BRASIL } from '../app/lib/selo/municipiosBrasil.mjs';
import { REGIOES } from '../app/lib/selo/regioes.mjs';

// Aceita o JSON já baixado (o certificado do IBGE às vezes não fecha a cadeia
// no Node): curl -o ibge.json 'https://servicodados.ibge.gov.br/api/v1/localidades/municipios?view=nivelado'
const arquivo = process.argv[2];
const lista = arquivo ? JSON.parse(readFileSync(arquivo, 'utf8'))
  : await (await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/municipios?view=nivelado')).json();
const ibge = new Map(lista.map((m) => [String(m['municipio-id']), m]));

const NORDESTE = ['MA', 'PI', 'CE', 'RN', 'PB', 'PE', 'AL', 'SE', 'BA'];
const CENTRO_OESTE = ['DF', 'GO', 'MT', 'MS'];

// Regra editorial (revisável): mesorregião/microrregião → coleção.
function colecao(uf, meso, micro) {
  if (uf === 'SP') {
    if (meso === 'Vale do Paraíba Paulista') return '01-vale-do-paraiba';
    if (meso === 'Litoral Sul Paulista') return '05-vale-do-ribeira';
    return '02-interior-paulista';
  }
  if (uf === 'PR') {
    if (micro === 'Cerro Azul') return '05-vale-do-ribeira';
    if (meso === 'Oeste Paranaense' || meso === 'Sudoeste Paranaense') return '10-triplice-fronteira';
    if (meso === 'Sudeste Paranaense') return '06-vale-europeu-planalto-norte';
    return '04-campos-gerais-norte-pioneiro';
  }
  if (uf === 'SC') {
    if (meso === 'Vale do Itajaí' || meso === 'Norte Catarinense') return '06-vale-europeu-planalto-norte';
    if (meso === 'Oeste Catarinense') return '12-grandes-travessias';
    return '07-serras-catarinenses';
  }
  if (uf === 'RS') {
    if (['Sudoeste Rio-grandense', 'Sudeste Rio-grandense', 'Metropolitana de Porto Alegre'].includes(meso)) return '08-pampa-lagoa-dos-patos';
    return '09-planalto-gaucho';
  }
  if (uf === 'MG') {
    if (['Itajubá', 'Pouso Alegre', 'Santa Rita do Sapucaí', 'Andrelândia'].includes(micro)) return 'mg-mantiqueira';
    if (['São Lourenço', 'Poços de Caldas'].includes(micro)) return 'mg-circuito-das-aguas';
    if (meso === 'Sul/Sudoeste de Minas' || meso === 'Oeste de Minas') return 'mg-canastra-furnas';
    if (meso === 'Metropolitana de Belo Horizonte' || meso === 'Central Mineira') return 'mg-serra-do-cipo';
    if (meso === 'Vale do Mucuri' || meso === 'Jequitinhonha') return 'mg-mucuri-jequitinhonha';
    if (meso === 'Norte de Minas' || meso === 'Noroeste de Minas') return 'mg-norte-noroeste';
    return '12-grandes-travessias';
  }
  if (CENTRO_OESTE.includes(uf)) return '11-planalto-central';
  if (NORDESTE.includes(uf)) return '03-litoral-nordestino';
  return '12-grandes-travessias';
}

const indice = new Map(REGIOES.map((reg, i) => [reg.arquivo, i]));
const municipios = {}; const contagem = {};
let semIbge = 0;
for (const m of MUNICIPIOS_BRASIL) {
  const i = ibge.get(String(m.ibge));
  if (!i) { semIbge++; continue; }
  const arq = colecao(m.uf, i['mesorregiao-nome'], i['microrregiao-nome']);
  municipios[m.slug] = indice.get(arq);
  contagem[arq] = (contagem[arq] || 0) + 1;
}
writeFileSync('app/lib/selo/regioesMunicipios.json', JSON.stringify({ geradoEm: new Date().toISOString().slice(0, 10), fonte: 'IBGE localidades (mesorregião/microrregião)', municipios }));
console.log('municípios:', Object.keys(municipios).length, 'sem IBGE:', semIbge);
console.log(Object.entries(contagem).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}: ${v}`).join('\n'));
