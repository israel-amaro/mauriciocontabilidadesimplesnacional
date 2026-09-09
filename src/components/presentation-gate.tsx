'use client';
import { useEffect, useState } from 'react';
import { portalFetch } from '@/lib/portal-fetch';
export function PresentationGate({area,children}:{area:'staff'|'client';children:React.ReactNode}){
  const [ready,setReady]=useState(false);const [error,setError]=useState('');
  useEffect(()=>{let cancelled=false;async function check(){try{const r=await portalFetch('/api/session');if(r.status===401){window.location.replace('/admin/login');return;}const s=await r.json();if(!r.ok)throw new Error(s.error);if((s.role==='client')!==(area==='client')){window.location.replace(s.role==='client'?'/cliente':'/admin');return;}if(!cancelled)setReady(true);}catch(e){if(!cancelled)setError(e instanceof Error?e.message:'Não foi possível abrir sua área.');}}void check();const timer=setInterval(()=>void check(),5000);return()=>{cancelled=true;clearInterval(timer);};},[area]);
  return ready?children:<div className="loading" role="status">{error||'Abrindo sua área…'}</div>;
}
