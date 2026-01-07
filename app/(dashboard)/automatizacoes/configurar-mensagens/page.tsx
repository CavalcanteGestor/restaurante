import { Card, CardContent } from "@/components/ui/card"
import PageHeader from "@/components/layout/PageHeader"
import { MessageSquare, Settings } from "lucide-react"
import { getAllConfiguracoesMensagens } from "@/lib/db/configuracoes-mensagens"
import ConfigurarMensagem from "@/components/automatizacoes/ConfigurarMensagem"

// Forçar renderização dinâmica porque usa cookies (Supabase)
export const dynamic = 'force-dynamic'

export default async function ConfigurarMensagensPage() {
  let configuracoes: any[] = []
  let configNaoComparecimento: any = null

  try {
    configuracoes = await getAllConfiguracoesMensagens()
    // Criar configuração padrão se não existir
    configNaoComparecimento = configuracoes.find(c => c.tipo === 'nao_comparecimento')
  } catch (error) {
    console.error("Erro ao carregar configurações:", error)
    // Continuar mesmo com erro - o componente vai criar padrão
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F0E8] via-white to-[#F5F0E8]/50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-4 md:space-y-8">
        {/* Header */}
        <PageHeader
          icon={Settings}
          title="Configurar Mensagens Automáticas"
          description="Personalize as mensagens enviadas automaticamente para clientes"
        />

        {/* Configuração de Não Comparecimento */}
        <ConfigurarMensagem
          tipo="nao_comparecimento"
          configuracao={configNaoComparecimento}
        />

        {/* Informações sobre Placeholders */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold text-lg mb-4">Placeholders Disponíveis</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <code className="bg-gray-100 px-2 py-1 rounded font-mono">{'{nome}'}</code>
                <span className="text-gray-700">Nome do cliente</span>
              </div>
              <div className="flex items-start gap-2">
                <code className="bg-gray-100 px-2 py-1 rounded font-mono">{'{horario_reserva}'}</code>
                <span className="text-gray-700">Horário da reserva (ex: 19:00)</span>
              </div>
              <div className="flex items-start gap-2">
                <code className="bg-gray-100 px-2 py-1 rounded font-mono">{'{data_reserva}'}</code>
                <span className="text-gray-700">Data da reserva (ex: 15/01/2026)</span>
              </div>
              <div className="flex items-start gap-2">
                <code className="bg-gray-100 px-2 py-1 rounded font-mono">{'{numero_pessoas}'}</code>
                <span className="text-gray-700">Número de pessoas</span>
              </div>
              <div className="flex items-start gap-2">
                <code className="bg-gray-100 px-2 py-1 rounded font-mono">{'{mesas}'}</code>
                <span className="text-gray-700">Mesas reservadas</span>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Dica:</strong> Você pode posicionar o nome em qualquer lugar da mensagem usando o placeholder. 
                O sistema substituirá automaticamente pelos dados reais da reserva.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

