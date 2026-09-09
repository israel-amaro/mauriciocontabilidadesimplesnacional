import { Check, Database, MessageCircle, UserRound } from 'lucide-react';

export function PresentationSettings({email}:{email:string}){
  return <div className="settings-grid">
    <section className="panel settings-card"><Database size={26}/><h2>Dados do portal</h2><span className="connection-state"><Check size={15}/>Armazenamento neste navegador</span><p>Diagnósticos, propostas e histórico ficam salvos neste dispositivo.</p><small>Os registros permanecem ao recarregar a página. Limpar os dados do site remove as alterações. Outros dispositivos têm seus próprios registros.</small></section>
    <section className="panel settings-card"><MessageCircle size={26}/><h2>Conversas no portal</h2><span className="connection-state"><Check size={15}/>Histórico disponível</span><p>Organize as conversas na ficha de cada relacionamento.</p><small>As mensagens ficam neste navegador e podem ser consultadas ao alternar entre os perfis. Este canal não envia mensagens pelo WhatsApp.</small></section>
    <section className="panel settings-card"><UserRound size={26}/><h2>Seu perfil</h2><span className="connection-state">Equipe de atendimento</span><p>{email}</p><small>Use Sair no canto superior direito para alternar o perfil. O acesso expira após 8 horas.</small></section>
  </div>;
}
