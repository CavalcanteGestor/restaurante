import { NextRequest, NextResponse } from "next/server"
import { getSugestoesMesas } from "@/lib/db/sugestoes-mesas"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const data = searchParams.get("data")
    const turno = searchParams.get("turno")
    const pessoas = searchParams.get("pessoas")
    const tipoUso = searchParams.get("tipoUso") as "pessoal" | "corporativo" | "evento" | null

    if (!data || !turno || !pessoas) {
      return NextResponse.json(
        { error: "Parâmetros obrigatórios: data, turno, pessoas" },
        { status: 400 }
      )
    }

    const solucoes = await getSugestoesMesas(
      data,
      turno,
      parseInt(pessoas),
      tipoUso || "pessoal"
    )

    return NextResponse.json(solucoes)
  } catch (error: any) {
    console.error("Erro ao buscar sugestões:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

