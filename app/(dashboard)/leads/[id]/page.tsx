import { notFound } from "next/navigation"
import { getLeadById } from "@/lib/db/leads"
import { getConversasByTelefone } from "@/lib/db/conversas"
import { getReservas } from "@/lib/db/reservas"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDateTime } from "@/lib/utils/date"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MessageSquare, Calendar } from "lucide-react"

export default async function LeadDetalhesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  
  if (!id) {
    notFound()
  }
  
  const lead = await getLeadById(parseInt(id))
  
  if (!lead) {
    notFound()
  }
  
  const conversas = await getConversasByTelefone(lead.telefone)
  const reservas = await getReservas({ telefone: lead.telefone })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{lead.nome}</h1>
          <p className="text-gray-600 mt-1">{lead.telefone}</p>
        </div>
        <Link href={`/whatsapp/${encodeURIComponent(lead.telefone)}`}>
          <Button>
            <MessageSquare className="h-4 w-4 mr-2" />
            Iniciar Chat
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Nome</p>
              <p className="font-medium">{lead.nome}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Telefone</p>
              <p className="font-medium">{lead.telefone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Etapa</p>
              <Badge variant="secondary">{lead.etapa}</Badge>
            </div>
            {lead.data_ultima_msg && (
              <div>
                <p className="text-sm text-gray-600">Última Mensagem</p>
                <p className="font-medium">{formatDateTime(lead.data_ultima_msg)}</p>
              </div>
            )}
            {lead.contexto && (
              <div>
                <p className="text-sm text-gray-600">Contexto</p>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{lead.contexto}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reservas</CardTitle>
          </CardHeader>
          <CardContent>
            {reservas.length > 0 ? (
              <div className="space-y-2">
                {reservas.map((reserva) => (
                  <Link key={reserva.id} href={`/reservas/${reserva.id}`}>
                    <div className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{reserva.nome}</p>
                          <p className="text-sm text-gray-600">
                            {formatDateTime(reserva.data_reserva + " " + reserva.horario_reserva)}
                          </p>
                        </div>
                        <Badge variant="secondary">{reserva.numero_pessoas} pessoas</Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-700">Nenhuma reserva</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Conversas</CardTitle>
        </CardHeader>
        <CardContent>
          {conversas.length > 0 ? (
            <div className="space-y-4">
              {conversas.map((conversa) => (
                <div key={conversa.id} className="border-l-4 border-primary pl-4 py-2">
                  {conversa.mensagem_ia && (
                    <div className="mb-2">
                      <p className="text-sm text-gray-600">IA:</p>
                      <p className="text-sm">{conversa.mensagem_ia}</p>
                    </div>
                  )}
                  {conversa.mensagem_lead && (
                    <div>
                      <p className="text-sm text-gray-600">Cliente:</p>
                      <p className="text-sm">{conversa.mensagem_lead}</p>
                    </div>
                  )}
                  {conversa.data_mensagem && (
                    <p className="text-xs text-gray-700 mt-1">
                      {formatDateTime(conversa.data_mensagem)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-700">Nenhuma conversa registrada</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

