"use client"

import { useMemo } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Database } from "@/types/database"
import { format } from "date-fns"

type Reserva = Database['public']['Tables']['reservas']['Row']

interface ReservasChartProps {
  reservas: Reserva[]
}

export default function ReservasChart({ reservas }: ReservasChartProps) {
  const data = useMemo(() => {
    const grouped = reservas.reduce((acc, reserva) => {
      const date = reserva.data_reserva
      if (!acc[date]) {
        acc[date] = 0
      }
      acc[date]++
      return acc
    }, {} as Record<string, number>)

    return Object.entries(grouped)
      .map(([date, count]) => ({
        date: format(new Date(date), "dd/MM"),
        reservas: count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [reservas])

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="reservas"
          stroke="#3b82f6"
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

