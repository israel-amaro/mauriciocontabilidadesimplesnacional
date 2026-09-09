# Maurício Rocha · Portal Simples Nacional

Site de captação com diagnóstico em três etapas e CRM privado. Projeto independente em Next.js 16, React 19 e TypeScript, preparado para GitHub e Vercel.

## Abrir a demonstração no seu PC

O projeto já está instalado e configurado nesta pasta. Para iniciar novamente:

```powershell
npm run dev
```

- Site: http://127.0.0.1:3000
- Diagnóstico: http://127.0.0.1:3000/diagnostico
- Administrador: http://127.0.0.1:3000/admin
- **E-mail e senha exclusivos desta instalação estão em `ACESSO-LOCAL.txt`.**
- O banco local fica em `data/portal.sqlite`. Os dados persistem ao recarregar e reiniciar o servidor.
- Use Node.js 24. O banco SQLite local usa o módulo nativo do Node.

Em outro computador, execute `npm ci`, `npm run setup` e `npm run dev`. O setup gera uma senha, seu hash e o segredo de sessão, sem sobrescrever uma configuração existente.

## Roteiro para apresentar ao cliente

### Acessos de cliente e funcionário

Abra `/admin/login` e use as credenciais de **ACESSOS-TESTE.txt**. O e-mail determina a área após a autenticação:

- **Funcionário:** `equipe.mr.portal.teste@gmail.com` — CRM, leads, histórico, agenda e propostas. Exclusão definitiva exige o administrador original.
- **Cliente:** `cliente.mr.portal.teste@gmail.com` — `/cliente`, com o próprio diagnóstico, andamento e proposta compartilhada. Não acessa outros contatos, notas internas ou APIs da equipe.

São identificadores fictícios do portal; nenhuma conta Gmail foi criada e não se trata de login com Google. Use **Sair** antes de alternar entre os perfis na mesma janela. O acesso administrador original em ACESSO-LOCAL.txt continua válido.

Os acessos locais foram gerados com `npm run setup:test-users`, que preserva uma configuração existente. As senhas são exclusivas desta instalação e seus hashes ficam em `.env.local`. O comando também cria uma empresa fictícia com proposta para o cliente visualizar.

Para disponibilizar os perfis na Vercel, configure `EMPLOYEE_EMAIL`, `EMPLOYEE_PASSWORD_HASH`, `CLIENT_EMAIL`, `CLIENT_PASSWORD_HASH` e `CLIENT_LEAD_ID`. O último deve apontar para o ID de um lead existente **no banco PostgreSQL publicado**, escolhido pelo administrador; o banco local e seu registro não são enviados automaticamente. O cliente nunca escolhe ou altera seu próprio vínculo. A proposta só aparece quando a etapa é `Proposta enviada` ou `Cliente fechado`.

Validação específica de permissões: `npm run test:roles` (servidor local ativo). Foram aprovadas 23 verificações, incluindo tentativas de acessar outro cliente, ocultação de notas internas, bloqueio de alterações e revogação de sessão.

### Apresentação do CRM

1. Mostre a página inicial e entre em **Quero uma orientação**.
2. Preencha as três etapas do diagnóstico com dados de teste. Ao enviar, aparece o protocolo e o botão para continuar a conversa no WhatsApp comercial.
3. Abra `/admin` e faça login com as credenciais locais.
4. Confira o diagnóstico recebido. Abra a ficha, adicione uma nota, defina o responsável e a data de retorno.
5. Em **Funil de vendas**, arraste um cartão ou altere a etapa dentro da ficha. A alteração fica registrada no histórico.
6. Na aba **Proposta**, escreva os serviços e valores. Salve, clique em **Visualizar** e use **Imprimir / salvar PDF**. Marque como enviada apenas depois de encaminhar ao cliente.
7. Abra **Captação**, crie um link de campanha, preencha o diagnóstico por ele e confira a origem no CRM.
8. Para mostrar conversas bidirecionais, abra um contato com a etiqueta **Exemplo**. As mensagens e a resposta simulada são fictícias e não fazem envios externos.

Os oito exemplos existentes foram criados para apresentação. Em uma instalação vazia, **Configurações → Carregar demonstração** adiciona os exemplos quando `DEMO_ENABLED=true`. Dados reais e fictícios possuem identificação separada em cada registro. Exclua os exemplos individualmente antes da operação real ou use um banco novo com `DEMO_ENABLED=false`.

## O que está implementado

