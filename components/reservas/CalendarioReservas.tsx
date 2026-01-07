"use client"

import { Database } from "@/types/database"
import { formatDate, formatTime } from "@/lib/utils/date"
import { useState } from "react"
import Link from "next/link"

type Reserva = Database['public']['Tables']['reservas']['Row']

interface CalendarioReservasProps {
  reservas: Reserva[]
}

export default function CalendarioReservas({ reservas }: CalendarioReservasProps) {
  const [mesAtual, setMesAtual] = useState(new Date())

  const diasDoMes = () => {
    const primeiroDia = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1)
    const ultimoDia = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0)
    const dias = []
    
    // Adicionar dias vazios do início
    for (let i = 0; i < primeiroDia.getDay(); i++) {
      dias.push(null)
    }
    
    // Adicionar dias do mês
    for (let i = 1; i <= ultimoDia.getDate(); i++) {
      dias.push(i)
    }
    
    return dias
  }

  const reservasDoDia = (dia: number) => {
    if (!dia) return []
    const data = `${mesAtual.getFullYear()}-${String(mesAtual.getMonth() + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
    return reservas.filter(r => r.data_reserva === data)
  }

  const getStatusColor = (etapa: string) => {
    switch (etapa) {
      case "reserva_confirmada":
        return "bg-green-100 text-green-800 border-green-300"
      case "interesse":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "cancelado":
        return "bg-gray-100 text-gray-800 border-gray-300"
      default:
        return "bg-blue-100 text-blue-800 border-blue-300"
    }
  }

  const mesAnterior = () => {
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1))
  }

  const mesProximo = () => {
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1))
  }

  const nomesDias = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
  const nomesMeses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={mesAnterior}
          className="px-4 py-2 border rounded-md hover:bg-gray-50"
        >
          ← Anterior
        </button>
        <h2 className="text-xl font-semibold">
          {nomesMeses[mesAtual.getMonth()]} {mesAtual.getFullYear()}
        </h2>
        <button
          onClick={mesProximo}
          className="px-4 py-2 border rounded-md hover:bg-gray-50"
        >
          Próximo →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {nomesDias.map((dia) => (
          <div key={dia} className="p-2 text-center font-medium text-gray-700">
            {dia}
          </div>
        ))}
        {diasDoMes().map((dia, index) => (
          <div
            key={index}
            className="min-h-[100px] border rounded-md p-2 bg-white hover:bg-gray-50"
          >
            {dia && (
              <>
                <div className="font-medium mb-1">{dia}</div>
                <div className="space-y-1">
                  {reservasDoDia(dia).slice(0, 3).map((reserva) => (
                    <Link
                      key={reserva.id}
                      href={`/reservas/${reserva.id}`}
                      className={`block text-xs p-1 rounded border ${getStatusColor(reserva.etapa || "interesse")}`}
                    >
                      <div className="font-medium truncate">{reserva.nome}</div>
                      <div className="text-xs">{formatTime(reserva.horario_reserva)}</div>
                    </Link>
                  ))}
                  {reservasDoDia(dia).length > 3 && (
                    <div className="text-xs text-gray-700">
                      +{reservasDoDia(dia).length - 3} mais
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

