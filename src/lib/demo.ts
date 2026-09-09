import { randomUUID } from 'node:crypto';
import { newLead } from './leads';
import type { Lead, Stage } from './types';
export function demoLeads(): Lead[]{
  const examples: [string,string,string,Stage,string,string][]=[
    ['Marina Alves','Estúdio Aurora','Serviços','Novo','Trocar de contador','Precisamos de um atendimento mais próximo e de clareza nos impostos.'],
    ['Rafael Costa','Café do Pátio','Comércio','Novo','Organizar minha contabilidade','O café cresceu e queremos organizar a rotina.'],
    ['Camila Santos','Clínica Horizonte','Saúde','Em conversa','Entender meus impostos','Quero entender melhor meu enquadramento.'],
    ['Pedro Lima','Nexo Digital','Tecnologia','Em conversa','Sair do MEI','Vamos contratar e precisamos planejar a transição.'],
    ['Juliana Melo','Casa Flora','Comércio','Proposta enviada','Trocar de contador','Buscamos suporte para lojas e vendas online.'],
    ['Bruno Martins','Oficina Norte','Serviços','Cliente fechado','Regularizar pendências','Precisamos acompanhar as obrigações com mais organização.'],
    ['Ana Ribeiro','Ateliê Origem','Indústria','Cliente fechado','Organizar minha contabilidade','Nossa produção está crescendo.'],
    ['Lucas Oliveira','Ponto Criativo','Serviços','Novo','Abrir uma empresa','Estou abrindo meu primeiro negócio.'],
  ];
  return examples.map(([name,company,sector,status,challenge,details],i)=>{
    const lead=newLead({submissionId:randomUUID(),name,company,sector,status,challenge,details,email:`demo${i+1}@example.com`,phone:'27900000000',revenue:i%2?'Até R$ 30 mil':'R$ 30 mil a R$ 100 mil',regime:'Simples Nacional',consent:true,source:['Google','Instagram','Indicação','Site'][i%4],campaign:i%2?'simples-nacional':'',cnpj:''});
    const createdAt=new Date(Date.now()-(i*1.3+.2)*86400000).toISOString();
    const nextContact=new Date(Date.now()+((i%3)-1)*86400000).toISOString().slice(0,10);
    return {...lead,status,demo:true,createdAt,updatedAt:createdAt,consentAt:createdAt,owner:i%2?'Maurício Rocha':'Equipe comercial',priority:i===0||i===2?'Alta':'Normal',nextContact:i<5?nextContact:'',activities:[{id:randomUUID(),at:createdAt,text:'Exemplo fictício criado para apresentação. Não representa um cliente real.',kind:'system'}],messages:i===2?[{id:randomUUID(),direction:'in',text:'Olá! Gostaria de entender como vocês podem ajudar a organizar a contabilidade da clínica.',at:new Date(Date.now()-3600000).toISOString(),status:'received',demo:true}]:[],proposal:{scope:status==='Proposta enviada'?'Rotina fiscal e contábil, acompanhamento mensal e orientação à empresa.':'',amount:status==='Proposta enviada'?690:0,notes:'Valores ilustrativos para demonstração.'}};
  });
}
