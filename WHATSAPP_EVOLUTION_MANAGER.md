# 🎉 WhatsApp integrado com Evolution Manager

## O que foi feito

Descobrimos que a Evolution API expõe os chats/mensagens através de **endpoints do Manager** em vez dos endpoints padrão da API. O sistema agora está configurado para usar esses endpoints corretos.

### Endpoints Descobertos (Status 200 ✓)

```
/manager/api/instance/{instanceId}/chats      ✓ 200
/manager/api/instance/{instanceId}/contacts   ✓ 200
/manager/api/instance/{instanceId}/messages   ✓ 200
```

### Arquivos Atualizados

1. **`lib/evolution-api/client.ts`**
   - `getChats()` agora usa `/manager/api/instance/{id}/chats`
   - `getContacts()` agora usa `/manager/api/instance/{id}/contacts`
   - `getMessages()` agora usa `/manager/api/instance/{id}/messages`
   - Busca automática do `instanceId` pelo nome da instância

2. **`app/api/whatsapp/chats/route.ts`**
   - Busca chats **direto da Evolution API** (sem Supabase)
   - Normaliza formato para o frontend
   - Retorna sempre status 200 com `success: true/false`

3. **`app/api/whatsapp/messages/route.ts`**
   - Busca mensagens **direto da Evolution API** (sem Supabase)
   - Normaliza formato para o frontend
   - Extrai texto de diferentes tipos de mensagem

4. **`app/(dashboard)/whatsapp/page.tsx`**
   - Já estava usando os endpoints corretos
   - Atualiza automaticamente a cada 5 segundos
   - Mostra erro de conexão com botão "Tentar Novamente"

5. **`app/api/whatsapp/discover/route.ts`** (novo)
   - Rota de diagnóstico para descobrir endpoints
   - Útil para debug futuro

## Como funciona agora

### Fluxo de Listagem de Chats

```
Frontend (/whatsapp)
    ↓
GET /api/whatsapp/chats
    ↓
evolutionApi.getChats()
    ↓
GET /manager/api/instance/{id}/chats
    ↓
Evolution Manager
    ↓
Chats em tempo real (sem banco de dados)
```

### Fluxo de Mensagens

```
Frontend (seleciona chat)
    ↓
GET /api/whatsapp/messages?telefone=...
    ↓
evolutionApi.getMessages(remoteJid)
    ↓
GET /manager/api/instance/{id}/messages?remoteJid=...
    ↓
Evolution Manager
    ↓
Mensagens em tempo real (sem banco de dados)
```

### Fluxo de Envio

```
Frontend (digita mensagem)
    ↓
POST /api/whatsapp/send
    ↓
evolutionApi.sendText()
    ↓
POST /message/sendText/{instanceName}
    ↓
Evolution API (endpoint padrão)
    ↓
Mensagem enviada via WhatsApp
```

## Teste Agora

1. **Reinicie o servidor** (se ainda não estiver rodando):
   ```bash
   npm run dev
   ```

2. **Acesse a página WhatsApp**:
   ```
   http://localhost:3000/whatsapp
   ```

3. **O que você deve ver**:
   - ✅ Status "Conectado" no canto superior direito
   - ✅ Lista de conversas na esquerda (as mesmas que aparecem no Evolution Manager)
   - ✅ Ao clicar em uma conversa, as mensagens aparecem na direita
   - ✅ Você pode enviar mensagens e elas aparecem no chat

4. **Se der erro**:
   - Verifique se `EVOLUTION_API_URL`, `EVOLUTION_API_KEY` e `EVOLUTION_INSTANCE_NAME` estão corretos no `.env.local`
   - Verifique se a instância "Medica" está conectada no Evolution Manager
   - Olhe o terminal para ver os logs detalhados

## Diferenças do Sistema Anterior

### ❌ Antes (com tabela `whatsapp_messages`)
- Dependia de webhook para salvar mensagens no Supabase
- Precisava de tabela `whatsapp_messages`
- Mensagens antigas não apareciam se não fossem salvas
- Sincronização manual

### ✅ Agora (direto da Evolution)
- **Sem dependência de tabela no Supabase**
- **Sem dependência de webhook para listagem**
- **Mensagens em tempo real** direto da Evolution
- **Histórico completo** (todas as mensagens que o Evolution tem)
- **Funciona igual ao seu outro sistema**

## Observações Importantes

1. **Tabela `conversas`**: Ainda é usada pela **IA** (n8n), não foi removida
2. **Tabela `leads`**: Ainda é usada para enriquecer dados (nome, etapa, etc.)
3. **Tabela `atendimento_humano`**: Ainda é usada para indicar se o atendimento é humano ou IA
4. **Webhook**: Ainda é útil para a IA processar mensagens, mas não é mais necessário para o frontend do WhatsApp

## Logs para Debug

Todos os logs começam com `[Evolution API]` ou `[WhatsApp Chats]` ou `[WhatsApp Messages]`. Procure por eles no terminal para ver o que está acontecendo.

Exemplo de log de sucesso:
```
[Evolution API] ID da instância "Medica": f88283b4-9171-4b6b-8faa-2f1f32056d15
[Evolution API] Endpoint: /manager/api/instance/f88283b4-9171-4b6b-8faa-2f1f32056d15/chats
[Evolution API] ✓ Chats recebidos: 160
[WhatsApp Chats] ✓ 160 chats formatados
```

---

**Sistema de Gestão de Reservas - Est! Est!! Est!!! Ristorante** 🍝

