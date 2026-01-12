import { NextRequest, NextResponse } from "next/server"
import { getReservaById, updateReserva, deleteReserva } from "@/lib/db/reservas"
import { updateLeadByTelefone } from "@/lib/db/leads"
import { logAuditoria } from "@/lib/db/auditoria"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const reserva = await getReservaById(id)
    return NextResponse.json(reserva)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { nome, telefone, data_reserva, horario_reserva, numero_pessoas, turno, mesas, contexto, etapa } = body

    // Validar tipos de dados
    const numeroPessoas = typeof numero_pessoas === 'string' ? parseInt(numero_pessoas, 10) : (typeof numero_pessoas === 'number' ? numero_pessoas : null)
    
    if (numeroPessoas === null || isNaN(numeroPessoas) || numeroPessoas < 1) {
      return NextResponse.json(
        { error: "Número de pessoas inválido" },
        { status: 400 }
      )
    }

    // Atualizar contexto do lead
    if (telefone) {
      const contextoLead = contexto || `Reserva atualizada para ${data_reserva} às ${horario_reserva}, ${numeroPessoas} pessoas, mesas: ${mesas || "não especificadas"}`
      await updateLeadByTelefone(String(telefone), {
        contexto: String(contextoLead || ''),
        data_ultima_msg: new Date().toISOString(),
        etapa: etapa || "reserva_confirmada",
      })
    }

    // Preparar dados de atualização com tipos corretos
    const updateData: any = {}
    if (nome !== undefined) updateData.nome = String(nome || '')
    if (telefone !== undefined) updateData.telefone = String(telefone || '')
    if (data_reserva !== undefined) updateData.data_reserva = String(data_reserva || '')
    if (horario_reserva !== undefined) updateData.horario_reserva = String(horario_reserva || '')
    if (numero_pessoas !== undefined) updateData.numero_pessoas = numeroPessoas
    if (turno !== undefined) updateData.turno = turno ? String(turno) : null
    if (mesas !== undefined) updateData.mesas = mesas ? String(mesas) : null
    if (contexto !== undefined) updateData.contexto = contexto ? String(contexto) : null
    if (etapa !== undefined) updateData.etapa = etapa ? String(etapa) : null

    const reserva = await updateReserva(String(id), updateData)

    // Registrar auditoria
    await logAuditoria(
      'UPDATE',
      'RESERVAS',
      `Reserva ${id} atualizada`,
      String(id),
      updateData,
      request
    )

    return NextResponse.json(reserva)
  } catch (error: any) {
    console.error("Erro ao atualizar reserva:", error)
    return NextResponse.json(
      { 
        error: error.message || "Erro ao atualizar reserva",
        details: error.code || error.hint || undefined
      }, 
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // Registrar auditoria antes de deletar
    const reservaAntes = await getReservaById(id)
    await logAuditoria(
      'DELETE',
      'RESERVAS',
      `Reserva deletada: ${reservaAntes?.nome || 'N/A'}`,
      id,
      reservaAntes ? { nome: reservaAntes.nome, telefone: reservaAntes.telefone } : undefined,
      request
    )

    await deleteReserva(id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

