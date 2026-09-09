import postgres from 'postgres';
import { readFileSync } from 'node:fs';
const url=process.env.DATABASE_URL||process.env.POSTGRES_URL;
if(!url){console.error('Configure DATABASE_URL para migrar o PostgreSQL. O banco local é preparado automaticamente.');process.exit(1);}
const sql=postgres(url,{max:1,prepare:false});
try{const statements=readFileSync('db/schema.sql','utf8').split(';').map(v=>v.trim()).filter(Boolean);await sql.begin(async tx=>{for(const s of statements)await tx.unsafe(s);});console.log('Banco PostgreSQL preparado.');}finally{await sql.end();}
