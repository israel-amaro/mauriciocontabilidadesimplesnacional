import { existsSync, writeFileSync } from 'node:fs';
import { randomBytes, scryptSync } from 'node:crypto';
if(existsSync('.env.local')){console.log('Configuração existente preservada. Consulte ACESSO-LOCAL.txt.');process.exit(0);}
const password='MR-'+randomBytes(9).toString('base64url');
const salt=randomBytes(16).toString('hex');
const hash=scryptSync(password,salt,64).toString('hex');
writeFileSync('.env.local',`ADMIN_EMAIL=admin@mauriciorocha.local\nADMIN_PASSWORD_HASH=${salt}:${hash}\nAUTH_SECRET=${randomBytes(40).toString('hex')}\nLOCAL_DATABASE=true\nDEMO_ENABLED=true\nAPP_URL=http://127.0.0.1:3000\nDATABASE_URL=\nWHATSAPP_TOKEN=\nWHATSAPP_PHONE_NUMBER_ID=\nWHATSAPP_APP_SECRET=\nWHATSAPP_VERIFY_TOKEN=\nWHATSAPP_API_VERSION=v25.0\n`);
writeFileSync('ACESSO-LOCAL.txt',`ACESSO LOCAL — NÃO ENVIAR PARA O GITHUB\n\nSite: http://127.0.0.1:3000\nPainel: http://127.0.0.1:3000/admin\nE-mail: admin@mauriciorocha.local\nSenha: ${password}\n\nCredenciais geradas exclusivamente para esta instalação.\nPara a Vercel, configure as variáveis conforme o README.md.\n`);
console.log('Configuração criada. Credenciais salvas em ACESSO-LOCAL.txt (ignorado pelo Git).');
