import { createClient } from "@/lib/supabase/server"
import { getLeadByTelefone } from "@/lib/db/leads"
import { getReservas } from "@/lib/db/reservas"
import ChatInterface from "@/components/whatsapp/ChatInterface"
import { notFound } from "next/navigation"
import type { WhatsAppMessage } from "@/components/whatsapp/ChatInterface"

export default async function ChatPage({
  params,
}: {
  params: Promise<{ telefone: string }>
}) {
  const { telefone } = await params
  const telefoneDecoded = decodeURIComponent(telefone)
  const supabase = await createClient()
  
  const lead = await getLeadByTelefone(telefoneDecoded)
  const reservas = await getReservas({ telefone: telefoneDecoded })

  // Verificar se está em atendimento humano
  const { data: atendimento } = await supabase
    .from('atendimento_humano')
    .select('ativo')
    .eq('phone', telefoneDecoded)
    .maybeSingle()

  const atendimentoHumanoAtivo = atendimento?.ativo === true

  if (!lead) {
    notFound()
  }

  // Conversas vazias inicialmente - o ChatInterface carrega via API
  const conversas: WhatsAppMessage[] = []

  return (
    <div className="h-[calc(100vh-200px)]">
      <ChatInterface
        lead={lead}
        conversas={conversas}
        reservas={reservas}
        telefone={telefoneDecoded}
        atendimentoHumanoAtivo={atendimentoHumanoAtivo}
      />
    </div>
  )
}

