"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PhoneInput } from "@/components/ui/phone-input"
import { Label } from "@/components/ui/label"
import { Database } from "@/types/database"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Table2, Sparkles } from "lucide-react"

type Mesa = Database['public']['Tables']['mesas']['Row']

interface SolucaoMesa {
  mesas: string[]
  capacidadeTotal: number
  descricao: string
  tipo: 'individual' | 'combinada'
  ambiente?: string
}

const reservaSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  telefone: z.string().min(10, "Telefone inválido").refine((val) => {
    const numbers = val.replace(/\D/g, "")
    return numbers.length >= 10 && numbers.length <= 11
  }, "Telefone deve ter DDD + número (10 ou 11 dígitos)"),
  data_reserva: z.string().min(1, "Data é obrigatória"),
  horario_reserva: z.string().min(1, "Horário é obrigatório"),
  numero_pessoas: z.number().min(1, "Número de pessoas deve ser pelo menos 1"),
  turno: z.enum(["almoco", "jantar"], {
    message: "Turno é obrigatório",
  }),
  mesas: z.string().optional(),
  tipo_uso: z.enum(["pessoal", "corporativo", "evento"]).optional(),
  contexto: z.string().optional(),
})

type ReservaFormData = z.infer<typeof reservaSchema>

interface ReservaFormProps {
  reservaId?: string
  reservaData?: {
    nome: string
    telefone: string
    data_reserva: string
    horario_reserva: string
    numero_pessoas: number
    turno: "almoco" | "jantar"
    mesas?: string | null
    tipo_uso?: "pessoal" | "corporativo" | "evento"
    contexto?: string | null
  }
}

