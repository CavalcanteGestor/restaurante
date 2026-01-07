import { NextRequest, NextResponse } from "next/server"
import { getMensagensAutomaticas, getEstatisticasMensagens } from "@/lib/db/mensagens-automaticas"

/**
 * GET /api/automatizacoes/mensagens
 * Lista mensagens automáticas com filtros
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const filters = {
      reserva_id: searchParams.get('reserva_id') || undefined,
      telefone: searchParams.get('telefone') || undefined,
      tipo: searchParams.get('tipo') || undefined,
      status: searchParams.get('status') || undefined,
      data_inicio: searchParams.get('data_inicio') || undefined,
      data_fim: searchParams.get('data_fim') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
    }

    const mensagens = await getMensagensAutomaticas(filters)

    // Buscar estatísticas se solicitado
    const incluirStats = searchParams.get('stats') === 'true'
    let estatisticas = null
    if (incluirStats) {
      estatisticas = await getEstatisticasMensagens(filters.data_inicio, filters.data_fim)
    }

    return NextResponse.json({
      success: true,
      mensagens,
      total: mensagens.length,
      ...(estatisticas && { estatisticas }),
    })
  } catch (error: any) {
    console.error("[Mensagens Automáticas] Erro:", error)
    return NextResponse.json(
      { error: error.message || "Erro ao buscar mensagens" },
      { status: 500 }
    )
  }
}

