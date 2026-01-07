import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * GET /api/search?q=termo
 * Busca global no sistema (reservas, leads, clientes, mesas)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("q")

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] })
    }

    const supabase = await createClient()
    const results: any[] = []

    // Buscar Reservas
    const { data: reservas } = await supabase
      .from('reservas')
      .select('id, nome, telefone, data_reserva, horario_reserva, etapa')
      .or(`nome.ilike.%${query}%,telefone.ilike.%${query}%`)
      .limit(5)

    reservas?.forEach(r => {
      results.push({
        type: 'reserva',
        id: r.id,
        title: r.nome,
        subtitle: `${r.telefone} • ${r.data_reserva} • ${r.horario_reserva}`,
        href: `/reservas/${r.id}`,
      })
    })

    // Buscar Leads
    const { data: leads } = await supabase
      .from('leads')
      .select('id, nome, telefone, etapa')
      .or(`nome.ilike.%${query}%,telefone.ilike.%${query}%`)
      .limit(5)

    leads?.forEach(l => {
      results.push({
        type: 'lead',
        id: String(l.id),
        title: l.nome || l.telefone,
        subtitle: `${l.telefone} • Etapa: ${l.etapa}`,
        href: `/leads/${l.id}`,
      })
    })

    // Buscar Mesas (por número)
    const { data: mesas } = await supabase
      .from('mesas')
      .select('numero, ambiente, capacidade, disponivel')
      .ilike('numero', `%${query}%`)
      .limit(5)

    mesas?.forEach(m => {
      results.push({
        type: 'mesa',
        id: m.numero,
        title: `Mesa ${m.numero}`,
        subtitle: `${m.ambiente || 'N/A'} • ${m.capacidade} pessoas • ${m.disponivel ? 'Disponível' : 'Indisponível'}`,
        href: `/mesas/${m.numero}`,
      })
    })

    return NextResponse.json({
      success: true,
      results,
      total: results.length,
    })
  } catch (error: any) {
    console.error("[Search] Erro:", error.message)
    return NextResponse.json({
      success: false,
      error: error.message,
      results: [],
    })
  }
}