export default function ReservaForm({ reservaId, reservaData }: ReservaFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [sugestoes, setSugestoes] = useState<SolucaoMesa[]>([])
  const [solucaoSelecionada, setSolucaoSelecionada] = useState<SolucaoMesa | null>(null)
  const [mesasSelecionadas, setMesasSelecionadas] = useState<string[]>(
    reservaData?.mesas ? reservaData.mesas.split('+') : []
  )

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ReservaFormData>({
    resolver: zodResolver(reservaSchema),
    defaultValues: {
      nome: reservaData?.nome || "",
      telefone: reservaData?.telefone || "",
      data_reserva: reservaData?.data_reserva || "",
      horario_reserva: reservaData?.horario_reserva || "",
      numero_pessoas: reservaData?.numero_pessoas || 1,
      turno: reservaData?.turno || undefined,
      tipo_uso: reservaData?.tipo_uso || "pessoal",
      contexto: reservaData?.contexto || "",
    },
  })

  const dataReserva = watch("data_reserva")
  const turno = watch("turno")
  const numeroPessoas = watch("numero_pessoas")
  const tipoUso = watch("tipo_uso")

  // Buscar sugestões de mesas quando mudar data, turno ou número de pessoas
  useEffect(() => {
    if (dataReserva && turno && numeroPessoas) {
      buscarSugestoes()
    } else {
      setSugestoes([])
      setSolucaoSelecionada(null)
    }
  }, [dataReserva, turno, numeroPessoas, tipoUso])

  const buscarSugestoes = async () => {
    if (!dataReserva || !turno || !numeroPessoas) {
      setSugestoes([])
      setSolucaoSelecionada(null)
      return
    }

    try {
      const response = await fetch(
        `/api/mesas/sugestoes?data=${dataReserva}&turno=${turno}&pessoas=${numeroPessoas}&tipoUso=${tipoUso || "pessoal"}`
      )
      
      if (!response.ok) {
        throw new Error("Erro ao buscar sugestões")
      }
      
      const solucoes = await response.json()
      setSugestoes(Array.isArray(solucoes) ? solucoes : [])
      
      // Se já havia mesas selecionadas, tentar encontrar a solução correspondente
      if (mesasSelecionadas.length > 0) {
        const solucao = solucoes.find((s: SolucaoMesa) => 
          s.mesas.length === mesasSelecionadas.length &&
          s.mesas.every((m) => mesasSelecionadas.includes(m))
        )
        if (solucao) {
          setSolucaoSelecionada(solucao)
        }
      }
    } catch (error) {
      console.error("Erro ao buscar sugestões:", error)
      setSugestoes([])
      setSolucaoSelecionada(null)
    }
  }

  const selecionarSolucao = (solucao: SolucaoMesa) => {
    setSolucaoSelecionada(solucao)
    setMesasSelecionadas(solucao.mesas)
  }

  const onSubmit = async (data: ReservaFormData) => {
    setLoading(true)
    try {
      const mesasString = mesasSelecionadas.join("+")
      const reservaData = {
        ...data,
        mesas: mesasString || null,
        etapa: "reserva_confirmada",
      }

      const response = await fetch("/api/reservas", {
        method: reservaId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reservaId ? { id: reservaId, ...reservaData } : reservaData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Erro ao criar reserva")
      }

      router.push("/reservas")
      router.refresh()
    } catch (error: any) {
      alert(error.message || "Erro ao salvar reserva")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="nome" className="text-gray-900 font-semibold">Nome *</Label>
          <Input id="nome" {...register("nome")} className="text-gray-900 border-2 border-gray-300 focus:border-[#8B2E3D]" />
          {errors.nome && (
            <p className="text-sm text-red-600">{errors.nome.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="telefone" className="text-gray-900 font-semibold">Telefone *</Label>
          <PhoneInput 
            id="telefone" 
            {...register("telefone", {
              required: "Telefone é obrigatório",
              validate: (value) => {
                const numbers = value.replace(/\D/g, "")
                if (numbers.length < 10) {
                  return "Telefone deve ter DDD + número (mínimo 10 dígitos)"
                }
                if (numbers.length === 11) {
                  // Se tem 11 dígitos, deve ser DDD (2) + 9 dígitos começando com 9
                  const numero = numbers.slice(2)
                  if (!numero.startsWith("9")) {
                    return "Número de celular deve começar com 9 (formato: DDD + 9 dígitos)"
                  }
                }
                if (numbers.length > 11) {
                  return "Telefone deve ter no máximo 11 dígitos"
                }
                return true
              }
            })} 
            className="text-gray-900 border-2 border-gray-300 focus:border-[#8B2E3D]" 
          />
          {errors.telefone && (
            <p className="text-sm text-red-600">{errors.telefone.message}</p>
          )}
          <p className="text-xs text-gray-600">Formato: (DDD) 9XXXX-XXXX</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="data_reserva" className="text-gray-900 font-semibold">Data *</Label>
          <Input
            id="data_reserva"
            type="date"
            {...register("data_reserva")}
            min={new Date().toISOString().split("T")[0]}
            className="text-gray-900 border-2 border-gray-300 focus:border-[#8B2E3D]"
          />
          {errors.data_reserva && (
            <p className="text-sm text-red-600">{errors.data_reserva.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="horario_reserva" className="text-gray-900 font-semibold">Horário *</Label>
          <Input id="horario_reserva" type="time" {...register("horario_reserva")} className="text-gray-900 border-2 border-gray-300 focus:border-[#8B2E3D]" />
          {errors.horario_reserva && (
            <p className="text-sm text-red-600">{errors.horario_reserva.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="numero_pessoas" className="text-gray-900 font-semibold">Número de Pessoas *</Label>
          <Input
            id="numero_pessoas"
            type="number"
            min="1"
            {...register("numero_pessoas", { valueAsNumber: true })}
            className="text-gray-900 border-2 border-gray-300 focus:border-[#8B2E3D]"
          />
          {errors.numero_pessoas && (
            <p className="text-sm text-red-600">{errors.numero_pessoas.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="turno" className="text-gray-900 font-semibold">Turno *</Label>
          <select
            id="turno"
            {...register("turno")}
            className="flex h-10 w-full rounded-md border-2 border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 font-medium focus:border-[#8B2E3D] focus:outline-none"
          >
            <option value="">Selecione...</option>
            <option value="almoco">Almoço</option>
            <option value="jantar">Jantar</option>
          </select>
          {errors.turno && (
            <p className="text-sm text-red-600">{errors.turno.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="tipo_uso" className="text-gray-900 font-semibold">Tipo de Uso</Label>
          <select
            id="tipo_uso"
            {...register("tipo_uso")}
            className="flex h-10 w-full rounded-md border-2 border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 font-medium focus:border-[#8B2E3D] focus:outline-none"
          >
            <option value="pessoal">Pessoal</option>
            <option value="corporativo">Corporativo</option>
            <option value="evento">Evento</option>
          </select>
        </div>
      </div>

      {dataReserva && turno && numeroPessoas && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#8B2E3D]" />
            <Label className="text-gray-900 font-semibold text-lg">
              Soluções Disponíveis para {numeroPessoas} {numeroPessoas === 1 ? 'pessoa' : 'pessoas'}
            </Label>
          </div>

          {sugestoes.length === 0 ? (
            <Card className="border-2 border-yellow-300 bg-yellow-50/50">
              <CardContent className="pt-6">
                <p className="text-gray-700 font-medium text-center">
                  Nenhuma solução disponível para {numeroPessoas} {numeroPessoas === 1 ? 'pessoa' : 'pessoas'} nesta data e turno.
                </p>
                <p className="text-sm text-gray-600 text-center mt-2">
                  Tente alterar a data, horário ou número de pessoas.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {sugestoes.map((solucao, index) => {
                const isSelected = solucaoSelecionada?.mesas.join('+') === solucao.mesas.join('+')
                return (
                  <Card
                    key={index}
                    className={`cursor-pointer transition-all border-2 ${
                      isSelected
                        ? 'border-[#8B2E3D] bg-[#8B2E3D]/10 shadow-lg'
                        : 'border-gray-300 hover:border-[#8B2E3D]/50 hover:shadow-md'
                    }`}
                    onClick={() => selecionarSolucao(solucao)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base font-bold text-gray-900 mb-1">
                            {solucao.tipo === 'combinada' ? (
                              <span className="flex items-center gap-2">
                                <Table2 className="h-4 w-4 text-[#8B2E3D]" />
                                {solucao.mesas.join(' + ')}
                              </span>
                            ) : (
                              <span className="flex items-center gap-2">
                                <Table2 className="h-4 w-4 text-gray-600" />
                                {solucao.mesas[0]}
                              </span>
                            )}
                          </CardTitle>
                          <CardDescription className="text-sm text-gray-700 mt-1">
                            {solucao.descricao}
                          </CardDescription>
                        </div>
                        {solucao.tipo === 'combinada' && (
                          <Badge className="bg-[#8B2E3D]/20 text-[#8B2E3D] border-[#8B2E3D]/30">
                            Combinada
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Users className="h-4 w-4" />
                          <span className="font-semibold">{solucao.capacidadeTotal} lugares</span>
                        </div>
                        {solucao.ambiente && (
                          <Badge variant="outline" className="text-xs">
                            {solucao.ambiente}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {mesasSelecionadas.length > 0 && (
            <Card className="border-2 border-[#8B2E3D] bg-[#8B2E3D]/10">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Table2 className="h-5 w-5 text-[#8B2E3D]" />
                  <p className="text-sm font-semibold text-[#8B2E3D]">
                    Solução Selecionada:
                  </p>
                </div>
                <p className="text-base font-bold text-gray-900 mb-1">
                  {mesasSelecionadas.join(" + ")}
                </p>
                {solucaoSelecionada && (
                  <p className="text-sm text-gray-700">
                    {solucaoSelecionada.descricao}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="contexto" className="text-gray-900 font-semibold">Observações</Label>
        <textarea
          id="contexto"
          {...register("contexto")}
          className="flex min-h-[80px] w-full rounded-md border-2 border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-[#8B2E3D] focus:outline-none"
          rows={3}
        />
      </div>

      <div className="flex gap-4">
        <Button 
          type="submit" 
          disabled={loading}
          className="bg-[#8B2E3D] hover:bg-[#7A1F2E] text-white font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          {loading ? "Salvando..." : "Salvar Reserva"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold"
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}

