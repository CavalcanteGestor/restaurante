"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Database } from "@/types/database"

type Reserva = Database['public']['Tables']['reservas']['Row']

interface OcupacaoChartProps {
  reservas: Reserva[]
}

export default function OcupacaoChart({ reservas }: OcupacaoChartProps) {
  const data = [
    {
      name: "Almoço",
      reservas: reservas.filter((r) => r.turno === "almoco").length,
    },
    {
      name: "Jantar",
      reservas: reservas.filter((r) => r.turno === "jantar").length,
    },
  ]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="reservas" fill="#3b82f6" />
      </BarChart>
    </ResponsiveContainer>
  )
}

