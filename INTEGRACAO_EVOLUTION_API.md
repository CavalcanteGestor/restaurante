# 📱 Integração Evolution API - Guia Completo

## ✅ O que foi implementado

### 1. Cliente Evolution API (`lib/evolution-api/client.ts`)
- ✅ Cliente completo e reutilizável
- ✅ Envio de mensagens de texto
- ✅ Envio de mídia (imagem, áudio, vídeo, documento)
- ✅ Verificação de status da instância
- ✅ Verificação de conexão
- ✅ Busca de mensagens e chats
- ✅ Marcação de mensagens como lidas
- ✅ Validação de números WhatsApp

### 2. API Routes

#### `/api/whatsapp/send` (POST)
- Envia mensagens via Evolution API
- Valida conexão antes de enviar
- Tratamento de erros completo
- Suporte a delay e link preview

#### `/api/whatsapp/status` (GET)
- Verifica status da instância
- Retorna se está conectado
- Informações de configuração

#### `/api/whatsapp/webhook` (POST)
- Recebe mensagens do Evolution API
- Salva automaticamente na tabela `conversas`
- Cria/atualiza leads automaticamente
- Atualiza contexto do lead

### 3. Componentes UI

#### `EvolutionStatus`
- Mostra status da conexão em tempo real
- Atualiza automaticamente a cada 30 segundos
- Alertas visuais (verde=conectado, vermelho=desconectado)
- Botão para verificar manualmente

#### `ChatInterface` (Melhorado)
- Melhor tratamento de erros
- Feedback visual ao enviar mensagens
- Validação de conexão antes de enviar

## 🔧 Configuração

### Variáveis de Ambiente

No arquivo `.env.local`:

```env
EVOLUTION_API_URL=https://sua-evolution-api.com
EVOLUTION_API_KEY=sua-chave-api
EVOLUTION_INSTANCE_NAME=Bistro
```

### Configurar Webhook no Evolution API

1. Acesse o painel do Evolution API
2. Vá em: **Webhooks** ou **Configurações**
3. Configure o webhook para:
   - **URL**: `https://seu-dominio.com/api/whatsapp/webhook`
   - **Eventos**: `messages.upsert` (mensagens recebidas)
4. Salve a configuração

## 📋 Como Funciona

### Fluxo de Envio de Mensagem

1. **Recepcionista digita mensagem** → `ChatInterface`
2. **Clica em enviar** → Chama `/api/whatsapp/send`
3. **API verifica conexão** → `evolutionApi.isConnected()`
4. **Envia via Evolution API** → `evolutionApi.sendText()`
5. **Atualiza contexto do lead** → Salva no banco
6. **Atualiza interface** → Mostra mensagem enviada

### Fluxo de Recebimento de Mensagem

1. **Cliente envia mensagem no WhatsApp** → Evolution API recebe
2. **Evolution API envia webhook** → `/api/whatsapp/webhook`
3. **Sistema processa mensagem** → Extrai telefone e texto
4. **Busca ou cria lead** → Tabela `leads`
5. **Salva mensagem** → Tabela `conversas`
6. **Atualiza última mensagem** → Campo `data_ultima_msg`

## 🎯 Funcionalidades Disponíveis

### Enviar Mensagem de Texto
```typescript
await evolutionApi.sendText({
  number: "5511999999999",
  text: "Olá! Como posso ajudar?",
  delay: 1200,
  linkPreview: true
})
```

### Enviar Mídia
```typescript
await evolutionApi.sendMedia({
  number: "5511999999999",
  media: "https://exemplo.com/imagem.jpg",
  caption: "Veja esta imagem",
  type: "image"
})
```

### Verificar Status
```typescript
const isConnected = await evolutionApi.isConnected()
const status = await evolutionApi.getInstanceStatus()
```

### Buscar Mensagens
```typescript
const messages = await evolutionApi.getMessages("5511999999999", 50)
```

## 🔍 Monitoramento

### Status em Tempo Real
- A página `/whatsapp` mostra o status da conexão
- Atualiza automaticamente a cada 30 segundos
- Alertas visuais para problemas

### Logs
- Erros são logados no console do servidor
- Mensagens de erro são retornadas ao frontend
- Webhook logs são salvos no banco

## ⚠️ Troubleshooting

### "Evolution API não configurada"
- Verifique se as variáveis de ambiente estão no `.env.local`
- Reinicie o servidor após adicionar variáveis

### "Instância não está conectada"
- Verifique se a instância está ativa no Evolution API
- Verifique se o QR Code foi escaneado
- Verifique se a instância não expirou

### "Erro ao enviar mensagem"
- Verifique se o número está no formato correto (sem @s.whatsapp.net)
- Verifique se o número existe no WhatsApp
- Verifique os logs do Evolution API

### Webhook não recebe mensagens
- Verifique se a URL do webhook está correta
- Verifique se o servidor está acessível publicamente
- Verifique os logs do Evolution API para erros de webhook

## 📞 Suporte

Para mais informações sobre Evolution API:
- Documentação: https://doc.evolution-api.com
- Suporte: Verifique o painel do Evolution API

---

**Sistema de Gestão de Reservas - Est! Est!! Est!!! Ristorante** 🍝

