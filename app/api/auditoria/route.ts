import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/user"
import { getAuditoria } from "@/lib/db/auditoria"

/**
 * GET - Busca registros de auditoria
 * Apenas administradores podem acessar
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores podem visualizar auditoria." },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get('user_id')
    const module = searchParams.get('module')
    const action = searchParams.get('action')
    const data_inicio = searchParams.get('data_inicio')
    const data_fim = searchParams.get('data_fim')
    const limit = searchParams.get('limit')

    const registros = await getAuditoria({
      user_id: user_id || undefined,
      module: module || undefined,
      action: action || undefined,
      data_inicio: data_inicio || undefined,
      data_fim: data_fim || undefined,
      limit: limit ? parseInt(limit) : undefined,
    })

    return NextResponse.json({ registros })
  } catch (error: any) {
    console.error("Erro ao buscar auditoria:", error)
    return NextResponse.json(
      { error: error.message || "Erro ao buscar auditoria" },
      { status: 500 }
    )
  }
}
