import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createClient} from '@supabase/supabase-js';
import {resolveSupabaseAdminConfig} from '../app/lib/supabaseAdminConfig.mjs';
const base=process.env.PV_TEST_BASE || 'http://127.0.0.1:3103';
const event='cbb79f85-3cbf-4dea-8dda-1df38d2c0261';
const path=`/api/eventos/${event}/saidas`;
const {url,key}=resolveSupabaseAdminConfig();const admin=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
const a={cookie:''},b={cookie:''};let id,rateKey;
async function call(client,data,query='') {
 const r=await fetch(base+path+query,{method:data?'POST':'GET',headers:{...(data?{'Content-Type':'application/json',Origin:base}:{}),...(client.cookie?{Cookie:client.cookie}:{})},...(data?{body:JSON.stringify(data)}:{})});
 const cookie=r.headers.get('set-cookie');if(cookie)client.cookie=cookie.split(';')[0];
 return {status:r.status,body:await r.json()};
}
try {
 let r=await call(a,{action:'create',name:'Teste técnico A',city:'Itajubá',uf:'MG',date:'2026-11-01',time:'07:00',meeting_point:'Teste automatizado — será removido',note:'Verificação temporária do sistema.'});assert.equal(r.status,200,JSON.stringify(r.body));id=r.body.id;
 r=await call(a);assert.equal(r.body.departures.find(d=>d.id===id).mine,true);assert(!JSON.stringify(r.body).includes('owner_hash'));
 r=await call(b,{action:'join',departure_id:id,name:'Teste técnico B'});assert.equal(r.status,200,JSON.stringify(r.body));
 r=await call(b,{action:'join',departure_id:id,name:'Teste técnico B'});assert.equal(r.status,200);
 r=await call(a,null,`?departure=${id}`);assert.equal(r.body.totalMembers,1);assert.equal(r.body.joined,false);
 r=await call(b,{action:'comment',departure_id:id,name:'Teste técnico B',body:'Confirmo o ponto de encontro.'});assert.equal(r.status,200);const comment=r.body.id;
 r=await call(a,null,`?departure=${id}`);assert.equal(r.body.comments.length,1);assert.equal(r.body.comments[0].mine,false);assert(!JSON.stringify(r.body).includes('owner_hash'));
 r=await call(a,{action:'delete_comment',departure_id:id,comment_id:comment});assert.equal(r.status,403);
 r=await call(b,{action:'delete_departure',departure_id:id});assert.equal(r.status,403);
 const badOrigin=await fetch(base+path,{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://example.org'},body:JSON.stringify({action:'create'})});assert.equal(badOrigin.status,403);
 r=await call(b,{action:'comment',departure_id:id,name:'Teste técnico B',body:'Rápido demais'});assert.equal(r.status,429);
 const token=b.cookie.split('=')[1];const owner=createHash('sha256').update(token).digest('hex');const budgets=await admin.from('pv_event_departure_limits').select('key').like('key',owner+':%');assert.equal(budgets.data.length,1);rateKey=budgets.data[0].key;
 const limit=await admin.from('pv_event_departure_limits').upsert({key:rateKey,hits:30,expires_at:new Date(Date.now()+3600000).toISOString()});assert(!limit.error);
 r=await call(b,{action:'join',departure_id:id,name:'Teste técnico B'});assert.equal(r.status,429);
 r=await call(b,{action:'leave',departure_id:id});assert.equal(r.status,200);
 r=await call(b,{action:'delete_comment',departure_id:id,comment_id:comment});assert.equal(r.status,200);
 r=await call(a,null,`?departure=${id}`);assert.equal(r.body.totalMembers,0);assert.equal(r.body.comments.length,0);
 const anon=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
 const read=await anon.from('pv_event_departures').select('*');assert(read.error||read.data.length===0);
 const rpc=await anon.rpc('pv_mutate_event_departure',{p_event:event,p_owner:'a'.repeat(64),p_rate:'b'.repeat(64),p_data:{action:'create'}});assert(rpc.error);
 r=await call(a,{action:'delete_departure',departure_id:id});assert.equal(r.status,200);id=null;
 console.log('PASS: create, ownership, unique join, comment, other-session updates, unauthorized deletion, cross-origin, cooldown, rate limit, removal after limit, private tables/RPC, cleanup.');
} finally {
 if(id)await admin.from('pv_event_departures').delete().eq('id',id).eq('name','Teste técnico A');
 if(rateKey)await admin.from('pv_event_departure_limits').delete().eq('key',rateKey);
}
