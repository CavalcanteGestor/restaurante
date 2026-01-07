import { NextRequest, NextResponse } from "next/server"
import { 
  getAllConfiguracoesMensagens, 
  getConfiguracaoMensagem,
  createConfiguracaoMensagem,
  updateConfiguracaoMensagem,
  deleteConfiguracaoMensagem,
  processarTemplate
} from "@/lib/db/configuracoes-mensagens"

/**
 * GET /api/automatizacoes/configuracoes-mensagens
 * Lista todas as configurações de mensagens
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tipo = searchParams.get('tipo')

    if (tipo) {
      const config = await getConfiguracaoMensagem(tipo)
      return NextResponse.json({
        success: true,
        configuracao: config,
      })
    }

    const configuracoes = await getAllConfiguracoesMensagens()
    return NextResponse.json({
      success: true,
      configuracoes,
    })
  } catch (error: any) {
    console.error("[Configurações Mensagens] Erro:", error)
    return NextResponse.json(
      { error: error.message || "Erro ao buscar configurações" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/automatizacoes/configuracoes-mensagens
 * Cria nova configuração de mensagem
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tipo, template, posicao_nome, placeholder_nome, ativo } = body

    if (!tipo || !template) {
      return NextResponse.json(
        { error: "Tipo e template são obrigatórios" },
        { status: 400 }
      )
    }

    const configuracao = await createConfiguracaoMensagem({
      tipo,
      template,
      posicao_nome: posicao_nome || 'inicio',
      placeholder_nome: placeholder_nome || '{nome}',
      ativo: ativo !== undefined ? ativo : true,
    })

    return NextResponse.json({
      success: true,
      configuracao,
    })
  } catch (error: any) {
    console.error("[Configurações Mensagens] Erro:", error)
    return NextResponse.json(
      { error: error.message || "Erro ao criar configuração" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/automatizacoes/configuracoes-mensagens
 * Atualiza configuração existente
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, template, posicao_nome, placeholder_nome, ativo } = body

    if (!id) {
      return NextResponse.json(
        { error: "ID é obrigatório" },
        { status: 400 }
      )
    }

    const configuracao = await updateConfiguracaoMensagem(id, {
      template,
      posicao_nome,
      placeholder_nome,
      ativo,
    })

    return NextResponse.json({
      success: true,
      configuracao,
    })
  } catch (error: any) {
    console.error("[Configurações Mensagens] Erro:", error)
    return NextResponse.json(
      { error: error.message || "Erro ao atualizar configuração" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/automatizacoes/configuracoes-mensagens
 * Deleta configuração
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: "ID é obrigatório" },
        { status: 400 }
      )
    }

    await deleteConfiguracaoMensagem(id)

    return NextResponse.json({
      success: true,
      message: "Configuração deletada com sucesso",
    })
  } catch (error: any) {
    console.error("[Configurações Mensagens] Erro:", error)
    return NextResponse.json(
      { error: error.message || "Erro ao deletar configuração" },
      { status: 500 }
    )
  }
}

