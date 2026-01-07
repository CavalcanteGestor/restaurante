# ⚡ Deploy Rápido na Vercel - 5 Minutos

## 🚀 Passo a Passo Rápido

### 1. Preparar Git (se ainda não fez)

```bash
git add .
git commit -m "Preparar deploy Vercel"
git push
```

### 2. Acessar Vercel

1. Vá em: https://vercel.com/new
2. Clique em **"Import Project"**
3. Conecte seu repositório

### 3. Configurar Variáveis

Na tela de configuração, adicione estas variáveis:

```env
NEXT_PUBLIC_SUPABASE_URL=https://qwhynhmjgmjfmpgsfqqy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[sua-chave-anon]
EVOLUTION_API_URL=[sua-evolution-api]
EVOLUTION_API_KEY=[sua-chave-api]
EVOLUTION_INSTANCE_NAME=Bistro
CRON_SECRET=[chave-secreta-forte]
```

**Marque todas para:** Production ✅ Preview ✅ Development ✅

### 4. Deploy

Clique em **"Deploy"** e aguarde!

### 5. Atualizar Base URL

Após deploy, vá em **Settings** → **Environment Variables** e adicione:

```env
NEXT_PUBLIC_BASE_URL=https://seu-projeto.vercel.app
```

## ✅ Pronto!

Seu projeto está no ar! 🎉

**URL:** `https://seu-projeto.vercel.app`

---

Para guia completo, veja: `GUIA_DEPLOY_VERCEL.md`

