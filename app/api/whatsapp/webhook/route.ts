import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * POST - Webhook para receber mensagens do Evolution API
 * Configure este endpoint no Evolution API como webhook
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Evolution API envia eventos no formato:
    // { event: 'messages.upsert', data: { key: {...}, message: {...} } }
    const { event, data } = body

    if (event === 'messages.upsert') {
      const message = data?.message
      const key = data?.key

      if (!message || !key) {
        return NextResponse.json({ received: true })
      }

      const remoteJid = key.remoteJid
      const messageText = message.conversation || message.extendedTextMessage?.text || ''
      const messageTimestamp = message.messageTimestamp || Date.now()
      const waMessageId = key.id || null
      const fromMe = !!key.fromMe

      // Extrair número do JID (remove @s.whatsapp.net)
      const telefone = String(remoteJid || '').replace(/@.*/, '').replace(/\D/g, '')

      if (!telefone || !messageText) {
        return NextResponse.json({ received: true })
      }

      const supabase = await createClient()

      // Buscar ou criar lead
      let { data: lead } = await supabase
        .from('leads')
        .select('*')
        .eq('telefone', telefone)
        .single()

      if (!lead) {
        // Criar novo lead
        const { data: newLead } = await supabase
          .from('leads')
          .insert({
            telefone,
            nome: telefone, // Nome padrão, será atualizado depois
            etapa: 'interesse',
          })
          .select()
          .single()

        lead = newLead
      }

      // Salvar mensagem no storage do WhatsApp (NÃO usar public.conversas)
      const tsNumber = typeof messageTimestamp === 'number' ? messageTimestamp : Date.now()
      const tsMs = tsNumber > 1_000_000_000_000 ? tsNumber : tsNumber * 1000
      const timestampIso = new Date(tsMs).toISOString()

      const instanceName =
        body?.instanceName ||
        body?.instance ||
        data?.instanceName ||
        data?.instance ||
        process.env.EVOLUTION_INSTANCE_NAME ||
        'default'

      await supabase
        .from('whatsapp_messages')
        .insert({
          instance_name: String(instanceName),
          wa_message_id: waMessageId ? String(waMessageId) : null,
          remote_jid: String(remoteJid || ''),
          phone: String(telefone),
          from_me: fromMe,
          message_type: 'text',
          body: String(messageText || ''),
          timestamp: timestampIso,
          raw: body,
        })

      // Atualizar data da última mensagem do lead
      if (lead) {
        await supabase
          .from('leads')
          .update({ data_ultima_msg: timestampIso })
          .eq('id', lead.id)
      }
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error("Erro no webhook do Evolution API:", error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

