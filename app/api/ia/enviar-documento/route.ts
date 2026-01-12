import { NextRequest, NextResponse } from "next/server"
import { getDocumentoAtivoPorTipo, TipoDocumento } from "@/lib/db/documentos"
import { evolutionApi } from "@/lib/evolution-api/client"

/**
 * POST - Envia um documento via WhatsApp (usado pela IA)
 * Endpoint público para uso pela IA (n8n)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { telefone, tipo, documento_id } = body

    if (!telefone) {
      return NextResponse.json(
        { error: "Telefone é obrigatório" },
        { status: 400 }
      )
    }

    // Verificar se Evolution API está configurada
    if (!evolutionApi.isConfigured()) {
      return NextResponse.json(
        { error: "Evolution API não configurada" },
        { status: 500 }
      )
    }

    // Verificar se está conectado
    const isConnected = await evolutionApi.isConnected()
    if (!isConnected) {
      return NextResponse.json(
        { error: "Instância do WhatsApp não está conectada" },
        { status: 503 }
      )
    }

    let documento

    // Se foi fornecido documento_id, buscar por ID
    if (documento_id) {
      const { getDocumentoById } = await import("@/lib/db/documentos")
      documento = await getDocumentoById(documento_id)
    } 
    // Caso contrário, buscar o documento ativo mais recente do tipo
    else if (tipo) {
      const tiposValidos: TipoDocumento[] = ['cardapio', 'cartela_videos', 'restaurante']
      if (!tiposValidos.includes(tipo)) {
        return NextResponse.json(
          { error: `Tipo inválido. Tipos válidos: ${tiposValidos.join(', ')}` },
          { status: 400 }
        )
      }
      documento = await getDocumentoAtivoPorTipo(tipo)
    } else {
      return NextResponse.json(
        { error: "Tipo ou documento_id é obrigatório" },
        { status: 400 }
      )
    }

    if (!documento) {
      return NextResponse.json(
        { error: "Documento não encontrado" },
        { status: 404 }
      )
    }

    if (!documento.ativo) {
      return NextResponse.json(
        { error: "Documento está inativo" },
        { status: 400 }
      )
    }

    // Buscar o arquivo do Supabase Storage e converter para base64
    // Para enviar via Evolution API, precisamos da URL pública ou base64
    // Vamos usar a URL pública diretamente
    const arquivoUrl = documento.arquivo_url

    // Enviar documento via WhatsApp
    await evolutionApi.sendMedia({
      number: telefone,
      media: arquivoUrl,
      type: 'document',
      caption: documento.descricao || documento.titulo,
    })

    return NextResponse.json({ 
      success: true,
      message: "Documento enviado com sucesso",
      documento: {
        id: documento.id,
        titulo: documento.titulo,
        tipo: documento.tipo,
      }
    })
  } catch (error: any) {
    console.error("Erro ao enviar documento:", error)
    return NextResponse.json(
      { error: error.message || "Erro ao enviar documento" },
      { status: 500 }
    )
  }
}
