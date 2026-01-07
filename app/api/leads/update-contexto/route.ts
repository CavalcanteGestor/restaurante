import { NextRequest, NextResponse } from "next/server"
import { updateLeadByTelefone, getLeadByTelefone } from "@/lib/db/leads"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { telefone, contexto } = body

    if (!telefone || !contexto) {
      return NextResponse.json(
        { error: "Telefone e contexto são obrigatórios" },
        { status: 400 }
      )
    }

    const lead = await getLeadByTelefone(telefone)
    
    if (!lead) {
      return NextResponse.json(
        { error: "Lead não encontrado" },
        { status: 404 }
      )
    }

    const contextoAtualizado = lead.contexto
      ? `${lead.contexto}\n\n${contexto}`
      : contexto

    await updateLeadByTelefone(telefone, {
      contexto: contextoAtualizado,
      data_ultima_msg: new Date().toISOString(),
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

