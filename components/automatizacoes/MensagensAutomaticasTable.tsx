"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { formatDate, formatTime } from "@/lib/utils/date"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  MessageSquare, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search,
  Phone,
  Calendar,
  AlertCircle,
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface MensagemAutomatica {
  id: string
  reserva_id: string | null
  telefone: string
  nome: string
  mensagem: string
  tipo: string
  status: string
  data_envio: string | null
  erro: string | null
  created_at: string | null
}

interface MensagensAutomaticasTableProps {
  mensagens: MensagemAutomatica[]
  onRefresh?: () => void
}

export default function MensagensAutomaticasTable({ 
  mensagens: initialMensagens,
  onRefresh 
}: MensagensAutomaticasTableProps) {
  const [mensagens, setMensagens] = useState(initialMensagens)
  const [filter, setFilter] = useState("")
  const [tipoFilter, setTipoFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    setMensagens(initialMensagens)
  }, [initialMensagens])

  const filteredMensagens = mensagens.filter((msg) => {
    if (filter && !msg.nome.toLowerCase().includes(filter.toLowerCase()) && 
        !msg.telefone.includes(filter)) {
      return false
    }
    if (tipoFilter !== "all" && msg.tipo !== tipoFilter) {
      return false
    }
    if (statusFilter !== "all" && msg.status !== statusFilter) {
      return false
    }
    return true
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'enviada':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Enviada
          </Badge>
        )
      case 'erro':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Erro
          </Badge>
        )
      case 'cancelada':
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            Cancelada
          </Badge>
        )
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Pendente
          </Badge>
        )
    }
  }

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'nao_comparecimento':
        return 'Não Comparecimento'
      case 'atraso':
        return 'Atraso'
      case 'lembrete':
        return 'Lembrete'
      default:
        return tipo
    }
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar por nome ou telefone..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={tipoFilter} onValueChange={setTipoFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="nao_comparecimento">Não Comparecimento</SelectItem>
            <SelectItem value="atraso">Atraso</SelectItem>
            <SelectItem value="lembrete">Lembrete</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="enviada">Enviada</SelectItem>
            <SelectItem value="erro">Erro</SelectItem>
            <SelectItem value="cancelada">Cancelada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabela */}
      <div className="border rounded-lg overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b">
              <tr>
                <th className="text-left p-4 font-semibold text-sm text-gray-700">Data/Hora</th>
                <th className="text-left p-4 font-semibold text-sm text-gray-700">Cliente</th>
                <th className="text-left p-4 font-semibold text-sm text-gray-700">Telefone</th>
                <th className="text-left p-4 font-semibold text-sm text-gray-700">Tipo</th>
                <th className="text-left p-4 font-semibold text-sm text-gray-700">Mensagem</th>
                <th className="text-left p-4 font-semibold text-sm text-gray-700">Status</th>
                <th className="text-left p-4 font-semibold text-sm text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMensagens.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-12">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4 opacity-70" />
                    <p className="text-gray-600 font-medium">Nenhuma mensagem encontrada</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {filter || tipoFilter !== "all" || statusFilter !== "all" 
                        ? "Tente ajustar os filtros" 
                        : "Nenhuma mensagem automática foi enviada ainda"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredMensagens.map((msg) => (
                  <tr 
                    key={msg.id} 
                    className="hover:bg-[#8B2E3D]/5 transition-colors group"
                  >
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        {msg.data_envio ? (
                          <>
                            <div className="flex items-center gap-1 text-sm font-medium">
                              <Calendar className="h-3 w-3 text-gray-500" />
                              {formatDate(msg.data_envio)}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <Clock className="h-3 w-3" />
                              {formatTime(msg.data_envio)}
                            </div>
                          </>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-gray-900 group-hover:text-[#8B2E3D] transition-colors">
                        {msg.nome}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-600 font-mono">
                        {msg.telefone}
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="text-xs">
                        {getTipoLabel(msg.tipo)}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="max-w-md">
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {msg.mensagem}
                        </p>
                        {msg.erro && (
                          <div className="mt-1 flex items-start gap-1 text-xs text-red-600">
                            <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            <span>{msg.erro}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(msg.status)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {msg.reserva_id && (
                          <Link href={`/reservas/${msg.reserva_id}`}>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 hover:bg-[#8B2E3D]/10 text-gray-700 hover:text-[#8B2E3D]"
                              title="Ver reserva"
                            >
                              <Calendar className="h-4 w-4" />
                            </Button>
                          </Link>
                        )}
                        <Link href={`/whatsapp?telefone=${msg.telefone}`}>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 hover:bg-blue-100 text-gray-700 hover:text-blue-600"
                            title="Abrir WhatsApp"
                          >
                            <Phone className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

