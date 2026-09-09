'use client';
import { useEffect, useRef } from 'react';
import { ChevronDown, LogOut, Settings2 } from 'lucide-react';

export function AccountMenu({email,role,busy,onLogout,onSettings}:{email:string;role:'admin'|'employee';busy:boolean;onLogout:()=>Promise<void>;onSettings:()=>void}) {
  const menu=useRef<HTMLDetailsElement>(null);
  useEffect(()=>{
    function outside(event:PointerEvent){if(menu.current&&!menu.current.contains(event.target as Node))menu.current.open=false;}
    function escape(event:KeyboardEvent){if(event.key==='Escape'&&menu.current?.open){menu.current.open=false;menu.current.querySelector('summary')?.focus();}}
    document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escape);
    return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape);};
  },[]);
  return <details className="account-menu" ref={menu}><summary aria-label="Abrir opções do perfil" title="Opções do perfil"><span className="avatar small">MR</span><span>Perfil</span><ChevronDown size={14}/></summary><div className="account-popover"><strong>{role==='admin'?'Administrador':'Funcionário'}</strong><p>{email}</p><button onClick={()=>{if(menu.current)menu.current.open=false;onSettings();}}><Settings2 size={17}/> Configurações da conta</button><button disabled={busy} onClick={()=>void onLogout()}><LogOut size={17}/>{busy?'Saindo…':'Sair e trocar de acesso'}</button></div></details>;
}
