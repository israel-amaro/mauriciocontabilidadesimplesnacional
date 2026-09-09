import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
if(process.env.LOCAL_DATABASE!=='true'||process.env.DATABASE_URL||process.env.POSTGRES_URL)throw new Error('Use somente o ambiente local.');
const credentials=readFileSync('ACESSOS-TESTE.txt','utf8');
const employeePassword=credentials.match(/FUNCIONÁRIO\r?\nE-mail: .+\r?\nSenha: (.+)/)?.[1];
const clientPassword=credentials.match(/CLIENTE\r?\nE-mail: .+\r?\nSenha: (.+)/)?.[1];
const base='http://127.0.0.1:3000';let count=0;
function check(label,fn){fn();console.log(`OK ${++count} — ${label}`);}
async function request(path,cookie='',method='GET',data){const r=await fetch(base+path,{method,redirect:'manual',headers:{Origin:base,'Content-Type':'application/json',Cookie:cookie},...(data?{body:JSON.stringify(data)}:{})});const text=await r.text();let body;try{body=JSON.parse(text);}catch{body=text;}return {status:r.status,body,headers:r.headers};}
async function login(email,password){const r=await request('/api/auth','','POST',{email,password,role:'admin'});assert.equal(r.status,200);return {cookie:r.headers.get('set-cookie').split(';')[0],redirect:r.body.redirect};}
const employee=await login(process.env.EMPLOYEE_EMAIL,employeePassword);
const client=await login(process.env.CLIENT_EMAIL,clientPassword);
try{
  check('Funcionário direcionado ao CRM',()=>assert.equal(employee.redirect,'/admin'));
  check('Cliente direcionado à própria área',()=>assert.equal(client.redirect,'/cliente'));
  const crm=await request('/admin',employee.cookie);check('Funcionário abre painel e recebe seu perfil',()=>{assert.equal(crm.status,200);assert.match(crm.body,/Funcionário/);});
  const all=await request('/api/leads',employee.cookie);check('Funcionário acessa os atendimentos',()=>{assert.equal(all.status,200);assert.ok(all.body.leads.length>1);});
  const assigned=all.body.leads.find(l=>l.id===process.env.CLIENT_LEAD_ID);assert.ok(assigned?.demo);
  const own=await request('/api/client',client.cookie);check('Cliente recebe apenas o registro associado',()=>{assert.equal(own.status,200);assert.equal(own.body.client.id,assigned.id);assert.ok(own.body.client.proposal);});
  check('Notas internas e metadados comerciais não são expostos',()=>{for(const field of ['activities','messages','owner','priority','source','campaign'])assert.equal(field in own.body.client,false);assert.doesNotMatch(JSON.stringify(own.body),/Nota interna da equipe/);});
  const other=all.body.leads.find(l=>l.id!==assigned.id);
  const guessed=await request(`/api/client?id=${other.id}`,client.cookie);check('Parâmetro de outro cliente não altera a autorização',()=>assert.equal(guessed.body.client.id,assigned.id));
  for(const [path,method,data] of [['/api/leads','GET'],['/api/settings','GET'],[`/api/leads/${other.id}`,'GET'],[`/api/leads/${assigned.id}`,'PATCH',{status:'Cliente fechado'}],[`/api/leads/${assigned.id}`,'DELETE'],[`/api/leads/${assigned.id}/messages`,'POST',{text:'Teste',simulateIncoming:true}],['/api/demo','POST',{}]]){const r=await request(path,client.cookie,method,data);check(`Cliente bloqueado: ${method} ${path.replace(assigned.id,'próprio').replace(other.id,'outro')}`,()=>assert.equal(r.status,403));}
  const page=await request('/cliente',client.cookie);check('Área do cliente renderiza sem notas internas',()=>{assert.equal(page.status,200);assert.doesNotMatch(page.body,/Nota interna da equipe/);});
  const forbiddenPage=await request('/admin',client.cookie);check('Cliente redirecionado ao tentar abrir CRM',()=>{assert.equal(forbiddenPage.status,307);assert.equal(forbiddenPage.headers.get('location'),'/cliente');});
  const privateProposal=await request(`/admin/propostas/${other.id}`,client.cookie);check('Proposta interna de outra empresa protegida',()=>{assert.equal(privateProposal.status,307);assert.equal(privateProposal.headers.get('location'),'/cliente');});
  const employeeClient=await request('/api/client',employee.cookie);check('API pessoal exige perfil de cliente',()=>assert.equal(employeeClient.status,403));
  const noDelete=await request(`/api/leads/${assigned.id}`,employee.cookie,'DELETE');check('Funcionário não pode excluir definitivamente',()=>assert.equal(noDelete.status,403));
  const draft=await request(`/api/leads/${assigned.id}`,employee.cookie,'PATCH',{status:'Em conversa'});check('Funcionário atualiza atendimento',()=>assert.equal(draft.status,200));
  try{const hidden=await request('/api/client',client.cookie);check('Rascunho de proposta não aparece para cliente',()=>assert.equal(hidden.body.client.proposal,null));}finally{await request(`/api/leads/${assigned.id}`,employee.cookie,'PATCH',{status:assigned.status});}
  const shared=await request('/api/client',client.cookie);check('Proposta compartilhada reaparece ao cliente',()=>assert.ok(shared.body.client.proposal));
}finally{await request('/api/auth',employee.cookie,'DELETE');await request('/api/auth',client.cookie,'DELETE');}
const revoked=await request('/api/client',client.cookie);check('Logout revoga sessão do cliente',()=>assert.equal(revoked.status,401));
console.log(`\n${count} verificações de perfis e isolamento aprovadas.`);
