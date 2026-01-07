# 🚀 Guia Completo de Deploy na Vercel

## 📋 Pré-requisitos

1. Conta na Vercel (gratuita): https://vercel.com
2. Projeto no GitHub, GitLab ou Bitbucket (recomendado)
3. Variáveis de ambiente configuradas

## 🎯 Método 1: Deploy via Dashboard Vercel (Recomendado)

### Passo 1: Preparar Repositório Git

```bash
# Se ainda não tem repositório Git
git init
git add .
git commit -m "Preparar para deploy Vercel"
git branch -M main

# Conectar ao GitHub/GitLab/Bitbucket
git remote add origin https://github.com/seu-usuario/bistro.git
git push -u origin main
```

### Passo 2: Conectar Projeto na Vercel

1. Acesse: https://vercel.com/new
2. Clique em **"Import Project"**
3. Conecte seu repositório (GitHub/GitLab/Bitbucket)
4. Selecione o repositório `bistro`

### Passo 3: Configurar Projeto

A Vercel detectará automaticamente:
- ✅ Framework: Next.js
- ✅ Build Command: `npm run build`
- ✅ Output Directory: `.next`

**Você pode deixar os padrões ou ajustar se necessário.**

### Passo 4: Configurar Variáveis de Ambiente

Na tela de configuração, vá em **"Environment Variables"** e adicione:

#### Variáveis Obrigatórias:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://qwhynhmjgmjfmpgsfqqy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui

# Evolution API
EVOLUTION_API_URL=https://sua-evolution-api.com
EVOLUTION_API_KEY=sua-chave-api-aqui
EVOLUTION_INSTANCE_NAME=Bistro

# Cron Secret
CRON_SECRET=sua-chave-secreta-forte-aqui

# Base URL (será preenchida automaticamente após primeiro deploy)
NEXT_PUBLIC_BASE_URL=https://seu-projeto.vercel.app
```

**⚠️ IMPORTANTE:**
- Marque todas como **Production**, **Preview** e **Development**
- Use valores reais (não os placeholders)
- `NEXT_PUBLIC_BASE_URL` será atualizada automaticamente após o primeiro deploy

### Passo 5: Deploy

1. Clique em **"Deploy"**
2. Aguarde o build (2-5 minutos)
3. Quando terminar, você terá uma URL: `https://seu-projeto.vercel.app`

### Passo 6: Atualizar Base URL

Após o primeiro deploy:

1. Vá em **Settings** → **Environment Variables**
2. Edite `NEXT_PUBLIC_BASE_URL` com a URL real do seu projeto
3. Faça um novo deploy (ou aguarde o próximo)

## 🎯 Método 2: Deploy via CLI

### Passo 1: Instalar Vercel CLI

```bash
npm install -g vercel
```

### Passo 2: Login

```bash
vercel login
```

### Passo 3: Deploy

```bash
# Na raiz do projeto
vercel

# Siga as instruções:
# - Set up and deploy? Y
# - Which scope? (seu usuário)
# - Link to existing project? N (primeira vez)
# - Project name? bistro-reservas
# - Directory? ./
# - Override settings? N
```

### Passo 4: Configurar Variáveis

```bash
# Adicionar variáveis de ambiente
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add EVOLUTION_API_URL
vercel env add EVOLUTION_API_KEY
vercel env add EVOLUTION_INSTANCE_NAME
vercel env add CRON_SECRET
vercel env add NEXT_PUBLIC_BASE_URL

# Para cada variável, escolha:
# - Production: Y
# - Preview: Y
# - Development: Y
```

### Passo 5: Deploy de Produção

```bash
vercel --prod
```

## ⚙️ Configurações Importantes

### 1. Cron Jobs

O arquivo `vercel.json` já está configurado para executar o cron job a cada 5 minutos.

**Após o deploy, verifique:**
1. Vá em **Settings** → **Cron Jobs**
2. Deve aparecer: `*/5 * * * *` → `/api/cron/verificar-mensagens`
3. Se não aparecer, adicione manualmente

