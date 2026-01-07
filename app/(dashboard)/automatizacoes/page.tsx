import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getReservasAtrasadas } from "@/lib/db/reservas"
import { formatDate, formatTime } from "@/lib/utils/date"
import { Send, Clock, AlertCircle, Settings, Zap, MessageSquare } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import EnviarMensagemAtraso from "@/components/automatizacoes/EnviarMensagemAtraso"
import Link from "next/link"

export default async function AutomatizacoesPage() {
  const reservasAtrasadas = await getReservasAtrasadas()

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#8B2E3D] to-[#7A1F2E] bg-clip-text text-transparent flex items-center gap-3">
            <Zap className="h-10 w-10 text-[#8B2E3D]" />
            Automatizações
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            Sistema de mensagens automáticas
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/automatizacoes/configurar-mensagens">
            <Button variant="outline" className="border-[#8B2E3D] text-[#8B2E3D] hover:bg-[#8B2E3D] hover:text-white gap-2">
              <Settings className="h-5 w-5" />
              Configurar Mensagens
            </Button>
          </Link>
          <Link href="/automatizacoes/mensagens">
            <Button className="bg-gradient-to-r from-[#8B2E3D] to-[#7A1F2E] hover:from-[#7A1F2E] hover:to-[#8B2E3D] text-white shadow-lg gap-2">
              <MessageSquare className="h-5 w-5" />
              Ver Histórico
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <Card className="border-2 border-[#8B2E3D]/20 bg-gradient-to-r from-[#8B2E3D]/10 to-white shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-[#8B2E3D]/10 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-[#8B2E3D]" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-[#8B2E3D]">
                  {reservasAtrasadas.length}
                </CardTitle>
                <CardDescription className="text-[#8B2E3D]/80">
                  Reservas atrasadas requerendo atenção
                </CardDescription>
              </div>
            </div>
            <Badge className="bg-[#8B2E3D] text-white text-lg px-4 py-2">
              Ativo
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Reservas Atrasadas */}
      <Card className="shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-red-50/50 to-transparent">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-red-600" />
            <CardTitle className="text-xl font-bold">Reservas Atrasadas</CardTitle>
          </div>
          <CardDescription className="mt-1">
            Reservas com mais de 15 minutos de atraso - Enviar mensagem automática
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {reservasAtrasadas.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-16 w-16 text-gray-600 mx-auto mb-4 opacity-70" />
              <p className="text-gray-600 font-medium text-lg">
                Nenhuma reserva atrasada no momento
              </p>
              <p className="text-sm text-gray-600 mt-2">
                O sistema monitora automaticamente as reservas
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reservasAtrasadas.map((reserva) => (
                <div
                  key={reserva.id}
                  className="flex items-center justify-between p-5 border-2 border-red-200 rounded-lg hover:border-red-300 hover:bg-red-50/50 transition-all bg-white"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                      <AlertCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-base">{reserva.nome}</p>
                        <Badge className="bg-red-100 text-red-800 border-red-200">
                          Atrasada
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{formatDate(reserva.data_reserva)} às {formatTime(reserva.horario_reserva)}</span>
                        <span>•</span>
                        <span className="font-mono">{reserva.telefone}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/whatsapp/${reserva.telefone}`}>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Send className="h-4 w-4" />
                        Chat
                      </Button>
                    </Link>
                    <EnviarMensagemAtraso reserva={reserva} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Regras Configuradas */}
      <Card className="shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-[#8B2E3D]/5 to-transparent">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <CardTitle className="text-xl font-bold">Regras Configuradas</CardTitle>
          </div>
          <CardDescription className="mt-1">
            Automatizações ativas no sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-5 border-2 rounded-lg hover:border-[#8B2E3D]/50 transition-all bg-gradient-to-r from-white to-[#8B2E3D]/5">
              <div className="flex items-center gap-4 flex-1">
                <div className="h-12 w-12 rounded-full bg-[#8B2E3D]/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-[#8B2E3D]" />
                </div>
                <div>
                  <p className="font-semibold text-base mb-1">Atraso de 15 minutos</p>
                  <p className="text-sm text-gray-600">
                    Envia mensagem automática quando cliente atrasa mais de 15 minutos
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  Ativo
                </Badge>
                <Button variant="outline" size="sm">
                  Configurar
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
