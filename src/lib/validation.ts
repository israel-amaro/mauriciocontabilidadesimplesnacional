import { z } from 'zod';
import { sectors, revenues, stages } from './types';
export const normalizePhone = (value: string) => {
  const n = value.replace(/\D/g, '');
  return n.length === 10 || n.length === 11 ? `55${n}` : n;
};
export function validCnpj(value: string) {
  if (!value) return true;
  const n = value.replace(/\D/g, '');
  if (n.length !== 14 || /^(\d)\1+$/.test(n)) return false;
  const check = (base: string) => { let weight = base.length - 7; let sum = 0; for (const digit of base) { sum += Number(digit) * weight--; if (weight < 2) weight = 9; } const rest = sum % 11; return rest < 2 ? 0 : 11 - rest; };
  return check(n.slice(0,12)) === Number(n[12]) && check(n.slice(0,13)) === Number(n[13]);
}
export const leadInput = z.object({
  name: z.string().trim().min(3, 'Informe seu nome completo.').max(100),
  email: z.email('Informe um e-mail válido.').max(180).transform(v => v.toLowerCase()),
  phone: z.string().max(25).transform(normalizePhone).refine(v => /^55[1-9][0-9][0-9]{8,9}$/.test(v), 'Informe um WhatsApp brasileiro com DDD.'),
  company: z.string().trim().min(2, 'Informe o nome da empresa.').max(160),
  cnpj: z.string().trim().max(20).default(''),
  sector: z.enum(sectors), revenue: z.enum(revenues),
  regime: z.enum(['Simples Nacional', 'MEI', 'Outro regime', 'Ainda vou abrir', 'Não sei informar']),
  challenge: z.enum(['Organizar minha contabilidade', 'Trocar de contador', 'Abrir uma empresa', 'Sair do MEI', 'Regularizar pendências', 'Entender meus impostos']),
  details: z.string().trim().max(2000).default(''), consent: z.literal(true, 'Autorize o contato para continuar.'),
  source: z.string().trim().max(120).default('Site'), campaign: z.string().trim().max(160).default(''),
  website: z.string().max(0).optional(),
  submissionId: z.uuid(),
});
export const leadUpdate = z.object({
  status: z.enum(stages).optional(), priority: z.enum(['Normal', 'Alta']).optional(),
  owner: z.string().trim().max(80).optional(), nextContact: z.union([z.literal(''), z.iso.date()]).optional(),
  note: z.string().trim().min(1).max(4000).optional(),
  proposal: z.object({ scope: z.string().trim().max(5000), amount: z.number().min(0).max(1000000), notes: z.string().trim().max(2000) }).optional(),
}).strict();
