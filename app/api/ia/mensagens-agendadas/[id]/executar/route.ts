import { NextRequest, NextResponse } from "next/server"
import { getMensagemAgendadaById, updateMensagemAgendada } from "@/lib/db/mensagens-agendadas"
import { createClient } from "@/lib/supabase/server"
import { getReservaById } from "@/lib/db/reservas"
import { processarTemplate } from "@/lib/db/configuracoes-mensagens"
import { evolutionApi } from "@/lib/evolution-api/client"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const mensagem = await getMensagemAgendadaById(id)

    if (mensagem.status !== 'pendente') {
      return NextResponse.json(
        { error: "Mensagem não está pendente para execução" },
        { status: 400 }
      )
    }

    // Buscar dados da reserva se houver
    let dadosReserva: any = {}
    if (mensagem.reserva_id) {
      const reserva = await getReservaById(mensagem.reserva_id)
      if (reserva) {
        dadosReserva = {
          nome: reserva.nome,
          telefone: reserva.telefone,
          data_reserva: reserva.data_reserva,
          horario_reserva: reserva.horario_reserva,
          numero_pessoas: reserva.numero_pessoas,
          mesas: reserva.mesas,
        }
      }
    }

    // Processar template da mensagem
    const mensagemFinal = processarTemplate(mensagem.mensagem, {
      ...dadosReserva,
      nome: mensagem.nome,
      telefone: mensagem.telefone,
      data_atual: new Date().toLocaleDateString('pt-BR'),
    })

    // Verificar se Evolution API está configurada
    if (!evolutionApi.isConfigured()) {
      throw new Error("Evolution API não configurada. Verifique as variáveis de ambiente.")
    }

    // Verificar se está conectado
    const isConnected = await evolutionApi.isConnected()
    if (!isConnected) {
      throw new Error("Instância do WhatsApp não está conectada. Verifique a conexão.")
    }

    // Enviar via Evolution API
    await evolutionApi.sendText({
      number: mensagem.telefone,
      text: mensagemFinal,
      delay: 1200,
    })

    // Atualizar status da mensagem
    await updateMensagemAgendada(id, {
      status: 'enviada',
      enviado_em: new Date().toISOString(),
      erro: null,
    })

    // Salvar na tabela conversas
    const supabase = await createClient()
    await supabase.from('conversas').insert({
      numero: mensagem.telefone,
      nome: mensagem.nome,
      mensagem_ia: mensagemFinal,
      data_mensagem: new Date().toISOString(),
      tipo_mensagem: `AUTOMATICA_${mensagem.tipo.toUpperCase()}`,
    })

    return NextResponse.json({ 
      success: true, 
      mensagem: "Mensagem enviada com sucesso",
      enviado_em: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Erro ao executar mensagem agendada:", error)
    
    // Atualizar status para erro
    try {
      const { id } = await params
      await updateMensagemAgendada(id, {
        status: 'erro',
        erro: error.message || "Erro desconhecido ao enviar mensagem",
      })
    } catch (updateError) {
      console.error("Erro ao atualizar status de erro:", updateError)
    }

    return NextResponse.json(
      { error: error.message || "Erro ao executar mensagem agendada" },
      { status: 500 }
    )
  }
}

