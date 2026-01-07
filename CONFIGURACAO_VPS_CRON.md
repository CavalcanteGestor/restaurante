# Configuração de Cron Job na VPS

## Passo a Passo Completo

### 1. Preparar o Script

Copie o script `scripts/cron-verificar-mensagens.sh` para um local acessível na VPS:

```bash
# Copiar script para /usr/local/bin (ou outro diretório de sua escolha)
sudo cp scripts/cron-verificar-mensagens.sh /usr/local/bin/bistro-verificar-mensagens.sh
sudo chmod +x /usr/local/bin/bistro-verificar-mensagens.sh
```

### 2. Configurar Variáveis de Ambiente

Edite o script e configure as variáveis no início:

```bash
sudo nano /usr/local/bin/bistro-verificar-mensagens.sh
```

Ou crie um arquivo de configuração `/etc/bistro/cron.env`:

```bash
sudo mkdir -p /etc/bistro
sudo nano /etc/bistro/cron.env
```

Adicione:
```env
# URL da sua aplicação (ajuste conforme necessário)
API_URL=http://localhost:3000
# OU se estiver em outro servidor/porta:
# API_URL=https://seu-dominio.com

# Chave secreta (mesma do .env.local da aplicação)
CRON_SECRET=sua-chave-secreta-aqui

# Arquivo de log (opcional)
LOG_FILE=/var/log/bistro/cron-mensagens.log
```

E modifique o script para carregar essas variáveis:

```bash
# No início do script, adicione:
if [ -f /etc/bistro/cron.env ]; then
  source /etc/bistro/cron.env
fi
```

### 3. Testar o Script Manualmente

Antes de configurar o cron, teste o script:

```bash
# Teste básico
/usr/local/bin/bistro-verificar-mensagens.sh

# Verificar log
tail -f /var/log/bistro/cron-mensagens.log

# Ou se não configurou log, ver saída direta
/usr/local/bin/bistro-verificar-mensagens.sh
```

**Importante:** Certifique-se de que:
- A aplicação está rodando (PM2, systemd, etc.)
- A URL está correta (localhost:3000 ou seu domínio)
- O CRON_SECRET está correto

### 4. Configurar Crontab

Edite o crontab do usuário que roda a aplicação:

```bash
# Se usar PM2 com usuário específico
crontab -e

# Se usar root (não recomendado, mas possível)
sudo crontab -e
```

Adicione esta linha para executar a cada 5 minutos:

```cron
# Verificar mensagens automáticas de não comparecimento - Bistro
*/5 * * * * /usr/local/bin/bistro-verificar-mensagens.sh >/dev/null 2>&1
```

**Ou com log detalhado:**

```cron
# Verificar mensagens automáticas de não comparecimento - Bistro
*/5 * * * * /usr/local/bin/bistro-verificar-mensagens.sh >> /var/log/bistro/cron-mensagens.log 2>&1
```

### 5. Verificar Crontab Configurado

```bash
# Ver crontab atual
crontab -l

# Verificar se cron está rodando
sudo systemctl status cron
# ou
sudo service cron status
```

### 6. Monitorar Execução

```bash
# Ver logs em tempo real
tail -f /var/log/bistro/cron-mensagens.log

# Ver últimas 50 linhas
tail -n 50 /var/log/bistro/cron-mensagens.log

# Verificar se está executando
ps aux | grep bistro-verificar-mensagens
```

## Configurações Alternativas

### Opção 1: Usando Systemd Timer (Mais Moderno)

Crie `/etc/systemd/system/bistro-verificar-mensagens.service`:

```ini
[Unit]
Description=Verificar Mensagens Automáticas - Bistro
After=network.target

[Service]
Type=oneshot
EnvironmentFile=/etc/bistro/cron.env
ExecStart=/usr/local/bin/bistro-verificar-mensagens.sh
User=seu-usuario
```

Crie `/etc/systemd/system/bistro-verificar-mensagens.timer`:

```ini
[Unit]
Description=Timer para Verificar Mensagens Automáticas - Bistro
Requires=bistro-verificar-mensagens.service

[Timer]
OnCalendar=*:0/5
Persistent=true

[Install]
WantedBy=timers.target
```

Ative e inicie:

```bash
sudo systemctl daemon-reload
sudo systemctl enable bistro-verificar-mensagens.timer
sudo systemctl start bistro-verificar-mensagens.timer
sudo systemctl status bistro-verificar-mensagens.timer
```

### Opção 2: Se Aplicação Está em Docker

Se sua aplicação roda em Docker, ajuste a URL:

```bash
# Se container se chama "bistro-app"
API_URL=http://bistro-app:3000

# Ou se usa network bridge
API_URL=http://172.17.0.1:3000

# Ou se expõe porta diretamente
API_URL=http://localhost:3000
```

E execute o script dentro do container ou de um container separado:

```bash
# Dentro do container da aplicação
docker exec bistro-app /usr/local/bin/bistro-verificar-mensagens.sh

# Ou criar container separado só para cron
docker run --rm --network bistro-network \
  -e API_URL=http://bistro-app:3000 \
  -e CRON_SECRET=sua-chave \
  bistro-cron:latest
```

### Opção 3: Se Usa PM2

Se usa PM2, pode criar um script PM2 que executa periodicamente:

```bash
# Instalar pm2-cron (se ainda não tem)
npm install -g pm2-cron

# Criar script PM2
pm2 start /usr/local/bin/bistro-verificar-mensagens.sh \
  --name "bistro-verificar-mensagens" \
  --cron "*/5 * * * *" \
  --no-autorestart
```

## Troubleshooting

### Script não executa

```bash
# Verificar permissões
ls -la /usr/local/bin/bistro-verificar-mensagens.sh

# Testar manualmente
bash -x /usr/local/bin/bistro-verificar-mensagens.sh

# Verificar se curl está instalado
which curl
curl --version
```

### Erro 401 Unauthorized

- Verifique se `CRON_SECRET` está correto
- Verifique se está enviando o header Authorization
- Teste manualmente:
  ```bash
  curl -H "Authorization: Bearer sua-chave-secreta" \
    http://localhost:3000/api/cron/verificar-mensagens
  ```

### Erro de Conexão

- Verifique se a aplicação está rodando:
  ```bash
  curl http://localhost:3000/api/health
  # ou
  netstat -tulpn | grep 3000
  ```
- Verifique firewall:
  ```bash
  sudo ufw status
  sudo iptables -L
  ```

### Logs não aparecem

- Verifique permissões do diretório de log:
  ```bash
  sudo mkdir -p /var/log/bistro
  sudo chmod 755 /var/log/bistro
  sudo chown seu-usuario:seu-usuario /var/log/bistro
  ```

## Exemplo Completo de Setup

```bash
# 1. Criar diretórios
sudo mkdir -p /usr/local/bin
sudo mkdir -p /etc/bistro
sudo mkdir -p /var/log/bistro

# 2. Copiar script
sudo cp scripts/cron-verificar-mensagens.sh /usr/local/bin/bistro-verificar-mensagens.sh
sudo chmod +x /usr/local/bin/bistro-verificar-mensagens.sh

# 3. Criar arquivo de configuração
sudo tee /etc/bistro/cron.env > /dev/null <<EOF
API_URL=http://localhost:3000
CRON_SECRET=sua-chave-secreta-aqui
LOG_FILE=/var/log/bistro/cron-mensagens.log
EOF

# 4. Modificar script para carregar .env (adicionar no início):
# if [ -f /etc/bistro/cron.env ]; then
#   source /etc/bistro/cron.env
# fi

# 5. Testar
/usr/local/bin/bistro-verificar-mensagens.sh

# 6. Configurar cron
crontab -e
# Adicionar: */5 * * * * /usr/local/bin/bistro-verificar-mensagens.sh >/dev/null 2>&1

# 7. Verificar
crontab -l
tail -f /var/log/bistro/cron-mensagens.log
```

## Monitoramento Recomendado

### Log Rotation

Crie `/etc/logrotate.d/bistro`:

```
/var/log/bistro/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0644 seu-usuario seu-usuario
}
```

### Alertas por Email (Opcional)

Descomente a seção de email no script e configure:

```bash
# Instalar mailutils (Ubuntu/Debian)
sudo apt-get install mailutils

# Configurar postfix ou outro MTA
sudo dpkg-reconfigure postfix
```

---

**Pronto!** O cron job estará executando a cada 5 minutos verificando reservas que não compareceram e enviando mensagens automáticas.