### 2. Domínio Customizado (Opcional)

1. Vá em **Settings** → **Domains**
2. Adicione seu domínio
3. Configure DNS conforme instruções da Vercel

### 3. Build Settings

Verifique em **Settings** → **General**:
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next` (padrão)
- **Install Command**: `npm install`
- **Node.js Version**: 20.x (ou superior)

## 🔍 Verificações Pós-Deploy

### 1. Testar Aplicação

```bash
# Acesse sua URL
https://seu-projeto.vercel.app

# Teste:
- Login funciona?
- Dashboard carrega?
- Reservas aparecem?
- WhatsApp conecta?
```

### 2. Verificar Logs

```bash
# Via Dashboard
Vercel Dashboard → Deployments → [último deploy] → Functions → Logs

# Via CLI
vercel logs
```

### 3. Testar Cron Job

```bash
# Teste manual do endpoint
curl "https://seu-projeto.vercel.app/api/cron/verificar-mensagens?secret=SUA_CRON_SECRET"

# Deve retornar JSON com sucesso
```

### 4. Verificar Variáveis

```bash
# Via CLI
vercel env ls

# Via Dashboard
Settings → Environment Variables
```

## 🐛 Troubleshooting

### Erro: "Module not found"

**Solução:**
```bash
# Verifique se todas as dependências estão no package.json
npm install

# Faça commit e redeploy
git add package.json package-lock.json
git commit -m "Fix dependencies"
git push
```

### Erro: "Environment variable not found"

**Solução:**
1. Vá em **Settings** → **Environment Variables**
2. Verifique se todas as variáveis estão configuradas
3. Marque para **Production**, **Preview** e **Development**
4. Faça um novo deploy

### Erro: "Build failed"

**Solução:**
1. Veja os logs do build no dashboard
2. Teste localmente: `npm run build`
3. Corrija os erros
4. Faça commit e push

### Cron Job não executa

**Solução:**
1. Verifique em **Settings** → **Cron Jobs**
2. Confirme que está ativo
3. Verifique se `CRON_SECRET` está configurado
4. Teste manualmente o endpoint

### Erro de conexão com Supabase

**Solução:**
1. Verifique se `NEXT_PUBLIC_SUPABASE_URL` está correto
2. Verifique se `NEXT_PUBLIC_SUPABASE_ANON_KEY` está correto
3. Verifique se as políticas RLS estão configuradas no Supabase

## 📊 Monitoramento

### Analytics (Opcional)

1. Vercel Analytics (gratuito)
2. Vercel Speed Insights (gratuito)

Ative em **Settings** → **Analytics**

### Logs em Tempo Real

```bash
# Via CLI
vercel logs --follow

# Via Dashboard
Deployments → [deploy] → Functions → Logs
```

## 🔄 Deploy Automático

Após conectar o repositório:

- ✅ **Push para `main`** → Deploy automático em produção
- ✅ **Pull Request** → Preview deployment automático
- ✅ **Push para outras branches** → Preview deployment

## 📝 Checklist Final

Antes de fazer deploy, verifique:

- [ ] Todas as variáveis de ambiente configuradas
- [ ] `vercel.json` está correto
- [ ] `.vercelignore` está configurado
- [ ] Build funciona localmente (`npm run build`)
- [ ] Não há erros de TypeScript (`npm run type-check`)
- [ ] Repositório Git está atualizado
- [ ] `CRON_SECRET` é uma chave forte e segura

## 🎉 Pronto!

Após seguir este guia, seu projeto estará:

- ✅ Rodando na Vercel
- ✅ Com deploy automático
- ✅ Com cron jobs configurados
- ✅ Com domínio próprio (ou .vercel.app)
- ✅ Com SSL automático
- ✅ Com CDN global

---

**Dúvidas?** Consulte a documentação: https://vercel.com/docs

