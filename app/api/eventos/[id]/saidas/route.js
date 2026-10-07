import { NextResponse } from 'next/server';
import { createHash, createHmac, randomBytes } from 'node:crypto';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';
import { resolveSupabaseAdminConfig } from '../../../../lib/supabaseAdminConfig.mjs';
import { UUID, validateDepartureInput, publicDeparture, publicComment } from '../../../../lib/eventDepartures.mjs';
import { eventStartISO } from '../../../../lib/events';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const COOKIE = 'pv_departure_session';
const hash = value => createHash('sha256').update(value).digest('hex');
const session = req => { const v=req.cookies.get(COOKIE)?.value; return /^[a-f0-9]{64}$/.test(v || '') ? v : null; };
const reply = (body,status=200) => NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store'}});
async function event(sb,id) {
  const {data,error}=await sb.from('pv_events').select('id,date,time,hidden,schedule').eq('id',id).maybeSingle();
  if(error) throw error;
  return data && !data.hidden && data.schedule?.some(s=>s?.departuresEnabled===true) ? data : null;
}
export async function GET(req,{params}) {
  const {id}=await params;
  if(!UUID.test(id)) return reply({error:'Evento inválido.'},400);
  try {
    const sb=supabaseAdmin();
    if(!await event(sb,id)) return reply({error:'Saídas indisponíveis para este evento.'},404);
    const owner=session(req) ? hash(session(req)) : null;
    const query=new URL(req.url).searchParams;
    const offset=Math.max(0,Math.min(10000,parseInt(query.get('offset') || '0',10)||0));
    const departure=query.get('departure');
    if(departure) {
      if(!UUID.test(departure)) return reply({error:'Saída inválida.'},400);
      const {data:dep,error:de}=await sb.from('pv_event_departures').select('id,owner_hash').eq('id',departure).eq('event_id',id).maybeSingle();
      if(de) throw de;
      if(!dep) return reply({error:'Saída não encontrada.'},404);
      const [members,comments,mine]=await Promise.all([
        sb.from('pv_event_departure_members').select('id,name', {count:'exact'}).eq('departure_id',departure).order('created_at').limit(100),
        sb.from('pv_event_departure_comments').select('id,name,body,created_at,owner_hash',{count:'exact'}).eq('departure_id',departure).order('created_at',{ascending:false}).order('id').range(offset,offset+19),
        owner ? sb.from('pv_event_departure_members').select('id').eq('departure_id',departure).eq('owner_hash',owner).maybeSingle() : Promise.resolve({data:null}),
      ]);
      for(const r of [members,comments,mine]) if(r.error) throw r.error;
      return reply({members:members.data,totalMembers:members.count,joined:Boolean(mine.data),comments:comments.data.map(c=>publicComment(c,owner)),more:offset+20<comments.count});
    }
    const {data,error,count}=await sb.from('pv_event_departures').select('*',{count:'exact'}).eq('event_id',id).order('created_at',{ascending:false}).order('id').range(offset,offset+19);
    if(error) throw error;
    // Resumo por cidade só na primeira página. Se a função de agregação ainda
    // não existir no banco (migração pendente), a lista continua funcionando.
    let cities=[];
    if(!offset) {
      const summary=await sb.rpc('pv_event_departure_cities',{p_event:id});
      if(summary.error) console.warn('[Event departures] city summary unavailable',summary.error.code || summary.error.message);
      else cities=summary.data || [];
    }
    return reply({departures:data.map(d=>publicDeparture(d,owner)),more:offset+20<count,cities});
  } catch(error) { console.error('[Event departures] read failed',error.code || error.name); return reply({error:'Não foi possível carregar as saídas. Tente novamente.'},503); }
}
export async function POST(req,{params}) {
  const {id}=await params;
  if(!UUID.test(id)) return reply({error:'Evento inválido.'},400);
  if(req.headers.get('origin')!==`${new URL(req.url).protocol}//${req.headers.get('host')}` || req.headers.get('sec-fetch-site')==='cross-site') return reply({error:'Origem não permitida.'},403);
  if(!req.headers.get('content-type')?.includes('application/json')) return reply({error:'Formato inválido.'},415);
  if(Number(req.headers.get('content-length'))>5000) return reply({error:'Mensagem muito longa.'},413);
  const reader=req.body?.getReader();
  if(!reader) return reply({error:'Dados inválidos.'},400);
  const chunks=[];let bytes=0;
  while(true) { const {value,done}=await reader.read();if(done) break;bytes+=value.byteLength;if(bytes>5000){await reader.cancel();return reply({error:'Mensagem muito longa.'},413);}chunks.push(Buffer.from(value)); }
  const raw=Buffer.concat(chunks).toString('utf8');
  let body;
  try { body=JSON.parse(raw); } catch {return reply({error:'Dados inválidos.'},400);}
  try {
    const sb=supabaseAdmin(); const e=await event(sb,id);
    if(!e) return reply({error:'Evento não encontrado.'},404);
    let data;
    try {data=validateDepartureInput(body,eventStartISO(e.date,e.time)?.slice(0,10));} catch(err){return reply({error:err.message},400);}
    if(['create','join','comment'].includes(data.action) && eventStartISO(e.date,e.time)?.slice(0,10)<new Date(Date.now()-3*3600000).toISOString().slice(0,10)) return reply({error:'Este encontro já terminou.'},400);
    const token=session(req)||randomBytes(32).toString('hex');
    const ip=req.headers.get('x-vercel-forwarded-for') || req.headers.get('x-forwarded-for') || 'local';
    const rate=createHmac('sha256',resolveSupabaseAdminConfig().key).update(`${ip.split(',')[0].trim()}:${Math.floor(Date.now()/3600000)}`).digest('hex');
    const {data:result,error}=await sb.rpc('pv_mutate_event_departure',{p_event:id,p_owner:hash(token),p_rate:rate,p_data:data});
    if(error) {
      const mapping=[['RATE_LIMIT',429,'Muitas ações. Tente novamente mais tarde.'],['COMMENT_TOO_FAST',429,'Aguarde 15 segundos antes de comentar novamente.'],['FORBIDDEN',403,'Você só pode excluir publicações feitas neste navegador.'],['DEPARTURE_NOT_FOUND',404,'Esta saída não está mais disponível.'],['DEPARTURE_PAST',400,'Esta saída já aconteceu.'],['ALREADY_ORGANIZER',400,'Você já organiza esta saída.']];
      const known=mapping.find(([key])=>error.message?.includes(key));
      if(known) {console.warn('[Event departures] rejected',known[0]);return reply({error:known[2]},known[1]);}
      if(error.code==='23505') return reply({error:'Você já publicou uma saída para este evento. Exclua a anterior para substituir.'},409);
      throw error;
    }
    const response=reply({ok:true,id:result.id});
    response.cookies.set(COOKIE,token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:60*60*24*180});
    return response;
  } catch(error) {console.error('[Event departures] write failed',error.code || error.name);return reply({error:'Não foi possível salvar. Tente novamente.'},503);}
}
