import { notFound } from "next/navigation"
import { getReservaById } from "@/lib/db/reservas"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ReservaForm from "@/components/reservas/ReservaForm"
import CancelarReserva from "@/components/reservas/CancelarReserva"
import { formatDate, formatTime } from "@/lib/utils/date"

export default async function ReservaDetalhesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const reserva = await getReservaById(id)

  if (!reserva) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editar Reserva</h1>
          <p className="text-gray-600 mt-1">
            {reserva.nome} - {formatDate(reserva.data_reserva)} às {formatTime(reserva.horario_reserva)}
          </p>
        </div>
        {reserva.etapa !== 'cancelado' && (
          <CancelarReserva
            reservaId={reserva.id}
            nomeCliente={reserva.nome}
            dataReserva={reserva.data_reserva}
            horarioReserva={reserva.horario_reserva}
          />
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Reserva</CardTitle>
        </CardHeader>
        <CardContent>
          <ReservaForm 
            reservaId={reserva.id}
            reservaData={{
              nome: reserva.nome,
              telefone: reserva.telefone,
              data_reserva: reserva.data_reserva,
              horario_reserva: reserva.horario_reserva,
              numero_pessoas: reserva.numero_pessoas,
              turno: (reserva.turno || "almoco") as "almoco" | "jantar",
              mesas: reserva.mesas,
              contexto: reserva.contexto,
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}

