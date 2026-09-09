import { z } from 'zod';
import { listLeads, mutateLead } from '@/lib/db';
import { validSignature } from '@/lib/whatsapp';
import { handle, HttpError, json } from '@/lib/http';
export const runtime='nodejs';
export async function GET(req:Request){const p=new URL(req.url).searchParams;if(process.env.WHATSAPP_VERIFY_TOKEN&&p.get('hub.mode')==='subscribe'&&p.get('hub.verify_token')===process.env.WHATSAPP_VERIFY_TOKEN)return new Response(p.get('hub.challenge')||'');return new Response('Forbidden',{status:403});}
const messageSchema=z.object({id:z.string(),from:z.string(),timestamp:z.string(),type:z.string(),text:z.object({body:z.string()}).optional()});
const valueSchema=z.object({
  metadata:z.object({phone_number_id:z.string()}).optional(),
  messages:z.array(messageSchema).optional(),
  statuses:z.array(z.object({id:z.string(),status:z.string()})).optional(),
});
const webhookSchema=z.object({entry:z.array(z.object({changes:z.array(z.object({value:valueSchema}))})).optional()});
export async function POST(req:Request){return handle(async()=>{
  const raw=await req.text();if(raw.length>1000000)throw new HttpError(413,'Payload too large');
  if(!validSignature(raw,req.headers.get('x-hub-signature-256')))throw new HttpError(401,'Invalid signature');
  let parsed:unknown;try{parsed=JSON.parse(raw);}catch{throw new HttpError(400,'Invalid JSON');}
  const payload=webhookSchema.parse(parsed);const leads=await listLeads();
  for(const entry of payload.entry||[])for(const change of entry.changes){
    const value=change.value;
    if(value.metadata?.phone_number_id!==process.env.WHATSAPP_PHONE_NUMBER_ID)continue;
    for(const m of value.messages||[]){
      const lead=leads.find(l=>l.phone===m.from&&!l.demo);if(!lead)continue;
      const timestamp=Number(m.timestamp)*1000;if(!Number.isFinite(timestamp))continue;
      await mutateLead(lead.id,l=>{if(l.messages.some(x=>x.id===m.id))return l;return {...l,messages:[...l.messages,{id:m.id,direction:'in',text:m.text?.body||`Mensagem do tipo ${m.type}. Abra no WhatsApp para visualizar.`,at:new Date(timestamp).toISOString(),status:'received'}]};});
    }
    for(const s of value.statuses||[]){const lead=leads.find(l=>l.messages.some(m=>m.id===s.id));if(lead)await mutateLead(lead.id,l=>({...l,messages:l.messages.map(m=>m.id===s.id?{...m,status:s.status}:m)}));}
  }
  return json({ok:true});
});}
