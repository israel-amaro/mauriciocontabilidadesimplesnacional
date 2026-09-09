import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { randomBytes, randomUUID, scryptSync } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
if(!existsSync('.env.local'))throw new Error('Execute npm run setup antes de criar os acessos.');
let env=readFileSync('.env.local','utf8');
if(!/^LOCAL_DATABASE=true$/m.test(env)||/^DATABASE_URL=.+$/m.test(env)||/^POSTGRES_URL=.+$/m.test(env))throw new Error('Este preparo é exclusivo da demonstração local.');
if(/^CLIENT_EMAIL=.+$/m.test(env)||/^EMPLOYEE_EMAIL=.+$/m.test(env)){console.log('Acessos existentes preservados. Consulte ACESSOS-TESTE.txt.');process.exit(0);}
const employeeEmail='equipe.mr.portal.teste@gmail.com';const clientEmail='cliente.mr.portal.teste@gmail.com';
const employeePassword='Equipe-MR-'+randomBytes(6).toString('base64url');const clientPassword='Cliente-MR-'+randomBytes(6).toString('base64url');
const hash=password=>{const salt=randomBytes(16).toString('hex');return salt+':'+scryptSync(password,salt,64).toString('hex');};
const id=randomUUID();const now=new Date().toISOString();
const lead={id,name:'Marina Oliveira',email:clientEmail,phone:'5527900000002',company:'Horizonte Design · Exemplo',cnpj:'',sector:'Serviços',revenue:'Até R$ 30 mil',regime:'Simples Nacional',challenge:'Organizar minha contabilidade',details:'Quero organizar a rotina da empresa e ter acompanhamento próximo para crescer.',consent:true,consentAt:now,consentVersion:'demonstracao',source:'Apresentação',campaign:'conta-cliente',status:'Proposta enviada',priority:'Normal',owner:'Equipe Maurício Rocha',nextContact:'',createdAt:now,updatedAt:now,activities:[{id:randomUUID(),at:now,kind:'note',text:'Nota interna da equipe: não exibir na área do cliente.'}],messages:[],proposal:{scope:'Acompanhamento contábil e fiscal mensal.\nOrganização das obrigações do Simples Nacional.\nOrientação sobre emissão de notas fiscais.\nAtendimento para esclarecer dúvidas da empresa.',amount:690,notes:'Proposta fictícia para apresentação. Valores ilustrativos, sem contratação ou cobrança.'},demo:true};
mkdirSync('data',{recursive:true});const db=new DatabaseSync('data/portal.sqlite');db.exec(readFileSync('db/schema.sql','utf8'));db.prepare('INSERT INTO leads(id,data,version) VALUES(?,?,1)').run(id,JSON.stringify(lead));db.close();
const values={EMPLOYEE_EMAIL:employeeEmail,EMPLOYEE_PASSWORD_HASH:hash(employeePassword),CLIENT_EMAIL:clientEmail,CLIENT_PASSWORD_HASH:hash(clientPassword),CLIENT_LEAD_ID:id};
for(const [key,value] of Object.entries(values)){const line=new RegExp('^'+key+'=.*$','m');env=line.test(env)?env.replace(line,key+'='+value):env.trimEnd()+'\n'+key+'='+value+'\n';}
writeFileSync('.env.local',env);
writeFileSync('ACESSOS-TESTE.txt',`ACESSOS DE TESTE — SOMENTE PARA O PORTAL\n\nLogin: http://127.0.0.1:3000/admin/login\n\nFUNCIONÁRIO\nE-mail: ${employeeEmail}\nSenha: ${employeePassword}\nÁrea: http://127.0.0.1:3000/admin\n\nCLIENTE\nE-mail: ${clientEmail}\nSenha: ${clientPassword}\nÁrea: http://127.0.0.1:3000/cliente\n\nEndereços fictícios usados como nomes de usuário. Nenhuma conta Gmail foi criada.\nO cliente só vê o diagnóstico e a proposta do registro associado.\nO funcionário acessa o CRM e pode atualizar atendimentos; a exclusão definitiva exige o administrador original.\nO acesso administrador original permanece no arquivo ACESSO-LOCAL.txt.\n\nNão enviar este arquivo nem .env.local ao GitHub.\n`);
console.log('Cliente e funcionário criados. Credenciais em ACESSOS-TESTE.txt.');
