"use client"

import { useState } from "react"
import { Database } from "@/types/database"
import { formatDateTime } from "@/lib/utils/date"
import { MessageSquare, User } from "lucide-react"

type Conversa = Database['public']['Tables']['conversas']['Row']

interface ConversasListProps {
  conversas: Conversa[]
}

export default function ConversasList({ conversas }: ConversasListProps) {
  const [filter, setFilter] = useState("")

  const filteredConversas = conversas.filter((conversa) => {
    if (!filter) return true
    const searchTerm = filter.toLowerCase()
    return (
      conversa.nome?.toLowerCase().includes(searchTerm) ||
      conversa.numero.includes(searchTerm) ||
      conversa.mensagem_ia?.toLowerCase().includes(searchTerm) ||
      conversa.mensagem_lead?.toLowerCase().includes(searchTerm)
    )
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Buscar por nome, telefone ou conteúdo..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-md"
        />
      </div>

      <div className="space-y-4">
        {filteredConversas.length === 0 ? (
          <div className="text-center py-12 text-gray-700">
            Nenhuma conversa encontrada
          </div>
        ) : (
          filteredConversas.map((conversa) => (
            <div
              key={conversa.id}
              className="border rounded-lg p-4 hover:bg-gray-50"
            >
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium">{conversa.nome || conversa.numero}</p>
                      <p className="text-sm text-gray-600">{conversa.numero}</p>
                    </div>
                    {conversa.data_mensagem && (
                      <p className="text-sm text-gray-700">
                        {formatDateTime(conversa.data_mensagem)}
                      </p>
                    )}
                  </div>
                  {conversa.mensagem_ia && (
                    <div className="mb-2 p-2 bg-blue-50 rounded">
                      <p className="text-xs text-blue-600 font-medium mb-1">IA:</p>
                      <p className="text-sm">{conversa.mensagem_ia}</p>
                    </div>
                  )}
                  {conversa.mensagem_lead && (
                    <div className="p-2 bg-gray-50 rounded">
                      <p className="text-xs text-gray-600 font-medium mb-1">Cliente:</p>
                      <p className="text-sm">{conversa.mensagem_lead}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

