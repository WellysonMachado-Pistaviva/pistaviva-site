import 'server-only';
import { supabaseAdmin } from '../supabaseAdmin';
import { motoPorCodigo, storeLocal } from './store';

// A autorização usa o mesmo segredo do passaporte pessoal. Relato nunca
// participa do modelo público, do mapa comunitário ou dos cartões.
async function entradaDoDono(codigo, entradaId) {
  const moto = await motoPorCodigo(codigo);
  if (!moto) return null;
  const { data, error } = await supabaseAdmin().from('pv_selo_entradas')
    .select('id, foto_path, foto_status').eq('id', entradaId).eq('motociclista_id', moto.id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function lerMemoria(codigo, entradaId) {
  if (storeLocal) return storeLocal.memoriaPorEntrada(codigo, entradaId);
  const entrada = await entradaDoDono(codigo, entradaId);
  if (!entrada) return null;
  const { data, error } = await supabaseAdmin().from('pv_selo_memorias')
    .select('relato, atualizado_em').eq('entrada_id', entradaId).maybeSingle();
  if (error) throw error;
  return { relato: data?.relato || '', atualizadoEm: data?.atualizado_em || null, fotoPath: entrada.foto_path, fotoStatus: entrada.foto_status };
}

export async function gravarMemoria(codigo, entradaId, relato) {
  if (storeLocal) return storeLocal.salvarMemoria(codigo, entradaId, relato);
  if (!await entradaDoDono(codigo, entradaId)) return null;
  const atualizadoEm = new Date().toISOString();
  const { error } = await supabaseAdmin().from('pv_selo_memorias')
    .upsert({ entrada_id: entradaId, relato, atualizado_em: atualizadoEm }, { onConflict: 'entrada_id' });
  if (error) throw error;
  return { relato, atualizadoEm };
}
