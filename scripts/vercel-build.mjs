import { spawnSync } from 'node:child_process';
const missing=['ADMIN_EMAIL','ADMIN_PASSWORD_HASH','AUTH_SECRET'].filter(k=>!process.env[k]);
if(!process.env.DATABASE_URL&&!process.env.POSTGRES_URL)missing.push('DATABASE_URL');
if(missing.length){console.error('Configure estas variáveis na Vercel antes de publicar: '+missing.join(', ')+'. Consulte README.md.');process.exit(1);}
if(process.env.AUTH_SECRET.length<32||!process.env.ADMIN_PASSWORD_HASH.match(/^[a-f0-9]+:[a-f0-9]{128}$/i)){console.error('Credenciais inválidas. Gere valores válidos com npm run setup.');process.exit(1);}
for(const args of [['scripts/migrate.mjs'],['node_modules/next/dist/bin/next','build']]){const run=spawnSync(process.execPath,args,{stdio:'inherit',env:process.env});if(run.status!==0)process.exit(run.status||1);}
