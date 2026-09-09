import { demoLeads } from '@/lib/demo';
import { insertLead, listLeads } from '@/lib/db';
import { handle, HttpError, json, requireAdmin, sameOrigin } from '@/lib/http';
export async function POST(req:Request){return handle(async()=>{sameOrigin(req);await requireAdmin();if(process.env.DEMO_ENABLED!=='true')throw new HttpError(403,'Demonstração desativada.');if((await listLeads()).some(l=>l.demo))throw new HttpError(409,'Os exemplos já estão no CRM.');for(const lead of demoLeads())await insertLead(lead);return json({ok:true});});}
