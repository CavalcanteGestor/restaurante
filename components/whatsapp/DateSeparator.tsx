"use client"

interface DateSeparatorProps {
  date: string | number
}

export default function DateSeparator({ date }: DateSeparatorProps) {
  const formatDateSeparator = (timestamp: string | number): string => {
    try {
      const messageDate = new Date(typeof timestamp === 'number' ? timestamp : parseInt(String(timestamp)))
      const hoje = new Date()
      const ontem = new Date(hoje)
      ontem.setDate(ontem.getDate() - 1)

      // Limpar horas para comparação
      const messageDay = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate())
      const hojeDay = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())
      const ontemDay = new Date(ontem.getFullYear(), ontem.getMonth(), ontem.getDate())

      if (messageDay.getTime() === hojeDay.getTime()) {
        return 'HOJE'
      } else if (messageDay.getTime() === ontemDay.getTime()) {
        return 'ONTEM'
      } else {
        return messageDate.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
      }
    } catch (e) {
      return ''
    }
  }

  return (
    <div className="flex justify-center my-4">
      <div className="bg-[#8B2E3D]/10 backdrop-blur-sm rounded-full px-4 py-1.5 shadow-sm">
        <p className="text-xs text-[#8B2E3D] font-semibold">
          {formatDateSeparator(date)}
        </p>
      </div>
    </div>
  )
}

