/**
 * Sistema de cache em memória para queries frequentes
 * Reduz carga no banco de dados e melhora performance
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number // Time to live em milissegundos
}

class QueryCache {
  private cache: Map<string, CacheEntry<any>> = new Map()

  /**
   * Obtém dados do cache se ainda válidos
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      // Cache expirado
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  /**
   * Armazena dados no cache
   */
  set<T>(key: string, data: T, ttlMs: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    })
  }

  /**
   * Remove entrada do cache
   */
  delete(key: string): void {
    this.cache.delete(key)
  }

  /**
   * Limpa todo o cache
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Remove entradas expiradas
   */
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Gera chave de cache baseada em parâmetros
   */
  static generateKey(prefix: string, params?: Record<string, any>): string {
    if (!params || Object.keys(params).length === 0) {
      return prefix
    }
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|')
    return `${prefix}|${sortedParams}`
  }
}

// Instância singleton
const queryCache = new QueryCache()

// Limpeza automática a cada 5 minutos
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    queryCache.cleanup()
  }, 5 * 60 * 1000)
}

export default queryCache

// Helpers específicos para diferentes tipos de queries
export const cacheKeys = {
  reservas: (filters?: Record<string, any>) => 
    QueryCache.generateKey('reservas', filters),
  reservasAtrasadas: () => 'reservas:atrasadas',
  leads: (filters?: Record<string, any>) => 
    QueryCache.generateKey('leads', filters),
  mensagens: (filters?: Record<string, any>) => 
    QueryCache.generateKey('mensagens', filters),
}

// TTLs padrão (em milissegundos)
export const cacheTTL = {
  reservas: 30 * 1000, // 30 segundos
  reservasAtrasadas: 60 * 1000, // 1 minuto
  leads: 30 * 1000, // 30 segundos
  mensagens: 60 * 1000, // 1 minuto
}

