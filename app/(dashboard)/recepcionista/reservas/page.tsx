import Link from "next/link"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth/user"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Plus, Calendar, Search, AlertTriangle, MessageSquare } from "lucide-react"
import { getReservas } from "@/lib/db/reservas"
import { formatDate, formatTime, isAtrasado } from "@/lib/utils/date"
import ReservasTable from "@/components/reservas/ReservasTable"

export default async function RecepcionistaReservasPage({
  searchParams,
}: {
  searchParams: Promise<{ data?: string; turno?: string; etapa?: string }>
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const params = await searchParams
  const reservas = await getReservas({
    data: params.data,
    turno: params.turno,
    etapa: params.etapa,
  })

  const reservasAtrasadas = reservas.filter((r) =>
    isAtrasado(r.data_reserva, r.horario_reserva)
  )

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Reservas</h1>
          <p className="text-gray-600 mt-2 text-lg">Gerencie todas as reservas do restaurante</p>
        </div>
        <Link href="/recepcionista/reservas/nova">
          <Button className="bg-[#8B2E3D] hover:bg-[#7A1F2E] transition-colors duration-200 shadow-md hover:shadow-lg text-white">
            <Plus className="h-5 w-5 mr-2" />
            Nova Reserva
          </Button>
        </Link>
      </div>

      {reservasAtrasadas.length > 0 && (
        <Card className="border-red-400 bg-red-50 shadow-lg animate-pulse-slow">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <CardTitle className="text-xl font-semibold text-red-800">
                Reservas Atrasadas ({reservasAtrasadas.length})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reservasAtrasadas.map((reserva) => (
                <div
                  key={reserva.id}
                  className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-200 shadow-sm"
                >
                  <div>
                    <p className="font-medium text-gray-800">{reserva.nome}</p>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {formatDate(reserva.data_reserva)} às {formatTime(reserva.horario_reserva)}
                    </p>
                  </div>
                  <Link href={`/recepcionista/whatsapp/${reserva.telefone}`}>
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50/50">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Enviar Mensagem
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Lista de Reservas</CardTitle>
          <CardDescription className="text-gray-700">
            Visualize e gerencie todas as reservas ativas e passadas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReservasTable reservas={reservas} />
        </CardContent>
      </Card>
    </div>
  )
}

