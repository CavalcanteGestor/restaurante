import { NextRequest, NextResponse } from "next/server"
import { getConversas } from "@/lib/db/conversas"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const numero = searchParams.get("numero")
    const sessionid = searchParams.get("sessionid")

    const conversas = await getConversas({
      numero: numero || undefined,
      sessionid: sessionid || undefined,
    })

    return NextResponse.json(conversas)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { numero, nome, mensagem_ia, mensagem_lead, data_mensagem, sessionid } = body

    // Validar tipos
    if (!numero || typeof numero !== 'string') {
      return NextResponse.json(
        { error: "Número é obrigatório e deve ser uma string" },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from("conversas")
      .insert({
        numero: String(numero),
        nome: nome ? String(nome) : null,
        mensagem_ia: mensagem_ia ? String(mensagem_ia) : null,
        mensagem_lead: mensagem_lead ? String(mensagem_lead) : null,
        data_mensagem: data_mensagem ? String(data_mensagem) : new Date().toISOString(),
        sessionid: sessionid ? String(sessionid) : null,
      })
      .select()
      .single()

    if (error) {
      console.error("Erro ao inserir conversa:", error)
      throw error
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    console.error("Erro na API de conversas:", error)
    return NextResponse.json(
      { 
        error: error.message || "Erro ao criar conversa",
        code: error.code,
        details: error.details
      }, 
      { status: 500 }
    )
  }
}
