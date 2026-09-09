import 'server-only';
import { cookies } from 'next/headers';
import { scryptSync, timingSafeEqual, createHash, randomUUID } from 'node:crypto';
import { SignJWT, jwtVerify } from 'jose';
import { query } from './db';
const cookieName = 'mr_session';
const key = () => { const value=process.env.AUTH_SECRET; if (!value || value.length<32) throw new Error('AUTH_NOT_CONFIGURED'); return new TextEncoder().encode(value); };
export const authConfigured = () => Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD_HASH && (process.env.AUTH_SECRET?.length ?? 0)>=32);
export type Role = 'admin' | 'employee' | 'client';
type Account = { email: string; passwordHash: string; role: Role; leadId?: string };
function accounts(): Account[] {
  const result: Account[] = [];
  if(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD_HASH) result.push({email:process.env.ADMIN_EMAIL.toLowerCase(),passwordHash:process.env.ADMIN_PASSWORD_HASH,role:'admin'});
  if(process.env.EMPLOYEE_EMAIL && process.env.EMPLOYEE_PASSWORD_HASH) result.push({email:process.env.EMPLOYEE_EMAIL.toLowerCase(),passwordHash:process.env.EMPLOYEE_PASSWORD_HASH,role:'employee'});
  if(process.env.CLIENT_EMAIL && process.env.CLIENT_PASSWORD_HASH && process.env.CLIENT_LEAD_ID) result.push({email:process.env.CLIENT_EMAIL.toLowerCase(),passwordHash:process.env.CLIENT_PASSWORD_HASH,role:'client',leadId:process.env.CLIENT_LEAD_ID});
  return result;
}
export function checkPassword(password: string, hash = process.env.ADMIN_PASSWORD_HASH || '') {
  const [salt, hex] = hash.split(':');
  if (!salt || !hex || hex.length!==128) return false;
  const expected = Buffer.from(hex, 'hex');
  return timingSafeEqual(scryptSync(password, salt, 64), expected);
}
export function authenticate(email:string,password:string) {
  const account=accounts().find(a=>a.email===email.trim().toLowerCase());
  const valid=checkPassword(password,account?.passwordHash||process.env.ADMIN_PASSWORD_HASH||'');
  return account&&valid?account:null;
}
const credentialVersion = (account:Account) => createHash('sha256').update(`${account.passwordHash}:${account.role}:${account.leadId||''}`).digest('hex').slice(0,16);
export const sessionHome = (role:Role) => role==='client'?'/cliente':'/admin';
export async function createSession(account:Account) {
  const id=randomUUID(); const expires=Date.now()+8*60*60*1000;
  await query('DELETE FROM sessions WHERE expires < $1', [Date.now()]);
  await query('INSERT INTO sessions (id, expires) VALUES ($1,$2)', [id,expires]);
  const token = await new SignJWT({role:account.role, version:credentialVersion(account)}).setProtectedHeader({alg:'HS256'}).setSubject(account.email).setJti(id).setIssuedAt().setExpirationTime('8h').setIssuer('mr-portal').setAudience('mr-portal-users').sign(key());
  (await cookies()).set(cookieName,token,{httpOnly:true,secure:Boolean(process.env.VERCEL || process.env.APP_URL?.startsWith('https://')),sameSite:'strict',path:'/',maxAge:8*60*60});
}
export async function getSession() {
  const token=(await cookies()).get(cookieName)?.value;
  if(!token || !authConfigured()) return null;
  let payload;
  try { ({payload} = await jwtVerify(token,key(),{algorithms:['HS256'],issuer:'mr-portal',audience:'mr-portal-users'})); } catch { return null; }
  const account=accounts().find(a=>a.email===payload.sub);
  if(!account || payload.role!==account.role || payload.version!==credentialVersion(account) || !payload.jti) return null;
  const [session]=await query('SELECT id FROM sessions WHERE id = $1 AND expires > $2',[payload.jti,Date.now()]);
  return session ? {email:account.email,id:payload.jti,role:account.role,leadId:account.leadId} : null;
}
export async function logout() {
  const session=await getSession();
  if(session) await query('DELETE FROM sessions WHERE id = $1',[session.id]);
  (await cookies()).delete(cookieName);
}
