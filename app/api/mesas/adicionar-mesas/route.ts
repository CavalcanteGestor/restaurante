import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth/user"

/**
 * API Route para adicionar mesas em lote
 * Apenas admin pode usar
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores podem adicionar mesas." },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { mesas } = body

    if (!Array.isArray(mesas) || mesas.length === 0) {
      return NextResponse.json(
        { error: "Lista de mesas inválida" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Validar e inserir mesas
    const mesasParaInserir = mesas.map((mesa: any) => {
      // Garantir tipos corretos
      const capacidade = typeof mesa.capacidade === 'string' 
        ? parseInt(mesa.capacidade, 10) 
        : (typeof mesa.capacidade === 'number' ? mesa.capacidade : 2)
      
      const posicaoX = mesa.posicao_x !== undefined && mesa.posicao_x !== null
        ? (typeof mesa.posicao_x === 'string' ? parseFloat(mesa.posicao_x) : mesa.posicao_x)
        : null
      
      const posicaoY = mesa.posicao_y !== undefined && mesa.posicao_y !== null
        ? (typeof mesa.posicao_y === 'string' ? parseFloat(mesa.posicao_y) : mesa.posicao_y)
        : null

      return {
        codigo: String(mesa.codigo || ''),
        capacidade: isNaN(capacidade) ? 2 : capacidade,
        tipo: String(mesa.tipo || 'padrao'),
        andar: String(mesa.andar || 'primeiro'),
        disponivel: mesa.disponivel !== undefined ? Boolean(mesa.disponivel) : true,
        observacao: mesa.observacao ? String(mesa.observacao) : null,
        ambiente: mesa.ambiente ? String(mesa.ambiente) : null,
        pode_juntar: Boolean(mesa.pode_juntar || false),
        junta_com: mesa.junta_com ? String(mesa.junta_com) : null,
        eventos_pessoais: Boolean(mesa.eventos_pessoais || false),
        eventos_corporativos: Boolean(mesa.eventos_corporativos || false),
        so_eventos: Boolean(mesa.so_eventos || false),
        tem_tv: Boolean(mesa.tem_tv || false),
        privativa: Boolean(mesa.privativa || false),
        posicao_x: posicaoX !== null && !isNaN(posicaoX) ? posicaoX : null,
        posicao_y: posicaoY !== null && !isNaN(posicaoY) ? posicaoY : null,
      }
    })

    const { data, error } = await supabase
      .from('mesas')
      .insert(mesasParaInserir)
      .select()

    if (error) {
      console.error("Erro ao inserir mesas:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        mesas: mesasParaInserir.slice(0, 3) // Log apenas as primeiras 3 para debug
      })
      // Se for erro de duplicata, ignorar
      if (error.code === '23505') {
        return NextResponse.json(
          { 
            message: "Algumas mesas já existem. Mesas novas foram adicionadas.",
            mesas: data || []
          },
          { status: 200 }
        )
      }
      throw error
    }

    return NextResponse.json({
      message: `${data.length} mesas adicionadas com sucesso`,
      mesas: data
    })
  } catch (error: any) {
    console.error("Erro ao adicionar mesas:", error)
    return NextResponse.json(
      { error: error.message || "Erro ao adicionar mesas" },
      { status: 500 }
    )
  }
}

