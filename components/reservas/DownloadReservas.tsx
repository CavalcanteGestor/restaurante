"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Calendar, FileText } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useSearchParams } from "next/navigation"

export default function DownloadReservas() {
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  const [tipoDownload, setTipoDownload] = useState<'dia' | 'periodo' | 'mes' | 'ano'>('dia')
  const [data, setData] = useState(new Date().toISOString().split('T')[0])
  const [dataInicio, setDataInicio] = useState(new Date().toISOString().split('T')[0])
  const [dataFim, setDataFim] = useState(new Date().toISOString().split('T')[0])
  const [mes, setMes] = useState(new Date().toISOString().substring(0, 7))
  const [ano, setAno] = useState(new Date().getFullYear().toString())
  const [turno, setTurno] = useState<string>('all')

  const dataAtual = searchParams.get('data') || new Date().toISOString().split('T')[0]
  const turnoAtual = searchParams.get('turno') || ''

  const handleDownload = () => {
    let url = '/api/reservas/pdf?'
    
    if (tipoDownload === 'dia') {
      url += `data=${data}`
      if (turno && turno !== 'all') url += `&turno=${turno}`
    } else if (tipoDownload === 'periodo') {
      url += `dataInicio=${dataInicio}&dataFim=${dataFim}`
      if (turno && turno !== 'all') url += `&turno=${turno}`
    } else if (tipoDownload === 'mes') {
      url += `mes=${mes}`
    } else if (tipoDownload === 'ano') {
      url += `ano=${ano}`
    }

    // Usar filtros atuais se não especificados
    if (tipoDownload === 'dia' && !data) {
      url = `/api/reservas/pdf?data=${dataAtual}`
      if (turnoAtual) url += `&turno=${turnoAtual}`
    }

    window.open(url, '_blank')
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Baixar PDF
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#8B2E3D] flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Baixar Relatório de Reservas
          </DialogTitle>
          <DialogDescription className="text-gray-700">
            Selecione o tipo de relatório que deseja baixar
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-gray-900 font-semibold">Tipo de Relatório</Label>
            <Select value={tipoDownload} onValueChange={(value: any) => setTipoDownload(value)}>
              <SelectTrigger className="border-2 border-gray-300 focus:border-[#8B2E3D]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dia">Reservas do Dia</SelectItem>
                <SelectItem value="periodo">Reservas do Período</SelectItem>
                <SelectItem value="mes">Reservas do Mês</SelectItem>
                <SelectItem value="ano">Reservas do Ano</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {tipoDownload === 'dia' && (
            <>
              <div className="space-y-2">
                <Label className="text-gray-900 font-semibold">Data</Label>
                <Input
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  className="border-2 border-gray-300 focus:border-[#8B2E3D]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-900 font-semibold">Período (Opcional)</Label>
                <Select value={turno} onValueChange={setTurno}>
                  <SelectTrigger className="border-2 border-gray-300 focus:border-[#8B2E3D]">
                    <SelectValue placeholder="Todos os períodos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os períodos</SelectItem>
                    <SelectItem value="almoco">Almoço</SelectItem>
                    <SelectItem value="jantar">Jantar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {tipoDownload === 'periodo' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-900 font-semibold">Data Início</Label>
                  <Input
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    className="border-2 border-gray-300 focus:border-[#8B2E3D]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-900 font-semibold">Data Fim</Label>
                  <Input
                    type="date"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                    className="border-2 border-gray-300 focus:border-[#8B2E3D]"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-900 font-semibold">Período (Opcional)</Label>
                <Select value={turno} onValueChange={setTurno}>
                  <SelectTrigger className="border-2 border-gray-300 focus:border-[#8B2E3D]">
                    <SelectValue placeholder="Todos os períodos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os períodos</SelectItem>
                    <SelectItem value="almoco">Almoço</SelectItem>
                    <SelectItem value="jantar">Jantar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {tipoDownload === 'mes' && (
            <div className="space-y-2">
              <Label className="text-gray-900 font-semibold">Mês</Label>
              <Input
                type="month"
                value={mes}
                onChange={(e) => setMes(e.target.value)}
                className="border-2 border-gray-300 focus:border-[#8B2E3D]"
              />
            </div>
          )}

          {tipoDownload === 'ano' && (
            <div className="space-y-2">
              <Label className="text-gray-900 font-semibold">Ano</Label>
              <Input
                type="number"
                min="2020"
                max="2100"
                value={ano}
                onChange={(e) => setAno(e.target.value)}
                className="border-2 border-gray-300 focus:border-[#8B2E3D]"
              />
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDownload}
              className="flex-1 bg-[#8B2E3D] hover:bg-[#7A1F2E] text-white gap-2"
            >
              <Download className="h-4 w-4" />
              Baixar PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

