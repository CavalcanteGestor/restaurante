"use client"

import { useState } from "react"
import Link from "next/link"
import { Database } from "@/types/database"
import { Button } from "@/components/ui/button"
import { formatDateTime } from "@/lib/utils/date"
import { MessageSquare, Calendar, User } from "lucide-react"

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

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Buscar por nome, telefone ou etapa..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-md"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3 font-medium text-gray-700">Nome</th>
              <th className="text-left p-3 font-medium text-gray-700">Telefone</th>
              <th className="text-left p-3 font-medium text-gray-700">Etapa</th>
              <th className="text-left p-3 font-medium text-gray-700">Última Mensagem</th>
              <th className="text-left p-3 font-medium text-gray-700">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center p-8 text-gray-700">
                  Nenhum lead encontrado
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead) => (
                <tr key={lead.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{lead.nome}</td>
                  <td className="p-3">{lead.telefone}</td>
                  <td className="p-3">
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                      {lead.etapa}
                    </span>
                  </td>
                  <td className="p-3">
                    {lead.data_ultima_msg
                      ? formatDateTime(lead.data_ultima_msg)
                      : "-"}
                  </td>
                  <td className="p-3">
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
  )
}

