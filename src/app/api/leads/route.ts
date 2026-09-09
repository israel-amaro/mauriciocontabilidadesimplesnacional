import { insertLead, listLeads, consumeLimit } from '@/lib/db';
import { handle, HttpError, ipKey, json, readJson, requireAdmin, sameOrigin } from '@/lib/http';
import { newLead } from '@/lib/leads';
export const runtime='nodejs';
export async function GET(){return handle(async()=>{await requireAdmin();return json({leads:await listLeads()});});}
export async function POST(req:Request){return handle(async()=>{
  sameOrigin(req);
  if(!await consumeLimit('capture:'+ipKey(req),15,60*60*1000)) throw new HttpError(429,'Muitas solicitações. Aguarde um pouco para tentar novamente.');
  const lead=newLead(await readJson(req));
  await insertLead(lead); return json({id:lead.id},201);
});}
