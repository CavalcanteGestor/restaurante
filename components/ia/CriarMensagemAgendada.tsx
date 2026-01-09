"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Calendar, Clock } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { formatDate } from "@/lib/utils/date"

const mensagemAgendadaSchema = z.object({
  reserva_id: z.string().optional(),
  telefone: z.string().min(10, "Telefone inválido"),
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  tipo: z.enum(['confirmacao', 'cancelamento', 'atraso', 'lembrete']),
  mensagem: z.string().min(10, "Mensagem deve ter pelo menos 10 caracteres"),
  agendado_para: z.string().min(1, "Data/hora de agendamento é obrigatória"),
  horas_antes: z.number().optional(),
})

type MensagemAgendadaFormData = z.infer<typeof mensagemAgendadaSchema>

interface CriarMensagemAgendadaProps {
  onSuccess?: () => void
  reservaId?: string
}

export default function CriarMensagemAgendada({ 
  onSuccess, 
  reservaId 
}: CriarMensagemAgendadaProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<MensagemAgendadaFormData>({
    resolver: zodResolver(mensagemAgendadaSchema),
    defaultValues: {
      reserva_id: reservaId || "",
      tipo: 'lembrete',
      agendado_para: "",
    },
  })

  const tipo = watch("tipo")

  async function onSubmit(data: MensagemAgendadaFormData) {
    try {
      setLoading(true)

      // Calcular agendado_para se for "horas antes"
      let agendadoPara = data.agendado_para
      if (data.horas_antes) {
        const agora = new Date()
        agora.setHours(agora.getHours() + data.horas_antes)
        agendadoPara = agora.toISOString()
      }

      const response = await fetch('/api/ia/mensagens-agendadas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reserva_id: data.reserva_id || null,
          telefone: data.telefone,
          nome: data.nome,
          tipo: data.tipo,
          mensagem: data.mensagem,
          agendado_para: agendadoPara,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erro ao criar mensagem agendada")
      }

      toast.success("Mensagem agendada criada com sucesso!")
      reset()
      setOpen(false)
      onSuccess?.()
    } catch (error: any) {
      console.error("Erro ao criar mensagem agendada:", error)
      toast.error(error.message || "Erro ao criar mensagem agendada")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="whitespace-nowrap">
          <Plus className="h-4 w-4 mr-2" />
          Nova Mensagem
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Mensagem Agendada</DialogTitle>
          <DialogDescription>
            Agende uma mensagem para ser enviada automaticamente em uma data/hora específica
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Tipo */}
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Mensagem *</Label>
            <Select
              value={tipo}
              onValueChange={(value) => setValue("tipo", value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="confirmacao">Confirmação</SelectItem>
                <SelectItem value="cancelamento">Cancelamento</SelectItem>
                <SelectItem value="atraso">Atraso</SelectItem>
                <SelectItem value="lembrete">Lembrete</SelectItem>
              </SelectContent>
            </Select>
            {errors.tipo && (
              <p className="text-sm text-red-600">{errors.tipo.message}</p>
            )}
          </div>

          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Cliente *</Label>
            <Input
              id="nome"
              {...register("nome")}
              placeholder="Nome completo"
            />
            {errors.nome && (
              <p className="text-sm text-red-600">{errors.nome.message}</p>
            )}
          </div>

          {/* Telefone */}
          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone *</Label>
            <Input
              id="telefone"
              {...register("telefone")}
              placeholder="5531999999999"
            />
            {errors.telefone && (
              <p className="text-sm text-red-600">{errors.telefone.message}</p>
            )}
          </div>

          {/* Reserva ID (opcional) */}
          {!reservaId && (
            <div className="space-y-2">
              <Label htmlFor="reserva_id">ID da Reserva (opcional)</Label>
              <Input
                id="reserva_id"
                {...register("reserva_id")}
                placeholder="UUID da reserva"
              />
            </div>
          )}

          {/* Mensagem */}
          <div className="space-y-2">
            <Label htmlFor="mensagem">Mensagem *</Label>
            <Textarea
              id="mensagem"
              {...register("mensagem")}
              placeholder="Olá {nome}! Lembrando que você tem uma reserva..."
              rows={4}
            />
            <p className="text-xs text-gray-600">
              Placeholders disponíveis: {"{"}nome{"}"}, {"{"}data_reserva{"}"}, {"{"}horario_reserva{"}"}, {"{"}numero_pessoas{"}"}, {"{"}mesas{"}"}, {"{"}data_atual{"}"}
            </p>
            {errors.mensagem && (
              <p className="text-sm text-red-600">{errors.mensagem.message}</p>
            )}
          </div>

          {/* Agendamento */}
          <div className="space-y-2">
            <Label htmlFor="agendado_para">Data/Hora de Agendamento *</Label>
            <Input
              id="agendado_para"
              type="datetime-local"
              {...register("agendado_para")}
            />
            {errors.agendado_para && (
              <p className="text-sm text-red-600">{errors.agendado_para.message}</p>
            )}
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Criando..." : "Criar Mensagem"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

