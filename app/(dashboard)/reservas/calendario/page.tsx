import { getReservas } from "@/lib/db/reservas"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import CalendarioReservas from "@/components/reservas/CalendarioReservas"

export default async function CalendarioPage() {
  const reservas = await getReservas()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Calendário de Reservas</h1>
        <p className="text-gray-600 mt-1">Visualize todas as reservas em formato de calendário</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Calendário</CardTitle>
        </CardHeader>
        <CardContent>
          <CalendarioReservas reservas={reservas} />
        </CardContent>
      </Card>
    </div>
  )
}

