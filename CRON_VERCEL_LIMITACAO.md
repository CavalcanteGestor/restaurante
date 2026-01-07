# ⚠️ Limitação de Cron Jobs na Vercel (Plano Hobby)

## 🚨 Problema

Contas **Hobby (gratuitas)** na Vercel têm limitação:
- ✅ **1 execução por dia** (máximo)
- ❌ Não pode executar a cada 5 minutos

## ✅ Solução Implementada

O `vercel.json` foi ajustado para executar **1 vez por dia às 9h**:

```json
{
  "crons": [
    {
      "path": "/api/cron/verificar-mensagens",
      "schedule": "0 9 * * *"
    }
  ]
}
```

**Horário:** 09:00 (9h da manhã) todos os dias

## 🔄 Alternativas para Execução Mais Frequente

Se você precisa verificar mensagens **a cada 5 ou 15 minutos**, use uma das opções abaixo:

### Opção 1: n8n (Recomendado - Já tem instalado)

Se você já usa n8n, crie um workflow:

1. **Trigger:** Cron (a cada 5 minutos)
2. **HTTP Request:** 
   - Method: `GET`
   - URL: `https://seu-projeto.vercel.app/api/cron/verificar-mensagens?secret=SUA_CRON_SECRET`

**Vantagens:**
- ✅ Gratuito
- ✅ Já está no seu ambiente
- ✅ Pode executar a cada minuto se quiser
- ✅ Logs e histórico

### Opção 2: VPS (Se já tem servidor)

Use o script que já criamos:

```bash
# Instalar cron job no VPS
crontab -e

# Adicionar linha (executa a cada 5 minutos):
*/5 * * * * /caminho/para/scripts/cron-verificar-mensagens.sh
```

Veja: `GUIA_RAPIDO_VPS.md` e `CONFIGURACAO_VPS_CRON.md`

### Opção 3: Serviços Externos Gratuitos

#### EasyCron
- URL: https://www.easycron.com
- Gratuito: 1 job a cada 5 minutos
- Configure: `GET https://seu-projeto.vercel.app/api/cron/verificar-mensagens?secret=SUA_CRON_SECRET`

#### Cron-Job.org
- URL: https://cron-job.org
- Gratuito: Jobs ilimitados
- Configure: `GET https://seu-projeto.vercel.app/api/cron/verificar-mensagens?secret=SUA_CRON_SECRET`

#### UptimeRobot
- URL: https://uptimerobot.com
- Gratuito: Monitora e pode fazer HTTP requests
- Configure: Monitor HTTP com intervalo de 5 minutos

### Opção 4: Upgrade Vercel Pro

Se quiser usar apenas Vercel:
- **Pro Plan:** $20/mês
- ✅ Cron jobs ilimitados
- ✅ Execução a cada minuto se quiser

## 📋 Configuração Recomendada

### Para Produção (Verificação a cada 5 minutos):

**Use n8n ou VPS** para chamar o endpoint:

```
GET https://seu-projeto.vercel.app/api/cron/verificar-mensagens?secret=SUA_CRON_SECRET
```

### Para Teste/Desenvolvimento:

O cron da Vercel (1x por dia) é suficiente para testes.

## 🔧 Como Configurar n8n

1. Acesse seu n8n
2. Crie novo workflow
3. Adicione node **Cron**:
   - Schedule: `*/5 * * * *` (a cada 5 minutos)
4. Adicione node **HTTP Request**:
   - Method: `GET`
   - URL: `https://seu-projeto.vercel.app/api/cron/verificar-mensagens`
   - Query Parameters:
     - `secret`: `SUA_CRON_SECRET`
5. Salve e ative o workflow

## ✅ Status Atual

- ✅ Cron job configurado na Vercel (1x por dia às 9h)
- ✅ Endpoint funcionando: `/api/cron/verificar-mensagens`
- ✅ Script VPS pronto: `scripts/cron-verificar-mensagens.sh`
- ✅ Documentação completa disponível

## 🎯 Recomendação Final

**Para produção:** Use **n8n** (já tem instalado) para executar a cada 5 minutos.

**Para desenvolvimento:** O cron da Vercel (1x por dia) é suficiente.

---

**Pronto!** O sistema está configurado. Escolha a opção que melhor se adapta ao seu caso! 🚀

