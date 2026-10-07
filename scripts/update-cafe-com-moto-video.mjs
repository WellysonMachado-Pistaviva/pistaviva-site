import {createClient} from '@supabase/supabase-js';
import {resolveSupabaseAdminConfig} from '../app/lib/supabaseAdminConfig.mjs';
const {url,key}=resolveSupabaseAdminConfig();
if(!url||!key)throw new Error('Credenciais Supabase ausentes. Use node --env-file=.env.local.');
const sb=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
const id='cbb79f85-3cbf-4dea-8dda-1df38d2c0261';
const video='https://www.instagram.com/p/DVcBZq4gRPF/';
const {data:event,error:lookup}=await sb.from('pv_events').select('id,title,schedule').eq('id',id).single();
if(lookup)throw new Error(lookup.message);
if(!Array.isArray(event.schedule))throw new Error('Schedule inesperado.');
const target=event.schedule.findIndex(item=>item&&'previousInstagram' in item);
if(target<0)throw new Error('Nenhum item de schedule com previousInstagram.');
const before=event.schedule[target].previousInstagram;
if(before===video){console.log({unchanged:true,video});process.exit(0);}
const schedule=event.schedule.map((item,index)=>index===target?{...item,previousInstagram:video}:item);
if(!process.argv.includes('--apply')){console.log({dryRun:true,title:event.title,before,after:video});process.exit(0);}
const {error}=await sb.from('pv_events').update({schedule}).eq('id',id);
if(error)throw new Error(error.message);
console.log({updated:true,before,after:video});
