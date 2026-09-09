import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';

const base='http://127.0.0.1:3000';
if(process.env.LOCAL_DATABASE!=='true'||process.env.DATABASE_URL||process.env.POSTGRES_URL){throw new Error('Estes testes operam somente no banco local, sem conexão PostgreSQL.');}
const credentials=readFileSync('ACESSO-LOCAL.txt','utf8');
const password=credentials.match(/^Senha: (.+)$/m)?.[1];
const email=process.env.ADMIN_EMAIL;
assert.ok(password&&email,'Credenciais locais disponíveis');
let cookie='';let passed=0;const created=[];
function check(label,fn){fn();passed++;console.log(`OK ${String(passed).padStart(2,'0')} — ${label}`);}
async function request(path,{method='GET',data,auth=true,origin=base,rawCookie}={}){
  const r=await fetch(base+path,{method,headers:{'Content-Type':'application/json',Origin:origin,...(auth&&cookie?{Cookie:cookie}:{}),...(rawCookie?{Cookie:rawCookie}:{})},body:data===undefined?undefined:JSON.stringify(data),redirect:'manual'});
  const text=await r.text();let body;try{body=JSON.parse(text);}catch{body=text;}
  return {status:r.status,body,headers:r.headers};
}
const lead={submissionId:randomUUID(),name:'Teste Integração',email:'integracao@example.com',phone:'27900000001',company:'Empresa de teste automatizado',cnpj:'',sector:'Serviços',revenue:'Até R$ 30 mil',regime:'Simples Nacional',challenge:'Trocar de contador',details:'Registro temporário usado na validação local.',consent:true,source:'Teste automatizado',campaign:'integracao'};
try{
  for(const path of ['/','/diagnostico','/privacidade','/admin/login']){const r=await request(path,{auth:false});check(`Página ${path}`,()=>assert.equal(r.status,200));}
  const admin=await request('/admin',{auth:false});check('Painel redireciona visitante sem sessão',()=>assert.equal(admin.status,307));
  for(const path of ['/api/leads','/api/settings']){const r=await request(path,{auth:false});check(`${path} exige autenticação`,()=>assert.equal(r.status,401));}
  const forged=await request('/api/leads',{auth:false,rawCookie:'mr_session=forged'});check('Cookie forjado recusado',()=>assert.equal(forged.status,401));
  const csrf=await request('/api/leads',{method:'POST',data:lead,auth:false,origin:'https://untrusted.example'});check('Origem externa recusada',()=>assert.equal(csrf.status,403));
  const invalid=await request('/api/leads',{method:'POST',data:{...lead,consent:false},auth:false});check('Consentimento obrigatório no servidor',()=>assert.equal(invalid.status,400));
  const invalidPhone=await request('/api/leads',{method:'POST',data:{...lead,phone:'123'},auth:false});check('Telefone inválido recusado',()=>assert.equal(invalidPhone.status,400));
  const bot=await request('/api/leads',{method:'POST',data:{...lead,website:'spam'},auth:false});check('Campo antispam validado',()=>assert.equal(bot.status,400));
  const inserted=await request('/api/leads',{method:'POST',data:lead,auth:false});check('Diagnóstico salva no banco',()=>assert.equal(inserted.status,201));created.push(lead.submissionId);
  const repeated=await request('/api/leads',{method:'POST',data:lead,auth:false});check('Reenvio seguro do mesmo diagnóstico',()=>assert.equal(repeated.status,201));
  const wrong=await request('/api/auth',{method:'POST',data:{email,password:'senha-incorreta'},auth:false});check('Senha incorreta recusada',()=>assert.equal(wrong.status,401));
  const login=await request('/api/auth',{method:'POST',data:{email,password},auth:false});check('Login com credencial local',()=>assert.equal(login.status,200));cookie=login.headers.get('set-cookie')?.split(';')[0]||'';
  check('Cookie HttpOnly e SameSite Strict',()=>{assert.match(login.headers.get('set-cookie'),/HttpOnly/i);assert.match(login.headers.get('set-cookie'),/SameSite=Strict/i);});
  const all=await request('/api/leads');check('Diagnóstico aparece uma única vez no CRM',()=>assert.equal(all.body.leads.filter(l=>l.id===lead.submissionId).length,1));check('Telefone e campanha normalizados',()=>{const l=all.body.leads.find(l=>l.id===lead.submissionId);assert.equal(l.phone,'5527900000001');assert.equal(l.campaign,'integracao');});
  const badUpdate=await request(`/api/leads/${lead.submissionId}`,{method:'PATCH',data:{status:'Admin'}});check('Etapa desconhecida recusada',()=>assert.equal(badUpdate.status,400));
  const update=await request(`/api/leads/${lead.submissionId}`,{method:'PATCH',data:{status:'Em conversa',owner:'Equipe de teste',nextContact:'2026-10-01',note:'Anotação de teste',proposal:{scope:'Serviços de teste',amount:350,notes:'Somente teste'}}});check('Etapa, responsável, agenda, nota e proposta salvos',()=>{assert.equal(update.status,200);assert.equal(update.body.lead.status,'Em conversa');assert.equal(update.body.lead.proposal.amount,350);assert.ok(update.body.lead.activities.some(a=>a.text==='Anotação de teste'));});
  const concurrent=await Promise.all(['Nota concorrente A','Nota concorrente B'].map(note=>request(`/api/leads/${lead.submissionId}`,{method:'PATCH',data:{note}})));check('Atualizações concorrentes concluídas',()=>concurrent.forEach(r=>assert.equal(r.status,200)));
  const reread=await request(`/api/leads/${lead.submissionId}`);check('Histórico preservado em atualização concorrente',()=>assert.equal(reread.body.lead.activities.filter(a=>a.text.startsWith('Nota concorrente')).length,2));
  const printed=await request(`/admin/propostas/${lead.submissionId}`);check('Proposta imprimível protegida disponível',()=>{assert.equal(printed.status,200);assert.match(printed.body,/Serviços de teste/);});
  const privateProposal=await request(`/admin/propostas/${lead.submissionId}`,{auth:false});check('Proposta privada exige login',()=>assert.equal(privateProposal.status,307));
  const realSend=await request(`/api/leads/${lead.submissionId}/messages`,{method:'POST',data:{text:'Teste sem envio'}});check('Envio real bloqueado sem integração/conversa ativa',()=>assert.equal(realSend.status,409));
  const simulateReal=await request(`/api/leads/${lead.submissionId}/messages`,{method:'POST',data:{text:'Teste',simulateIncoming:true}});check('Simulação não é permitida em lead real',()=>assert.equal(simulateReal.status,403));
  const webhook=await request('/api/whatsapp/webhook',{method:'POST',data:{entry:[]},auth:false});check('Webhook sem assinatura recusado',()=>assert.equal(webhook.status,401));
  const seed=await request('/api/demo',{method:'POST',data:{}});check('Exemplos disponíveis ou já carregados',()=>assert.ok([200,409].includes(seed.status)));
  const demoList=await request('/api/leads');const demo=demoList.body.leads.find(l=>l.demo);assert.ok(demo);
  const sendDemo=await request(`/api/leads/${demo.id}/messages`,{method:'POST',data:{text:'Mensagem de demonstração. Sem envio externo.'}});check('Conversa fictícia registra saída sem WhatsApp',()=>{assert.equal(sendDemo.status,200);assert.equal(sendDemo.body.lead.messages.at(-1).demo,true);});
  const replyDemo=await request(`/api/leads/${demo.id}/messages`,{method:'POST',data:{text:'Resposta fictícia de demonstração.',simulateIncoming:true}});check('Conversa fictícia registra resposta',()=>{assert.equal(replyDemo.status,200);assert.equal(replyDemo.body.lead.messages.at(-1).direction,'in');});
  await request(`/api/leads/${lead.submissionId}`,{method:'DELETE'});created.length=0;
  const removed=await request(`/api/leads/${lead.submissionId}`);check('Exclusão remove registro e histórico',()=>assert.equal(removed.status,404));
  const savedCookie=cookie;const out=await request('/api/auth',{method:'DELETE'});check('Logout concluído',()=>assert.equal(out.status,200));
  const revoked=await request('/api/leads',{rawCookie:savedCookie});check('Sessão revogada não pode ser reutilizada',()=>assert.equal(revoked.status,401));
  console.log(`\n${passed} verificações aprovadas. Nenhuma mensagem real enviada.\nExemplos fictícios mantidos no CRM para apresentação.`);
}finally{for(const id of created)await request(`/api/leads/${id}`,{method:'DELETE'});}
