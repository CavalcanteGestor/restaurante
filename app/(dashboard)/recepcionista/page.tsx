import { getReservas } from "@/lib/db/reservas"
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
  Phone,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Utensils
} from "lucide-react"
import { formatDateTime } from "@/lib/utils/date"

export default async function RecepcionistaDashboard() {
  const hoje = new Date().toISOString().split('T')[0]
  
  const reservasHoje = await getReservas({ data: hoje })
  const supabase = await createClient()
  
  // Buscar próximas reservas (próximas 3 horas)
  const agora = new Date()
  const proximasHoras = new Date()
  proximasHoras.setHours(proximasHoras.getHours() + 3)
  
  const horaAtual = agora.toTimeString().split(':').slice(0, 2).join(':')
  const horaLimite = proximasHoras.toTimeString().split(':').slice(0, 2).join(':')

  const proximasReservas = reservasHoje.filter(r => {
    return r.horario_reserva >= horaAtual && r.horario_reserva <= horaLimite
  })

  // Buscar atendimentos ativos
  const { data: atendimentos } = await supabase
    .from('atendimento_humano')
    .select('*')
    .eq('ativo', true)

  const totalReservasHoje = reservasHoje.length
  const confirmadas = reservasHoje.filter(r => r.etapa === 'confirmado').length
  const pendentes = reservasHoje.filter(r => r.etapa === 'interesse' || r.etapa === 'pendente').length
  const atendimentosAtivos = atendimentos?.length || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F0E8] via-white to-[#F5F0E8]/50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <PageHeader
          icon={LayoutDashboard}
          title="Painel do Recepcionista"
          description={`Boa tarde! Você tem ${proximasReservas.length} ${proximasReservas.length === 1 ? 'reserva chegando' : 'reservas chegando'} nas próximas 3 horas`}
        />

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            icon={Calendar}
            title="Reservas Hoje"
            value={totalReservasHoje}
            subtitle="Total agendado"
            color="primary"
          />
          
          <StatsCard
            icon={CheckCircle2}
            title="Confirmadas"
            value={confirmadas}
            subtitle="Prontas para receber"
            color="success"
          />
          
          <StatsCard
            icon={Clock}
            title="Pendentes"
            value={pendentes}
            subtitle="Aguardando confirmação"
            color="warning"
          />
          
          <StatsCard
            icon={Phone}
            title="Atendimentos"
            value={atendimentosAtivos}
            subtitle="WhatsApp ativos"
            color="info"
          />
        </div>

        {/* Grid Principal */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Próximas Reservas (Próximas 3h) */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-2 border-[#8B2E3D]/20">
              <CardHeader className="border-b-2 border-[#8B2E3D]/10 bg-gradient-to-r from-[#8B2E3D]/5 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#8B2E3D] to-[#7A1F2E] flex items-center justify-center shadow-md">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900">
                        Próximas Reservas
                      </CardTitle>
                      <CardDescription className="text-gray-700">
                        {proximasReservas.length} chegando nas próximas 3 horas
                      </CardDescription>
                    </div>
                  </div>
                  <Link href="/recepcionista/reservas">
                    <Button variant="outline" size="sm" className="border-[#8B2E3D] text-[#8B2E3D] hover:bg-[#8B2E3D] hover:text-white">
                      Ver Todas
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {proximasReservas.length > 0 ? (
                  <div className="space-y-4">
                    {proximasReservas.slice(0, 5).map((reserva) => {
                      const minutos = Math.floor((new Date(`${reserva.data_reserva}T${reserva.horario_reserva}`).getTime() - Date.now()) / 60000)
                      
                      return (
                        <div
                          key={reserva.id}
                          className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-100 hover:border-[#8B2E3D]/30 hover:bg-[#8B2E3D]/5 transition-all group"
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-[#8B2E3D] to-[#7A1F2E] flex items-center justify-center text-white font-bold text-xl shadow-md">
                              {reserva.nome?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 text-lg group-hover:text-[#8B2E3D] transition-colors">
                                {reserva.nome}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm font-semibold text-[#8B2E3D]">
                                  {reserva.horario_reserva}
                                </span>
                                <span className="text-sm text-gray-600">•</span>
                                <Badge variant="outline" className="text-xs">
                                  {reserva.numero_pessoas} {reserva.numero_pessoas === 1 ? 'pessoa' : 'pessoas'}
                                </Badge>
                                {minutos <= 30 && (
                                  <>
                                    <span className="text-sm text-gray-600">•</span>
                                    <Badge className="bg-orange-600 text-white text-xs animate-pulse">
                                      Chega em {minutos} min
                                    </Badge>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Link href={`/whatsapp?telefone=${reserva.telefone}`}>
                              <Button size="sm" variant="outline" className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
                                <Phone className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/recepcionista/reservas/${reserva.id}`}>
                              <Button size="sm" className="bg-[#8B2E3D] hover:bg-[#7A1F2E]">
                                Ver
                              </Button>
                            </Link>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Clock className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-600 font-medium">Nenhuma reserva nas próximas 3 horas</p>
                    <p className="text-sm text-gray-500 mt-2">Quando houver reservas próximas, elas aparecerão aqui</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Ações Rápidas */}
          <div className="space-y-6">
            {/* Atendimentos WhatsApp */}
            <Card className="shadow-xl border-2 border-green-500/30 bg-gradient-to-br from-green-50/50 to-white">
              <CardHeader className="bg-gradient-to-r from-green-100/50 to-transparent border-b-2 border-green-200/50">
                <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Phone className="h-5 w-5 text-green-600" />
                  WhatsApp
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-5xl font-bold text-green-600 mb-2">
                    {atendimentosAtivos}
                  </div>
                  <p className="text-sm text-gray-700 font-semibold mb-4">Atendimentos ativos</p>
                  <Link href="/recepcionista/whatsapp">
                    <Button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-600 text-white shadow-md">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Abrir WhatsApp
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
                  <Link href="/recepcionista/reservas" className="block">
                    <Button className="w-full bg-gradient-to-r from-[#8B2E3D] to-[#7A1F2E] hover:from-[#7A1F2E] hover:to-[#8B2E3D] text-white shadow-md justify-start">
                      <Calendar className="h-4 w-4 mr-2" />
                      Ver Reservas
                    </Button>
                  </Link>
                  <Link href="/recepcionista/mesas" className="block">
                    <Button variant="outline" className="w-full border-2 border-[#8B2E3D]/30 text-[#8B2E3D] hover:bg-[#8B2E3D] hover:text-white justify-start">
                      <Utensils className="h-4 w-4 mr-2" />
                      Ver Mesas
                    </Button>
                  </Link>
                  <Link href="/recepcionista/whatsapp" className="block">
                    <Button variant="outline" className="w-full border-2 border-[#8B2E3D]/30 text-[#8B2E3D] hover:bg-[#8B2E3D] hover:text-white justify-start">
                      <Phone className="h-4 w-4 mr-2" />
                      WhatsApp
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Todas as Reservas de Hoje */}
        <Card className="shadow-xl border-2 border-[#8B2E3D]/20">
          <CardHeader className="border-b-2 border-[#8B2E3D]/10 bg-gradient-to-r from-[#8B2E3D]/5 to-transparent">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#8B2E3D] to-[#7A1F2E] flex items-center justify-center shadow-md">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Todas as Reservas de Hoje
                </CardTitle>
                <CardDescription className="text-gray-700">
                  {totalReservasHoje} {totalReservasHoje === 1 ? 'reserva agendada' : 'reservas agendadas'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {reservasHoje.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {reservasHoje.map((reserva) => (
                  <Link key={reserva.id} href={`/recepcionista/reservas`}>
                    <div className="p-4 rounded-xl border-2 border-gray-100 hover:border-[#8B2E3D]/30 hover:bg-[#8B2E3D]/5 transition-all cursor-pointer group">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#8B2E3D] to-[#7A1F2E] flex items-center justify-center text-white font-bold text-lg shadow-md">
                          {reserva.nome?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 group-hover:text-[#8B2E3D] transition-colors truncate">
                            {reserva.nome}
                          </h4>
                          <p className="text-sm text-gray-600 truncate">{reserva.telefone}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Horário:</span>
                          <span className="text-sm font-bold text-[#8B2E3D]">{reserva.horario_reserva}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Pessoas:</span>
                          <Badge variant="outline" className="text-xs">
                            {reserva.numero_pessoas}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Status:</span>
                          <Badge className={`${
                            reserva.etapa === 'confirmado' 
                              ? 'bg-green-600 text-white' 
                              : reserva.etapa === 'cancelado'
                              ? 'bg-red-600 text-white'
                              : 'bg-yellow-600 text-white'
                          } text-xs`}>
                            {reserva.etapa}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-600 font-medium">Nenhuma reserva para hoje</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
