import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import PageHeader from "@/components/layout/PageHeader"
import StatsCard from "@/components/layout/StatsCard"
import { Plus, Calendar, AlertCircle, CheckCircle2, Clock, XCircle } from "lucide-react"
import { getReservas } from "@/lib/db/reservas"
import { isAtrasado } from "@/lib/utils/date"
import ReservasTable from "@/components/reservas/ReservasTable"
import FiltrosReservas from "@/components/reservas/FiltrosReservas"
import DownloadReservas from "@/components/reservas/DownloadReservas"

export default async function ReservasPage({
  searchParams,
}: {
  searchParams: Promise<{ data?: string; turno?: string; etapa?: string }>
}) {
  const params = await searchParams
  const dataAtual = new Date().toISOString().split('T')[0]
  const dataFiltro = params.data || dataAtual
  
  const reservas = await getReservas({
    data: dataFiltro,
    turno: params.turno,
    etapa: params.etapa,
  })

  const reservasAtrasadas = reservas.filter((r) =>
    isAtrasado(r.data_reserva, r.horario_reserva)
  )

  const totalReservas = reservas.length
  const confirmadas = reservas.filter(r => r.etapa === 'confirmado').length
  const pendentes = reservas.filter(r => r.etapa === 'interesse' || r.etapa === 'pendente').length
  const canceladas = reservas.filter(r => r.etapa === 'cancelado').length

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F0E8] via-white to-[#F5F0E8]/50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-8">
        {/* Header */}
        <PageHeader
          icon={Calendar}
          title="Reservas"
          description="Gerencie todas as reservas do restaurante"
          action={
            <Link href="/reservas/nova">
              <Button className="bg-gradient-to-r from-[#8B2E3D] to-[#7A1F2E] hover:from-[#7A1F2E] hover:to-[#8B2E3D] text-white shadow-lg gap-2">
                <Plus className="h-5 w-5" />
                Nova Reserva
              </Button>
            </Link>
          }
        />

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            icon={Calendar}
            title="Total"
            value={totalReservas}
            subtitle={dataFiltro === dataAtual ? "Reservas de hoje" : "Reservas filtradas"}
            color="primary"
          />
          
          <StatsCard
            icon={CheckCircle2}
            title="Confirmadas"
            value={confirmadas}
            subtitle="Prontas"
            color="success"
          />
          
          <StatsCard
            icon={Clock}
            title="Pendentes"
            value={pendentes}
            subtitle="Aguardando"
            color="warning"
          />
          
          <StatsCard
            icon={AlertCircle}
            title="Atrasadas"
            value={reservasAtrasadas.length}
            subtitle="Requerem atenção"
            color="warning"
          />
        </div>

        {/* Alerta de Reservas Atrasadas */}
        {reservasAtrasadas.length > 0 && (
          <Card className="border-2 border-red-500 bg-gradient-to-r from-red-50 to-red-50/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-red-600 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-red-900 text-lg mb-1">
                    {reservasAtrasadas.length} {reservasAtrasadas.length === 1 ? 'Reserva Atrasada' : 'Reservas Atrasadas'}
                  </h3>
                  <p className="text-red-800 text-sm">
                    {reservasAtrasadas.length === 1 
                      ? 'Há uma reserva que passou do horário e requer atenção imediata.'
                      : `Há ${reservasAtrasadas.length} reservas que passaram do horário e requerem atenção imediata.`
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filtros e Download */}
        <div className="flex items-center gap-4">
          <FiltrosReservas />
          <DownloadReservas />
        </div>

        {/* Tabela de Reservas */}
        <Card className="shadow-xl border-2 border-[#8B2E3D]/20">
          <CardHeader className="border-b-2 border-[#8B2E3D]/10 bg-gradient-to-r from-[#8B2E3D]/5 to-transparent">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#8B2E3D] to-[#7A1F2E] flex items-center justify-center shadow-md">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Lista de Reservas
                </CardTitle>
                <CardDescription className="text-gray-700">
                  {totalReservas} {totalReservas === 1 ? 'reserva encontrada' : 'reservas encontradas'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-8">
            <ReservasTable reservas={reservas} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
