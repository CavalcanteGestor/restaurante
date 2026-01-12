import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth/user"
import { createDocumento, TipoDocumento } from "@/lib/db/documentos"
import { logAuditoria } from "@/lib/db/auditoria"

/**
 * POST - Upload de arquivo PDF para o Supabase Storage
 * Requer autenticação de admin
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores podem fazer upload." },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const tipo = formData.get('tipo') as TipoDocumento
    const titulo = formData.get('titulo') as string
    const descricao = formData.get('descricao') as string | null
    const ordem = formData.get('ordem') as string | null

    if (!file || !tipo || !titulo) {
      return NextResponse.json(
        { error: "Arquivo, tipo e título são obrigatórios" },
        { status: 400 }
      )
    }

    // Validar tipo de arquivo (apenas PDF)
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json(
        { error: "Apenas arquivos PDF são permitidos" },
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

    const supabase = await createClient()

    // Gerar nome único para o arquivo
    const timestamp = Date.now()
    const nomeLimpo = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${tipo}/${timestamp}_${nomeLimpo}`

    // Upload para Supabase Storage (bucket: documentos)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documentos')
      .upload(fileName, file, {
        contentType: 'application/pdf',
        upsert: false,
      })

    if (uploadError) {
      console.error("Erro no upload:", uploadError)
      return NextResponse.json(
        { error: `Erro ao fazer upload: ${uploadError.message}` },
        { status: 500 }
      )
    }

    // Obter URL pública do arquivo
    const { data: urlData } = supabase.storage
      .from('documentos')
      .getPublicUrl(fileName)

    const arquivoUrl = urlData.publicUrl

    // Criar registro na tabela documentos
    const documento = await createDocumento({
      tipo,
      titulo,
      descricao: descricao || null,
      arquivo_url: arquivoUrl,
      arquivo_nome: file.name,
      arquivo_tamanho: file.size,
      ordem: ordem ? parseInt(ordem) : 0,
      ativo: true,
    })

    // Registrar auditoria
    await logAuditoria(
      'CREATE',
      'DOCUMENTOS',
      `Documento criado: ${titulo} (${tipo})`,
      documento.id,
      { tipo, titulo, arquivo_nome: file.name, arquivo_tamanho: file.size },
      request
    )

    return NextResponse.json({ 
      documento,
      message: "Upload realizado com sucesso"
    }, { status: 201 })
  } catch (error: any) {
    console.error("Erro ao fazer upload:", error)
    return NextResponse.json(
      { error: error.message || "Erro ao fazer upload" },
      { status: 500 }
    )
  }
}
