import { NextRequest, NextResponse } from "next/server"

/**
 * GET /api/cron/verificar-mensagens
 * Endpoint para ser chamado por cron job (Vercel Cron, n8n, etc)
 * 
 * Autenticação via header secreto ou query param
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'default-secret-change-in-production'
    const querySecret = request.nextUrl.searchParams.get('secret')

    if (authHeader !== `Bearer ${cronSecret}` && querySecret !== cronSecret) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Chamar a lógica de verificação
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin
    const response = await fetch(`${baseUrl}/api/automatizacoes/verificar-nao-comparecimento`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const result = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Erro ao verificar mensagens',
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      ...result,
      executadoEm: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("[Cron Verificar Mensagens] Erro:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erro ao executar cron job",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

// Também aceita POST para compatibilidade
export async function POST(request: NextRequest) {
  return GET(request)
}

