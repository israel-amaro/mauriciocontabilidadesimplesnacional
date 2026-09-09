import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { CRM } from '@/components/crm';
export const metadata={title:'Painel de relacionamento',robots:{index:false,follow:false}};
export const dynamic='force-dynamic';
export default async function Admin(){const session=await getSession();if(!session)redirect('/admin/login');if(session.role==='client')redirect('/cliente');return <CRM email={session.email} role={session.role}/>;}
