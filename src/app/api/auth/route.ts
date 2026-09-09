import { z } from 'zod';
import { authConfigured, authenticate, createSession, logout, sessionHome } from '@/lib/auth';
import { consumeLimit } from '@/lib/db';
import { handle, HttpError, ipKey, json, readJson, sameOrigin } from '@/lib/http';
export const runtime='nodejs';
export async function POST(req:Request){return handle(async()=>{
  sameOrigin(req); if(!authConfigured()) throw new HttpError(503,'O acesso administrativo ainda não foi configurado. Consulte o guia de instalação.');
  const {email,password}=z.object({email:z.email().max(180),password:z.string().min(1).max(200)}).parse(await readJson(req));
  if(!await consumeLimit('login:'+ipKey(req),8,15*60*1000) || !await consumeLimit('login:global',80,15*60*1000)) throw new HttpError(429,'Muitas tentativas. Aguarde 15 minutos antes de tentar novamente.');
  const account=authenticate(email,password);
  if(!account) throw new HttpError(401,'E-mail ou senha incorretos.');
  await createSession(account); return json({ok:true,redirect:sessionHome(account.role)});
});}
export async function DELETE(req:Request){return handle(async()=>{sameOrigin(req);await logout();return json({ok:true});});}
