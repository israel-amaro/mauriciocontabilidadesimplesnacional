import { databaseUrl, query } from '@/lib/db';
import { handle, json, requireAdmin } from '@/lib/http';
import { whatsappConfigured } from '@/lib/whatsapp';
export async function GET(){return handle(async()=>{const session=await requireAdmin();await query('SELECT id FROM leads LIMIT 1');return json({storage:databaseUrl()?'PostgreSQL conectado':'Banco local conectado',whatsapp:whatsappConfigured(),demoEnabled:process.env.DEMO_ENABLED==='true',email:session.email});});}
