"use client"

import { Database } from "@/types/database"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useState } from "react"

type Mesa = Database['public']['Tables']['mesas']['Row']
type Reserva = Database['public']['Tables']['reservas']['Row']

interface MapaMesasProps {
  mesas: Mesa[]
  reservas: Reserva[]
}

export default function MapaMesas({ mesas, reservas }: MapaMesasProps) {
  const [ambienteFiltro, setAmbienteFiltro] = useState<string | null>(null)

  const ambientes = Array.from(new Set(mesas.map(m => m.ambiente).filter(Boolean)))

  const mesasFiltradas = ambienteFiltro
    ? mesas.filter(m => m.ambiente === ambienteFiltro)
    : mesas

  const getStatusMesa = (mesa: Mesa) => {
    const reservasMesa = reservas.filter(
      r => r.mesas?.includes(mesa.codigo) && r.etapa === 'reserva_confirmada'
    )
    
    if (!mesa.disponivel) {
      return { status: 'indisponivel', cor: 'bg-gray-400', label: 'Indisponível' }
    }
    
    if (reservasMesa.length > 0) {
      return { status: 'reservada', cor: 'bg-yellow-400', label: 'Reservada' }
    }
    
    return { status: 'disponivel', cor: 'bg-green-400', label: 'Disponível' }
  }

  return (
    <div className="space-y-4">
      {ambientes.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setAmbienteFiltro(null)}
            className={`px-4 py-2 rounded-md text-sm ${
              ambienteFiltro === null
                ? 'bg-primary text-primary-foreground'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Todos
          </button>
          {ambientes.map((ambiente) => (
            <button
              key={ambiente}
              onClick={() => setAmbienteFiltro(ambiente || null)}
              className={`px-4 py-2 rounded-md text-sm ${
                ambienteFiltro === ambiente
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {ambiente}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
        {mesasFiltradas.map((mesa) => {
          const status = getStatusMesa(mesa)
          return (
            <Link key={mesa.id} href={`/mesas/${mesa.id}`}>
              <Card className={`hover:shadow-lg transition-all cursor-pointer border-2 ${
                status.status === 'disponivel' ? 'border-green-300' :
                status.status === 'reservada' ? 'border-yellow-300' :
                'border-gray-300'
              }`}>
                <CardContent className="p-4">
                  <div className={`w-full h-16 rounded-md ${status.cor} flex items-center justify-center mb-2`}>
                    <span className="font-bold text-white">{mesa.codigo}</span>
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-xs font-medium">{mesa.codigo}</p>
                    <p className="text-xs text-gray-600">Cap: {mesa.capacidade}</p>
                    <Badge variant="secondary" className="text-xs">
                      {status.label}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {mesasFiltradas.length === 0 && (
        <div className="text-center py-12 text-gray-700">
          Nenhuma mesa encontrada para este ambiente
        </div>
      )}
    </div>
  )
}

