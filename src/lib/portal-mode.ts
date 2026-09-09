import 'server-only';
export function isPresentationMode(){
  if(process.env.PORTAL_MODE==='production')return false;
  if(process.env.PORTAL_MODE==='presentation')return true;
  return !process.env.DATABASE_URL&&!process.env.POSTGRES_URL&&process.env.LOCAL_DATABASE!=='true';
}
