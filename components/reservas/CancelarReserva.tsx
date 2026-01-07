"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
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
import { X, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface CancelarReservaProps {
  reservaId: string
  nomeCliente: string
  dataReserva: string
  horarioReserva: string
  onCancelado?: () => void
}

export default function CancelarReserva({
  reservaId,
  nomeCliente,
  dataReserva,
  horarioReserva,
  onCancelado,
}: CancelarReservaProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleCancelar = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/reservas/${reservaId}/cancelar`, {
        method: "PATCH",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao cancelar reserva")
      }

      toast.success("Reserva cancelada com sucesso!", {
        description: `A reserva de ${nomeCliente} foi cancelada. O horário está livre.`,
      })

      // Atualizar página
      if (onCancelado) {
        onCancelado()
      } else {
        router.refresh()
      }
    } catch (error: any) {
      console.error("Erro ao cancelar reserva:", error)
      toast.error("Erro ao cancelar reserva", {
        description: error.message || "Tente novamente mais tarde.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-red-600 text-red-600 hover:bg-red-50 hover:text-red-700"
          title="Cancelar reserva"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Cancelando...
            </>
          ) : (
            <>
              <X className="h-4 w-4 mr-2" />
              Cancelar Reserva
            </>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancelar Reserva</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Tem certeza que deseja cancelar a reserva de <strong>{nomeCliente}</strong>?
            </p>
            <p className="text-sm text-gray-600">
              Data: {new Date(dataReserva).toLocaleDateString('pt-BR')} às {horarioReserva}
            </p>
            <p className="text-sm font-semibold text-red-600 mt-2">
              ⚠️ Esta ação não pode ser desfeita. O horário ficará livre para novas reservas.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Não, manter reserva</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCancelar}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Cancelando...
              </>
            ) : (
              "Sim, cancelar reserva"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

