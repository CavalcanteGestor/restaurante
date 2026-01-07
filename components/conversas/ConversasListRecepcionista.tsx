"use client"

import Link from "next/link"
import { formatDateTime } from "@/lib/utils/date"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Bot, User, Phone, ArrowRight } from "lucide-react"
import { Database } from "@/types/database"

type Lead = Database['public']['Tables']['leads']['Row']

interface LeadComStatus extends Lead {
  atendimento_humano_ativo?: boolean
}

interface ConversasListRecepcionistaProps {
  leads: LeadComStatus[]
  showIAStatus?: boolean
}

export default function ConversasListRecepcionista({ 
  leads, 
  showIAStatus = false 
}: ConversasListRecepcionistaProps) {
  if (leads.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-16 w-16 text-gray-600 mx-auto mb-4 opacity-70" />
        <p className="text-gray-700 font-medium text-lg">Nenhuma conversa encontrada</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {leads.map((lead) => {
        const isAtendimentoHumano = lead.atendimento_humano_ativo === true
        const isIA = !isAtendimentoHumano

        return (
          <div
            key={lead.id}
            className={`flex items-center justify-between p-4 border-2 rounded-lg transition-all hover:shadow-md ${
              isAtendimentoHumano
                ? 'border-green-200 bg-green-50/50 hover:border-green-300'
                : 'border-blue-200 bg-blue-50/30 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center gap-4 flex-1">
              {/* Status Icon */}
              <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                isAtendimentoHumano
                  ? 'bg-green-100'
                  : 'bg-blue-100'
              }`}>
                {isAtendimentoHumano ? (
                  <User className="h-6 w-6 text-green-600" />
                ) : (
                  <Bot className="h-6 w-6 text-blue-600" />
                )}
              </div>

              {/* Lead Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-base text-gray-900 truncate">
                    {lead.nome}
                  </p>
                  {showIAStatus && (
                    <Badge 
                      className={`${
                        isAtendimentoHumano
                          ? 'bg-green-600 text-white'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      {isAtendimentoHumano ? (
                        <>
                          <User className="h-3 w-3 mr-1" />
                          Atendimento Humano
                        </>
                      ) : (
                        <>
                          <Bot className="h-3 w-3 mr-1" />
                          IA Respondendo
                        </>
                      )}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    <span className="font-mono">{lead.telefone}</span>
                  </div>
                  {lead.data_ultima_msg && (
                    <>
                      <span>•</span>
                      <span>{formatDateTime(lead.data_ultima_msg)}</span>
                    </>
                  )}
                </div>
                {lead.mensagem && (
                  <p className="text-sm text-gray-700 mt-1 truncate max-w-md">
                    {lead.mensagem}
                  </p>
                )}
                {lead.etapa && (
                  <Badge variant="outline" className="mt-2 text-xs bg-gray-50 text-gray-700 border-gray-300">
                    {lead.etapa}
                  </Badge>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Link href={`/recepcionista/whatsapp/${encodeURIComponent(lead.telefone)}`}>
                <Button 
                  variant={isAtendimentoHumano ? "default" : "outline"}
                  size="sm"
                  className={`gap-2 ${
                    isAtendimentoHumano
                      ? 'bg-[#8B2E3D] hover:bg-[#7A1F2E] text-white'
                      : 'border-[#8B2E3D] text-[#8B2E3D] hover:bg-[#8B2E3D]/10'
                  }`}
                >
                  <MessageSquare className="h-4 w-4" />
                  {isAtendimentoHumano ? 'Responder' : 'Ver Conversa'}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        )
      })}
    </div>
  )
}

