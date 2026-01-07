import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import PageHeader from "@/components/layout/PageHeader"
import StatsCard from "@/components/layout/StatsCard"
import { Users, TrendingUp, Phone, MessageSquare } from "lucide-react"
import LeadsTable from "@/components/leads/LeadsTable"

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ etapa?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('leads')
    .select('*')
    .order('data_ultima_msg', { ascending: false })

  if (params.etapa) {
    query = query.eq('etapa', params.etapa)
  }

  const { data: leads, error } = await query

  const totalLeads = leads?.length || 0
  const interesse = leads?.filter(l => l.etapa === 'interesse').length || 0
  const negociacao = leads?.filter(l => l.etapa === 'negociacao').length || 0
  const convertidos = leads?.filter(l => l.etapa === 'convertido').length || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F0E8] via-white to-[#F5F0E8]/50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-8">
        {/* Header */}
        <PageHeader
          icon={Users}
          title="Leads"
          description="Gerencie todos os leads e conversões"
        />

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            icon={Users}
            title="Total de Leads"
            value={totalLeads}
            subtitle="Leads no sistema"
            color="primary"
          />
          
          <StatsCard
            icon={MessageSquare}
            title="Em Interesse"
            value={interesse}
            subtitle="Iniciando conversa"
            color="info"
          />
          
          <StatsCard
            icon={Phone}
            title="Em Negociação"
            value={negociacao}
            subtitle="Processo ativo"
            color="warning"
          />
          
          <StatsCard
            icon={TrendingUp}
            title="Convertidos"
            value={convertidos}
            subtitle="Viraram clientes"
            color="success"
          />
        </div>

        {/* Tabela de Leads */}
        <Card className="shadow-xl border-2 border-[#8B2E3D]/20">
          <CardHeader className="border-b-2 border-[#8B2E3D]/10 bg-gradient-to-r from-[#8B2E3D]/5 to-transparent">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#8B2E3D] to-[#7A1F2E] flex items-center justify-center shadow-md">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Lista de Leads
                </CardTitle>
                <CardDescription className="text-gray-700">
                  {totalLeads} {totalLeads === 1 ? 'lead cadastrado' : 'leads cadastrados'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-8">
            <LeadsTable leads={leads || []} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
