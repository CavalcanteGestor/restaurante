import { NextRequest, NextResponse } from "next/server"
import { evolutionApi } from "@/lib/evolution-api/client"

/**
 * GET - Verifica status da instância Evolution API
 */
export async function GET(request: NextRequest) {
  try {
    if (!evolutionApi.isConfigured()) {
      return NextResponse.json({
        configured: false,
        connected: false,
        error: "Evolution API não configurada"
      })
    }

    const isConnected = await evolutionApi.isConnected()
    const status = await evolutionApi.getInstanceStatus()

    return NextResponse.json({
      configured: true,
      connected: isConnected,
      status,
      instanceName: process.env.EVOLUTION_INSTANCE_NAME || "Bistro"
    })
  } catch (error: any) {
    return NextResponse.json({
      configured: evolutionApi.isConfigured(),
      connected: false,
      error: error.message || "Erro ao verificar status"
    }, { status: 500 })
  }
}

