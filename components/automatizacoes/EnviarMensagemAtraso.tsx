"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"
import { Database } from "@/types/database"

type Reserva = Database['public']['Tables']['reservas']['Row']

interface EnviarMensagemAtrasoProps {
  reserva: Reserva
}

export default function EnviarMensagemAtraso({ reserva }: EnviarMensagemAtrasoProps) {
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)

  const handleEnviar = async () => {
    setLoading(true)
    try {
      const mensagem = `Olá ${reserva.nome}! Notamos que você tinha uma reserva para hoje às ${reserva.horario_reserva} e ainda não chegou. Você ainda vai conseguir vir? Se precisar remarcar, estamos à disposição! 😊`

      // Enviar mensagem
      const response = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telefone: reserva.telefone,
          message: mensagem,
        }),
      })

      if (!response.ok) {
        throw new Error("Erro ao enviar mensagem")
      }

      // Atualizar contexto do lead
      await fetch("/api/leads/update-contexto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telefone: reserva.telefone,
          contexto: `Cliente atrasou 15+ minutos em ${reserva.data_reserva}. Mensagem automática de atraso enviada.`,
        }),
      })

      // Registrar na tabela conversas
      await fetch("/api/conversas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numero: reserva.telefone,
          nome: reserva.nome,
          mensagem_ia: mensagem,
          data_mensagem: new Date().toISOString(),
        }),
      })

      setEnviado(true)
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error)
      alert("Erro ao enviar mensagem. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  if (enviado) {
    return (
      <span className="text-sm text-green-600 font-medium">Mensagem enviada!</span>
    )
  }

  return (
    <Button onClick={handleEnviar} disabled={loading} size="sm">
      <Send className="h-4 w-4 mr-2" />
      {loading ? "Enviando..." : "Enviar Mensagem"}
    </Button>
  )
}

