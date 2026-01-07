import { NextRequest, NextResponse } from "next/server"
import { evolutionApi } from "@/lib/evolution-api/client"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { telefone, message, delay, linkPreview, mediaType, media, caption } = body

    if (!telefone) {
      return NextResponse.json(
        { error: "Telefone é obrigatório" },
        { status: 400 }
      )
    }

    // Verificar se está configurado
    if (!evolutionApi.isConfigured()) {
      return NextResponse.json(
        { error: "Evolution API não configurada. Verifique as variáveis de ambiente." },
        { status: 500 }
      )
    }

    // Verificar se está conectado
    const isConnected = await evolutionApi.isConnected()
    if (!isConnected) {
      return NextResponse.json(
        { error: "Instância do WhatsApp não está conectada. Verifique a conexão." },
        { status: 503 }
      )
    }

    let data

    // Se tem mídia, enviar mídia
    if (mediaType && media) {
      data = await evolutionApi.sendMedia({
        number: telefone,
        media,
        type: mediaType,
        caption: caption || "",
      })
    } else {
      // Caso contrário, enviar texto
      if (!message) {
        return NextResponse.json(
          { error: "Mensagem ou mídia é obrigatória" },
          { status: 400 }
        )
      }

      data = await evolutionApi.sendText({
        number: telefone,
        text: message,
        delay: delay || 1200,
        linkPreview: linkPreview !== false,
      })
    }

    // Salvar no storage próprio do WhatsApp (NÃO usar public.conversas)
    try {
      const supabase = await createClient()
      const instanceName = process.env.EVOLUTION_INSTANCE_NAME || "Bistro"
      const phone = String(telefone || "").replace(/\D/g, "")
      await supabase.from("whatsapp_messages").insert({
        instance_name: instanceName,
        wa_message_id: data?.key?.id || data?.id || null,
        remote_jid: `${phone}@s.whatsapp.net`,
        phone,
        from_me: true,
        message_type: mediaType || "text",
        body: String(message || caption || mediaType || ""),
        timestamp: new Date().toISOString(),
        raw: data,
      })
    } catch (err) {
      console.error("Erro ao salvar mensagem enviada no WhatsApp storage:", err)
    }

    return NextResponse.json({ 
      success: true, 
      data,
      message: "Mensagem enviada com sucesso"
    })
  } catch (error: any) {
    console.error("Erro ao enviar mensagem via Evolution API:", error)
    return NextResponse.json(
      { 
        error: error.message || "Erro ao enviar mensagem",
        details: error.message
      }, 
      { status: 500 }
    )
  }
}

