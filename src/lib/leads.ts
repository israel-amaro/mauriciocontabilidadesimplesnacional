import { randomUUID } from 'node:crypto';
import type { Lead } from './types';
import { leadInput } from './validation';
export function newLead(input: unknown): Lead {
  const {submissionId, website: _website, ...data}=leadInput.parse(input);
  const now=new Date().toISOString();
  return {...data,id:submissionId,status:'Novo',priority:'Normal',owner:'',nextContact:'',createdAt:now,updatedAt:now,consentAt:now,consentVersion:'2026-09-v1',activities:[{id:randomUUID(),kind:'system',text:'Diagnóstico recebido pelo portal.',at:now}],messages:[],proposal:{scope:'',amount:0,notes:''},demo:false};
}
