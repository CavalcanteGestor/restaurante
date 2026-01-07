/**
 * Utilitários para validar e converter tipos de dados para o banco
 */

export function ensureString(value: any): string {
  if (value === null || value === undefined) return ''
  return String(value)
}

export function ensureNumber(value: any, defaultValue: number = 0): number {
  if (value === null || value === undefined) return defaultValue
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10)
    return isNaN(parsed) ? defaultValue : parsed
  }
  return defaultValue
}

export function ensureFloat(value: any, defaultValue: number | null = null): number | null {
  if (value === null || value === undefined) return defaultValue
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const parsed = parseFloat(value)
    return isNaN(parsed) ? defaultValue : parsed
  }
  return defaultValue
}

export function ensureBoolean(value: any, defaultValue: boolean = false): boolean {
  if (value === null || value === undefined) return defaultValue
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value === '1'
  }
  if (typeof value === 'number') {
    return value !== 0
  }
  return Boolean(value)
}

export function ensureNullableString(value: any): string | null {
  if (value === null || value === undefined || value === '') return null
  return String(value)
}

export function ensureDate(value: any): string {
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'string') {
    // Tentar validar se é uma data válida
    const date = new Date(value)
    if (!isNaN(date.getTime())) return date.toISOString()
    return new Date().toISOString()
  }
  return new Date().toISOString()
}

