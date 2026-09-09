'use client';
import { Printer } from 'lucide-react';
export function PrintButton(){return <button className="button small" onClick={()=>window.print()}><Printer size={17}/> Imprimir / salvar PDF</button>;}
