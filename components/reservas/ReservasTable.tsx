"use client"

import { useState, memo } from "react"
import Link from "next/link"
import { formatDate, formatTime, isAtrasado } from "@/lib/utils/date"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Database } from "@/types/database"
import { Edit, MessageSquare, Search, Clock, Users, Calendar, Download } from "lucide-react"
import StatusComparecimento from "./StatusComparecimento"
import CancelarReserva from "./CancelarReserva"

type Reserva = Database['public']['Tables']['reservas']['Row']

interface ReservasTableProps {
  reservas: Reserva[]
}

const ReservasTable = memo(function ReservasTable({ reservas }: ReservasTableProps) {
  const [filter, setFilter] = useState("")

  const filteredReservas = reservas.filter((reserva) => {
    if (!filter) return true
    const searchTerm = filter.toLowerCase()
    return (
      reserva.nome.toLowerCase().includes(searchTerm) ||
      reserva.telefone.includes(searchTerm) ||
      reserva.mesas?.toLowerCase().includes(searchTerm)
    )
  })

  const getStatusBadge = (etapa: string | null, data: string, hora: string) => {
    if (isAtrasado(data, hora)) {
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-200">
          <Clock className="h-3 w-3 mr-1" />
          Atrasada
        </Badge>
      )
    }
    switch (etapa) {
      case "reserva_confirmada":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Confirmada</Badge>
      case "interesse":
        return <Badge className="bg-yellow-500 text-white border-yellow-600 font-semibold">Pendente</Badge>
      case "cancelado":
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">Cancelada</Badge>
      default:
        return <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">Interesse</Badge>
    }
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-700" />
        <Input
          type="text"
          placeholder="Buscar por nome, telefone ou mesa..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="pl-10 w-full max-w-md bg-gray-50 border-gray-200 focus:bg-white"
        />
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {filteredReservas.length === 0 ? (
          <div className="text-center p-12">
            <Calendar className="h-12 w-12 text-gray-600 mx-auto mb-4 opacity-70" />
            <p className="text-gray-600 font-medium">Nenhuma reserva encontrada</p>
            <p className="text-sm text-gray-600 mt-1">
              {filter ? "Tente ajustar os filtros de busca" : "Crie sua primeira reserva"}
            </p>
          </div>
        ) : (
          filteredReservas.map((reserva) => (
            <div
              key={reserva.id}
              className="bg-white border-2 border-gray-200 rounded-lg p-4 space-y-3 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg">{reserva.nome}</h3>
                  <p className="text-sm text-gray-600 font-mono mt-1">{reserva.telefone}</p>
                </div>
                {getStatusBadge(reserva.etapa, reserva.data_reserva, reserva.horario_reserva)}
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1 text-gray-700">
                  <Calendar className="h-4 w-4" />
                  {formatDate(reserva.data_reserva)}
                </div>
                <div className="flex items-center gap-1 text-gray-700">
                  <Clock className="h-4 w-4" />
                  {formatTime(reserva.horario_reserva)}
                </div>
                <div className="flex items-center gap-1 text-gray-700">
                  <Users className="h-4 w-4" />
                  {reserva.numero_pessoas} pessoas
                </div>
                {reserva.mesas && (
                  <div className="text-gray-700">
                    <Badge variant="outline" className="font-mono text-xs bg-blue-50 text-blue-700 border-blue-300">
                      {reserva.mesas}
                    </Badge>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-gray-200">
                <StatusComparecimento
                  reservaId={reserva.id}
                  statusAtual={(reserva as any).status_comparecimento || 'agendado'}
                  nomeCliente={reserva.nome}
                />
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                <Link href={`/reservas/${reserva.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <Edit className="h-4 w-4 mr-2" />
                    Ver Detalhes
                  </Button>
                </Link>
                <Link href={`/whatsapp/${reserva.telefone}`}>
                  <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </Link>
                {reserva.etapa !== 'cancelado' && (
                  <CancelarReserva
                    reservaId={reserva.id}
                    nomeCliente={reserva.nome}
                    dataReserva={reserva.data_reserva}
                    horarioReserva={reserva.horario_reserva}
                  />
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b">
              <tr>
                <th className="text-left p-4 font-semibold text-sm text-gray-700">Cliente</th>
                <th className="text-left p-4 font-semibold text-sm text-gray-700">Contato</th>
                <th className="text-left p-4 font-semibold text-sm text-gray-700">Data & Horário</th>
                <th className="text-left p-4 font-semibold text-sm text-gray-700">Pessoas</th>
                <th className="text-left p-4 font-semibold text-sm text-gray-700">Mesas</th>
                <th className="text-left p-4 font-semibold text-sm text-gray-700">Status</th>
                <th className="text-left p-4 font-semibold text-sm text-gray-700">Comparecimento</th>
                <th className="text-left p-4 font-semibold text-sm text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredReservas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center p-12">
                    <Calendar className="h-12 w-12 text-gray-600 mx-auto mb-4 opacity-70" />
                    <p className="text-gray-600 font-medium">Nenhuma reserva encontrada</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {filter ? "Tente ajustar os filtros de busca" : "Crie sua primeira reserva"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredReservas.map((reserva) => (
                  <tr 
                    key={reserva.id} 
                    className="hover:bg-[#8B2E3D]/5 transition-colors group"
                  >
                    <td className="p-4">
                      <div className="font-semibold text-gray-900 group-hover:text-[#8B2E3D] transition-colors">
                        {reserva.nome}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-600 font-mono">
                        {reserva.telefone}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1 text-sm font-medium">
                          <Calendar className="h-3 w-3 text-gray-700" />
                          {formatDate(reserva.data_reserva)}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Clock className="h-3 w-3" />
                          {formatTime(reserva.horario_reserva)}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-sm">
                        <Users className="h-4 w-4 text-gray-700" />
                        <span className="font-medium">{reserva.numero_pessoas}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      {reserva.mesas ? (
                        <Badge variant="outline" className="font-mono text-xs bg-blue-50 text-blue-700 border-blue-300">
                          {reserva.mesas}
                        </Badge>
                      ) : (
                        <span className="text-gray-700 text-sm">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      {getStatusBadge(reserva.etapa, reserva.data_reserva, reserva.horario_reserva)}
                    </td>
                    <td className="p-4">
                      <StatusComparecimento
                        reservaId={reserva.id}
                        statusAtual={(reserva as any).status_comparecimento || 'agendado'}
                        nomeCliente={reserva.nome}
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/reservas/${reserva.id}`}>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 hover:bg-[#8B2E3D]/10 text-gray-700 hover:text-[#8B2E3D]"
                            title="Editar reserva"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/whatsapp/${reserva.telefone}`}>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 hover:bg-blue-100 text-gray-700 hover:text-blue-600"
                            title="Abrir conversa no WhatsApp"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 hover:bg-green-100 text-gray-700 hover:text-green-600"
                          title="Baixar PDF"
                          onClick={() => {
                            window.open(`/api/reservas/${reserva.id}/pdf`, '_blank')
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        {reserva.etapa !== 'cancelado' && (
                          <CancelarReserva
                            reservaId={reserva.id}
                            nomeCliente={reserva.nome}
                            dataReserva={reserva.data_reserva}
                            horarioReserva={reserva.horario_reserva}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results Count */}
      {filter && (
        <div className="text-sm text-gray-600">
          Mostrando {filteredReservas.length} de {reservas.length} reservas
        </div>
      )}
    </div>
  )
})

export default ReservasTable
