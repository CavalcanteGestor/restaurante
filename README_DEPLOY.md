# 🚀 Deploy na Vercel - Resumo Executivo

## ⚡ Deploy em 3 Passos

### 1️⃣ Conectar Repositório
- Acesse: https://vercel.com/new
- Conecte seu repositório Git
- Selecione o projeto

### 2️⃣ Configurar Variáveis
Adicione em **Settings** → **Environment Variables**:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
EVOLUTION_API_URL
EVOLUTION_API_KEY
EVOLUTION_INSTANCE_NAME
CRON_SECRET
NEXT_PUBLIC_BASE_URL (após primeiro deploy)
```

### 3️⃣ Deploy
- Clique em **"Deploy"**
- Aguarde 2-5 minutos
- Pronto! 🎉

## 📚 Documentação Completa

- **Guia Completo**: `GUIA_DEPLOY_VERCEL.md`
- **Deploy Rápido**: `DEPLOY_RAPIDO.md`
- **Variáveis de Ambiente**: `VARIAVEIS_AMBIENTE_VERCEL.md`

## ✅ Checklist

- [ ] Repositório Git configurado
- [ ] Variáveis de ambiente adicionadas
- [ ] Build funciona localmente (`npm run build`)
- [ ] Deploy realizado
- [ ] URL funcionando
- [ ] Cron job configurado

---

**Dúvidas?** Veja `GUIA_DEPLOY_VERCEL.md` para instruções detalhadas.

