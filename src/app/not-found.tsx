import Link from 'next/link';
import { Brand } from '@/components/brand';
export default function NotFound(){return <main className="container privacy-page"><Brand/><span className="eyebrow">PÁGINA NÃO ENCONTRADA</span><h1>Vamos voltar ao caminho certo.</h1><p>Este endereço não existe ou o registro não está mais disponível.</p><Link className="button" href="/" style={{marginTop:30}}>Voltar ao início</Link></main>;}
