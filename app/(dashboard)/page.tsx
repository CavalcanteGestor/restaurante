import { getReservas } from "@/lib/db/reservas"
import { getMesas } from "@/lib/db/mesas"
import { createClient } from "@/lib/supabase/server"
import PageHeader from "@/components/layout/PageHeader"
import StatsCard from "@/components/layout/StatsCard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  MessageSquare, 
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Phone
} from "lucide-react"
import { formatDateTime } from "@/lib/utils/date"

export default async function DashboardPage() {
  const hoje = new Date().toISOString().split('T')[0]
  
  const reservas = await getReservas({ data: hoje })
  const mesas = await getMesas()
  const supabase = await createClient()
  
  const { data: leads, count: totalLeads } = await supabase
    .from('leads')
    .select('*', { count: 'exact' })
    .limit(5)
  
  const { data: atendimentos, count: totalAtendimentos } = await supabase
    .from('atendimento_humano')
    .select('*', { count: 'exact' })
    .eq('ativo', true)

  const reservasHoje = reservas.length
  const reservasPendentes = reservas.filter(r => r.etapa === 'interesse' || r.etapa === 'pendente').length
  const reservasConfirmadas = reservas.filter(r => r.etapa === 'confirmado').length
  const mesasDisponiveis = mesas.filter(m => m.disponivel).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F0E8] via-white to-[#F5F0E8]/50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-8">
        {/* Header */}
        <PageHeader
          icon={LayoutDashboard}
          title="Dashboard"
          description="Visão geral do sistema de reservas"
        />

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            icon={Calendar}
            title="Reservas Hoje"
            value={reservasHoje}
            subtitle={`${reservasConfirmadas} confirmadas`}
            color="primary"
          />
          
          <StatsCard
            icon={CheckCircle2}
            title="Confirmadas"
            value={reservasConfirmadas}
            subtitle="Prontas para hoje"
            color="success"
          />
          
          <StatsCard
            icon={AlertCircle}
            title="Pendentes"
            value={reservasPendentes}
            subtitle="Aguardando confirmação"
            color="warning"
          />
          
          <StatsCard
            icon={Users}
            title="Leads Ativos"
            value={totalLeads || 0}
            subtitle="Total de leads"
            color="info"
          />
        </div>

        {/* Grid Principal */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Reservas Recentes */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-2 border-[#8B2E3D]/20 hover:shadow-2xl transition-shadow">
              <CardHeader className="border-b-2 border-[#8B2E3D]/10 bg-gradient-to-r from-[#8B2E3D]/5 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#8B2E3D] to-[#7A1F2E] flex items-center justify-center shadow-md">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900">
                        Reservas de Hoje
                      </CardTitle>
                      <CardDescription className="text-gray-700">
                        {reservasHoje} {reservasHoje === 1 ? 'reserva agendada' : 'reservas agendadas'}
                      </CardDescription>
                    </div>
                  </div>
                  <Link href="/reservas">
                    <Button variant="outline" size="sm" className="border-[#8B2E3D] text-[#8B2E3D] hover:bg-[#8B2E3D] hover:text-white">
                      Ver Todas
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {reservas.length > 0 ? (
                  <div className="space-y-4">
                    {reservas.slice(0, 5).map((reserva) => (
                      <Link key={reserva.id} href={`/reservas/${reserva.id}`}>
                        <div className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-100 hover:border-[#8B2E3D]/30 hover:bg-[#8B2E3D]/5 transition-all cursor-pointer group">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#8B2E3D] to-[#7A1F2E] flex items-center justify-center text-white font-bold text-lg shadow-md">
                              {reserva.nome?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 group-hover:text-[#8B2E3D] transition-colors">
                                {reserva.nome}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {reserva.numero_pessoas} {reserva.numero_pessoas === 1 ? 'pessoa' : 'pessoas'}
                                </Badge>
                                <span className="text-sm text-gray-600">•</span>
                                <span className="text-sm text-gray-600">{reserva.horario_reserva}</span>
                                <span className="text-sm text-gray-600">•</span>
                                <span className="text-sm text-gray-600 capitalize">{reserva.turno}</span>
                              </div>
                            </div>
                          </div>
                          <Badge className={`${
                            reserva.etapa === 'confirmado' 
                              ? 'bg-green-600 text-white' 
                              : reserva.etapa === 'cancelado'
                              ? 'bg-red-600 text-white'
                              : 'bg-yellow-600 text-white'
                          } font-semibold`}>
                            {reserva.etapa}
                          </Badge>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-600 font-medium">Nenhuma reserva para hoje</p>
                    <p className="text-sm text-gray-500 mt-2">As reservas aparecerão aqui automaticamente</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Ações Rápidas */}
          <div className="space-y-6">
            {/* Atendimentos Humanos */}
            <Card className="shadow-xl border-2 border-[#8B2E3D]/20">
              <CardHeader className="bg-gradient-to-r from-[#8B2E3D]/10 to-transparent border-b-2 border-[#8B2E3D]/10">
                <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Phone className="h-5 w-5 text-[#8B2E3D]" />
                  Atendimentos Ativos
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-[#8B2E3D] mb-2">
                    {totalAtendimentos || 0}
                  </div>
                  <p className="text-sm text-gray-600 mb-4">Atendimentos humanos ativos</p>
                  <Link href="/whatsapp">
                    <Button className="w-full bg-gradient-to-r from-[#8B2E3D] to-[#7A1F2E] hover:from-[#7A1F2E] hover:to-[#8B2E3D] text-white shadow-md">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Ir para WhatsApp
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Ações Rápidas */}
            <Card className="shadow-xl border-2 border-[#8B2E3D]/20">
              <CardHeader className="bg-gradient-to-r from-[#8B2E3D]/10 to-transparent border-b-2 border-[#8B2E3D]/10">
                <CardTitle className="text-lg font-bold text-gray-900">
                  Ações Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Link href="/reservas/nova" className="block">
                    <Button className="w-full bg-gradient-to-r from-[#8B2E3D] to-[#7A1F2E] hover:from-[#7A1F2E] hover:to-[#8B2E3D] text-white shadow-md">
                      <Calendar className="h-4 w-4 mr-2" />
                      Nova Reserva
                    </Button>
                  </Link>
                  <Link href="/mesas" className="block">
                    <Button variant="outline" className="w-full border-2 border-[#8B2E3D]/30 text-[#8B2E3D] hover:bg-[#8B2E3D] hover:text-white">
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Ver Mesas
                    </Button>
                  </Link>
                  <Link href="/leads" className="block">
                    <Button variant="outline" className="w-full border-2 border-[#8B2E3D]/30 text-[#8B2E3D] hover:bg-[#8B2E3D] hover:text-white">
                      <Users className="h-4 w-4 mr-2" />
                      Leads
                    </Button>
                  </Link>
                  <Link href="/relatorios" className="block">
                    <Button variant="outline" className="w-full border-2 border-[#8B2E3D]/30 text-[#8B2E3D] hover:bg-[#8B2E3D] hover:text-white">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Relatórios
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
