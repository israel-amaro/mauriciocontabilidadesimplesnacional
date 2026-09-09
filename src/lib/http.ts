import { createHash } from 'node:crypto';
import { ZodError } from 'zod';
import { getSession } from './auth';
export class HttpError extends Error { constructor(public status: number, message: string) { super(message); } }
export const json = (data: unknown, status=200) => Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export async function requireAdmin() { const session=await getSession(); if(!session) throw new HttpError(401,'Sua sessão expirou. Entre novamente.'); if(session.role==='client')throw new HttpError(403,'Esta área é exclusiva da equipe.'); return session; }
export async function requireAdministrator() { const session=await requireAdmin(); if(session.role!=='admin')throw new HttpError(403,'Esta ação exige um administrador.'); return session; }
export async function requireClient() { const session=await getSession();if(!session)throw new HttpError(401,'Sua sessão expirou. Entre novamente.');if(session.role!=='client'||!session.leadId)throw new HttpError(403,'Esta área exige um acesso de cliente.');return session; }
export function sameOrigin(req: Request) {
  const origin=req.headers.get('origin');
  const allowed=new Set([new URL(req.url).origin, ...(process.env.APP_URL ? [new URL(process.env.APP_URL).origin] : [])]);
  // A Vercel encaminha o host original em Host; Origin continua sob controle do navegador.
  const host=req.headers.get('host'); if(host) allowed.add(`${process.env.VERCEL ? 'https:' : new URL(req.url).protocol}//${host}`);
  if(!origin || !allowed.has(origin)) throw new HttpError(403,'Origem da solicitação não autorizada.');
}
export async function readJson(req: Request) {
  if(!req.headers.get('content-type')?.includes('application/json')) throw new HttpError(415,'Envie os dados como JSON.');
  const text=await req.text(); if(text.length>32000) throw new HttpError(413,'Solicitação muito grande.');
  try{return JSON.parse(text);}catch{throw new HttpError(400,'Dados inválidos.');}
}
export function ipKey(req: Request) {
  const ip=process.env.VERCEL ? req.headers.get('x-vercel-forwarded-for') || 'unknown' : 'local';
  return createHash('sha256').update(ip + (process.env.AUTH_SECRET || '')).digest('hex').slice(0,32);
}
export async function handle(action:()=>Promise<Response>) {
  try{return await action();}catch(error){
    if(error instanceof HttpError) return json({error:error.message},error.status);
    if(error instanceof ZodError) return json({error:error.issues[0]?.message || 'Revise os dados preenchidos.'},400);
    console.error('[portal]',error instanceof Error ? error.message : 'Unknown failure');
    return json({error:'Não foi possível concluir agora. Seus dados preenchidos foram mantidos. Tente novamente em instantes.'},503);
  }
}
