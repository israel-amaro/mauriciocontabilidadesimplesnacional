import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { getLead, mutateLead } from '@/lib/db';
import { handle, HttpError, json, readJson, requireAdmin, sameOrigin } from '@/lib/http';
import { sendWhatsapp, whatsappConfigured } from '@/lib/whatsapp';
export async function POST(req:Request,ctx:{params:Promise<{id:string}>}){return handle(async()=>{
  sameOrigin(req);await requireAdmin();const id=(await ctx.params).id;
  const {text,simulateIncoming}=z.object({text:z.string().trim().min(1).max(4000),simulateIncoming:z.boolean().default(false)}).parse(await readJson(req));
  const lead=await getLead(id);if(!lead)throw new HttpError(404,'Lead não encontrado.');
  if(simulateIncoming&&(!lead.demo||process.env.DEMO_ENABLED!=='true'))throw new HttpError(403,'Simulação disponível apenas em exemplos fictícios.');
  let messageId=randomUUID() as string;
  if(!lead.demo){
    if(!whatsappConfigured())throw new HttpError(409,'Conecte o WhatsApp Business nas integrações. Você também pode abrir a conversa pelo WhatsApp.');
    const incoming=lead.messages.filter(m=>m.direction==='in'&&!m.demo).sort((a,b)=>b.at.localeCompare(a.at))[0];
    if(!incoming||Date.now()-new Date(incoming.at).getTime()>24*60*60*1000)throw new HttpError(409,'Peça ao contato que inicie ou retome a conversa pelo WhatsApp. O envio livre pela API exige uma mensagem recebida nas últimas 24 horas.');
    try{messageId=await sendWhatsapp(lead.phone,text);}catch{throw new HttpError(502,'O WhatsApp não confirmou o envio. Confira a conversa antes de tentar novamente.');}
  }
  const updated=await mutateLead(id,l=>({...l,messages:[...l.messages,{id:messageId,text,direction:simulateIncoming?'in':'out',at:new Date().toISOString(),status:lead.demo?'simulated':simulateIncoming?'received':'sent',demo:lead.demo}]}));
  return json({lead:updated});
});}
