# Maurício Rocha · Portal Simples Nacional

Site de captação, CRM e área do cliente em Next.js, React e TypeScript. A configuração padrão publica na Vercel **sem banco de dados externo e sem variáveis obrigatórias**.

## Publicar agora na Vercel

1. Importe o repositório `israel-amaro/mauriciocontabilidadesimplesnacional`.
2. Use a raiz do repositório como Root Directory, framework Next.js e Node.js 24.x.
3. Mantenha o build de `vercel.json`: `npm run vercel-build`.
4. Publique. Se a publicação anterior falhou, faça uma nova publicação usando o commit mais recente de `main`.

Não é necessário conectar Neon, Supabase ou WhatsApp. Sem `DATABASE_URL`/`POSTGRES_URL`, o build seleciona automaticamente o modo de apresentação. Se já houver variáveis de outro ambiente, defina `PORTAL_MODE=presentation` para selecionar explicitamente esse modo. Não envie `.env.local`, arquivos de acesso, `data/` ou `node_modules/` ao GitHub; o `.gitignore` já os exclui.

## Acessos para a apresentação

Abra `/admin/login`. São identificadores do portal; nenhuma conta Gmail foi criada e não é login com Google.

| Perfil | E-mail | Senha de apresentação |
| --- | --- | --- |
| Funcionário | equipe.mr.portal.teste@gmail.com | Equipe-MR-AsevgRYR |
| Cliente | cliente.mr.portal.teste@gmail.com | Cliente-MR-4QaXeeGt |

Essas credenciais são públicas e exclusivas da apresentação. Não reutilize em sistemas reais.

- Funcionário: CRM em `/admin`, com nove contatos sintéticos, busca, filtros, funil, histórico, próximos contatos e propostas.
- Cliente: `/cliente`, acompanhamento da Horizonte Design, diagnóstico, proposta compartilhada e conversa com a equipe.
- O botão **Sair** fica no canto superior direito. Saia antes de alternar o perfil.
- A interface tem aparência final, sem faixas ou etiquetas de demonstração. Os contatos iniciais são sintéticos.

## Como os dados funcionam nesta versão

Os registros são gravados em `localStorage` **somente no navegador e no domínio em que você abriu o portal**. As alterações permanecem ao atualizar ou reabrir a página. Outro navegador, outro dispositivo, aba anônima ou outro endereço da Vercel tem seus próprios registros. Apagar os dados do site apaga as alterações e restaura os contatos iniciais na próxima abertura.

O acesso por senha neste modo é apenas uma seleção de perfil para apresentação. Não constitui uma barreira de segurança: dados e credenciais de apresentação são distribuídos ao navegador. **Use somente dados fictícios; não use este modo para operar com clientes reais.** Os controles da interface mostram as áreas correspondentes a cada perfil, mas os dados do navegador podem ser inspecionados.

As conversas são registros internos neste navegador, sem envio de WhatsApp, e-mail, notificações ou comunicação entre dispositivos. Não há respostas automáticas fabricadas. A captação via formulário também fica nesse navegador; não chega a uma equipe em outro dispositivo. Links externos do site institucional continuam abrindo o WhatsApp comercial quando escolhidos.

## Roteiro de apresentação

1. Mostre a página inicial com a identidade visual, serviços e fotos do escritório.
2. Preencha o diagnóstico com dados fictícios. Confira o protocolo.
3. Entre como funcionário, localize o novo contato e abra a ficha. Adicione uma nota, responsável e data de retorno.
4. Arraste o cartão no funil ou altere a etapa dentro da ficha.
5. Abra **Horizonte Design**, edite e salve a proposta. A proposta aparece na área do cliente quando a etapa é **Proposta enviada** ou **Cliente fechado**. Outras etapas mantêm o rascunho restrito à vista da equipe.
6. Registre uma mensagem nessa ficha. Use **Sair**, entre como cliente no mesmo navegador e confira a proposta e a conversa. Registre uma resposta.
7. Saia e entre novamente como funcionário para consultar a resposta. As telas também atualizam o histórico periodicamente.
8. Mostre a exportação CSV, impressão/PDF da proposta e o gerador de links de campanha. O formulário registra a origem e a campanha localmente.

## Rodar no PC

```powershell
npm ci
npm run dev
```

Abra `http://127.0.0.1:3000`. Uma instalação sem `.env.local` já usa apresentação. Nesta máquina, `PORTAL_MODE=presentation` está definido no arquivo local para usar o mesmo comportamento da Vercel. Os antigos arquivos e banco local continuam preservados, mas não são usados pela interface nesse modo.

## Operação real com servidor — configuração opcional

O backend original continua disponível, mas não é necessário para a apresentação. Para operar com dados reais, é necessário configurar e validar esse ambiente separadamente.

