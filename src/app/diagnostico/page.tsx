import { Suspense } from 'react';
import { Diagnosis } from '@/components/diagnosis';
export const metadata={title:'Diagnóstico da sua empresa'};
export default function Page(){return <Suspense fallback={<div className="loading">Preparando seu diagnóstico…</div>}><Diagnosis/></Suspense>;}
