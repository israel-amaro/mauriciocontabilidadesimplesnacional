import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getLead } from '@/lib/db';
import { isPresentationMode } from '@/lib/portal-mode';
import { PresentationGate } from '@/components/presentation-gate';
import { PresentationProposal } from '@/components/presentation-proposal';
import { ProposalDocument } from '@/components/proposal-document';
export const dynamic='force-dynamic';
export const metadata={title:'Proposta personalizada',robots:{index:false,follow:false}};
export default async function Page({params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  if(isPresentationMode())return <PresentationGate area="staff"><PresentationProposal id={id}/></PresentationGate>;
  const session=await getSession();if(!session)redirect('/admin/login');if(session.role==='client')redirect('/cliente');
  const lead=await getLead(id);if(!lead||!lead.proposal.scope)notFound();return <ProposalDocument lead={lead}/>;
}
