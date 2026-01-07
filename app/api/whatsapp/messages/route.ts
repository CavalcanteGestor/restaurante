import { NextRequest, NextResponse } from "next/server"
import { evolutionApi } from "@/lib/evolution-api/client"

/**
 * GET /api/whatsapp/messages?telefone=5511999999999&limit=50
 * Busca mensagens de um chat específico com TODOS os dados formatados
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const remoteJid = searchParams.get("remoteJid") // Usar remoteJid direto
    const telefone = searchParams.get("telefone") // Fallback para telefone
    const limit = parseInt(searchParams.get("limit") || "100")

    if (!remoteJid && !telefone) {
      return NextResponse.json(
        { success: false, error: "remoteJid ou telefone não fornecido", messages: [] },
        { status: 400 }
      )
    }

    const jid = remoteJid || `${telefone}@s.whatsapp.net`
    // Verificar configuração
    if (!evolutionApi.isConfigured()) {
      return NextResponse.json({
        success: false,
        error: "Evolution API não configurada",
        messages: [],
      })
    }

    // Verificar conexão
    const isConnected = await evolutionApi.isConnected()
    if (!isConnected) {
      return NextResponse.json({
        success: false,
        error: "WhatsApp desconectado",
        messages: [],
      })
    }

    // Buscar mensagens usando o remoteJid REAL
    console.log(`[WhatsApp Messages] Buscando: ${jid}`)
    const rawMessages = await evolutionApi.getMessages(jid, limit)

    console.log(`[WhatsApp Messages] Resposta bruta (tipo):`, typeof rawMessages, Array.isArray(rawMessages))
    
    // Processar formato da resposta
    let messagesList: any[] = []
    if (Array.isArray(rawMessages)) {
      messagesList = rawMessages
    } else if (rawMessages?.messages?.records) {
      messagesList = rawMessages.messages.records
    } else if (rawMessages?.messages && Array.isArray(rawMessages.messages)) {
      messagesList = rawMessages.messages
    } else if (rawMessages?.records) {
      messagesList = rawMessages.records
    }

    console.log(`[WhatsApp Messages] ✓ ${messagesList.length} mensagens encontradas`)

    // Log da primeira mensagem para debug
    if (messagesList.length > 0) {
      console.log("[WhatsApp Messages] Exemplo de mensagem:", JSON.stringify(messagesList[0]).substring(0, 500))
    }

    // Função para extrair texto da mensagem
    const extractMessageText = (message: any): string => {
      if (!message) return "[Mensagem]"
      if (typeof message === 'string') return message
      
      try {
        if (message.conversation) {
          return typeof message.conversation === 'string' ? message.conversation : '[Mensagem]'
        }
        if (message.extendedTextMessage?.text) return message.extendedTextMessage.text
        if (message.imageMessage?.caption) return `[Imagem] ${message.imageMessage.caption}`
        if (message.imageMessage) return '[Imagem]'
        if (message.videoMessage?.caption) return `[Vídeo] ${message.videoMessage.caption}`
        if (message.videoMessage) return '[Vídeo]'
        if (message.audioMessage) return '[Áudio]'
        if (message.documentMessage) return `[Documento] ${message.documentMessage.fileName || ''}`
        if (message.stickerMessage) return '[Figurinha]'
        if (message.locationMessage) return '[Localização]'
        if (message.contactMessage) return `[Contato] ${message.contactMessage.displayName || ''}`
        
        return '[Mensagem]'
      } catch (e) {
        return '[Mensagem]'
      }
    }

    // Normalizar mensagens
    const mensagensFormatadas = messagesList.map((msg: any, index: number) => {
      const key = msg.key || {}
      const message = msg.message || {}
      
      // Extrair timestamp (pode estar em vários formatos)
      let timestamp: number
      if (msg.messageTimestamp) {
        timestamp = typeof msg.messageTimestamp === 'number' ? msg.messageTimestamp : parseInt(String(msg.messageTimestamp))
      } else if (msg.timestamp) {
        timestamp = typeof msg.timestamp === 'number' ? msg.timestamp : parseInt(String(msg.timestamp))
      } else {
        timestamp = Math.floor(Date.now() / 1000) - (messagesList.length - index) // Fallback
      }

      // Converter Unix segundos para milissegundos se necessário
      if (timestamp < 10000000000) {
        timestamp = timestamp * 1000
      }

      return {
        id: key.id || msg.id || `${index}-${Date.now()}`,
        fromMe: Boolean(key.fromMe),
        message: extractMessageText(message),
        timestamp: timestamp,
      }
    })

    // Ordenar por timestamp (mais antigo primeiro)
    mensagensFormatadas.sort((a, b) => a.timestamp - b.timestamp)

    console.log(`[WhatsApp Messages] ✓ ${mensagensFormatadas.length} mensagens`)

    return NextResponse.json({
      success: true,
      messages: mensagensFormatadas,
    })
  } catch (error: any) {
    console.error("[WhatsApp Messages] Erro:", error.message)
    return NextResponse.json({
      success: false,
      error: error.message || "Erro ao buscar mensagens",
      messages: [],
    })
  }
}
