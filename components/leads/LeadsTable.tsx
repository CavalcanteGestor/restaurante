"use client"

import { useState } from "react"
import Link from "next/link"
import { Database } from "@/types/database"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { formatDateTime } from "@/lib/utils/date"
import { MessageSquare, User, Search, Phone } from "lucide-react"

type Lead = Database['public']['Tables']['leads']['Row']

interface LeadsTableProps {
  leads: Lead[]
}

export default function LeadsTable({ leads }: LeadsTableProps) {
  const [filter, setFilter] = useState("")

  const filteredLeads = leads.filter((lead) => {
    if (!filter) return true
    const searchTerm = filter.toLowerCase()
    return (
      lead.nome.toLowerCase().includes(searchTerm) ||
      lead.telefone.includes(searchTerm) ||
      (lead.etapa || "").toLowerCase().includes(searchTerm)
    )
  })

  const getEtapaBadge = (etapa: string | null) => {
    if (!etapa) return null
    
    const etapas: Record<string, { label: string; className: string }> = {
      primeiro_contato: { label: "Primeiro Contato", className: "bg-blue-100 text-blue-800 border-blue-200" },
      interesse: { label: "Interesse", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
      negociacao: { label: "Negociação", className: "bg-orange-100 text-orange-800 border-orange-200" },
      convertido: { label: "Convertido", className: "bg-green-100 text-green-800 border-green-200" },
    }
    
    const etapaInfo = etapas[etapa] || { label: etapa, className: "bg-gray-100 text-gray-800 border-gray-200" }
    
    return (
      <Badge variant="outline" className={etapaInfo.className}>
        {etapaInfo.label}
      </Badge>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-700" />
        <Input
          type="text"
          placeholder="Buscar por nome, telefone ou etapa..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="pl-10 w-full max-w-md bg-gray-50 border-gray-200 focus:bg-white"
        />
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {filteredLeads.length === 0 ? (
          <div className="text-center p-12">
            <User className="h-12 w-12 text-gray-600 mx-auto mb-4 opacity-70" />
            <p className="text-gray-900 font-medium text-base">Nenhum lead encontrado</p>
            <p className="text-sm text-gray-600 mt-1">
              {filter ? "Tente ajustar os filtros de busca" : "Ainda não há leads cadastrados"}
            </p>
          </div>
        ) : (
          filteredLeads.map((lead) => (
            <div
              key={lead.id}
              className="bg-white border-2 border-gray-200 rounded-lg p-4 space-y-3 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg">{lead.nome}</h3>
                  <p className="text-sm text-gray-600 font-mono mt-1">{lead.telefone}</p>
                </div>
                {getEtapaBadge(lead.etapa)}
              </div>
              
              {lead.data_ultima_msg && (
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-600">
                    Última mensagem: <span className="font-medium text-gray-900">{formatDateTime(lead.data_ultima_msg)}</span>
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                <Link href={`/leads/${lead.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <User className="h-4 w-4 mr-2" />
                    Ver Detalhes
                  </Button>
                </Link>
                <Link href={`/whatsapp/${encodeURIComponent(lead.telefone)}`}>
                  <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </Link>
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
                <th className="text-left p-4 font-semibold text-sm text-gray-900">Nome</th>
                <th className="text-left p-4 font-semibold text-sm text-gray-900">Telefone</th>
                <th className="text-left p-4 font-semibold text-sm text-gray-900">Etapa</th>
                <th className="text-left p-4 font-semibold text-sm text-gray-900">Última Mensagem</th>
                <th className="text-left p-4 font-semibold text-sm text-gray-900">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-12">
                    <User className="h-12 w-12 text-gray-600 mx-auto mb-4 opacity-70" />
                    <p className="text-gray-900 font-medium text-base">Nenhum lead encontrado</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {filter ? "Tente ajustar os filtros de busca" : "Ainda não há leads cadastrados"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr 
                    key={lead.id} 
                    className="hover:bg-[#8B2E3D]/5 transition-colors group"
                  >
                    <td className="p-4">
                      <div className="font-semibold text-gray-900 group-hover:text-[#8B2E3D] transition-colors">
                        {lead.nome}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-700 font-mono">
                        {lead.telefone}
                      </div>
                    </td>
                    <td className="p-4">
                      {getEtapaBadge(lead.etapa)}
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-700">
                        {lead.data_ultima_msg
                          ? formatDateTime(lead.data_ultima_msg)
                          : <span className="text-gray-400">-</span>}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/leads/${lead.id}`}>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 hover:bg-[#8B2E3D]/10 text-gray-700 hover:text-[#8B2E3D]"
                            title="Ver detalhes do lead"
                          >
                            <User className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/whatsapp/${encodeURIComponent(lead.telefone)}`}>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 hover:bg-blue-100 text-gray-700 hover:text-blue-600"
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
        <div className="text-sm text-gray-700 font-medium">
          Mostrando {filteredLeads.length} de {leads.length} leads
        </div>
      )}
    </div>
  )
}

