import { format, parse, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function formatDate(date: string | Date | null | undefined, formatStr: string = 'dd/MM/yyyy'): string {
  if (!date) return '-'
  
  try {
    const dateObj = typeof date === 'string' ? parse(date, 'yyyy-MM-dd', new Date()) : date
    if (isNaN(dateObj.getTime())) return '-'
    return format(dateObj, formatStr, { locale: ptBR })
  } catch (error) {
    return '-'
  }
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '-'
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    if (isNaN(dateObj.getTime())) return '-'
    return format(dateObj, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
  } catch (error) {
    return '-'
  }
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':')
  return `${hours}:${minutes}`
}

export function getToday(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function getWeekRange(date: Date = new Date()): { start: string; end: string } {
  const start = startOfWeek(date, { weekStartsOn: 1 })
  const end = endOfWeek(date, { weekStartsOn: 1 })
  return {
    start: format(start, 'yyyy-MM-dd'),
    end: format(end, 'yyyy-MM-dd'),
  }
}

export function getMonthRange(date: Date = new Date()): { start: string; end: string } {
  const start = startOfMonth(date)
  const end = endOfMonth(date)
  return {
    start: format(start, 'yyyy-MM-dd'),
    end: format(end, 'yyyy-MM-dd'),
  }
}

export function isToday(date: string): boolean {
  return date === getToday()
}

export function isPast(date: string, time?: string): boolean {
  const dateObj = parse(date, 'yyyy-MM-dd', new Date())
  const now = new Date()
  
  if (time) {
    const [hours, minutes] = time.split(':')
    dateObj.setHours(parseInt(hours), parseInt(minutes), 0, 0)
  }
  
  return dateObj < now
}

export function isAtrasado(date: string, time: string, toleranciaMinutos: number = 15): boolean {
  if (!isToday(date)) return false
  
  const [hours, minutes] = time.split(':').map(Number)
  const horaReserva = new Date()
  horaReserva.setHours(hours, minutes, 0, 0)
  
  const agora = new Date()
  const diferencaMinutos = (agora.getTime() - horaReserva.getTime()) / (1000 * 60)
  
  return diferencaMinutos > toleranciaMinutos
}

