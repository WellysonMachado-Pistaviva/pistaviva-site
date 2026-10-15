#!/usr/bin/env node
// Pré-voo do Selo: confere se o BANCO e as VARIÁVEIS estão prontos para o
// código atual ANTES de publicar. Só lê (e um contador de teste que expira).
// Uso: node --env-file=.env.local scripts/selo-preflight.mjs
import { createClient } from '@supabase/supabase-js';
import { resolveSupabaseAdminConfig } from '../app/lib/supabaseAdminConfig.mjs';

const { url, key } = resolveSupabaseAdminConfig();
if (!url || !key) { console.error('FALHA  Supabase não configurado (URL/chave secreta).'); process.exit(1); }
const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

// Colunas que o código atual usa, por tabela.
const ESPERADO = {
  pv_selo_motociclistas: 'id, numero, codigo, nome, whatsapp, cidade, uf, cep, logradouro, numero_endereco, complemento, bairro, cupom, passaporte_publico_em, aceite_lgpd_em',
  pv_selo_visitas: 'id, motociclista_id, chave_envio, estacao, ano, local, foto_path, foto_status, retirado_em, liberado_em, checkin_em, checkin_metodo, checkin_distancia_m, checkin_precisao_m, prova_path',
  pv_selo_conquistas: 'id, motociclista_id, ano, autorizado_em, aprovado_em',
  pv_selo_beneficio_usos: 'id, motociclista_id, usado_em, nota, parceiro_id, tipo, ano',
  pv_selo_parceiros: 'id, nome, token, ativo, criado_em, selo_codigo, selo_cor, selo_local, selo_atualizado_em',
  pv_selo_limites: 'chave, contador, expira',
  pv_selo_entradas: 'id, motociclista_id, tipo, carimbo, ibge, uf, dia, criado_em, metodo, distancia_m, precisao_m, foto_path, capturado_em, foto_status, foto_em, denuncias, serie',
  pv_selo_series: 'carimbo, ultimo',
  pv_selo_denuncias: 'entrada_id, quem, criado_em',
};

const falhas = [];
const ok = (msg) => console.log(`OK     ${msg}`);
const falha = (msg) => { falhas.push(msg); console.log(`FALHA  ${msg}`); };

for (const [tabela, colunas] of Object.entries(ESPERADO)) {
  const { error } = await sb.from(tabela).select(colunas).limit(1);
  if (error) falha(`${tabela}: ${error.message}`); else ok(`${tabela} (${colunas.split(',').length} colunas)`);
}

const { error: e1 } = await sb.rpc('pv_selo_conquista_completa', { p_moto: '00000000-0000-0000-0000-000000000000', p_ano: 2026 });
if (e1) falha(`função pv_selo_conquista_completa: ${e1.message}`); else ok('função pv_selo_conquista_completa');
// supabase_selo_mapa.sql: passaporte online, carimbo sem foto, mapa e denúncias.
const { error: eMapa } = await sb.rpc('pv_selo_mapa_cidades');
if (eMapa) falha(`função pv_selo_mapa_cidades (rode supabase_selo_mapa.sql): ${eMapa.message}`); else ok('função pv_selo_mapa_cidades');
const { data: bloqueado, error: e2 } = await sb.rpc('pv_selo_limite', { p_chave: 'preflight:teste', p_limite: 100000, p_janela_seg: 60 });
if (e2) falha(`função pv_selo_limite: ${e2.message}`); else if (bloqueado !== false) falha('pv_selo_limite respondeu inesperado'); else ok('função pv_selo_limite (limite compartilhado)');

// Bucket de fotos privado.
const { data: bucket, error: e3 } = await sb.storage.getBucket('selo-fotos');
if (e3) falha(`bucket selo-fotos: ${e3.message}`); else if (bucket.public) falha('bucket selo-fotos está PÚBLICO'); else ok('bucket selo-fotos privado');

// Variáveis do ambiente onde o script roda (só presença, nunca o valor).
const VARS = [
  ['GOOGLE_SA_EMAIL', 'planilhas'], ['GOOGLE_SA_PRIVATE_KEY', 'planilhas'], ['SELO_PLANILHA_OFICIAL', 'planilhas'], ['SELO_PLANILHA_RESERVA', 'planilhas'],
  ['CRON_SECRET', 'cópia diária'], ['RATE_LIMIT_SALT', 'limite de tentativas'],
];
for (const [nome, uso] of VARS) console.log(`${process.env[nome] ? 'OK    ' : 'AVISO '} ${nome} ${process.env[nome] ? 'definida' : `ausente (${uso})`}`);
for (const nome of Object.keys(process.env)) if (process.env[nome]?.trim() && nome.startsWith('NEXT_PUBLIC_') && /SECRET|SERVICE|PRIVATE/i.test(nome)) falha(`${nome}: segredo exposto ao navegador`);

console.log(falhas.length ? `\n${falhas.length} problema(s): NÃO publique antes de corrigir.` : '\nBanco pronto para publicar.');
process.exit(falhas.length ? 1 : 0);
