import { getLead } from '@/lib/db';
import { clientView } from '@/lib/client-view';
import { handle, HttpError, json, requireClient } from '@/lib/http';
export async function GET(){return handle(async()=>{const session=await requireClient();const lead=await getLead(session.leadId!);if(!lead)throw new HttpError(404,'Seu acompanhamento ainda não está disponível. Fale com a equipe.');return json({client:clientView(lead)});});}
