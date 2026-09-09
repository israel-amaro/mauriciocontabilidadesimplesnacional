export const stages = ['Novo', 'Em conversa', 'Proposta enviada', 'Cliente fechado', 'Arquivado'] as const;
export type Stage = typeof stages[number];
export const sectors = ['Serviços', 'Comércio', 'Indústria', 'Saúde', 'Tecnologia', 'Outro'] as const;
export const revenues = ['Ainda não fatura', 'Até R$ 30 mil', 'R$ 30 mil a R$ 100 mil', 'R$ 100 mil a R$ 300 mil', 'Acima de R$ 300 mil'] as const;
export type Message = { id: string; text: string; direction: 'in' | 'out'; at: string; status: string; demo?: boolean };
export type Activity = { id: string; text: string; at: string; kind: 'note' | 'status' | 'system' };
export type Lead = {
  id: string; name: string; email: string; phone: string; company: string; cnpj: string;
  sector: string; revenue: string; regime: string; challenge: string; details: string;
  consent: boolean; consentAt: string; consentVersion: string; source: string; campaign: string;
  status: Stage; priority: 'Normal' | 'Alta'; owner: string; nextContact: string;
  createdAt: string; updatedAt: string; activities: Activity[]; messages: Message[];
  proposal: { scope: string; amount: number; notes: string }; demo: boolean;
};
export type IntegrationStatus = { storage: string; whatsapp: boolean; demoEnabled: boolean; email: string };
