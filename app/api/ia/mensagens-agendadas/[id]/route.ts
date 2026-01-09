import { NextRequest, NextResponse } from "next/server"
import { 
  getMensagemAgendadaById,
  updateMensagemAgendada,
  deleteMensagemAgendada 
} from "@/lib/db/mensagens-agendadas"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const mensagem = await getMensagemAgendadaById(id)
    return NextResponse.json(mensagem)
  } catch (error: any) {
    console.error("Erro ao buscar mensagem agendada:", error)
    return NextResponse.json(
      { error: error.message || "Mensagem agendada não encontrada" },
      { status: 404 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    const mensagem = await updateMensagemAgendada(id, body)
    return NextResponse.json(mensagem)
  } catch (error: any) {
    console.error("Erro ao atualizar mensagem agendada:", error)
    return NextResponse.json(
      { error: error.message || "Erro ao atualizar mensagem agendada" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await deleteMensagemAgendada(id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Erro ao deletar mensagem agendada:", error)
    return NextResponse.json(
      { error: error.message || "Erro ao deletar mensagem agendada" },
      { status: 500 }
    )
  }
}

