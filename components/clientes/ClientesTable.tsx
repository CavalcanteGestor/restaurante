"use client"

import { useState } from "react"
import Link from "next/link"
import { formatDate } from "@/lib/utils/date"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Cliente } from "@/lib/db/clientes"
import { Edit, MessageSquare, Search, Calendar, Phone, Users, Eye } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"

interface ClientesTableProps {
  clientes: Cliente[]
}

export default function ClientesTable({ clientes }: ClientesTableProps) {
  const [filter, setFilter] = useState("")
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null)

  const filteredClientes = clientes.filter((cliente) => {
    if (!filter) return true
    const searchTerm = filter.toLowerCase()
    return (
      cliente.nome.toLowerCase().includes(searchTerm) ||
      cliente.telefone.includes(searchTerm)
    )
  })

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-700" />
        <Input
          type="text"
          placeholder="Buscar por nome ou telefone..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="pl-10 w-full max-w-md bg-gray-50 border-gray-200 focus:bg-white"
        />
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b">
              <tr>
                <th className="text-left p-4 font-semibold text-sm text-gray-700">Cliente</th>
                <th className="text-left p-4 font-semibold text-sm text-gray-700">Contato</th>
                <th className="text-left p-4 font-semibold text-sm text-gray-700">Total Reservas</th>
                <th className="text-left p-4 font-semibold text-sm text-gray-700">Primeira Reserva</th>
                <th className="text-left p-4 font-semibold text-sm text-gray-700">Última Reserva</th>
                <th className="text-left p-4 font-semibold text-sm text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredClientes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-12">
                    <Users className="h-12 w-12 text-gray-600 mx-auto mb-4 opacity-70" />
                    <p className="text-gray-600 font-medium">Nenhum cliente encontrado</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {filter ? "Tente ajustar os filtros de busca" : "Os clientes aparecerão aqui quando houver reservas"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredClientes.map((cliente) => (
                  <tr 
                    key={cliente.telefone} 
                    className="hover:bg-[#8B2E3D]/5 transition-colors group"
                  >
                    <td className="p-4">
                      <div className="font-semibold text-gray-900 group-hover:text-[#8B2E3D] transition-colors">
                        {cliente.nome}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 font-mono">
                        <Phone className="h-3 w-3" />
                        {cliente.telefone}
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className="bg-[#8B2E3D] text-white font-semibold">
                        {cliente.totalReservas} {cliente.totalReservas === 1 ? 'reserva' : 'reservas'}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-sm text-gray-700">
                        <Calendar className="h-3 w-3" />
                        {formatDate(cliente.primeiraReserva)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-sm text-gray-700">
                        <Calendar className="h-3 w-3" />
                        {formatDate(cliente.ultimaReserva)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setClienteSelecionado(cliente)}
                              className="h-8 w-8 p-0 hover:bg-blue-100 text-gray-700 hover:text-blue-600"
                              title="Ver histórico"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-white border-2 border-[#8B2E3D]/20 shadow-2xl">
                            <DialogHeader>
                              <DialogTitle className="text-2xl font-serif font-bold text-[#8B2E3D]">
                                {cliente.nome}
                              </DialogTitle>
                              <DialogDescription className="text-gray-700 font-medium">
                                Histórico completo de reservas
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 mt-4">
                              <div className="grid grid-cols-3 gap-4">
                                <Card className="bg-gradient-to-br from-[#8B2E3D]/5 to-transparent">
                                  <CardContent className="p-4">
                                    <p className="text-sm text-gray-600">Total de Reservas</p>
                                    <p className="text-2xl font-bold text-[#8B2E3D]">{cliente.totalReservas}</p>
                                  </CardContent>
                                </Card>
                                <Card className="bg-gradient-to-br from-green-50 to-transparent">
                                  <CardContent className="p-4">
                                    <p className="text-sm text-gray-600">Primeira Reserva</p>
                                    <p className="text-lg font-bold text-green-600">{formatDate(cliente.primeiraReserva)}</p>
                                  </CardContent>
                                </Card>
                                <Card className="bg-gradient-to-br from-blue-50 to-transparent">
                                  <CardContent className="p-4">
                                    <p className="text-sm text-gray-600">Última Reserva</p>
                                    <p className="text-lg font-bold text-blue-600">{formatDate(cliente.ultimaReserva)}</p>
                                  </CardContent>
                                </Card>
                              </div>
                              <div className="space-y-2">
                                <h3 className="font-semibold text-gray-900">Reservas</h3>
                                {cliente.reservas.map((reserva) => (
                                  <Card key={reserva.id} className="border-2 border-gray-200 hover:border-[#8B2E3D]/50 transition-all">
                                    <CardContent className="p-4">
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <p className="font-semibold text-gray-900">
                                            {formatDate(reserva.data_reserva)} às {reserva.horario_reserva}
                                          </p>
                                          <p className="text-sm text-gray-600 mt-1">
                                            {reserva.numero_pessoas} {reserva.numero_pessoas === 1 ? 'pessoa' : 'pessoas'} • {reserva.turno === 'almoco' ? 'Almoço' : 'Jantar'}
                                          </p>
                                          {reserva.mesas && (
                                            <p className="text-xs text-gray-500 mt-1">
                                              Mesas: {reserva.mesas.split('+').join(' + ')}
                                            </p>
                                          )}
                                        </div>
                                        <Badge className={
                                          reserva.etapa === 'reserva_confirmada' ? 'bg-green-600 text-white' :
                                          reserva.etapa === 'interesse' ? 'bg-yellow-500 text-white' :
                                          reserva.etapa === 'cancelado' ? 'bg-red-600 text-white' :
                                          'bg-gray-500 text-white'
                                        }>
                                          {reserva.etapa === 'reserva_confirmada' ? 'Confirmada' :
                                           reserva.etapa === 'interesse' ? 'Pendente' :
                                           reserva.etapa === 'cancelado' ? 'Cancelada' :
                                           reserva.etapa || 'N/A'}
                                        </Badge>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Link href={`/whatsapp?telefone=${encodeURIComponent(cliente.telefone)}`}>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 hover:bg-green-100 text-gray-700 hover:text-green-600"
                            title="Abrir conversa no WhatsApp"
                          >
                            <MessageSquare className="h-4 w-4" />
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

      {/* Results Count */}
      {filter && (
        <div className="text-sm text-gray-600">
          Mostrando {filteredClientes.length} de {clientes.length} clientes
        </div>
      )}
    </div>
  )
}

