"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Clock, Ban } from "lucide-react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface StatusComparecimentoProps {
  reservaId: string
  statusAtual: string
  nomeCliente: string
  onStatusChanged?: () => void
}

export default function StatusComparecimento({ 
  reservaId, 
  statusAtual, 
  nomeCliente,
  onStatusChanged 
}: StatusComparecimentoProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const atualizarStatus = async (novoStatus: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/reservas/${reservaId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status_comparecimento: novoStatus }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao atualizar status')
      }

      const mensagens = {
        'compareceu': '✅ Cliente marcado como compareceu!',
        'nao_compareceu': '❌ Cliente marcado como não compareceu',
        'cancelado': '🚫 Reserva cancelada',
        'agendado': '📅 Status retornado para agendado',
      }

      toast.success(mensagens[novoStatus as keyof typeof mensagens] || 'Status atualizado')
      onStatusChanged?.()
      router.refresh() // Recarrega a página para atualizar os dados
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar status')
    } finally {
      setLoading(false)
    }
  }

  const statusInfo = {
    'agendado': { label: 'Agendado', icon: Clock, color: 'bg-blue-600', textColor: 'text-blue-600' },
    'compareceu': { label: 'Compareceu', icon: CheckCircle2, color: 'bg-green-600', textColor: 'text-green-600' },
    'nao_compareceu': { label: 'Não Compareceu', icon: XCircle, color: 'bg-red-600', textColor: 'text-red-600' },
    'cancelado': { label: 'Cancelado', icon: Ban, color: 'bg-gray-600', textColor: 'text-gray-600' },
  }

  const current = statusInfo[statusAtual as keyof typeof statusInfo] || statusInfo.agendado
  const Icon = current.icon

  return (
    <div className="flex items-center gap-2">
      {/* Status Atual */}
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${current.color} text-white font-semibold text-sm`}>
        <Icon className="h-4 w-4" />
        {current.label}
      </div>

      {/* Ações Rápidas */}
      {statusAtual === 'agendado' && (
        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={loading}
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Compareceu
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Comparecimento</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que <strong>{nomeCliente}</strong> compareceu? Esta ação atualizará o status da reserva.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => atualizarStatus('compareceu')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Sim, Compareceu
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                disabled={loading}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Não Veio
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Marcar como Não Compareceu</AlertDialogTitle>
                <AlertDialogDescription>
                  <strong>{nomeCliente}</strong> não compareceu na reserva? Esta ação pode disparar mensagens automáticas.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => atualizarStatus('nao_compareceu')}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Sim, Não Compareceu
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {/* Reverter para Agendado */}
      {statusAtual !== 'agendado' && statusAtual !== 'cancelado' && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => atualizarStatus('agendado')}
          disabled={loading}
          className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
        >
          Reverter
        </Button>
      )}
    </div>
  )
}

