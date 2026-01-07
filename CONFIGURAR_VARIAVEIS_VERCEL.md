# 🔐 Configurar Variáveis de Ambiente na Vercel

O erro `MIDDLEWARE_INVOCATION_FAILED` geralmente ocorre porque as variáveis de ambiente não estão configuradas na Vercel.

## 📋 Variáveis Obrigatórias

Você precisa configurar as seguintes variáveis de ambiente no painel da Vercel:

### 1. **Supabase** (Obrigatórias)
```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

### 2. **Evolution API** (Obrigatórias)
```
EVOLUTION_API_URL=https://sua-evolution-api.com
EVOLUTION_API_KEY=sua-api-key-aqui
EVOLUTION_INSTANCE_NAME=Bistro
```

### 3. **Cron Jobs** (Opcional, mas recomendado)
```
CRON_SECRET=seu-secret-super-seguro-aqui
NEXT_PUBLIC_BASE_URL=https://restaurante-bay-eight.vercel.app
```

## 🚀 Como Configurar na Vercel

### Passo 1: Acesse o Painel da Vercel
1. Vá para [vercel.com](https://vercel.com)
2. Faça login na sua conta
3. Selecione o projeto `restaurante`

### Passo 2: Configure as Variáveis
1. Clique em **Settings** (Configurações)
2. No menu lateral, clique em **Environment Variables** (Variáveis de Ambiente)
3. Adicione cada variável uma por uma:

#### Para cada variável:
- **Name**: Nome da variável (ex: `NEXT_PUBLIC_SUPABASE_URL`)
- **Value**: Valor da variável (copie do seu `.env.local`)
- **Environment**: Selecione:
  - ✅ **Production** (obrigatório)
  - ✅ **Preview** (recomendado)
  - ✅ **Development** (opcional)

### Passo 3: Redeploy
Após adicionar todas as variáveis:
1. Vá para a aba **Deployments**
2. Clique nos três pontos (⋯) do último deployment
3. Selecione **Redeploy**
4. Ou faça um novo commit para trigger automático

## 🔍 Onde Encontrar os Valores

### Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Selecione seu projeto
3. Vá em **Settings** → **API**
4. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Evolution API
- `EVOLUTION_API_URL`: URL da sua instância Evolution API
- `EVOLUTION_API_KEY`: Chave de API fornecida pelo Evolution API
- `EVOLUTION_INSTANCE_NAME`: Nome da instância (geralmente "Bistro")

### CRON_SECRET
- Crie uma string aleatória e segura (ex: use um gerador de senhas)
- Exemplo: `CRON_SECRET=abc123xyz789super_secret`

### NEXT_PUBLIC_BASE_URL
- Use a URL do seu projeto na Vercel
- Exemplo: `NEXT_PUBLIC_BASE_URL=https://restaurante-bay-eight.vercel.app`

## ⚠️ Importante

1. **Nunca commite o `.env.local`** - Ele está no `.gitignore` por segurança
2. **Variáveis com `NEXT_PUBLIC_`** são expostas ao cliente - use com cuidado
3. **Após adicionar variáveis**, sempre faça um **redeploy**
4. **Verifique os logs** na Vercel se ainda houver erros

## 🐛 Troubleshooting

### Erro persiste após configurar variáveis?
1. Verifique se todas as variáveis foram adicionadas
2. Verifique se selecionou os ambientes corretos (Production, Preview)
3. Faça um redeploy completo
4. Verifique os logs em **Deployments** → **Functions** → **View Function Logs**

### Como verificar se as variáveis estão configuradas?
1. Vá em **Settings** → **Environment Variables**
2. Você deve ver todas as variáveis listadas
3. Certifique-se de que estão marcadas para **Production**

## 📝 Checklist

Antes de fazer deploy, verifique:

- [ ] `NEXT_PUBLIC_SUPABASE_URL` configurada
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` configurada
- [ ] `EVOLUTION_API_URL` configurada
- [ ] `EVOLUTION_API_KEY` configurada
- [ ] `EVOLUTION_INSTANCE_NAME` configurada
- [ ] `CRON_SECRET` configurada (opcional)
- [ ] `NEXT_PUBLIC_BASE_URL` configurada (opcional)
- [ ] Todas marcadas para **Production**
- [ ] Redeploy feito após adicionar variáveis

---

**Dica**: Você pode copiar os valores do seu arquivo `.env.local` local e colar na Vercel, mas **NUNCA** commite o `.env.local` no Git!

