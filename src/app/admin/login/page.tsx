import { redirect } from 'next/navigation';
import { getSession, sessionHome } from '@/lib/auth';
import { Login } from '@/components/login';
export const metadata={title:'Entrar no portal',robots:{index:false,follow:false}};
export const dynamic='force-dynamic';
export default async function Page(){const session=await getSession();if(session)redirect(sessionHome(session.role));return <Login/>;}
