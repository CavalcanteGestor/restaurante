import Link from "next/link"
import { getMesas } from "@/lib/db/mesas"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import PageHeader from "@/components/layout/PageHeader"
import StatsCard from "@/components/layout/StatsCard"
import { Utensils, Map, CheckCircle2, Grid3x3, Layers } from "lucide-react"
import MesasGrid from "@/components/mesas/MesasGrid"
import { Badge } from "@/components/ui/badge"

export default async function MesasPage({
  searchParams,
}: {
  searchParams: Promise<{ andar?: string; ambiente?: string }>
}) {
  const params = await searchParams
  const mesas = await getMesas({
    andar: params.andar,
    ambiente: params.ambiente,
  })

  // Filtrar apenas mesas disponíveis
  const mesasDisponiveis = mesas.filter(m => m.disponivel)
  const totalMesas = mesasDisponiveis.length
  const ambientes = new Set(mesasDisponiveis.map(m => m.ambiente).filter(Boolean)).size
  const andares = new Set(mesasDisponiveis.map(m => m.andar).filter(Boolean)).size

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F0E8] via-white to-[#F5F0E8]/50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <PageHeader
          icon={Utensils}
          title="Mesas do Restaurante"
          description="Visualize e gerencie todas as mesas disponíveis"
          action={
            <Link href="/mesas/mapa">
              <Button className="bg-gradient-to-r from-[#8B2E3D] to-[#7A1F2E] hover:from-[#7A1F2E] hover:to-[#8B2E3D] text-white shadow-lg gap-2">
                <Map className="h-5 w-5" />
                Mapa Visual
              </Button>
            </Link>
          }
        />

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            icon={Grid3x3}
            title="Total de Mesas"
            value={totalMesas}
            subtitle="Mesas disponíveis"
            color="primary"
          />
          
          <StatsCard
            icon={CheckCircle2}
            title="Disponíveis"
            value={totalMesas}
            subtitle="Prontas para reserva"
            color="success"
          />
          
          <StatsCard
            icon={Layers}
            title="Ambientes"
            value={ambientes}
            subtitle="Diferentes ambientes"
            color="info"
          />
          
          <StatsCard
            icon={Layers}
            title="Andares"
            value={andares}
            subtitle="Níveis do restaurante"
            color="warning"
          />
        </div>

        {/* Filtros Ativos */}
        {(params.andar || params.ambiente) && (
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-700">Filtros ativos:</span>
            {params.andar && (
              <Badge className="bg-[#8B2E3D] text-white font-semibold px-3 py-1">
                Andar: {params.andar}
              </Badge>
            )}
            {params.ambiente && (
              <Badge className="bg-[#8B2E3D] text-white font-semibold px-3 py-1">
                Ambiente: {params.ambiente}
              </Badge>
            )}
            <Link href="/mesas">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-[#8B2E3D]">
                Limpar filtros
              </Button>
            </Link>
          </div>
        )}

        {/* Mesas Grid */}
        <Card className="shadow-xl border-2 border-[#8B2E3D]/20">
          <CardHeader className="border-b-2 border-[#8B2E3D]/10 bg-gradient-to-r from-[#8B2E3D]/5 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#8B2E3D] to-[#7A1F2E] flex items-center justify-center shadow-md">
                  <Grid3x3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    Lista de Mesas
                  </CardTitle>
                  <CardDescription className="text-gray-700">
                    {totalMesas} {totalMesas === 1 ? 'mesa disponível' : 'mesas disponíveis'}
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-8">
            <MesasGrid mesas={mesasDisponiveis} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
