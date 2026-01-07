import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth/user"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Users, Shield, User } from "lucide-react"
import Link from "next/link"
import UsuariosTable from "@/components/admin/UsuariosTable"
import { Badge } from "@/components/ui/badge"

export default async function UsuariosPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== 'admin') {
    redirect("/login")
  }

  const supabase = await createClient()

  // Buscar todos os usuários (sem join primeiro para evitar erros)
  const { data: usuarios, error: usuariosError } = await supabase
    .from('usuarios')
    .select('*')
    .order('nome', { ascending: true })

  if (usuariosError) {
    console.error("Erro ao buscar usuários:", {
      message: usuariosError.message,
      code: usuariosError.code,
      details: usuariosError.details,
      hint: usuariosError.hint
    })
  }

  // Buscar funções disponíveis
  const { data: funcoes, error: funcoesError } = await supabase
    .from('funcoes')
    .select('*')
    .order('nome', { ascending: true })

  if (funcoesError) {
    console.error("Erro ao buscar funções:", {
      message: funcoesError.message,
      code: funcoesError.code,
      details: funcoesError.details
    })
  }

  // Criar um mapa de funções para lookup rápido
  const funcoesMap = new Map((funcoes || []).map(f => [f.id, f]))

  // Combinar usuários com suas funções
  const usuariosComFuncao = (usuarios || []).map(u => {
    const funcao = u.funcao_id ? funcoesMap.get(u.funcao_id) : null
    return {
      ...u,
      funcao_nome: funcao?.nome || 'Sem função',
      funcao_tipo: funcao?.tipo || null,
    }
  })

  const totalUsuarios = usuariosComFuncao.length
  const usuariosAtivos = usuariosComFuncao.filter(u => u.status === true).length
  const admins = usuariosComFuncao.filter(u => u.tipo === 'admin' || u.tipo === 'administrador' || (u as any).funcao_tipo === 'admin').length
  const recepcionistas = usuariosComFuncao.filter(u => u.tipo !== 'admin' && u.tipo !== 'administrador' && (u as any).funcao_tipo !== 'admin').length

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#8B2E3D] to-[#7A1F2E] bg-clip-text text-transparent flex items-center gap-3">
            <Users className="h-10 w-10 text-[#8B2E3D]" />
            Gerenciar Usuários
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            Crie e gerencie usuários do sistema (admin e recepcionistas)
          </p>
        </div>
        <Link href="/admin/usuarios/novo">
          <Button className="bg-[#8B2E3D] hover:bg-[#7A1F2E] text-white shadow-md hover:shadow-lg">
            <Plus className="h-5 w-5 mr-2" />
            Novo Usuário
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-2 border-[#8B2E3D]/20 bg-gradient-to-br from-[#8B2E3D]/10 to-white shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-[#8B2E3D]/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-[#8B2E3D]" />
              </div>
              <CardTitle className="text-sm font-medium text-[#8B2E3D]">
                Total de Usuários
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-[#8B2E3D]">{totalUsuarios}</div>
            <p className="text-sm text-[#8B2E3D]/80 mt-1">
              Usuários cadastrados
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <User className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-sm font-medium text-green-700">
                Usuários Ativos
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600">{usuariosAtivos}</div>
            <p className="text-sm text-green-700/80 mt-1">
              Usuários com acesso ativo
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-sm font-medium text-purple-700">
                Administradores
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-purple-600">{admins}</div>
            <p className="text-sm text-purple-700/80 mt-1">
              Usuários com permissão admin
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-sm font-medium text-blue-700">
                Recepcionistas
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-600">{recepcionistas}</div>
            <p className="text-sm text-blue-700/80 mt-1">
              Usuários recepcionistas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Usuários */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Lista de Usuários</CardTitle>
          <CardDescription>
            Visualize e gerencie todos os usuários do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UsuariosTable usuarios={usuariosComFuncao} funcoes={funcoes || []} />
        </CardContent>
      </Card>
    </div>
  )
}

