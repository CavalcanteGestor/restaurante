import { notFound } from "next/navigation"
import { getMesaById } from "@/lib/db/mesas"
import { getReservas } from "@/lib/db/reservas"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate, formatTime } from "@/lib/utils/date"

export default async function MesaDetalhesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  
  if (!id) {
    notFound()
  }
  
  const mesa = await getMesaById(id)

  if (!mesa) {
    notFound()
  }

  // Buscar reservas desta mesa (últimos 30 dias)
  const hoje = new Date()
  const trintaDiasAtras = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000)
  const reservas = await getReservas()
  const reservasMesa = reservas.filter(
    (r) =>
      r.mesas?.includes(mesa.codigo) &&
      new Date(r.data_reserva) >= trintaDiasAtras
  )

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-serif font-bold bg-gradient-to-r from-[#8B2E3D] to-[#7A1F2E] bg-clip-text text-transparent">
          {mesa.codigo}
        </h1>
        <p className="text-[#8B2E3D]/70 mt-2 text-lg font-medium">
          {mesa.ambiente || mesa.andar}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Card de Informações */}
        <Card className="shadow-lg border-2 border-[#8B2E3D]/20">
          <CardHeader className="border-b bg-gradient-to-r from-[#8B2E3D]/5 to-transparent">
            <CardTitle className="text-xl font-serif font-bold text-gray-900">
              Informações da Mesa
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-5">
            <div className="border-b-2 border-gray-200 pb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Código</p>
              <p className="text-lg font-bold text-[#8B2E3D]">{mesa.codigo}</p>
            </div>
            
            <div className="border-b-2 border-gray-200 pb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Capacidade</p>
              <p className="text-lg font-bold text-gray-900">{mesa.capacidade} {mesa.capacidade === 1 ? 'pessoa' : 'pessoas'}</p>
            </div>
            
            <div className="border-b-2 border-gray-200 pb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Tipo</p>
              <p className="text-lg font-bold text-gray-900 capitalize">{mesa.tipo}</p>
            </div>
            
            <div className="border-b-2 border-gray-200 pb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Andar</p>
              <p className="text-lg font-bold text-gray-900 capitalize">{mesa.andar}</p>
            </div>
            
            <div className="border-b-2 border-gray-200 pb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Ambiente</p>
              <p className="text-lg font-bold text-gray-900">{mesa.ambiente || "-"}</p>
            </div>
            
            <div className="border-b-2 border-gray-200 pb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Status</p>
              <Badge className={`${mesa.disponivel ? 'bg-green-600 text-white' : 'bg-red-600 text-white'} text-sm font-semibold px-3 py-1`}>
                {mesa.disponivel ? "Disponível" : "Indisponível"}
              </Badge>
            </div>
            
            <div className="border-b-2 border-gray-200 pb-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">Características</p>
              <div className="flex flex-wrap gap-2">
                {mesa.pode_juntar && (
                  <Badge className="bg-blue-100 text-blue-800 border-blue-300 font-semibold">
                    Pode Juntar
                  </Badge>
                )}
                {mesa.tem_tv && (
                  <Badge className="bg-purple-100 text-purple-800 border-purple-300 font-semibold">
                    TV
                  </Badge>
                )}
                {mesa.privativa && (
                  <Badge className="bg-indigo-100 text-indigo-800 border-indigo-300 font-semibold">
                    Privativa
                  </Badge>
                )}
                {mesa.so_eventos && (
                  <Badge className="bg-orange-100 text-orange-800 border-orange-300 font-semibold">
                    Apenas Eventos
                  </Badge>
                )}
                {mesa.eventos_pessoais && (
                  <Badge className="bg-pink-100 text-pink-800 border-pink-300 font-semibold">
                    Eventos Pessoais
                  </Badge>
                )}
                {mesa.eventos_corporativos && (
                  <Badge className="bg-green-100 text-green-800 border-green-300 font-semibold">
                    Eventos Corporativos
                  </Badge>
                )}
                {!mesa.pode_juntar && !mesa.tem_tv && !mesa.privativa && !mesa.so_eventos && !mesa.eventos_pessoais && !mesa.eventos_corporativos && (
                  <span className="text-gray-600 text-sm">Nenhuma característica especial</span>
                )}
              </div>
            </div>
            
            {mesa.junta_com && (
              <div className="border-b-2 border-gray-200 pb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Junta com</p>
                <p className="text-lg font-bold text-gray-900">{mesa.junta_com}</p>
              </div>
            )}
            
            {mesa.observacao && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Observação</p>
                <p className="text-base text-gray-900 bg-gray-50 p-3 rounded-md border-2 border-gray-200">
                  {mesa.observacao}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card de Histórico de Reservas */}
        <Card className="shadow-lg border-2 border-[#8B2E3D]/20">
          <CardHeader className="border-b bg-gradient-to-r from-[#8B2E3D]/5 to-transparent">
            <CardTitle className="text-xl font-serif font-bold text-gray-900">
              Histórico de Reservas
            </CardTitle>
            <p className="text-sm text-gray-700 mt-1">Últimos 30 dias</p>
          </CardHeader>
          <CardContent className="pt-6">
            {reservasMesa.length > 0 ? (
              <div className="space-y-3">
                {reservasMesa.slice(0, 10).map((reserva) => (
                  <div
                    key={reserva.id}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#8B2E3D]/50 hover:bg-[#8B2E3D]/5 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 text-base">{reserva.nome}</p>
                        <p className="text-sm text-gray-700 font-medium mt-1">
                          {formatDate(reserva.data_reserva)} às{" "}
                          {formatTime(reserva.horario_reserva)}
                        </p>
                        {reserva.turno && (
                          <p className="text-xs text-gray-600 mt-1 capitalize">
                            {reserva.turno === 'almoco' ? 'Almoço' : 'Jantar'}
                          </p>
                        )}
                      </div>
                      <Badge className="bg-[#8B2E3D] text-white font-semibold ml-4">
                        {reserva.numero_pessoas} {reserva.numero_pessoas === 1 ? 'pessoa' : 'pessoas'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-gray-200">
                <p className="text-gray-900 font-semibold text-base">
                  Nenhuma reserva nos últimos 30 dias
                </p>
                <p className="text-sm text-gray-700 mt-2">
                  Esta mesa ainda não possui reservas registradas
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

