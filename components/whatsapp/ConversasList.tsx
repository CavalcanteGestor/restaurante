"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { MessageSquare, Phone } from "lucide-react"

interface Atendimento {
  phone: string
  ativo: boolean
  updated_at: string
}

interface ConversasListProps {
  atendimentos: Atendimento[]
}

export default function ConversasList({ atendimentos }: ConversasListProps) {
  if (atendimentos.length === 0) {
    return (
      <div className="text-center py-12 text-gray-700">
        <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-600" />
        <p>Nenhuma conversa ativa no momento</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {atendimentos.map((atendimento) => (
        <Link key={atendimento.phone} href={`/whatsapp/${encodeURIComponent(atendimento.phone)}`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{atendimento.phone}</p>
                  <p className="text-sm text-gray-700">
                    Última atualização: {new Date(atendimento.updated_at).toLocaleString('pt-BR')}
                  </p>
                </div>
                <MessageSquare className="h-5 w-5 text-gray-600" />
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}

