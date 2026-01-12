import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createReserva, updateReserva } from "@/lib/db/reservas"
import { updateLeadByTelefone, getLeadByTelefone, createLead } from "@/lib/db/leads"
import { logAuditoria } from "@/lib/db/auditoria"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const filters: any = {}
    if (searchParams.get("data")) filters.data = searchParams.get("data")
    if (searchParams.get("turno")) filters.turno = searchParams.get("turno")
    if (searchParams.get("etapa")) filters.etapa = searchParams.get("etapa")
    if (searchParams.get("telefone")) filters.telefone = searchParams.get("telefone")

    const { data: reservas, error } = await supabase
      .from("reservas")
      .select("*")
      .order("data_reserva", { ascending: true })
      .order("horario_reserva", { ascending: true })

    if (error) throw error

    let filteredReservas = reservas
    if (filters.data) {
      filteredReservas = filteredReservas.filter((r) => r.data_reserva === filters.data)
    }
    if (filters.turno) {
      filteredReservas = filteredReservas.filter((r) => r.turno === filters.turno)
    }
    if (filters.etapa) {
      filteredReservas = filteredReservas.filter((r) => r.etapa === filters.etapa)
    }
    if (filters.telefone) {
      filteredReservas = filteredReservas.filter((r) => r.telefone === filters.telefone)
    }

    return NextResponse.json(filteredReservas)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  let body: any = null
  try {
    body = await request.json()
    const { nome, telefone, data_reserva, horario_reserva, numero_pessoas, turno, mesas, contexto, etapa } = body

    // Criar ou atualizar lead
    let lead = await getLeadByTelefone(telefone)
    const contextoLead = contexto || `Reserva criada para ${data_reserva} às ${horario_reserva}, ${numero_pessoas} pessoas, mesas: ${mesas || "não especificadas"}`

    if (lead) {
      await updateLeadByTelefone(telefone, {
        nome,
        contexto: lead.contexto ? `${lead.contexto}\n\n${contextoLead}` : contextoLead,
        data_ultima_msg: new Date().toISOString(),
        etapa: etapa || "reserva_confirmada",
      })
    } else {
      await createLead({
        nome,
        telefone,
        contexto: contextoLead,
        etapa: etapa || "reserva_confirmada",
        data_ultima_msg: new Date().toISOString(),
      })
    }

    // Validar tipos de dados
    const numeroPessoas = typeof numero_pessoas === 'string' ? parseInt(numero_pessoas, 10) : numero_pessoas
    
    if (isNaN(numeroPessoas) || numeroPessoas < 1) {
      return NextResponse.json(
        { error: "Número de pessoas inválido" },
        { status: 400 }
      )
    }

    // Criar reserva
    const reserva = await createReserva({
      nome: String(nome || ''),
      telefone: String(telefone || ''),
      data_reserva: String(data_reserva || ''),
      horario_reserva: String(horario_reserva || ''),
      numero_pessoas: numeroPessoas,
      turno: turno || null,
      mesas: mesas || null,
      contexto: contexto || null,
      etapa: etapa || "reserva_confirmada",
    })

    // Registrar auditoria
    await logAuditoria(
      'CREATE',
      'RESERVAS',
      `Reserva criada para ${nome} - ${data_reserva} às ${horario_reserva}`,
      reserva.id,
      { nome, telefone, data_reserva, horario_reserva, numero_pessoas: numeroPessoas },
      request
    )

    return NextResponse.json(reserva, { status: 201 })
  } catch (error: any) {
    console.error("Erro ao criar reserva:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      body: body
    })
    return NextResponse.json(
      { 
        error: error.message || "Erro ao criar reserva",
        code: error.code,
        details: error.details
      }, 
      { status: 500 }
    )
  }
}

