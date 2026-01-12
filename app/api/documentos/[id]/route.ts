import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/user"
import { getDocumentoById, updateDocumento, deleteDocumento } from "@/lib/db/documentos"
import { createClient } from "@/lib/supabase/server"

/**
 * GET - Busca um documento por ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const documento = await getDocumentoById(id)

    if (!documento) {
      return NextResponse.json(
        { error: "Documento não encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json({ documento })
  } catch (error: any) {
    console.error("Erro ao buscar documento:", error)
    return NextResponse.json(
      { error: error.message || "Erro ao buscar documento" },
      { status: 500 }
    )
  }
}

/**
 * PATCH - Atualiza um documento
 * Requer autenticação de admin
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores podem atualizar documentos." },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()

    const documento = await updateDocumento(id, body)

    return NextResponse.json({ documento })
  } catch (error: any) {
    console.error("Erro ao atualizar documento:", error)
    return NextResponse.json(
      { error: error.message || "Erro ao atualizar documento" },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Remove um documento
 * Requer autenticação de admin
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores podem excluir documentos." },
        { status: 403 }
      )
    }

    const { id } = await params

    // Buscar documento para obter o caminho do arquivo
    const documento = await getDocumentoById(id)
    if (!documento) {
      return NextResponse.json(
        { error: "Documento não encontrado" },
        { status: 404 }
      )
    }

    // Extrair caminho do arquivo da URL
    // A URL do Supabase Storage tem formato: https://[project].supabase.co/storage/v1/object/public/documentos/[path]
    const url = new URL(documento.arquivo_url)
    const pathParts = url.pathname.split('/')
    const documentosIndex = pathParts.indexOf('documentos')
    const filePath = documentosIndex >= 0 ? pathParts.slice(documentosIndex + 1).join('/') : null
    
    if (!filePath) {
      console.warn("Não foi possível extrair o caminho do arquivo da URL")
    }

    const supabase = await createClient()

    // Tentar remover arquivo do storage (ignorar erro se não existir)
    if (filePath) {
      try {
        const { error: storageError } = await supabase.storage
          .from('documentos')
          .remove([filePath])
        if (storageError) {
          console.warn("Erro ao remover arquivo do storage (continuando):", storageError)
        }
      } catch (storageError) {
        console.warn("Erro ao remover arquivo do storage (continuando):", storageError)
      }
    }

    // Remover registro da tabela
    await deleteDocumento(id)

    return NextResponse.json({ message: "Documento removido com sucesso" })
  } catch (error: any) {
    console.error("Erro ao excluir documento:", error)
    return NextResponse.json(
      { error: error.message || "Erro ao excluir documento" },
      { status: 500 }
    )
  }
}
