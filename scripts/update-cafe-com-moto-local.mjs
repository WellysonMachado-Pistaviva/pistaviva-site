// Coordenadas e endereço do "Como chegar" do 2º Café com Moto na Serra.
// Pin exato evita depender do geocode do endereço em texto.
import {createClient} from '@supabase/supabase-js';
import {resolveSupabaseAdminConfig} from '../app/lib/supabaseAdminConfig.mjs';
const {url,key}=resolveSupabaseAdminConfig();
if(!url||!key)throw new Error('Credenciais Supabase ausentes. Use node --env-file=.env.local.');
const sb=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
const id='cbb79f85-3cbf-4dea-8dda-1df38d2c0261';
const patch={
  lat:-22.376862,
  lng:-44.760003,
  address:'Bar do Miguelzinho, Garganta do Registro, Rodovia BR-354, Engenheiro Passos, Resende - RJ',
};
if(Math.abs(patch.lat)>90||Math.abs(patch.lng)>180)throw new Error('Coordenadas fora de faixa.');
const {data:before,error:lookup}=await sb.from('pv_events').select('id,title,address,lat,lng').eq('id',id).single();
if(lookup)throw new Error(lookup.message);
if(!process.argv.includes('--apply')){console.log({dryRun:true,before,after:patch});process.exit(0);}
const {error}=await sb.from('pv_events').update(patch).eq('id',id);
if(error)throw new Error(error.message);
console.log({updated:true,before,after:patch});