- Página responsiva, navegação por seções, FAQ e página de privacidade.
- Diagnóstico com dados de contato, empresa, regime, faturamento e necessidade.
- Validação no servidor, autorização de contato, antispam por campo oculto e limite de solicitações.
- Protocolo por cadastro e proteção contra duplicação em reenvio da mesma submissão.
- Login privado, senha com scrypt, sessão assinada de 8 horas e logout com revogação no banco.
- CRM: indicadores, lista, busca, filtros, funil com arrastar e soltar, prioridade e responsável.
- Agenda de retornos, notas e histórico de mudança de etapa.
- Propostas privadas com visualização para impressão/PDF.
- Exportação CSV dos leads filtrados, com proteção contra fórmulas em células.
- Links com origem/campanha e contagem de leads e clientes por origem.
- WhatsApp: abertura de conversa manual, integração oficial de mensagens de texto, webhook assinado, recebimento e atualização de status.
- Banco SQLite local e adaptador PostgreSQL para a Vercel.

Não há compra de listas, raspagem de contatos, disparo em massa, anúncio publicado ou contratação de tráfego. A prospecção desta entrega é a estrutura de captação qualificada: você divulga os links, recebe os diagnósticos e acompanha os contatos.

## Publicar no GitHub e na Vercel

### 1. Enviar o código

Use **esta pasta** como raiz do repositório: a pasta que contém `package.json` e `vercel.json`. Se subir o diretório pai, selecione `portal-simples-nacional` como **Root Directory** na Vercel.

O `.gitignore` já exclui `.env.local`, `ACESSO-LOCAL.txt`, `ACESSOS-TESTE.txt`, `data/`, `node_modules/` e `.next/`. Não selecione esses arquivos manualmente ao enviar pelo navegador do GitHub. O arquivo `.env.example` pode ser publicado; ele não contém credenciais.

### 2. Conectar o banco na Vercel

1. Importe o repositório como projeto Next.js na Vercel.
2. Conecte um PostgreSQL, por exemplo pela integração Neon no Marketplace/Storage da Vercel.
3. Disponibilize a conexão em `DATABASE_URL` (ou `POSTGRES_URL`). Use a conexão fornecida pelo provedor, mantendo seus parâmetros TLS.
4. Configure as variáveis abaixo em **Settings → Environment Variables**, nos ambientes em que vai publicar.

| Variável | Valor |
| --- | --- |
| `DATABASE_URL` | URL de conexão do PostgreSQL |
| `ADMIN_EMAIL` | E-mail usado no login |
| `ADMIN_PASSWORD_HASH` | Valor completo gerado em `.env.local`, no formato `salt:hash` |
| `AUTH_SECRET` | Segredo aleatório de pelo menos 32 caracteres, gerado em `.env.local` |
| `DEMO_ENABLED` | `true` para apresentar os exemplos; `false` para desativar sua criação |
| `APP_URL` | URL pública completa quando conhecida, por exemplo `https://seu-projeto.vercel.app` |

Você pode copiar os valores gerados localmente para uma demonstração privada e entrar com a mesma senha do arquivo de acesso. Para a operação real, gere uma credencial exclusiva e defina o e-mail da equipe.

**Não configure `LOCAL_DATABASE=true` na Vercel.** A hospedagem exige PostgreSQL; o aplicativo não tenta salvar leads em arquivos temporários que seriam perdidos.

### 3. Publicar

- Framework: **Next.js**.
- Node.js: **24.x**.
- Build: definido automaticamente em `vercel.json` como `npm run vercel-build`.
- Esse comando verifica as variáveis, prepara as tabelas PostgreSQL com a migração incluída e executa a compilação.
- Se as variáveis estiverem faltando, a publicação falha com uma orientação explícita, evitando entregar um formulário sem armazenamento.
- Depois de configurar ou alterar variáveis, faça **Redeploy**.
- Abra `/admin` no endereço publicado. Carregue os exemplos em Configurações, se desejar; o banco local não é enviado para a Vercel.

O banco deve permitir criação das tabelas na primeira publicação. Se preferir preparar antes, execute `npm run db:migrate` localmente com a URL do banco remoto em `.env.local`, e depois restaure a configuração local. **Não compartilhe essa URL.**

Use projetos/bancos separados para uma prévia comercial e a operação real. As migrações deste primeiro esquema são idempotentes; alterações futuras de esquema devem ser versionadas, sem apagar dados existentes.

