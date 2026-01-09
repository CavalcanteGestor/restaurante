import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import PageHeader from "@/components/layout/PageHeader"
import { Bot, Brain } from "lucide-react"
import HistoricoConversas from "@/components/ia/HistoricoConversas"
import MetricasIA from "@/components/ia/MetricasIA"
import MensagensAgendadas from "@/components/ia/MensagensAgendadas"
import ContextoEditor from "@/components/ia/ContextoEditor"
import { getEstatisticasConversas } from "@/lib/db/conversas"
import { getMensagensAgendadas } from "@/lib/db/mensagens-agendadas"
import { getClientes } from "@/lib/db/clientes"

export const dynamic = 'force-dynamic'

export default async function IAPage() {
  // Buscar dados iniciais com tratamento de erro
  let estatisticas = {
    total: 0,
    mensagensIA: 0,
    mensagensLead: 0,
    mensagensHumano: 0,
    mensagensAutomaticas: 0,
    porTipo: {},
  }
  let mensagensPendentes: any[] = []
  let mensagensErro: any[] = []
  let clientes: any[] = []

  try {
    estatisticas = await getEstatisticasConversas()
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error)
  }

  try {
    mensagensPendentes = await getMensagensAgendadas({ status: 'pendente' })
  } catch (error) {
    console.error("Erro ao buscar mensagens pendentes:", error)
  }

  try {
    mensagensErro = await getMensagensAgendadas({ status: 'erro' })
  } catch (error) {
    console.error("Erro ao buscar mensagens com erro:", error)
  }

  try {
    clientes = await getClientes()
  } catch (error) {
    console.error("Erro ao buscar clientes:", error)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F0E8] via-white to-[#F5F0E8]/50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-8">
        {/* Header */}
        <PageHeader
          icon={Bot}
          title="Inteligência Artificial"
          description="Dashboard completo do sistema de IA: métricas, histórico de conversas e mensagens agendadas"
        />

        {/* Métricas */}
        <MetricasIA 
          estatisticas={estatisticas}
          mensagensPendentes={mensagensPendentes.length}
          mensagensErro={mensagensErro.length}
          totalClientes={clientes.length}
        />

        {/* Grid Principal */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Histórico de Conversas - 2 colunas */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-2 border-[#8B2E3D]/20">
              <CardHeader className="border-b-2 border-[#8B2E3D]/10 bg-gradient-to-r from-[#8B2E3D]/5 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#8B2E3D] to-[#7A1F2E] flex items-center justify-center shadow-md">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900">
                      Histórico de Conversas
                    </CardTitle>
                    <CardDescription className="text-gray-700">
                      Todas as interações da IA com clientes
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <HistoricoConversas />
              </CardContent>
            </Card>
          </div>

          {/* Mensagens Agendadas - 1 coluna */}
          <div>
            <Card className="shadow-xl border-2 border-[#8B2E3D]/20">
              <CardHeader className="border-b-2 border-[#8B2E3D]/10 bg-gradient-to-r from-[#8B2E3D]/5 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                    <Bot className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900">
                      Mensagens Agendadas
                    </CardTitle>
                    <CardDescription className="text-gray-700">
                      Mensagens automáticas programadas
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <MensagensAgendadas />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Editor de Contexto */}
        <Card className="shadow-xl border-2 border-[#8B2E3D]/20">
          <CardContent className="pt-6">
            <ContextoEditor />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

