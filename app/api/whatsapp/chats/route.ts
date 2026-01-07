import { NextRequest, NextResponse } from "next/server"
import { evolutionApi } from "@/lib/evolution-api/client"
import { createClient } from "@/lib/supabase/server"
import { evolutionCache } from "@/lib/evolution-api/cache"

/**
 * GET /api/whatsapp/chats
 * Busca lista de chats com TODOS os dados (nome, foto, última mensagem)
 * Usa cache para contatos (1977 contatos demora 6s, cache reduz para 0s)
 */
export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now()

    // Verificar configuração
    if (!evolutionApi.isConfigured()) {
      return NextResponse.json({
        success: false,
        error: "Evolution API não configurada",
        chats: [],
      })
    }

    // Verificar conexão (cache de 30s)
    let isConnected = evolutionCache.get<boolean>('connection_status')
    if (isConnected === null) {
      isConnected = await evolutionApi.isConnected()
      evolutionCache.set('connection_status', isConnected, 0.5) // 30 segundos
    }

    if (!isConnected) {
      return NextResponse.json({
        success: false,
        error: "WhatsApp desconectado",
        chats: [],
      })
    }

    // 1. Buscar CONTATOS (CACHE de 10 minutos - contatos não mudam tanto)
    let rawContacts = evolutionCache.get<any[]>('contacts')
    if (!rawContacts) {
      console.log('[WhatsApp Chats] Buscando contatos da Evolution...')
      rawContacts = await evolutionApi.getContacts()
      evolutionCache.set('contacts', rawContacts, 10) // Cache por 10 minutos
      console.log(`[WhatsApp Chats] ✓ ${rawContacts.length} contatos salvos no cache`)
    } else {
      console.log(`[WhatsApp Chats] ✓ ${rawContacts.length} contatos (cache)`)
    }

    // 2. Buscar CHATS (SEM cache - precisamos da última mensagem atualizada)
    const rawChats = await evolutionApi.getChats()
    console.log(`[WhatsApp Chats] ✓ ${rawChats.length} chats`)

    // 3. Criar map de contatos para acesso rápido (chave = remoteJid)
    const contactsMap = new Map()
    rawContacts.forEach((contact: any) => {
      const remoteJid = contact.remoteJid || contact.id || contact.jid || ""
      if (remoteJid) {
        contactsMap.set(remoteJid, {
          pushName: contact.pushName || contact.name || null,
          profilePicUrl: contact.profilePicUrl || null,
        })
      }
    })

    // 4. Combinar chats com contatos
    const supabase = await createClient()
    const { data: leads } = await supabase.from('leads').select('*')
    const { data: atendimentos } = await supabase.from('atendimento_humano').select('*').eq('ativo', true)

    const chatsFormatados = rawChats
      .map((chat: any) => {
        // Pegar remoteJid CORRETO (pode ser @lid, @g.us, ou @s.whatsapp.net)
        const remoteJid = chat.remoteJid || chat.id || ""
        if (!remoteJid) return null

        // Extrair telefone (remover qualquer sufixo @...)
        const telefone = remoteJid.replace(/@.*/, "").replace(/\D/g, "")
        if (!telefone) return null

        // Pegar info do contato usando o remoteJid COMPLETO como chave
        const contactInfo = contactsMap.get(remoteJid) || {}
        
        // Pegar info do lead e atendimento humano
        const lead = leads?.find(l => l.telefone === telefone)
        const atendimento = atendimentos?.find(a => a.phone === telefone)

        // Extrair última mensagem
        let lastMessageText = ""
        const lastMsg = chat.lastMessage
        if (lastMsg?.message) {
          const msg = lastMsg.message
          if (typeof msg === 'string') {
            lastMessageText = msg
          } else if (msg.conversation) {
            lastMessageText = typeof msg.conversation === 'string' ? msg.conversation : '[Mensagem]'
          } else if (msg.extendedTextMessage?.text) {
            lastMessageText = msg.extendedTextMessage.text
          } else if (msg.imageMessage) {
            lastMessageText = '[Imagem]'
          } else if (msg.videoMessage) {
            lastMessageText = '[Vídeo]'
          } else if (msg.audioMessage) {
            lastMessageText = '[Áudio]'
          } else if (msg.documentMessage) {
            lastMessageText = '[Documento]'
          }
        }

        // Prioridade de nome: Lead > pushName > telefone (sempre mostrar algo)
        const nome = lead?.nome || contactInfo.pushName || telefone || "Sem nome"

        // Extrair timestamp correto
        let messageTimestamp = Date.now()
        if (lastMsg?.messageTimestamp) {
          messageTimestamp = typeof lastMsg.messageTimestamp === 'number' 
            ? lastMsg.messageTimestamp 
            : parseInt(String(lastMsg.messageTimestamp))
        } else if (lastMsg?.timestamp) {
          messageTimestamp = typeof lastMsg.timestamp === 'number' 
            ? lastMsg.timestamp 
            : parseInt(String(lastMsg.timestamp))
        }

        // Converter Unix segundos para milissegundos se necessário
        if (messageTimestamp < 10000000000) {
          messageTimestamp = messageTimestamp * 1000
        }

        return {
          id: remoteJid,
          remoteJid: remoteJid, // Passar remoteJid REAL
          telefone,
          nome,
          lastMessage: lastMessageText,
          timestamp: messageTimestamp,
          unreadCount: chat.unreadCount || 0,
          profilePicUrl: contactInfo.profilePicUrl || null,
          atendimentoHumano: atendimento?.ativo || false,
          lead: lead || undefined,
        }
      })
      .filter(Boolean) // Remove nulls

    // Ordenar por timestamp (mais recente primeiro)
    chatsFormatados.sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0))

    const endTime = Date.now()
    console.log(`[WhatsApp Chats] ✓ ${chatsFormatados.length} conversas (${endTime - startTime}ms)`)

    return NextResponse.json({
      success: true,
      chats: chatsFormatados,
    })
  } catch (error: any) {
    console.error("[WhatsApp Chats] Erro:", error.message)
    return NextResponse.json({
      success: false,
      error: error.message || "Erro ao buscar chats",
      chats: [],
    })
  }
}
