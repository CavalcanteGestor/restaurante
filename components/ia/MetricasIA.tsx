"use client"

import { Card, CardContent } from "@/components/ui/card"
import StatsCard from "@/components/layout/StatsCard"
import { MessageSquare, Bot, Clock, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react"
import { EstatisticasConversas } from "@/lib/db/conversas"

interface MetricasIAProps {
  estatisticas: EstatisticasConversas
  mensagensPendentes: number
  mensagensErro: number
  totalClientes: number
}

export default function MetricasIA({ 
  estatisticas, 
  mensagensPendentes, 
  mensagensErro,
  totalClientes 
}: MetricasIAProps) {
  const taxaResposta = estatisticas.tempoMedioResposta 
    ? `${estatisticas.tempoMedioResposta.toFixed(1)} min`
    : "N/A"

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        icon={MessageSquare}
        title="Mensagens da IA"
        value={estatisticas.mensagensIA}
        subtitle={`${estatisticas.total} total`}
        color="primary"
      />
      
      <StatsCard
        icon={Clock}
        title="Tempo Médio"
        value={taxaResposta}
        subtitle="Tempo de resposta"
        color="info"
      />
      
      <StatsCard
        icon={AlertCircle}
        title="Pendentes"
        value={mensagensPendentes}
        subtitle="Aguardando envio"
        color="warning"
      />
      
      <StatsCard
        icon={CheckCircle2}
        title="Taxa Sucesso"
        value={estatisticas.total > 0 
          ? `${((estatisticas.mensagensIA / estatisticas.total) * 100).toFixed(1)}%`
          : "0%"}
        subtitle="Mensagens enviadas"
        color="success"
      />
    </div>
  )
}

