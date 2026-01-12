"use client"

import { useState } from "react"
import { Database } from "@/types/database"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatDateTime } from "@/lib/utils/date"
import { Search, Filter, RefreshCw, FileText, User, Activity } from "lucide-react"
import { useRouter } from "next/navigation"

type Auditoria = Database['public']['Tables']['auditoria']['Row']
type Usuario = { id: string; nome: string; email: string }

interface AuditoriaTableProps {
  registros: Auditoria[]
  usuariosMap: Map<string, Usuario>
}

export default function AuditoriaTable({ registros, usuariosMap }: AuditoriaTableProps) {
  const router = useRouter()
  const [filterModule, setFilterModule] = useState("")
  const [filterAction, setFilterAction] = useState("")
  const [filterUser, setFilterUser] = useState("")

  const modules = Array.from(new Set(registros.map(r => r.module))).sort()
  const actions = Array.from(new Set(registros.map(r => r.action))).sort()

  const filteredRegistros = registros.filter(reg => {
    if (filterModule && reg.module !== filterModule) return false
    if (filterAction && reg.action !== filterAction) return false
    if (filterUser && reg.user_id !== filterUser) return false
    return true
  })

  const handleFilter = () => {
    const params = new URLSearchParams()
    if (filterModule) params.set('module', filterModule)
    if (filterAction) params.set('action', filterAction)
    if (filterUser) params.set('user_id', filterUser)
    router.push(`/admin/auditoria?${params.toString()}`)
  }

  const clearFilters = () => {
    setFilterModule("")
    setFilterAction("")
    setFilterUser("")
    router.push('/admin/auditoria')
  }

  const getActionBadgeColor = (action: string) => {
    if (action.includes('CREATE') || action.includes('CRIAR') || action.includes('CRIADO')) {
      return 'bg-green-100 text-green-800 border-green-200'
    }
    if (action.includes('UPDATE') || action.includes('ATUALIZAR') || action.includes('EDITAR')) {
      return 'bg-blue-100 text-blue-800 border-blue-200'
    }
    if (action.includes('DELETE') || action.includes('DELETAR') || action.includes('EXCLUIR')) {
      return 'bg-red-100 text-red-800 border-red-200'
    }
    if (action.includes('LOGIN') || action.includes('LOGOUT')) {
      return 'bg-purple-100 text-purple-800 border-purple-200'
    }
    return 'bg-gray-100 text-gray-800 border-gray-200'
  }

  return (
    <Card className="shadow-xl border-2 border-[#8B2E3D]/20">
      <CardHeader className="border-b-2 border-[#8B2E3D]/10 bg-gradient-to-r from-[#8B2E3D]/5 to-transparent">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-gray-900">
              Registros de Auditoria
            </CardTitle>
            <CardDescription className="text-gray-700 mt-1">
              {filteredRegistros.length} registro{filteredRegistros.length !== 1 ? 's' : ''} encontrado{filteredRegistros.length !== 1 ? 's' : ''}
            </CardDescription>
          </div>
        </div>

        {/* Filtros */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
          <Select value={filterModule} onValueChange={setFilterModule}>
            <SelectTrigger>
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Módulo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os módulos</SelectItem>
              {modules.map(module => (
                <SelectItem key={module} value={module}>{module}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterAction} onValueChange={setFilterAction}>
            <SelectTrigger>
              <Activity className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Ação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas as ações</SelectItem>
              {actions.map(action => (
                <SelectItem key={action} value={action}>{action}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterUser} onValueChange={setFilterUser}>
            <SelectTrigger>
              <User className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Usuário" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os usuários</SelectItem>
              {Array.from(usuariosMap.values()).map(usuario => (
                <SelectItem key={usuario.id} value={usuario.id}>
                  {usuario.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button onClick={handleFilter} className="flex-1">
              <Search className="h-4 w-4 mr-2" />
              Filtrar
            </Button>
            {(filterModule || filterAction || filterUser) && (
              <Button onClick={clearFilters} variant="outline">
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {filteredRegistros.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-900 font-medium">Nenhum registro encontrado</p>
            <p className="text-sm text-gray-600 mt-1">
              {filterModule || filterAction || filterUser
                ? "Tente ajustar os filtros"
                : "Ainda não há registros de auditoria"}
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {filteredRegistros.map((registro) => {
              const usuario = registro.user_id ? usuariosMap.get(registro.user_id) : null

              return (
                <div
                  key={registro.id}
                  className="border-2 rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge
                          variant="outline"
                          className={getActionBadgeColor(registro.action)}
                        >
                          {registro.action}
                        </Badge>
                        <Badge variant="outline" className="bg-[#8B2E3D]/10 text-[#8B2E3D] border-[#8B2E3D]/20">
                          {registro.module}
                        </Badge>
                        {registro.record_id && (
                          <span className="text-xs text-gray-500 font-mono">
                            ID: {registro.record_id.substring(0, 8)}...
                          </span>
                        )}
                      </div>

                      {registro.description && (
                        <p className="text-sm text-gray-800 mb-2">{registro.description}</p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        {usuario && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{usuario.nome}</span>
                          </div>
                        )}
                        {registro.timestamp && (
                          <div className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            <span>{formatDateTime(registro.timestamp)}</span>
                          </div>
                        )}
                      </div>

                      {registro.metadata && (
                        <details className="mt-2">
                          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                            Ver detalhes
                          </summary>
                          <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                            {JSON.stringify(registro.metadata, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
