"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Filter, X, Calendar, Clock } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function FiltrosReservas() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const dataAtual = new Date().toISOString().split('T')[0]
  const dataFiltro = searchParams.get('data') || dataAtual
  const turnoFiltro = searchParams.get('turno') || ''
  const etapaFiltro = searchParams.get('etapa') || ''

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const aplicarFiltros = (data: string, turno: string, etapa: string) => {
    const params = new URLSearchParams()
    if (data && data !== dataAtual) params.set('data', data)
    if (turno) params.set('turno', turno)
    if (etapa) params.set('etapa', etapa)
    
    router.push(`/reservas?${params.toString()}`)
    setIsOpen(false)
  }

  const limparFiltros = () => {
    router.push('/reservas')
    setIsOpen(false)
  }

  const temFiltros = turnoFiltro || etapaFiltro || (dataFiltro && dataFiltro !== dataAtual)

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2 relative"
      >
        <Filter className="h-4 w-4" />
        Filtros
        {temFiltros && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#8B2E3D] text-white text-xs flex items-center justify-center">
            {[turnoFiltro, etapaFiltro, dataFiltro !== dataAtual ? dataFiltro : ''].filter(Boolean).length}
          </span>
        )}
      </Button>

      {isOpen && (
        <Card ref={cardRef} className="absolute top-full right-0 mt-2 z-50 w-80 shadow-xl border-2 border-[#8B2E3D]/20">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-[#8B2E3D] flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="filtro-data" className="text-gray-900 font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Data
              </Label>
              <Input
                id="filtro-data"
                type="date"
                defaultValue={dataFiltro}
                onChange={(e) => {
                  const novaData = e.target.value
                  aplicarFiltros(novaData, turnoFiltro, etapaFiltro)
                }}
                className="text-gray-900 border-2 border-gray-300 focus:border-[#8B2E3D]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="filtro-turno" className="text-gray-900 font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Período
              </Label>
              <Select
                value={turnoFiltro ? turnoFiltro : "all"}
                onValueChange={(value) => aplicarFiltros(dataFiltro, value === "all" ? "" : value, etapaFiltro)}
              >
                <SelectTrigger className="text-gray-900 border-2 border-gray-300 focus:border-[#8B2E3D]">
                  <SelectValue placeholder="Todos os períodos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os períodos</SelectItem>
                  <SelectItem value="almoco">Almoço</SelectItem>
                  <SelectItem value="jantar">Jantar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filtro-etapa" className="text-gray-900 font-semibold">
                Status
              </Label>
              <Select
                value={etapaFiltro ? etapaFiltro : "all"}
                onValueChange={(value) => aplicarFiltros(dataFiltro, turnoFiltro, value === "all" ? "" : value)}
              >
                <SelectTrigger className="text-gray-900 border-2 border-gray-300 focus:border-[#8B2E3D]">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="reserva_confirmada">Confirmada</SelectItem>
                  <SelectItem value="interesse">Pendente</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={limparFiltros}
                variant="outline"
                className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Limpar
              </Button>
              <Button
                onClick={() => setIsOpen(false)}
                className="flex-1 bg-[#8B2E3D] hover:bg-[#7A1F2E] text-white"
              >
                Aplicar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}

