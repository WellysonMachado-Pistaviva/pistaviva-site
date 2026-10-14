import 'server-only';
import { contagemSelos, paradasOficiais } from '../lib/selo/store';

export const BASE = 'https://www.pistavivamototurismo.com.br';

// Páginas públicas de SEO: se o banco cair, a página sai sem os números.
export async function contagens() {
  try { return await contagemSelos(); } catch (e) { console.error('[selos] contagem', e); return null; }
}

export async function paradas() {
  try { return await paradasOficiais(); } catch (e) { console.error('[selos] paradas', e); return []; }
}

export const pessoas = (n) => (n === 1 ? '1 colecionador' : `${n.toLocaleString('pt-BR')} colecionadores`);
