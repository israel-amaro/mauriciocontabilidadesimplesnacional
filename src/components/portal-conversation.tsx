'use client';
import { useEffect, useState } from 'react';
import { Send } from 'lucide-react';
import { portalFetch } from '@/lib/portal-fetch';
import type { Message } from '@/lib/types';

export function PortalConversation(){
  const [messages,setMessages]=useState<Message[]>([]);
  const [text,setText]=useState('');
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  async function load(){
    try{const r=await portalFetch('/api/client');const data=await r.json();if(!r.ok)throw new Error(data.error);setMessages(data.client.messages||[]);setError('');}
    catch(e){setError(e instanceof Error?e.message:'Não foi possível carregar a conversa.');}
  }
  useEffect(()=>{void load();const timer=setInterval(()=>void load(),10000);return()=>clearInterval(timer);},[]);
  async function send(event:React.FormEvent){
    event.preventDefault();setBusy(true);setError('');
    try{const r=await portalFetch('/api/client/messages',{method:'POST',body:JSON.stringify({text})});const data=await r.json();if(!r.ok)throw new Error(data.error);setMessages(data.client.messages);setText('');}
    catch(e){setError(e instanceof Error?e.message:'Não foi possível registrar a mensagem.');}
    finally{setBusy(false);}
  }
  return <section className="portal-conversation" aria-label="Conversa com a equipe"><h3>Conversa com a equipe</h3>
    <div className="portal-message-list" aria-live="polite">{messages.map(m=><article key={m.id} className={m.direction==='in'?'mine':''}><strong>{m.direction==='in'?'Você':'Equipe Maurício Rocha'}</strong><p>{m.text}</p><time dateTime={m.at}>{new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}).format(new Date(m.at))} · Registrada no portal</time></article>)}{!messages.length&&<p>Escreva sua dúvida para iniciar a conversa.</p>}</div>
    {error&&<div className="error-box" role="alert">{error}</div>}
    <form onSubmit={send}><label className="field"><span>Sua mensagem</span><textarea rows={3} required maxLength={4000} value={text} onChange={e=>setText(e.target.value)} placeholder="Como podemos ajudar?"/></label><button className="button full" disabled={busy||!text.trim()}>{busy?'Registrando…':'Registrar mensagem'}<Send size={16}/></button></form>
  </section>;
}
