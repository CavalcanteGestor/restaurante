/**
 * Cache simples em memória para Evolution API
 * Reduz chamadas desnecessárias
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number // Time to live em milissegundos
}

class EvolutionCache {
  private cache = new Map<string, CacheEntry<any>>()

  set<T>(key: string, data: T, ttlMinutes: number = 5): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000,
    })
    console.log(`[Evolution Cache] Salvou: ${key} (TTL: ${ttlMinutes}min)`)
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    const now = Date.now()
    const age = now - entry.timestamp

    if (age > entry.ttl) {
      console.log(`[Evolution Cache] Expirou: ${key} (${Math.round(age / 1000)}s)`)
      this.cache.delete(key)
      return null
    }

    console.log(`[Evolution Cache] Hit: ${key} (idade: ${Math.round(age / 1000)}s)`)
    return entry.data
  }

  clear(key?: string): void {
    if (key) {
      this.cache.delete(key)
      console.log(`[Evolution Cache] Limpou: ${key}`)
    } else {
      this.cache.clear()
      console.log(`[Evolution Cache] Limpou tudo`)
    }
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false

    const now = Date.now()
    const age = now - entry.timestamp

    if (age > entry.ttl) {
      this.cache.delete(key)
      return false
    }

    return true
  }
}

export const evolutionCache = new EvolutionCache()

