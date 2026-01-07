"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { AlertCircle, X, Phone, CheckCircle2, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface ReservaAtrasada {
  id: string
  nome: string
  telefone: string
  horario_reserva: string
  minutosAtraso: number
  mensagemEnviada?: boolean
  dataMensagem?: string
}

interface MensagemEnviada {
  id: string
  reserva_id: string
  nome: string
  telefone: string
  mensagem: string
  data_envio: string
  tipo: string
}

export default function RealtimeAlerts() {
  const [reservasAtrasadas, setReservasAtrasadas] = useState<ReservaAtrasada[]>([])
  const [mensagensEnviadas, setMensagensEnviadas] = useState<MensagemEnviada[]>([])
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [dismissedMensagens, setDismissedMensagens] = useState<Set<string>>(new Set())
  const router = useRouter()

  useEffect(() => {
    const verificarAtrasos = async () => {
      try {
        const supabase = createClient()
        const hoje = new Date().toISOString().split('T')[0]
        const agora = new Date()

        // Buscar reservas de hoje que ainda não foram concluídas
        const { data: reservas } = await supabase
          .from('reservas')
          .select('id, nome, telefone, horario_reserva, data_reserva, etapa, status_comparecimento')
          .eq('data_reserva', hoje)
          .in('etapa', ['confirmado', 'interesse', 'pendente', 'reserva_confirmada'])
          .or('status_comparecimento.is.null,status_comparecimento.eq.agendado')

        if (!reservas) return

        // Buscar mensagens automáticas enviadas hoje
        const { data: mensagens } = await supabase
          .from('mensagens_automaticas')
          .select('id, reserva_id, nome, telefone, mensagem, data_envio, tipo, status')
          .gte('data_envio', `${hoje}T00:00:00`)
          .eq('status', 'enviada')
          .order('data_envio', { ascending: false })
          .limit(10)

        const atrasadas: ReservaAtrasada[] = []

        reservas.forEach(reserva => {
          const [hora, minuto] = reserva.horario_reserva.split(':').map(Number)
          const horarioReserva = new Date(reserva.data_reserva)
          horarioReserva.setHours(hora, minuto, 0, 0)

          const diffMs = agora.getTime() - horarioReserva.getTime()
          const diffMinutos = Math.floor(diffMs / 60000)

          // Verificar se já foi enviada mensagem para esta reserva
          const mensagemEnviada = mensagens?.find(m => m.reserva_id === reserva.id)

          // Se passou mais de 15 minutos
          if (diffMinutos >= 15) {
            atrasadas.push({
              id: reserva.id,
              nome: reserva.nome,
              telefone: reserva.telefone,
              horario_reserva: reserva.horario_reserva,
              minutosAtraso: diffMinutos,
              mensagemEnviada: !!mensagemEnviada,
              dataMensagem: mensagemEnviada?.data_envio,
            })
          }
        })

        // Notificar novas reservas atrasadas
        atrasadas.forEach(reserva => {
          if (!dismissed.has(reserva.id)) {
            toast.error(
              `Reserva Atrasada: ${reserva.nome}`,
              {
                description: `${reserva.minutosAtraso} minutos de atraso. ${reserva.mensagemEnviada ? 'Mensagem automática já foi enviada.' : 'Mensagem automática será enviada pelo sistema.'}`,
                duration: 10000,
                action: {
                  label: 'Ver Reserva',
                  onClick: () => router.push(`/reservas/${reserva.id}`),
                },
              }
            )
          }
        })

        setReservasAtrasadas(atrasadas.filter(r => !dismissed.has(r.id)))
        
        // Atualizar mensagens enviadas
        if (mensagens) {
          const novasMensagens = mensagens.filter(m => !dismissedMensagens.has(m.id))
          setMensagensEnviadas(novasMensagens)
          
          // Notificar novas mensagens enviadas
          novasMensagens.forEach(msg => {
            if (!dismissedMensagens.has(msg.id)) {
              toast.success(
                `Mensagem Automática Enviada`,
                {
                  description: `Mensagem enviada para ${msg.nome} (${msg.telefone})`,
                  duration: 8000,
                  action: {
                    label: 'Ver Histórico',
                    onClick: () => router.push('/automatizacoes/mensagens'),
                  },
                }
              )
            }
          })
        }
      } catch (error) {
        console.error("Erro ao verificar atrasos:", error)
      }
    }

    // Verificar imediatamente e depois a cada 2 minutos
    verificarAtrasos()
    const interval = setInterval(verificarAtrasos, 120000) // 2 minutos

    return () => clearInterval(interval)
  }, [dismissed, dismissedMensagens, router])

  const dismissAlert = (id: string) => {
    setDismissed(prev => new Set([...prev, id]))
    setReservasAtrasadas(prev => prev.filter(r => r.id !== id))
  }

  const dismissMensagem = (id: string) => {
    setDismissedMensagens(prev => new Set([...prev, id]))
    setMensagensEnviadas(prev => prev.filter(m => m.id !== id))
  }

  const handleVerReserva = (id: string) => {
    try {
      router.push(`/reservas/${id}`)
    } catch (error) {
      console.error("Erro ao navegar para reserva:", error)
      window.location.href = `/reservas/${id}`
    }
  }

  const handleVerWhatsApp = (telefone: string) => {
    try {
      const telefoneEncoded = encodeURIComponent(telefone)
      router.push(`/whatsapp?telefone=${telefoneEncoded}`)
    } catch (error) {
      console.error("Erro ao navegar para WhatsApp:", error)
      window.location.href = `/whatsapp?telefone=${encodeURIComponent(telefone)}`
    }
  }

  const handleVerHistorico = () => {
    try {
      router.push('/automatizacoes/mensagens')
    } catch (error) {
      console.error("Erro ao navegar para histórico:", error)
      window.location.href = '/automatizacoes/mensagens'
    }
  }

  if (reservasAtrasadas.length === 0 && mensagensEnviadas.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 space-y-3 max-w-md">
      {/* Alertas de Reservas Atrasadas */}
      {reservasAtrasadas.map(reserva => (
        <div
          key={reserva.id}
          className="bg-white border-4 border-red-500 rounded-2xl shadow-2xl p-4 animate-in slide-in-from-right"
        >
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-xl bg-red-600 flex items-center justify-center flex-shrink-0 animate-pulse">
              <AlertCircle className="h-6 w-6 text-white" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-red-900 text-lg">Reserva Atrasada!</h3>
                <Button
                  onClick={() => dismissAlert(reserva.id)}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-red-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <p className="text-gray-900 font-semibold mb-1">{reserva.nome}</p>
              <p className="text-sm text-gray-700 mb-1">
                📞 {reserva.telefone}
              </p>
              <p className="text-sm text-gray-700 mb-3">
                🕐 Horário: {reserva.horario_reserva}
              </p>
              
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-2 mb-3">
                <p className="text-sm font-bold text-red-800 text-center">
                  ⏰ {reserva.minutosAtraso} minutos de atraso
                </p>
              </div>

              {/* Indicador de mensagem enviada */}
              {reserva.mensagemEnviada && (
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-2 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <p className="text-xs font-semibold text-green-800">
                    ✅ Mensagem automática enviada pela IA
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  onClick={() => handleVerReserva(reserva.id)}
                  size="sm" 
                  className="flex-1 bg-gradient-to-r from-[#8B2E3D] to-[#7A1F2E] hover:from-[#7A1F2E] hover:to-[#8B2E3D] text-white"
                >
                  Ver Reserva
                </Button>
                <Button 
                  onClick={() => handleVerWhatsApp(reserva.telefone)}
                  size="sm" 
                  variant="outline"
                  className="flex-1 border-[#8B2E3D] text-[#8B2E3D] hover:bg-[#8B2E3D] hover:text-white"
                >
                  <Phone className="h-4 w-4 mr-1" />
                  Ligar
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Notificações de Mensagens Enviadas */}
      {mensagensEnviadas.map(mensagem => (
        <div
          key={mensagem.id}
          className="bg-white border-4 border-green-500 rounded-2xl shadow-2xl p-4 animate-in slide-in-from-right"
        >
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-xl bg-green-600 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-green-900 text-lg">Mensagem Enviada!</h3>
                <Button
                  onClick={() => dismissMensagem(mensagem.id)}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-green-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <p className="text-gray-900 font-semibold mb-1">{mensagem.nome}</p>
              <p className="text-sm text-gray-700 mb-1">
                📞 {mensagem.telefone}
              </p>
              <p className="text-xs text-gray-600 mb-2 italic line-clamp-2">
                "{mensagem.mensagem.substring(0, 80)}..."
              </p>
              
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-2 mb-3">
                <p className="text-xs font-semibold text-green-800 text-center">
                  ✅ Mensagem automática enviada pela IA
                </p>
                <p className="text-xs text-green-700 text-center mt-1">
                  {new Date(mensagem.data_envio).toLocaleString('pt-BR')}
                </p>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => handleVerWhatsApp(mensagem.telefone)}
                  size="sm" 
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                >
                  <Phone className="h-4 w-4 mr-1" />
                  Ver Chat
                </Button>
                <Button 
                  onClick={handleVerHistorico}
                  size="sm" 
                  variant="outline"
                  className="flex-1 border-green-600 text-green-700 hover:bg-green-50"
                >
                  Ver Histórico
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

