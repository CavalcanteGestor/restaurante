import { NextRequest, NextResponse } from "next/server"
import { getMesasDisponiveis } from "@/lib/db/mesas"

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

    const mesas = await getMesasDisponiveis(
      data,
      turno,
      parseInt(pessoas),
      tipoUso || "pessoal"
    )

    return NextResponse.json(mesas)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

