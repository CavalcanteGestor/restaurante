"use client"

import { useState, useEffect } from "react"
import { Database } from "@/types/database"
import { formatDateTime } from "@/lib/utils/date"
import { MessageSquare, Bot, User, Phone, Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"

type Conversa = Database['public']['Tables']['conversas']['Row']

export default function HistoricoConversas() {
  const [conversas, setConversas] = useState<Conversa[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("")
  const [tipoFilter, setTipoFilter] = useState<string>("all")

  useEffect(() => {
    carregarConversas()
  }, [tipoFilter])

  async function carregarConversas() {
    try {
      setLoading(true)
      const supabase = createClient()
      
      let query = supabase
        .from('conversas')
        .select('*')
        .order('data_mensagem', { ascending: false })
        .limit(100)

      if (tipoFilter !== "all") {
        query = query.eq('tipo_mensagem', tipoFilter)
      }

      const { data, error } = await query

      if (error) throw error
      setConversas((data || []) as Conversa[])
    } catch (error) {
      console.error("Erro ao carregar conversas:", error)
    } finally {
      setLoading(false)
    }
  }

  const getTipoBadge = (conversa: Conversa) => {
    if (!conversa.tipo_mensagem) {
      // Se tem mensagem_ia e mensagem_lead, é conversa normal
      if (conversa.mensagem_ia && conversa.mensagem_lead) {
        return { label: "Conversa", className: "bg-blue-100 text-blue-800 border-blue-200" }
      }
      // Se só tem mensagem_ia, é resposta da IA
      if (conversa.mensagem_ia && !conversa.mensagem_lead) {
        return { label: "IA", className: "bg-purple-100 text-purple-800 border-purple-200" }
      }
      // Se só tem mensagem_lead, é mensagem do cliente
      return { label: "Cliente", className: "bg-gray-100 text-gray-800 border-gray-200" }
    }

    // Tipos específicos
    if (conversa.tipo_mensagem.includes('ATENDENTE') || conversa.tipo_mensagem === 'HUMANO') {
      return { label: "Atendimento Humano", className: "bg-green-100 text-green-800 border-green-200" }
    }
    if (conversa.tipo_mensagem.includes('AUTOMATICA')) {
      return { label: "Automática", className: "bg-orange-100 text-orange-800 border-orange-200" }
    }
    if (conversa.tipo_mensagem === 'LeadParaAtendimentoHumano') {
      return { label: "Lead → Humano", className: "bg-yellow-100 text-yellow-800 border-yellow-200" }
    }

    return { label: conversa.tipo_mensagem, className: "bg-gray-100 text-gray-800 border-gray-200" }
  }

  const filteredConversas = conversas.filter((conv) => {
    if (!filter) return true
    const searchTerm = filter.toLowerCase()
    return (
      (conv.nome || '').toLowerCase().includes(searchTerm) ||
      conv.numero.includes(searchTerm) ||
      (conv.mensagem_ia || '').toLowerCase().includes(searchTerm) ||
      (conv.mensagem_lead || '').toLowerCase().includes(searchTerm)
    )
  })

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-700" />
          <Input
            type="text"
            placeholder="Buscar por nome, telefone ou mensagem..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
          />
        </div>
        <Select value={tipoFilter} onValueChange={setTipoFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="HUMANO">Atendimento Humano</SelectItem>
            <SelectItem value="AUTOMATICA">Mensagens Automáticas</SelectItem>
            <SelectItem value="LeadParaAtendimentoHumano">Lead → Humano</SelectItem>
          </SelectContent>
        </Select>
        <Button
          onClick={carregarConversas}
          variant="outline"
          className="whitespace-nowrap"
        >
          Atualizar
        </Button>
      </div>

      {/* Lista de Conversas */}
      {loading ? (
        <div className="text-center py-12">
          <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Carregando conversas...</p>
        </div>
      ) : filteredConversas.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-900 font-medium">Nenhuma conversa encontrada</p>
          <p className="text-sm text-gray-600 mt-1">
            {filter ? "Tente ajustar os filtros de busca" : "Ainda não há conversas registradas"}
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {filteredConversas.map((conversa) => {
            const tipo = getTipoBadge(conversa)
            const isIA = conversa.mensagem_ia && !conversa.mensagem_lead
            const isCliente = conversa.mensagem_lead && !conversa.mensagem_ia
            const isHumano = conversa.tipo_mensagem?.includes('ATENDENTE') || conversa.tipo_mensagem === 'HUMANO'

            return (
              <div
                key={conversa.id}
                className={`border-2 rounded-lg p-4 transition-all ${
                  isIA 
                    ? 'bg-purple-50/50 border-purple-200' 
                    : isHumano
                    ? 'bg-green-50/50 border-green-200'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {isIA ? (
                      <Bot className="h-5 w-5 text-purple-600" />
                    ) : isHumano ? (
                      <User className="h-5 w-5 text-green-600" />
                    ) : (
                      <MessageSquare className="h-5 w-5 text-gray-600" />
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">{conversa.nome || conversa.numero}</p>
                      <p className="text-xs text-gray-600 font-mono">{conversa.numero}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {tipo && (
                      <Badge variant="outline" className={tipo.className}>
                        {tipo.label}
                      </Badge>
                    )}
                    {conversa.data_mensagem && (
                      <p className="text-xs text-gray-600">
                        {formatDateTime(conversa.data_mensagem)}
                      </p>
                    )}
                  </div>
                </div>

                {conversa.mensagem_lead && (
                  <div className="mb-3 p-3 bg-gray-100 rounded-lg border-l-4 border-gray-400">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="h-3 w-3 text-gray-600" />
                      <p className="text-xs font-semibold text-gray-700">Cliente:</p>
                    </div>
                    <p className="text-sm text-gray-900">{conversa.mensagem_lead}</p>
                  </div>
                )}

                {conversa.mensagem_ia && (
                  <div className={`p-3 rounded-lg border-l-4 ${
                    isHumano
                      ? 'bg-green-50 border-green-400'
                      : 'bg-purple-50 border-purple-400'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      {isHumano ? (
                        <>
                          <User className="h-3 w-3 text-green-600" />
                          <p className="text-xs font-semibold text-green-700">Atendente:</p>
                        </>
                      ) : (
                        <>
                          <Bot className="h-3 w-3 text-purple-600" />
                          <p className="text-xs font-semibold text-purple-700">IA:</p>
                        </>
                      )}
                    </div>
                    <p className={`text-sm ${
                      isHumano ? 'text-green-900' : 'text-purple-900'
                    }`}>
                      {conversa.mensagem_ia}
                    </p>
                  </div>
                )}

                {(conversa.sessionid || conversa.conversation_id) && (
                  <div className="mt-2 pt-2 border-t border-gray-200 flex flex-wrap gap-2 text-xs text-gray-500">
                    {conversa.sessionid && (
                      <span className="font-mono">Session: {conversa.sessionid.substring(0, 8)}...</span>
                    )}
                    {conversa.conversation_id && (
                      <span className="font-mono">Conv ID: {conversa.conversation_id.substring(0, 8)}...</span>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

