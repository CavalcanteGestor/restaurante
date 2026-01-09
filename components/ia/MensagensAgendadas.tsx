"use client"

import { useState, useEffect } from "react"
import { Database } from "@/types/database"
import { formatDateTime } from "@/lib/utils/date"
import { Clock, CheckCircle2, XCircle, AlertCircle, Play, Trash2, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import CriarMensagemAgendada from "./CriarMensagemAgendada"

type MensagemAgendada = Database['public']['Tables']['mensagens_agendadas']['Row']

export default function MensagensAgendadas() {
  const [mensagens, setMensagens] = useState<MensagemAgendada[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const router = useRouter()

  useEffect(() => {
    carregarMensagens()
  }, [statusFilter])

  async function carregarMensagens() {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== "all") {
        params.append('status', statusFilter)
      }

      const response = await fetch(`/api/ia/mensagens-agendadas?${params.toString()}`)
      if (!response.ok) throw new Error("Erro ao carregar mensagens")
      
      const data = await response.json()
      setMensagens(data)
    } catch (error: any) {
      console.error("Erro ao carregar mensagens:", error)
      toast.error("Erro ao carregar mensagens agendadas")
    } finally {
      setLoading(false)
    }
  }

  async function executarMensagem(id: string) {
    try {
      const response = await fetch(`/api/ia/mensagens-agendadas/${id}/executar`, {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erro ao executar mensagem")
      }

      toast.success("Mensagem enviada com sucesso!")
      carregarMensagens()
      router.refresh()
    } catch (error: any) {
      console.error("Erro ao executar mensagem:", error)
      toast.error(error.message || "Erro ao executar mensagem")
    }
  }

  async function cancelarMensagem(id: string) {
    try {
      const response = await fetch(`/api/ia/mensagens-agendadas/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelada' }),
      })

      if (!response.ok) throw new Error("Erro ao cancelar mensagem")

      toast.success("Mensagem cancelada com sucesso!")
      carregarMensagens()
    } catch (error: any) {
      console.error("Erro ao cancelar mensagem:", error)
      toast.error(error.message || "Erro ao cancelar mensagem")
    }
  }

  async function deletarMensagem(id: string) {
    try {
      const response = await fetch(`/api/ia/mensagens-agendadas/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error("Erro ao deletar mensagem")

      toast.success("Mensagem deletada com sucesso!")
      carregarMensagens()
    } catch (error: any) {
      console.error("Erro ao deletar mensagem:", error)
      toast.error(error.message || "Erro ao deletar mensagem")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>
      case 'enviada':
        return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle2 className="h-3 w-3 mr-1" />Enviada</Badge>
      case 'cancelada':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200"><XCircle className="h-3 w-3 mr-1" />Cancelada</Badge>
      case 'erro':
        return <Badge className="bg-red-100 text-red-800 border-red-200"><AlertCircle className="h-3 w-3 mr-1" />Erro</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'confirmacao':
        return 'Confirmação'
      case 'cancelamento':
        return 'Cancelamento'
      case 'atraso':
        return 'Atraso'
      case 'lembrete':
        return 'Lembrete'
      default:
        return tipo
    }
  }

  const filteredMensagens = mensagens.slice(0, 10) // Mostrar apenas últimas 10

  return (
    <div className="space-y-4">
      {/* Header com filtros e criar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="enviada">Enviada</SelectItem>
            <SelectItem value="erro">Erro</SelectItem>
            <SelectItem value="cancelada">Cancelada</SelectItem>
          </SelectContent>
        </Select>

        <CriarMensagemAgendada onSuccess={carregarMensagens} />
      </div>

      {/* Lista */}
      {loading ? (
        <div className="text-center py-8">
          <RefreshCw className="h-8 w-8 text-gray-400 mx-auto mb-2 animate-spin" />
          <p className="text-sm text-gray-600">Carregando mensagens...</p>
        </div>
      ) : filteredMensagens.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-900 font-medium">Nenhuma mensagem encontrada</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {filteredMensagens.map((msg) => (
            <div
              key={msg.id}
              className="border-2 rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900">{msg.nome}</p>
                    {getStatusBadge(msg.status)}
                    <Badge variant="outline" className="text-xs">
                      {getTipoLabel(msg.tipo)}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 font-mono">{msg.telefone}</p>
                </div>
              </div>

              <p className="text-sm text-gray-800 mb-3 line-clamp-2">{msg.mensagem}</p>

              <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                <div>
                  <span className="font-medium">Agendado para:</span>{" "}
                  {formatDateTime(msg.agendado_para)}
                </div>
                {msg.enviado_em && (
                  <div>
                    <span className="font-medium">Enviado em:</span>{" "}
                    {formatDateTime(msg.enviado_em)}
                  </div>
                )}
              </div>

              {msg.erro && (
                <div className="mb-3 p-2 bg-red-50 border-l-4 border-red-400 rounded">
                  <p className="text-xs text-red-800 font-medium">Erro:</p>
                  <p className="text-xs text-red-700">{msg.erro}</p>
                </div>
              )}

              {/* Ações */}
              {msg.status === 'pendente' && (
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => executarMensagem(msg.id)}
                    className="flex-1"
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Executar Agora
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline" className="text-red-600">
                        <XCircle className="h-3 w-3 mr-1" />
                        Cancelar
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancelar mensagem agendada?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação irá cancelar a mensagem agendada. Você pode recriar depois se necessário.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Voltar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => cancelarMensagem(msg.id)}>
                          Cancelar Mensagem
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline" className="text-red-600">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Deletar mensagem?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. A mensagem será permanentemente removida.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => deletarMensagem(msg.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Deletar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

