import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth/user"
import { getDocumentos, createDocumento, TipoDocumento } from "@/lib/db/documentos"

/**
 * GET - Lista todos os documentos ativos (ou de um tipo específico)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tipo = searchParams.get('tipo') as TipoDocumento | null

    const documentos = await getDocumentos(tipo || undefined)

    return NextResponse.json({ documentos })
  } catch (error: any) {
    console.error("Erro ao buscar documentos:", error)
    return NextResponse.json(
      { error: error.message || "Erro ao buscar documentos" },
      { status: 500 }
    )
  }
}

/**
 * POST - Cria um novo documento
 * Requer autenticação de admin
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores podem criar documentos." },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { tipo, titulo, descricao, arquivo_url, arquivo_nome, arquivo_tamanho, ordem } = body

    if (!tipo || !titulo || !arquivo_url || !arquivo_nome) {
      return NextResponse.json(
        { error: "Tipo, título, arquivo_url e arquivo_nome são obrigatórios" },
        { status: 400 }
      )
    }

    // Validar tipo
    const tiposValidos: TipoDocumento[] = ['cardapio', 'cartela_videos', 'restaurante']
    if (!tiposValidos.includes(tipo)) {
      return NextResponse.json(
        { error: `Tipo inválido. Tipos válidos: ${tiposValidos.join(', ')}` },
        { status: 400 }
      )
    }

    const documento = await createDocumento({
      tipo,
      titulo,
      descricao: descricao || null,
      arquivo_url,
      arquivo_nome,
      arquivo_tamanho: arquivo_tamanho || null,
      ordem: ordem || 0,
      ativo: true,
    })

    return NextResponse.json({ documento }, { status: 201 })
  } catch (error: any) {
    console.error("Erro ao criar documento:", error)
    return NextResponse.json(
      { error: error.message || "Erro ao criar documento" },
      { status: 500 }
    )
  }
}
