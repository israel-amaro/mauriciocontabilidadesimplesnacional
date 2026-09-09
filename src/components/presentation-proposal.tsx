'use client';
import { useEffect, useState } from 'react';
import { portalFetch } from '@/lib/portal-fetch';
import type { Lead } from '@/lib/types';
import { ProposalDocument } from './proposal-document';
export function PresentationProposal({id}:{id:string}){const [lead,setLead]=useState<Lead|null>(null);const [error,setError]=useState('');useEffect(()=>{void portalFetch(`/api/leads/${id}`).then(async r=>{const data=await r.json();if(!r.ok)throw new Error(data.error);if(!data.lead.proposal.scope)throw new Error('Proposta ainda não disponível.');setLead(data.lead);}).catch(e=>setError(e.message));},[id]);return lead?<ProposalDocument lead={lead}/>:<div className="loading">{error||'Preparando a proposta…'}</div>;}
