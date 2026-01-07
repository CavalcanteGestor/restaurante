# 🔐 Variáveis de Ambiente para Vercel

## 📋 Lista Completa de Variáveis

Adicione estas variáveis no painel da Vercel em **Settings** → **Environment Variables**:

### ✅ Variáveis Obrigatórias

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://qwhynhmjgmjfmpgsfqqy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-do-supabase

# Evolution API (WhatsApp)
EVOLUTION_API_URL=https://sua-evolution-api.com
EVOLUTION_API_KEY=sua-chave-api-evolution
EVOLUTION_INSTANCE_NAME=Bistro

# Cron Job Secret
CRON_SECRET=uma-chave-secreta-forte-aqui-minimo-32-caracteres

# Base URL (será preenchida após primeiro deploy)
NEXT_PUBLIC_BASE_URL=https://seu-projeto.vercel.app
```

### ⚙️ Configuração

Para cada variável:
1. **Key**: Nome da variável (ex: `NEXT_PUBLIC_SUPABASE_URL`)
2. **Value**: Valor da variável
3. **Environments**: Marque todas ✅
   - ✅ Production
   - ✅ Preview  
   - ✅ Development

### 🔍 Como Encontrar os Valores

#### Supabase
1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Settings** → **API**
4. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### Evolution API
- `EVOLUTION_API_URL`: URL da sua Evolution API
- `EVOLUTION_API_KEY`: Chave de API da Evolution
- `EVOLUTION_INSTANCE_NAME`: Nome da instância (geralmente "Bistro")

#### CRON_SECRET
Gere uma chave forte:
```bash
# No terminal
openssl rand -base64 32

# Ou use um gerador online
# https://randomkeygen.com/
```

### 📝 Exemplo de Valores Reais

```env
NEXT_PUBLIC_SUPABASE_URL=https://qwhynhmjgmjfmpgsfqqy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EVOLUTION_API_URL=https://evo.olifant.cloud
EVOLUTION_API_KEY=Bearer sua-chave-aqui
EVOLUTION_INSTANCE_NAME=Bistro
CRON_SECRET=minha-chave-super-secreta-1234567890abcdef
NEXT_PUBLIC_BASE_URL=https://bistro-reservas.vercel.app
```

### ⚠️ Importante

- **NUNCA** commite valores reais no Git
- Use apenas no painel da Vercel
- `NEXT_PUBLIC_*` são variáveis públicas (visíveis no cliente)
- Variáveis sem `NEXT_PUBLIC_` são apenas no servidor

### 🔄 Após Primeiro Deploy

1. Copie a URL do seu projeto: `https://seu-projeto.vercel.app`
2. Vá em **Settings** → **Environment Variables**
3. Adicione ou atualize: `NEXT_PUBLIC_BASE_URL`
4. Faça um novo deploy (ou aguarde o próximo)

---

**Pronto!** Com essas variáveis configuradas, seu projeto funcionará perfeitamente na Vercel! 🚀

