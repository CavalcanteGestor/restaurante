# Configuração do Cron Job para Mensagens Automáticas

## ⚠️ IMPORTANTE: Limitação Vercel Hobby

**Contas Hobby (gratuitas) na Vercel:**
- ✅ Máximo: **1 execução por dia**
- ❌ Não pode executar a cada 5 minutos

**Solução:** Use n8n ou VPS para execução mais frequente (veja opções abaixo)

## Opções de Configuração

### 1. Vercel Cron (1x por dia - Plano Hobby)

O arquivo `vercel.json` está configurado para executar **1 vez por dia às 9h**.

**Configuração:**
- O cron job está configurado em `vercel.json`
- Executa 1x por dia às 9h: `0 9 * * *`
- Endpoint: `/api/cron/verificar-mensagens`

**Para execução mais frequente (a cada 5 minutos), use n8n ou VPS (veja abaixo)**

**Autenticação:**
Adicione no `.env.local`:
```env
CRON_SECRET=sua-chave-secreta-aqui
```

O endpoint verifica o header `Authorization: Bearer {CRON_SECRET}` ou query param `?secret={CRON_SECRET}`.

### 2. n8n Workflow

Crie um workflow no n8n que chama o endpoint periodicamente:

1. **Cron Trigger**: Configure para executar a cada 5 minutos
2. **HTTP Request Node**:
   - Method: `GET` ou `POST`
   - URL: `https://seu-dominio.com/api/cron/verificar-mensagens?secret=sua-chave-secreta`
   - Ou use header: `Authorization: Bearer sua-chave-secreta`

### 3. Servidor Linux (cron)

Adicione no crontab (`crontab -e`):
```bash
*/5 * * * * curl -H "Authorization: Bearer sua-chave-secreta" https://seu-dominio.com/api/cron/verificar-mensagens
```

### 4. Teste Manual

Para testar manualmente:
```bash
curl -X POST http://localhost:3000/api/automatizacoes/verificar-nao-comparecimento
```

Ou acesse diretamente no navegador (apenas para testes):
```
http://localhost:3000/api/cron/verificar-mensagens?secret=sua-chave-secreta
```

## O que o Cron Job Faz

1. Verifica todas as reservas de hoje com `status_comparecimento = 'agendado'`
2. Calcula se passou 15 minutos após o horário da reserva
3. Verifica se já foi enviada mensagem para esta reserva
4. Envia mensagem via Evolution API se necessário
5. Registra na tabela `mensagens_automaticas`
6. Atualiza contexto do lead

## Logs e Monitoramento

Os logs aparecem no console do servidor:
- `[Verificar Não Comparecimento]` - Logs da verificação
- `[Cron Verificar Mensagens]` - Logs do cron job

## Troubleshooting

### Cron não está executando
- Verifique se `CRON_SECRET` está configurado
- Verifique logs do Vercel/n8n/servidor
- Teste manualmente o endpoint

### Mensagens não estão sendo enviadas
- Verifique se Evolution API está configurada corretamente
- Verifique se reservas têm `status_comparecimento = 'agendado'`
- Verifique se já passaram 15 minutos do horário
- Verifique tabela `mensagens_automaticas` para ver erros

### Erro 401 Unauthorized
- Verifique se `CRON_SECRET` está correto
- Verifique se está enviando header ou query param corretamente

