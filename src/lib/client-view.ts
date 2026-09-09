import type { Lead } from './types';
export function clientView(lead:Lead) {
  // Lista explícita de campos públicos para o cliente. Nunca retornar o registro inteiro.
  const shared=lead.status==='Proposta enviada'||lead.status==='Cliente fechado';
  return {id:lead.id,name:lead.name,company:lead.company,email:lead.email,sector:lead.sector,revenue:lead.revenue,regime:lead.regime,challenge:lead.challenge,details:lead.details,status:lead.status,createdAt:lead.createdAt,demo:lead.demo,proposal:shared&&lead.proposal.scope?{scope:lead.proposal.scope,amount:lead.proposal.amount,notes:lead.proposal.notes}:null};
}
export type ClientView=ReturnType<typeof clientView>;
