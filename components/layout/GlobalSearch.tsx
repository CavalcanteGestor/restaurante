"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Calendar, Users, Phone, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

interface SearchResult {
  type: 'reserva' | 'lead' | 'cliente' | 'mesa'
  id: string
  title: string
  subtitle: string
  href: string
}

interface GlobalSearchProps {
  mobile?: boolean
}

export default function GlobalSearch({ mobile = false }: GlobalSearchProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)

  // Atalho Ctrl+K ou Cmd+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  // Buscar quando digitar
  useEffect(() => {
    if (!search || search.length < 2) {
      setResults([])
      return
    }

    const buscar = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(search)}`)
        const data = await response.json()
        setResults(data.results || [])
      } catch (error) {
        console.error("Erro ao buscar:", error)
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(buscar, 300) // Debounce
    return () => clearTimeout(timer)
  }, [search])

  const handleSelect = (result: SearchResult) => {
    router.push(result.href)
    setOpen(false)
    setSearch("")
  }

  return (
    <>
      {mobile ? (
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-xl border-2 border-[#8B2E3D]/20 hover:border-[#8B2E3D]/40 transition-colors bg-white"
        >
          <Search className="h-5 w-5 text-[#8B2E3D]/70" />
        </button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-[#8B2E3D]/20 hover:border-[#8B2E3D]/40 transition-colors bg-white"
        >
          <Search className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">Buscar...</span>
          <kbd className="ml-auto px-2 py-0.5 text-xs font-semibold text-gray-500 bg-gray-100 rounded">
            ⌘K
          </kbd>
        </button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">Buscar no Sistema</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar reservas, clientes, leads, mesas..."
                className="pl-10 h-12 text-lg border-2 border-[#8B2E3D]/20 focus:border-[#8B2E3D]"
                autoFocus
              />
              {loading && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#8B2E3D] animate-spin" />
              )}
            </div>

            {results.length > 0 && (
              <div className="max-h-96 overflow-y-auto space-y-2">
                {results.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleSelect(result)}
                    className="w-full text-left p-4 rounded-lg border-2 border-gray-100 hover:border-[#8B2E3D]/30 hover:bg-[#8B2E3D]/5 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#8B2E3D] to-[#7A1F2E] flex items-center justify-center">
                        {result.type === 'reserva' && <Calendar className="h-5 w-5 text-white" />}
                        {result.type === 'lead' && <Users className="h-5 w-5 text-white" />}
                        {result.type === 'cliente' && <Phone className="h-5 w-5 text-white" />}
                        {result.type === 'mesa' && <span className="text-white font-bold">M</span>}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900 group-hover:text-[#8B2E3D]">
                            {result.title}
                          </h4>
                          <Badge variant="outline" className="text-xs capitalize">
                            {result.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{result.subtitle}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {search.length >= 2 && results.length === 0 && !loading && (
              <div className="text-center py-12">
                <Search className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-600 font-medium">Nenhum resultado encontrado</p>
                <p className="text-sm text-gray-500 mt-2">Tente buscar por nome, telefone ou número de mesa</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

