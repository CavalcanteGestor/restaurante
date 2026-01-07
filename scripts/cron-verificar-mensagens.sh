#!/bin/bash

# Script para verificar mensagens automáticas de não comparecimento
# Execute este script via cron job a cada 5 minutos

# Carregar variáveis de ambiente de arquivo de configuração (se existir)
if [ -f /etc/bistro/cron.env ]; then
  source /etc/bistro/cron.env
fi

# Configurações padrão (podem ser sobrescritas pelo arquivo acima)
API_URL="${API_URL:-http://localhost:3000}"
CRON_SECRET="${CRON_SECRET:-default-secret-change-in-production}"
LOG_FILE="${LOG_FILE:-/var/log/bistro/cron-mensagens.log}"

# Criar diretório de log se não existir
mkdir -p "$(dirname "$LOG_FILE")"

# Timestamp para log
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Fazer requisição ao endpoint
RESPONSE=$(curl -s -w "\n%{http_code}" \
  -H "Authorization: Bearer $CRON_SECRET" \
  -X GET \
  "${API_URL}/api/cron/verificar-mensagens" 2>&1)

# Separar resposta e código HTTP
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

# Log do resultado
if [ "$HTTP_CODE" -eq 200 ]; then
  echo "[$TIMESTAMP] ✅ Sucesso - Mensagens verificadas" >> "$LOG_FILE"
  echo "[$TIMESTAMP] Resposta: $BODY" >> "$LOG_FILE"
else
  echo "[$TIMESTAMP] ❌ Erro HTTP $HTTP_CODE" >> "$LOG_FILE"
  echo "[$TIMESTAMP] Resposta: $BODY" >> "$LOG_FILE"
fi

# Opcional: Enviar email em caso de erro (descomente e configure)
# if [ "$HTTP_CODE" -ne 200 ]; then
#   echo "Erro ao verificar mensagens automáticas. HTTP $HTTP_CODE" | \
#     mail -s "Erro Cron - Bistro" seu-email@exemplo.com
# fi

exit 0

