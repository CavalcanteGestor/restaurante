import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import PageHeader from "@/components/layout/PageHeader"
import StatsCard from "@/components/layout/StatsCard"
import { MessageSquare, CheckCircle2, XCircle, Clock, Send } from "lucide-react"
import { getMensagensAutomaticas, getEstatisticasMensagens } from "@/lib/db/mensagens-automaticas"
import MensagensAutomaticasTable from "@/components/automatizacoes/MensagensAutomaticasTable"

export default async function MensagensAutomaticasPage({
  searchParams,
}: {
  searchParams: Promise<{
    tipo?: string
    status?: string
    data_inicio?: string
    data_fim?: string
  }>
}) {
  const params = await searchParams

  // Buscar mensagens com filtros
  const mensagens = await getMensagensAutomaticas({
    tipo: params.tipo,
    status: params.status,
    data_inicio: params.data_inicio,
    data_fim: params.data_fim,
    limit: 200,
  })

  // Buscar estatísticas
  const hoje = new Date().toISOString().split('T')[0]
  const statsHoje = await getEstatisticasMensagens(hoje, hoje)
  const statsTotal = await getEstatisticasMensagens()

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F0E8] via-white to-[#F5F0E8]/50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-8">
        {/* Header */}
        <PageHeader
          icon={MessageSquare}
          title="Mensagens Automáticas"
          description="Histórico de todas as mensagens automáticas enviadas pelo sistema"
        />

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            icon={Send}
            title="Total Enviadas"
            value={statsTotal.enviadas.toString()}
            subtitle="Mensagens enviadas com sucesso"
            color="info"
          />
          <StatsCard
            icon={CheckCircle2}
            title="Hoje"
            value={statsHoje.enviadas.toString()}
            subtitle="Mensagens enviadas hoje"
            color="success"
          />
          <StatsCard
            icon={XCircle}
            title="Erros"
            value={statsTotal.erros.toString()}
            subtitle="Mensagens com erro no envio"
            color="warning"
          />
          <StatsCard
            icon={Clock}
            title="Total"
            value={statsTotal.total.toString()}
            subtitle="Total de mensagens registradas"
            color="primary"
          />
        </div>

        {/* Tabela de Mensagens */}
        <Card className="shadow-lg border-2 border-[#8B2E3D]/10">
          <CardHeader className="border-b bg-gradient-to-r from-[#8B2E3D]/5 to-transparent">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-[#8B2E3D]">
                  Histórico de Mensagens
                </CardTitle>
                <CardDescription className="text-gray-700 mt-1">
                  {mensagens.length} {mensagens.length === 1 ? 'mensagem encontrada' : 'mensagens encontradas'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <MensagensAutomaticasTable mensagens={mensagens} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

