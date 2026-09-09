import { seedLeads, presentationAccounts } from './presentation-data';
import { leadInput, leadUpdate } from './validation';
import { clientView } from './client-view';
import type { Lead } from './types';

// Ambiente de apresentação: estado e seleção de perfil locais, sem segurança de produção.
const storeKey='mr-presentation-records-v1';
const sessionKey='mr-presentation-session-v1';
type Session={email:string;role:'employee'|'client';leadId?:string;expires:number};
const response=(data:unknown,status=200)=>Response.json(data,{status});
function records():Lead[]{
  const raw=localStorage.getItem(storeKey);
  if(raw){const parsed=JSON.parse(raw);if(!Array.isArray(parsed))throw new Error('LOCAL_DATA_INVALID');return parsed;}
  const data=structuredClone(seedLeads) as Lead[];
  // Manter os intervalos do funil relevantes à data em que a apresentação é aberta.
  const newest=Math.max(...data.map(l=>Date.parse(l.createdAt)));const offset=Date.now()-newest;
  for(const lead of data){lead.createdAt=new Date(Date.parse(lead.createdAt)+offset).toISOString();lead.updatedAt=lead.createdAt;lead.consentAt=lead.createdAt;if(lead.nextContact)lead.nextContact=new Date(Date.parse(lead.nextContact+'T12:00:00Z')+offset).toISOString().slice(0,10);for(const a of lead.activities)a.at=lead.createdAt;for(const m of lead.messages)m.at=new Date(Date.now()-3600000).toISOString();}
  save(data);return data;
}
function save(data:Lead[]){localStorage.setItem(storeKey,JSON.stringify(data));}
function session():Session|null{const raw=localStorage.getItem(sessionKey);if(!raw)return null;try{const s=JSON.parse(raw) as Session;const known=presentationAccounts.find(a=>a.email===s.email&&a.role===s.role);if(!known||s.expires<Date.now()){localStorage.removeItem(sessionKey);return null;}return {...s,leadId:known.leadId};}catch{localStorage.removeItem(sessionKey);return null;}}
async function digest(value:string){const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));return Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');}
export async function presentationFetch(url:string,options:RequestInit={}):Promise<Response>{
  try{
    const method=(options.method||'GET').toUpperCase();const path=new URL(url,'https://portal.local').pathname;
    const body=typeof options.body==='string'?JSON.parse(options.body):{};
    if(path==='/api/auth'&&method==='POST'){
      const email=String(body.email||'').trim().toLowerCase();const password=String(body.password||'');
      const account=presentationAccounts.find(a=>a.email===email);
      if(!account||await digest(password)!==account.passwordDigest)return response({error:'E-mail ou senha incorretos.'},401);
      localStorage.setItem(sessionKey,JSON.stringify({email:account.email,role:account.role,leadId:account.leadId,expires:Date.now()+8*3600000}));
      records();return response({ok:true,redirect:account.role==='client'?'/cliente':'/admin'});
    }
    if(path==='/api/auth'&&method==='DELETE'){localStorage.removeItem(sessionKey);return response({ok:true});}
    if(path==='/api/leads'&&method==='POST'){
      const checked=leadInput.safeParse(body);if(!checked.success)return response({error:checked.error.issues[0].message},400);
      const {submissionId,website:_website,...input}=checked.data;const all=records();const now=new Date().toISOString();
      if(!all.some(l=>l.id===submissionId)){
        all.unshift({...input,id:submissionId,createdAt:now,updatedAt:now,consentAt:now,consentVersion:'2026-09-v1',status:'Novo',priority:'Normal',owner:'',nextContact:'',demo:true,activities:[{id:crypto.randomUUID(),kind:'system',text:'Diagnóstico registrado no portal.',at:now}],messages:[],proposal:{scope:'',amount:0,notes:''}});save(all);
      }return response({id:submissionId},201);
    }
    const user=session();if(!user)return response({error:'Entre novamente para continuar.'},401);
    if(path==='/api/session')return response({email:user.email,role:user.role});
    const all=records();
    if(path==='/api/client'||path==='/api/client/messages'){
      if(user.role!=='client')return response({error:'Área exclusiva do cliente.'},403);
      const lead=all.find(l=>l.id===user.leadId);if(!lead)return response({error:'Atendimento não encontrado.'},404);
      if(path.endsWith('/messages')&&method==='POST'){
        const text=String(body.text||'').trim();if(!text||text.length>4000)return response({error:'Escreva uma mensagem de até 4.000 caracteres.'},400);
        lead.messages.push({id:crypto.randomUUID(),text,direction:'in',at:new Date().toISOString(),status:'recorded'});save(all);
      }else if(method!=='GET')return response({error:'Ação não permitida.'},405);
      return response({client:{...clientView(lead),messages:lead.messages}});
    }
    if(user.role!=='employee')return response({error:'Área exclusiva da equipe.'},403);
    if(path==='/api/settings')return response({storage:'Dados deste navegador',whatsapp:false,demoEnabled:false,email:user.email});
    if(path==='/api/leads'&&method==='GET')return response({leads:all});
    const match=path.match(/^\/api\/leads\/([^/]+)(\/messages)?$/);if(!match)return response({error:'Recurso indisponível.'},404);
    const lead=all.find(l=>l.id===match[1]);if(!lead)return response({error:'Lead não encontrado.'},404);
    if(match[2]&&method==='POST'){
      if(body.simulateIncoming)return response({error:'A resposta deve ser enviada pela área do cliente.'},400);
      const text=String(body.text||'').trim();if(!text||text.length>4000)return response({error:'Escreva uma mensagem de até 4.000 caracteres.'},400);
      lead.messages.push({id:crypto.randomUUID(),text,direction:'out',at:new Date().toISOString(),status:'recorded'});save(all);return response({lead});
    }
    if(method==='GET')return response({lead});
    if(method==='PATCH'){
      const checked=leadUpdate.safeParse(body);if(!checked.success)return response({error:checked.error.issues[0].message},400);
      const {note,...fields}=checked.data;const at=new Date().toISOString();
      if(fields.status&&fields.status!==lead.status)lead.activities.push({id:crypto.randomUUID(),kind:'status',text:`Etapa alterada: ${lead.status} → ${fields.status}.`,at});
      if(note)lead.activities.push({id:crypto.randomUUID(),kind:'note',text:note,at});
      if(fields.proposal)lead.activities.push({id:crypto.randomUUID(),kind:'system',text:'Proposta personalizada atualizada.',at});
      Object.assign(lead,fields,{updatedAt:at});save(all);return response({lead});
    }
    return response({error:'Esta ação exige um administrador.'},403);
  }catch{return response({error:'Não foi possível salvar neste navegador. Verifique se o armazenamento do site está permitido e tente novamente.'},503);}
}