Referências oficiais: [Next.js](https://nextjs.org/docs), [PostgreSQL na Vercel](https://vercel.com/docs/postgres).

## Conectar o WhatsApp real

A demonstração local já funciona sem credenciais da Meta. Para mensagens reais dentro do CRM, configure o WhatsApp Business Platform da contabilidade e as variáveis:

| Variável | Conteúdo |
| --- | --- |
| `WHATSAPP_TOKEN` | Token de acesso com permissão `whatsapp_business_messaging` |
| `WHATSAPP_PHONE_NUMBER_ID` | ID do número comercial na Meta, não o telefone com DDD |
| `WHATSAPP_APP_SECRET` | Segredo do aplicativo Meta, usado para verificar a assinatura do webhook |
| `WHATSAPP_VERIFY_TOKEN` | Segredo aleatório escolhido para a verificação inicial do webhook |
| `WHATSAPP_API_VERSION` | Versão da Graph API disponível para sua conta; valor inicial `v25.0` |

Na Meta, cadastre a URL pública `https://SEU-DOMINIO/api/whatsapp/webhook`, informe o mesmo verify token e assine os eventos `messages` do número/conta comercial. O endpoint GET responde ao desafio; o POST verifica `X-Hub-Signature-256` com HMAC SHA-256 e o ID do número.

O cliente deve iniciar ou retomar a conversa para abrir a janela de 24 horas de mensagens livres. Fora dela, o painel orienta a continuar pelo WhatsApp; esta versão não implementa envio de templates aprovados. O formulário registra a autorização, mas isso por si só não abre a janela de atendimento da Meta.

- Mensagens de texto de contatos existentes chegam à ficha do lead correspondente ao telefone e aparecem no painel, atualizado a cada 20 segundos.
- Se houver mais de um diagnóstico com o mesmo telefone, a conversa é associada ao diagnóstico mais recente.
- Contatos sem diagnóstico prévio são ignorados pelo CRM; não há criação automática de leads a partir de mensagens desconhecidas.
- Anexos recebidos são identificados pelo tipo; a visualização de mídia é feita no WhatsApp.
- Os eventos repetidos de mensagens recebidas são deduplicados pelo ID da Meta.
- Em erro de rede durante o envio, o painel orienta conferir a conversa antes de reenviar, porque a confirmação pode ter sido perdida após o envio.
- A configuração aparecer como preenchida no painel não substitui uma verificação real da conta Meta.

**Envio e recebimento reais dependem da conta, do número e dos tokens comerciais. Não foram testados contra a Meta nesta entrega.** Nenhuma mensagem foi enviada a pessoas durante o desenvolvimento.

Referências: [API de mensagens oficial da Meta](https://www.postman.com/meta/whatsapp-business-platform/folder/o48mro7/messages), [Política de mensagens do WhatsApp](https://whatsappbusiness.com/policy/).

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
npm run typecheck
npm run build
# Em outro terminal, com npm run dev ativo e a configuração local original:
npm test
```

Os testes de integração exercitam as rotas HTTP, cadastro, sessão, autorização, validações, mudanças concorrentes, proposta, exclusão e simulação. Usam apenas o banco local e recusam execução se houver conexão PostgreSQL. Os testes mantêm os exemplos fictícios para a apresentação e removem seu próprio lead temporário.

- 34 verificações HTTP aprovadas na entrega inicial.
- Compilação de produção e TypeScript aprovados.
- Auditoria de dependências de produção: nenhuma vulnerabilidade reportada na verificação realizada.
- Persistência local validada; PostgreSQL e publicação Vercel dependem das credenciais externas e não foram executados nesta máquina.
- Não houve inspeção visual automatizada no navegador.
- Um recurso WebMCP opcional e somente de leitura expõe os totais do CRM a navegadores compatíveis, usando a mesma autenticação. Não havia contexto de validação WebMCP disponível; esse recurso não foi verificado em um navegador compatível.

## Estrutura principal

```text
src/app/                  Páginas e rotas HTTP
src/components/           Site, diagnóstico, login e CRM
src/lib/                  Marca, tipos, validações, banco, sessão e WhatsApp
db/schema.sql             Esquema comum SQLite/PostgreSQL
scripts/setup.mjs         Configuração e credenciais locais
scripts/migrate.mjs       Preparação do banco PostgreSQL
scripts/vercel-build.mjs  Preparação e compilação na Vercel
scripts/test-integration.mjs  Validação HTTP local
```

## Limites desta primeira entrega

Um administrador, um funcionário e um cliente configuráveis por ambiente, um número WhatsApp, texto simples e consulta de todos os leads em memória no servidor. Adequado à apresentação e a uma operação inicial pequena. Para escalar, evolua cadastro e convite de usuários, múltiplos clientes, paginação, busca e índices de leads, fila de mensagens, backups e monitoramento. A versão atual não inclui pagamentos, chatbot com IA ou emissão de documentos fiscais, conforme o escopo da proposta.
