import { NextRequest, NextResponse } from "next/server"
import { 
  getMensagensAgendadas, 
  createMensagemAgendada,
  FiltrosMensagensAgendadas 
} from "@/lib/db/mensagens-agendadas"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const filters: FiltrosMensagensAgendadas = {}
    
    if (searchParams.get('status')) {
      filters.status = searchParams.get('status') as any
    }
    if (searchParams.get('tipo')) {
      filters.tipo = searchParams.get('tipo') as any
    }
    if (searchParams.get('reserva_id')) {
      filters.reserva_id = searchParams.get('reserva_id')!
    }
    if (searchParams.get('telefone')) {
      filters.telefone = searchParams.get('telefone')!
    }
    if (searchParams.get('data_inicio')) {
      filters.data_inicio = searchParams.get('data_inicio')!
    }
    if (searchParams.get('data_fim')) {
      filters.data_fim = searchParams.get('data_fim')!
    }

    const mensagens = await getMensagensAgendadas(filters)
    return NextResponse.json(mensagens)
  } catch (error: any) {
    console.error("Erro ao buscar mensagens agendadas:", error)
    return NextResponse.json(
      { error: error.message || "Erro ao buscar mensagens agendadas" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      reserva_id, 
      telefone, 
      nome, 
      tipo, 
      mensagem, 
      agendado_para,
      status 
    } = body

    // Validações
    if (!telefone || !nome || !tipo || !mensagem || !agendado_para) {
      return NextResponse.json(
        { error: "Campos obrigatórios: telefone, nome, tipo, mensagem, agendado_para" },
        { status: 400 }
      )
    }

    if (!['confirmacao', 'cancelamento', 'atraso', 'lembrete'].includes(tipo)) {
      return NextResponse.json(
        { error: "Tipo inválido. Valores permitidos: confirmacao, cancelamento, atraso, lembrete" },
        { status: 400 }
      )
    }

    const mensagemCriada = await createMensagemAgendada({
      reserva_id: reserva_id || null,
      telefone,
      nome,
      tipo,
      mensagem,
      agendado_para,
      status: status || 'pendente',
    })

    return NextResponse.json(mensagemCriada, { status: 201 })
  } catch (error: any) {
    console.error("Erro ao criar mensagem agendada:", error)
    return NextResponse.json(
      { error: error.message || "Erro ao criar mensagem agendada" },
      { status: 500 }
    )
  }
}

