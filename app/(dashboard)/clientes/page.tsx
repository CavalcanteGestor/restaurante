import { getClientes } from "@/lib/db/clientes"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import PageHeader from "@/components/layout/PageHeader"
import StatsCard from "@/components/layout/StatsCard"
import { Users, TrendingUp, Calendar, Phone } from "lucide-react"
import ClientesTable from "@/components/clientes/ClientesTable"

export default async function ClientesPage() {
  const clientes = await getClientes()

  const totalClientes = clientes.length
  const clientesAtivos = clientes.filter(c => {
    const ultimaReserva = new Date(c.ultimaReserva)
    const trintaDiasAtras = new Date()
    trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30)
    return ultimaReserva >= trintaDiasAtras
  }).length

  const totalReservas = clientes.reduce((sum, c) => sum + c.totalReservas, 0)
  const mediaReservas = totalClientes > 0 ? (totalReservas / totalClientes).toFixed(1) : '0'

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F0E8] via-white to-[#F5F0E8]/50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-8">
        {/* Header */}
        <PageHeader
          icon={Users}
          title="Clientes"
          description="Gerencie todos os clientes do restaurante"
        />

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            icon={Users}
            title="Total de Clientes"
            value={totalClientes}
            subtitle="Clientes cadastrados"
            color="primary"
          />
          
          <StatsCard
            icon={TrendingUp}
            title="Clientes Ativos"
            value={clientesAtivos}
            subtitle="Últimos 30 dias"
            color="success"
          />
          
          <StatsCard
            icon={Calendar}
            title="Total de Reservas"
            value={totalReservas}
            subtitle="Reservas realizadas"
            color="info"
          />
          
          <StatsCard
            icon={TrendingUp}
            title="Média de Reservas"
            value={mediaReservas}
            subtitle="Por cliente"
            color="warning"
          />
        </div>

        {/* Tabela de Clientes */}
        <Card className="shadow-xl border-2 border-[#8B2E3D]/20">
          <CardHeader className="border-b-2 border-[#8B2E3D]/10 bg-gradient-to-r from-[#8B2E3D]/5 to-transparent">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#8B2E3D] to-[#7A1F2E] flex items-center justify-center shadow-md">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Lista de Clientes
                </CardTitle>
                <CardDescription className="text-gray-700">
                  {totalClientes} {totalClientes === 1 ? 'cliente cadastrado' : 'clientes cadastrados'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-8">
            <ClientesTable clientes={clientes} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
