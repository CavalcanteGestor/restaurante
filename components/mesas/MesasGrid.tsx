"use client"

import { useState } from "react"
import Link from "next/link"
import { Database } from "@/types/database"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, MapPin, Building2, Calendar } from "lucide-react"
import { Input } from "@/components/ui/input"

type Mesa = Database['public']['Tables']['mesas']['Row']

interface MesasGridProps {
  mesas: Mesa[]
}

export default function MesasGrid({ mesas }: MesasGridProps) {
  const [filter, setFilter] = useState("")

  const filteredMesas = mesas.filter((mesa) => {
    if (!filter) return true
    const searchTerm = filter.toLowerCase()
    return (
      mesa.codigo.toLowerCase().includes(searchTerm) ||
      mesa.ambiente?.toLowerCase().includes(searchTerm) ||
      mesa.tipo.toLowerCase().includes(searchTerm)
    )
  })

  return (
    <div className="space-y-6">
      {/* Busca */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Input
            type="text"
            placeholder="Buscar por código, ambiente ou tipo..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-10 border-2 border-gray-300 bg-white text-gray-900 focus:border-[#8B2E3D] focus:bg-white"
          />
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
        </div>
      </div>

      {/* Grid de Mesas com design premium */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredMesas.map((mesa, index) => (
          <Link key={mesa.id} href={`/mesas/${mesa.id}`}>
            <Card className="group relative overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer border-2 border-gray-200 hover:border-[#8B2E3D] bg-gradient-to-br from-white to-gray-50/50 hover:scale-105 hover:rotate-1">
              {/* Efeito de brilho no hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#8B2E3D]/0 to-[#8B2E3D]/0 group-hover:from-[#8B2E3D]/5 group-hover:to-transparent transition-all duration-500"></div>
              
              <CardContent className="p-6 relative z-10">
                {/* Header da Mesa */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#8B2E3D] to-[#7A1F2E] flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                        <span className="text-white font-bold text-sm">{mesa.codigo.split(' ')[1] || mesa.codigo[0]}</span>
                      </div>
                      <h3 className="font-serif font-bold text-2xl text-gray-900 group-hover:text-[#8B2E3D] transition-colors">
                        {mesa.codigo}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700 bg-[#8B2E3D]/5 px-3 py-1.5 rounded-lg inline-flex">
                      <Building2 className="h-4 w-4 text-[#8B2E3D]" />
                      <span className="font-semibold">{mesa.ambiente || mesa.andar}</span>
                    </div>
                  </div>
                </div>
                
                {/* Informações principais */}
                <div className="space-y-3 mt-5 border-t-2 border-gray-100 pt-4">
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-[#8B2E3D]/5 to-transparent rounded-lg">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-[#8B2E3D]" />
                      <span className="font-semibold text-gray-900">Capacidade</span>
                    </div>
                    <span className="font-bold text-lg text-[#8B2E3D]">{mesa.capacidade}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm p-2 bg-gray-50 rounded-lg">
                    <MapPin className="h-4 w-4 text-gray-600" />
                    <span className="font-semibold text-gray-900">Tipo:</span>
                    <span className="text-gray-700 capitalize">{mesa.tipo}</span>
                  </div>

                  {mesa.andar && (
                    <div className="flex items-center gap-2 text-sm p-2 bg-gray-50 rounded-lg">
                      <Building2 className="h-4 w-4 text-gray-600" />
                      <span className="font-semibold text-gray-900">Andar:</span>
                      <span className="text-gray-700 capitalize">{mesa.andar}</span>
                    </div>
                  )}
                </div>

                {/* Badges de características com design melhorado */}
                {(mesa.pode_juntar || mesa.tem_tv || mesa.privativa || mesa.so_eventos || mesa.eventos_corporativos || mesa.eventos_pessoais) && (
                  <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t-2 border-gray-100">
                    {mesa.pode_juntar && (
                      <Badge className="bg-blue-500 text-white border-0 text-xs font-bold px-2.5 py-1 shadow-md hover:shadow-lg transition-shadow">
                        Pode Juntar
                      </Badge>
                    )}
                    {mesa.tem_tv && (
                      <Badge className="bg-purple-500 text-white border-0 text-xs font-bold px-2.5 py-1 shadow-md hover:shadow-lg transition-shadow">
                        TV
                      </Badge>
                    )}
                    {mesa.privativa && (
                      <Badge className="bg-indigo-500 text-white border-0 text-xs font-bold px-2.5 py-1 shadow-md hover:shadow-lg transition-shadow">
                        Privativa
                      </Badge>
                    )}
                    {mesa.so_eventos && (
                      <Badge className="bg-orange-500 text-white border-0 text-xs font-bold px-2.5 py-1 shadow-md hover:shadow-lg transition-shadow">
                        Apenas Eventos
                      </Badge>
                    )}
                    {mesa.eventos_corporativos && (
                      <Badge className="bg-green-500 text-white border-0 text-xs font-bold px-2.5 py-1 shadow-md hover:shadow-lg transition-shadow">
                        Corporativos
                      </Badge>
                    )}
                    {mesa.eventos_pessoais && (
                      <Badge className="bg-pink-500 text-white border-0 text-xs font-bold px-2.5 py-1 shadow-md hover:shadow-lg transition-shadow">
                        Pessoais
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {filteredMesas.length === 0 && (
        <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-gray-200">
          <MapPin className="h-16 w-16 text-gray-600 mx-auto mb-4 opacity-50" />
          <p className="text-gray-900 font-semibold text-lg">Nenhuma mesa encontrada</p>
          <p className="text-gray-700 text-sm mt-2">
            {filter ? "Tente ajustar os filtros de busca" : "Não há mesas disponíveis"}
          </p>
        </div>
      )}
    </div>
  )
}

