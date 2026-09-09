import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { ClientPortal } from '@/components/client-portal';
export const dynamic='force-dynamic';
export const metadata={title:'Área do cliente',robots:{index:false,follow:false}};
export default async function Page(){const session=await getSession();if(!session)redirect('/admin/login');if(session.role!=='client')redirect('/admin');return <ClientPortal/>;}
