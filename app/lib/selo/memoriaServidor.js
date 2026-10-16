import 'server-only';
import { supabaseAdmin } from '../supabaseAdmin';
import { motoPorCodigo, storeLocal } from './store';

// A autorização usa o mesmo segredo do passaporte pessoal. O relato só sai
// do passaporte quando o dono marca "mostrar na página da cidade" (publica);
// nunca entra no modelo público nem nos cartões.
async function entradaDoDono(codigo, entradaId) {
  const moto = await motoPorCodigo(codigo);
  if (!moto) return null;
  const { data, error } = await supabaseAdmin().from('pv_selo_entradas')
    .select('id, carimbo, foto_path, foto_status').eq('id', entradaId).eq('motociclista_id', moto.id).maybeSingle();
  if (error) throw error;
  return data;
}

// Até supabase_selo_escolhas.sql rodar, a coluna publica não existe.
const semColunaPublica = (error) => /publica/.test(error?.message || '');

export async function lerMemoria(codigo, entradaId) {
  if (storeLocal) return storeLocal.memoriaPorEntrada(codigo, entradaId);
  const entrada = await entradaDoDono(codigo, entradaId);
  if (!entrada) return null;
  const consulta = (campos) => supabaseAdmin().from('pv_selo_memorias').select(campos).eq('entrada_id', entradaId).maybeSingle();
  let { data, error } = await consulta('relato, publica, atualizado_em');
  if (semColunaPublica(error)) ({ data, error } = await consulta('relato, atualizado_em'));
  if (error) throw error;
  return { relato: data?.relato || '', publica: Boolean(data?.publica), atualizadoEm: data?.atualizado_em || null, fotoPath: entrada.foto_path, fotoStatus: entrada.foto_status, carimbo: entrada.carimbo };
}

export async function gravarMemoria(codigo, entradaId, relato, publica = false) {
  if (storeLocal) return storeLocal.salvarMemoria(codigo, entradaId, relato, publica);
  const entrada = await entradaDoDono(codigo, entradaId);
  if (!entrada) return null;
  const atualizadoEm = new Date().toISOString();
  const gravar = (linha) => supabaseAdmin().from('pv_selo_memorias').upsert(linha, { onConflict: 'entrada_id' });
  let { error } = await gravar({ entrada_id: entradaId, relato, publica, atualizado_em: atualizadoEm });
  // Sem a migração: guarda o texto como privado (não perde o relato) e avisa
  // a tela que não publicou.
  let publicada = publica;
  if (semColunaPublica(error)) {
    publicada = false;
    ({ error } = await gravar({ entrada_id: entradaId, relato, atualizado_em: atualizadoEm }));
  }
  if (error) throw error;
  return { relato, publica: publicada, atualizadoEm, carimbo: entrada.carimbo };
}
