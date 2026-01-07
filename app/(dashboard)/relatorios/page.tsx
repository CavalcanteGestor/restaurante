import { createClient } from "@/lib/supabase/server"
import { getReservas } from "@/lib/db/reservas"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getMonthRange } from "@/lib/utils/date"
import ReservasChart from "@/components/relatorios/ReservasChart"
import OcupacaoChart from "@/components/relatorios/OcupacaoChart"
import { BarChart3, TrendingUp, TrendingDown, Calendar, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default async function RelatoriosPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string }>
}) {
  const params = await searchParams
  const periodo = params.periodo || "mes"
  const { start, end } = getMonthRange()
  
  const reservas = await getReservas()
  const reservasPeriodo = reservas.filter(
    (r) => r.data_reserva >= start && r.data_reserva <= end
  )

  const reservasConfirmadas = reservasPeriodo.filter(
    (r) => r.etapa === "reserva_confirmada"
  ).length
  const reservasCanceladas = reservasPeriodo.filter(
    (r) => r.etapa === "cancelado"
  ).length
  const taxaCancelamento =
    reservasPeriodo.length > 0
      ? ((reservasCanceladas / reservasPeriodo.length) * 100).toFixed(1)
      : "0"
  const taxaConfirmacao =
    reservasPeriodo.length > 0
      ? ((reservasConfirmadas / reservasPeriodo.length) * 100).toFixed(1)
      : "0"

  // Estatísticas por turno
  const reservasAlmoco = reservasPeriodo.filter((r) => r.turno === "almoco").length
  const reservasJantar = reservasPeriodo.filter((r) => r.turno === "jantar").length

  return (
    <div className="space-y-4 md:space-y-8 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-[#8B2E3D] to-[#7A1F2E] bg-clip-text text-transparent flex items-center gap-2 md:gap-3">
            <BarChart3 className="h-6 w-6 md:h-10 md:w-10 text-[#8B2E3D]" />
            Relatórios
          </h1>
          <p className="text-gray-600 mt-2 text-sm md:text-lg">
            Análise e métricas do sistema
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          Período: {periodo}
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Total de Reservas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{reservasPeriodo.length}</div>
            <p className="text-xs text-gray-600 mt-1">No período selecionado</p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-green-500/50 transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-white to-green-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Confirmadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{reservasConfirmadas}</div>
            <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
              <span>{taxaConfirmacao}% do total</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-red-500/50 transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-white to-red-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Taxa de Cancelamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{taxaCancelamento}%</div>
            <p className="text-xs text-gray-600 mt-1">
              {reservasCanceladas} canceladas
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-white to-blue-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Por Turno
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Almoço</span>
                <Badge className="bg-blue-100 text-blue-800">{reservasAlmoco}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Jantar</span>
                <Badge className="bg-purple-100 text-purple-800">{reservasJantar}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader className="border-b bg-gradient-to-r from-[#8B2E3D]/5 to-transparent">
            <CardTitle className="text-xl font-bold">Reservas por Dia</CardTitle>
            <CardDescription className="mt-1">
              Distribuição de reservas ao longo do período
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ReservasChart reservas={reservasPeriodo} />
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="border-b bg-gradient-to-r from-[#8B2E3D]/5 to-transparent">
            <CardTitle className="text-xl font-bold">Ocupação por Turno</CardTitle>
            <CardDescription className="mt-1">
              Comparativo entre almoço e jantar
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <OcupacaoChart reservas={reservasPeriodo} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