1. Defina `PORTAL_MODE=production`.
2. Configure PostgreSQL em `DATABASE_URL` ou `POSTGRES_URL`.
3. Gere credenciais exclusivas com `npm run setup` em ambiente separado e configure `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH` e `AUTH_SECRET` na hospedagem. Nunca envie senhas administrativas ou segredos ao repositório.
4. Para os perfis adicionais, configure `EMPLOYEE_EMAIL`, `EMPLOYEE_PASSWORD_HASH`, `CLIENT_EMAIL`, `CLIENT_PASSWORD_HASH` e `CLIENT_LEAD_ID`. O vínculo deve apontar a um lead do banco publicado; não é escolhido pelo cliente.
5. Use `DEMO_ENABLED=false` para desativar a criação de dados sintéticos. Defina `APP_URL` para o endereço publicado.
6. Publique. Nesse modo, `vercel-build` valida as variáveis, executa a migração de `db/schema.sql` e compila. O banco deve permitir criar as tabelas na primeira publicação.

Nesse backend, as sessões são assinadas, expiram em oito horas, usam cookie HttpOnly e são revogadas no banco ao sair. A senha usa scrypt. As permissões são verificadas no servidor; funcionários não excluem leads e clientes recebem apenas os campos previstos do registro vinculado. Não há sincronização automática dos registros de apresentação para o banco.

Para usar o backend local SQLite, defina `PORTAL_MODE=production`, `LOCAL_DATABASE=true` e gere as credenciais com `npm run setup`. O arquivo fica em `data/portal.sqlite`. Não use `LOCAL_DATABASE=true` na Vercel.

### WhatsApp Business real

O backend inclui envio de texto e webhook da API oficial. Exige `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_APP_SECRET`, `WHATSAPP_VERIFY_TOKEN` e `WHATSAPP_API_VERSION`. Cadastre `/api/whatsapp/webhook` na Meta e assine os eventos de mensagens. O webhook verifica a assinatura HMAC SHA-256 e o ID do número.

Mensagens livres exigem a janela de atendimento iniciada pelo contato; o formulário não abre essa janela. Não há envio de templates aprovados nesta implementação. Mensagens de contatos com diagnóstico são associadas ao registro mais recente daquele telefone, com deduplicação pelo ID da Meta. Contatos sem diagnóstico não geram leads automaticamente. Mídias são indicadas pelo tipo, sem download. Não há disparo em massa, compra de listas ou publicação de anúncios.

PostgreSQL e a conta Meta não foram testados com serviços externos nesta entrega. O backend atende um administrador, um funcionário e um cliente configurados por ambiente. Uma operação com múltiplos clientes exige cadastro de usuários, convites, vínculos e infraestrutura adequados.

## Marca e conteúdo


- Dados de contato e logotipo: `src/lib/brand.ts`.
- Cores, fontes e layout: `src/app/globals.css`.
- Conteúdo da página inicial: `src/app/page.tsx`.
- Para usar a logo oficial, coloque o arquivo em `public/brand/logo.png` e altere `brand.logo` para `/brand/logo.png`.
- Logo oficial, fotos do escritório e foto do Maurício foram fornecidas pelo usuário e copiadas sem alteração para `public/brand/`. O site utiliza a marca em azul-marinho e dourado conforme os prints recebidos.
- O site original foi bloqueado pelo filtro de rede. As referências visuais usadas foram os prints e os arquivos de marca enviados diretamente pelo usuário.
- A experiência de mais de 15 anos, atendimento nacional e foco em Simples Nacional vieram da proposta fornecida pelo usuário. Não foram inventadas avaliações, depoimentos nem números de clientes.
- O WhatsApp **(27) 99821-9238**, o Instagram `@contabilidade.mauriciorocha` e o endereço seguem o print do rodapé enviado pelo usuário. O e-mail foi encontrado no [cadastro comercial da empresa](https://www.solutudo.com.br/empresas/es/vitoria/contabilidade/mauricio-rocha-contabilidade-188928). O telefone do cadastro público divergente foi substituído pelo telefone do print.
- A política de privacidade descreve o comportamento implementado. O responsável pela operação deve ajustar fornecedores, retenção e informações cadastrais conforme a contratação final.
- As fontes DM Sans e Manrope carregam via Google Fonts; se a rede bloquear esse serviço, o site usa Arial. A instalação e compilação não dependem do serviço de fontes.

## Validação

```powershell
npm run test:presentation
npm run typecheck
npm run vercel-build
```

O teste de apresentação executa o adaptador real com armazenamento isolado e rede bloqueada: 39 verificações de credenciais, perfis, cadastro, persistência, proposta, mensagens, validação e logout. Não modifica o armazenamento do navegador.

Os testes HTTP do backend continuam em `npm run test:integration` e `npm run test:roles`, com servidor local ativo e configuração de backend SQLite. Eles foram aprovados na entrega inicial (34 verificações de integração e 23 de permissões). Não houve inspeção visual automatizada no navegador.

## Arquivos principais

- `src/lib/portal-mode.ts`: escolha entre apresentação e backend.
- `src/lib/presentation.ts`: operações e persistência no navegador.
- `src/lib/presentation-data.ts`: contatos e perfis sintéticos públicos.
- `src/lib/portal-fetch.ts`: encaminhamento das operações da interface.
- `src/components/`: site, CRM, área do cliente e propostas.
- `src/app/api/`: backend opcional com autenticação e banco.
- `scripts/vercel-build.mjs`: compilação nos dois modos.
- `db/schema.sql`: esquema do backend opcional.
