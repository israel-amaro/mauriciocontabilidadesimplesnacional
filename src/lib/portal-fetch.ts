export function browserPresentation(){return typeof document!=='undefined'&&document.documentElement.dataset.portalMode==='presentation';}
export async function portalFetch(url:string,options:RequestInit={}):Promise<Response>{
  if(browserPresentation())return (await import('./presentation')).presentationFetch(url,options);
  return fetch(url,options);
}
