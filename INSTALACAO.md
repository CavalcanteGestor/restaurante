# Guia de Instalação - Sistema de Gestão de Reservas

## Pré-requisitos

- Node.js 18+ instalado
- Conta no Supabase
- Evolution API configurada (para WhatsApp)

## Passo a Passo

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon

# Evolution API (WhatsApp)
EVOLUTION_API_URL=https://sua-evolution-api.com
EVOLUTION_API_KEY=sua-chave-api
EVOLUTION_INSTANCE_NAME=Bistro
```

### 3. Configurar Banco de Dados

O sistema utiliza as tabelas existentes do banco de dados. Certifique-se de que todas as tabelas estão criadas conforme o arquivo `sqldobancodedados.sql`.

### 4. Configurar Autenticação no Supabase

1. Acesse o painel do Supabase
2. Vá em Authentication > Providers
3. Configure o provider de email/password
4. Crie usuários de teste na tabela `auth.users`
5. Crie registros correspondentes na tabela `usuarios`

### 5. Executar o Projeto

```bash
npm run dev
```

O sistema estará disponível em `http://localhost:3000`

### 6. Primeiro Acesso

1. Acesse `/login`
2. Use as credenciais de um usuário criado no Supabase
3. Você será redirecionado para o dashboard

## Estrutura de Usuários

O sistema utiliza a tabela `usuarios` para gerenciar usuários. Cada usuário deve ter:

- Um registro em `auth.users` (criado pelo Supabase Auth)
- Um registro correspondente em `usuarios` com o mesmo `id`
- Uma função (`funcao_id`) associada para controle de permissões

## Integração com n8n

O sistema compartilha as mesmas tabelas do workflow n8n:

- `reservas` - Reservas criadas pela IA ou manualmente
- `leads` - Leads gerenciados pelo sistema
- `conversas` - Histórico de conversas
- `mesas` - Configuração de mesas
- `atendimento_humano` - Controle de atendimento humano

Quando a IA muda `atendimento_humano.ativo = true`, o lead aparece automaticamente na aba WhatsApp do sistema.

## Mensagens Automáticas

O sistema verifica automaticamente reservas atrasadas (>15 minutos) e permite enviar mensagens automáticas. Para ativar completamente:

1. Configure um cron job ou webhook para chamar `/api/automatizacoes/verificar-atrasos` periodicamente
2. Ou use a interface em `/automatizacoes` para enviar manualmente

## Troubleshooting

### Erro de autenticação
- Verifique se as variáveis de ambiente do Supabase estão corretas
- Confirme que o usuário existe em `auth.users` e `usuarios`

### Erro ao enviar mensagens WhatsApp
- Verifique as credenciais da Evolution API
- Confirme que a instância está ativa e conectada

### Mesas não aparecem
- Verifique se a tabela `mesas` está populada
- Confirme que os campos `disponivel = true` estão corretos

## Suporte

Para dúvidas ou problemas, consulte a documentação do Next.js e Supabase.

