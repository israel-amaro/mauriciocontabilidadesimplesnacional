import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
export const whatsappConfigured=()=>Boolean(process.env.WHATSAPP_TOKEN&&process.env.WHATSAPP_PHONE_NUMBER_ID&&process.env.WHATSAPP_APP_SECRET&&process.env.WHATSAPP_VERIFY_TOKEN);
export function validSignature(body:string, signature:string|null){
  if(!process.env.WHATSAPP_APP_SECRET||!signature)return false;
  const expected='sha256='+createHmac('sha256',process.env.WHATSAPP_APP_SECRET).update(body).digest('hex');
  const a=Buffer.from(signature),b=Buffer.from(expected);return a.length===b.length&&timingSafeEqual(a,b);
}
export async function sendWhatsapp(phone:string,text:string){
  const version=process.env.WHATSAPP_API_VERSION||'v25.0';
  if(!/^v\d+\.0$/.test(version)||!/^\d+$/.test(process.env.WHATSAPP_PHONE_NUMBER_ID||''))throw new Error('WHATSAPP_CONFIG_INVALID');
  const response=await fetch(`https://graph.facebook.com/${version}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,{method:'POST',headers:{Authorization:`Bearer ${process.env.WHATSAPP_TOKEN}`,'Content-Type':'application/json'},body:JSON.stringify({messaging_product:'whatsapp',to:phone,type:'text',text:{body:text}}),signal:AbortSignal.timeout(15000)});
  const result=await response.json();
  if(!response.ok){console.error('[whatsapp] provider error code',result.error?.code);throw new Error('WHATSAPP_PROVIDER_FAILED');}
  if(!result.messages?.[0]?.id)throw new Error('WHATSAPP_RESPONSE_INVALID');
  return result.messages[0].id as string;
}
