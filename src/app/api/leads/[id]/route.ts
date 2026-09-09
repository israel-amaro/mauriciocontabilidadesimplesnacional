import { randomUUID } from 'node:crypto';
import { getLead, mutateLead, query } from '@/lib/db';
import { handle, HttpError, json, readJson, requireAdmin, requireAdministrator, sameOrigin } from '@/lib/http';
import { leadUpdate } from '@/lib/validation';
type Context={params:Promise<{id:string}>};
export async function GET(_req:Request,ctx:Context){return handle(async()=>{await requireAdmin();const lead=await getLead((await ctx.params).id);if(!lead)throw new HttpError(404,'Lead não encontrado.');return json({lead});});}
export async function PATCH(req:Request,ctx:Context){return handle(async()=>{
  sameOrigin(req);await requireAdmin();const update=leadUpdate.parse(await readJson(req));
  const lead=await mutateLead((await ctx.params).id,lead=>{
    const now=new Date().toISOString();
    if(update.status && update.status!==lead.status) lead.activities.push({id:randomUUID(),text:`Etapa alterada: ${lead.status} → ${update.status}.`,kind:'status',at:now});
    if(update.note) lead.activities.push({id:randomUUID(),text:update.note,kind:'note',at:now});
    if(update.proposal) lead.activities.push({id:randomUUID(),text:'Proposta personalizada atualizada.',kind:'system',at:now});
    const {note:_note,...fields}=update;return {...lead,...fields};
  });if(!lead)throw new HttpError(404,'Lead não encontrado.');return json({lead});
});}
export async function DELETE(req:Request,ctx:Context){return handle(async()=>{sameOrigin(req);await requireAdministrator();await query('DELETE FROM leads WHERE id = $1',[(await ctx.params).id]);return json({ok:true});});}
