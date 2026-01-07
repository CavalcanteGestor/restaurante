# 🚀 Guia Rápido - Configurar Cron na VPS

## Setup Rápido (5 minutos)

### 1. Copiar Script para VPS

```bash
# Na sua VPS, criar diretório e copiar script
sudo mkdir -p /usr/local/bin /etc/bistro /var/log/bistro
sudo cp scripts/cron-verificar-mensagens.sh /usr/local/bin/bistro-verificar-mensagens.sh
sudo chmod +x /usr/local/bin/bistro-verificar-mensagens.sh
```

### 2. Configurar Variáveis

```bash
# Criar arquivo de configuração
sudo nano /etc/bistro/cron.env
```

Cole isso (AJUSTE OS VALORES):

```env
# URL da sua aplicação (se roda na porta 3000, deixe assim)
API_URL=http://localhost:3000

# Chave secreta (MESMA do seu .env.local)
CRON_SECRET=sua-chave-secreta-aqui

# Arquivo de log
LOG_FILE=/var/log/bistro/cron-mensagens.log
```

### 3. Testar Manualmente

```bash
# Testar se funciona
/usr/local/bin/bistro-verificar-mensagens.sh

# Ver log
tail -f /var/log/bistro/cron-mensagens.log
```

Se aparecer `✅ Sucesso`, está funcionando!

### 4. Configurar Cron

```bash
# Editar crontab
crontab -e
```

Adicione esta linha (executa a cada 5 minutos):

```cron
*/5 * * * * /usr/local/bin/bistro-verificar-mensagens.sh >/dev/null 2>&1
```

Salve e saia (Ctrl+X, Y, Enter no nano)

### 5. Verificar

```bash
# Ver se foi adicionado
crontab -l

# Ver logs em tempo real (aguarde alguns minutos)
tail -f /var/log/bistro/cron-mensagens.log
```

## ⚠️ IMPORTANTE

### Se sua aplicação roda com PM2:

```bash
# Verificar se está rodando
pm2 list

# Se não estiver, iniciar:
cd /caminho/do/seu/projeto
pm2 start npm --name "bistro" -- start
pm2 save
```

### Se usa porta diferente de 3000:

No arquivo `/etc/bistro/cron.env`, ajuste:
```env
API_URL=http://localhost:SUA_PORTA
```

### Se aplicação está em outro servidor:

```env
API_URL=https://seu-dominio.com
```

## 🔍 Troubleshooting

### Erro: "curl: command not found"
```bash
sudo apt-get install curl  # Ubuntu/Debian
sudo yum install curl      # CentOS/RHEL
```

### Erro: "Permission denied"
```bash
sudo chmod +x /usr/local/bin/bistro-verificar-mensagens.sh
```

### Erro 401 Unauthorized
- Verifique se `CRON_SECRET` no `/etc/bistro/cron.env` está igual ao `.env.local` da aplicação

### Não executa
```bash
# Ver logs do cron
grep CRON /var/log/syslog | tail -20

# Testar manualmente com debug
bash -x /usr/local/bin/bistro-verificar-mensagens.sh
```

## 📋 Checklist Final

- [ ] Script copiado e com permissão de execução
- [ ] Arquivo `/etc/bistro/cron.env` criado com valores corretos
- [ ] Teste manual funcionou
- [ ] Crontab configurado
- [ ] Logs aparecendo após alguns minutos

---

**Pronto!** O sistema verificará automaticamente a cada 5 minutos e enviará mensagens para clientes que não compareceram! 🎉

