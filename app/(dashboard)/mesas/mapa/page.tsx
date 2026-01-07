import { getMesas } from "@/lib/db/mesas"
import { getReservas } from "@/lib/db/reservas"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import MapaMesas from "@/components/mesas/MapaMesas"

export default async function MapaMesasPage() {
  const mesas = await getMesas()
  const hoje = new Date().toISOString().split('T')[0]
  const reservasHoje = await getReservas({ data: hoje })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mapa Visual de Mesas</h1>
        <p className="text-gray-600 mt-1">Visualize a disposição e status das mesas</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mapa de Mesas - {new Date().toLocaleDateString('pt-BR')}</CardTitle>
        </CardHeader>
        <CardContent>
          <MapaMesas mesas={mesas} reservas={reservasHoje} />
        </CardContent>
      </Card>
    </div>
  )
}

