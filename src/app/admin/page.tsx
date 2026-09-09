import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { isPresentationMode } from '@/lib/portal-mode';
import { PresentationGate } from '@/components/presentation-gate';
import { CRM } from '@/components/crm';
export const metadata={title:'Painel de relacionamento',robots:{index:false,follow:false}};
export const dynamic='force-dynamic';
export default async function Admin(){if(isPresentationMode())return <PresentationGate area="staff"><CRM email="equipe.mr.portal.teste@gmail.com" role="employee"/></PresentationGate>;const session=await getSession();if(!session)redirect('/admin/login');if(session.role==='client')redirect('/cliente');return <CRM email={session.email} role={session.role}/>;}
