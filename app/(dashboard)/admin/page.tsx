import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth/user"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"
import { Settings, Users, Shield, FileText, Clock, Calendar, BarChart3, Table, FileUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default async function AdminPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== 'admin') {
    redirect("/login")
  }

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-4xl font-serif font-bold bg-gradient-to-r from-[#8B2E3D] to-[#7A1F2E] bg-clip-text text-transparent flex items-center gap-3">
          <Settings className="h-10 w-10 text-[#8B2E3D]" />
          Painel Administrativo
        </h1>
        <p className="text-[#8B2E3D]/70 mt-2 text-lg font-medium">
          Gerencie todas as configurações e usuários do sistema
        </p>
      </div>

      {/* Welcome Card */}
      <Card className="border-2 border-[#8B2E3D]/20 bg-gradient-to-r from-[#8B2E3D]/10 to-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-serif font-bold text-[#8B2E3D]">
            Bem-vindo, {user.nome}!
          </CardTitle>
          <div className="text-sm text-[#8B2E3D]/80 mt-2 flex items-center gap-2 font-medium">
            <span>Você está logado como</span>
            <Badge className="bg-[#8B2E3D] text-white font-semibold">Administrador</Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Admin Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-[#8B2E3D]/50 group h-full">
          <Link href="/admin/usuarios" className="block h-full">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-[#8B2E3D]/10 flex items-center justify-center group-hover:bg-[#8B2E3D]/20 transition-colors">
                  <Users className="h-7 w-7 text-[#8B2E3D]" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg font-bold">Usuários</CardTitle>
                  <CardDescription className="mt-1 text-[#8B2E3D]/70">
                    Gerencie usuários e permissões do sistema
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Link>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-[#8B2E3D]/50 group h-full">
          <Link href="/admin/regras" className="block h-full">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-[#8B2E3D]/10 flex items-center justify-center group-hover:bg-[#8B2E3D]/20 transition-colors">
                  <Shield className="h-7 w-7 text-[#8B2E3D]" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg font-bold">Regras de Negócio</CardTitle>
                  <CardDescription className="mt-1 text-[#8B2E3D]/70">
                    Configure regras MCPS do sistema
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Link>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-[#8B2E3D]/50 group h-full">
          <Link href="/admin/logs" className="block h-full">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-[#8B2E3D]/10 flex items-center justify-center group-hover:bg-[#8B2E3D]/20 transition-colors">
                  <FileText className="h-7 w-7 text-[#8B2E3D]" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg font-bold">Logs e Auditoria</CardTitle>
                  <CardDescription className="mt-1 text-[#8B2E3D]/70">
                    Visualize logs e atividades do sistema
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Link>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-[#8B2E3D]/50 group h-full">
          <Link href="/admin/mesas/adicionar" className="block h-full">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-[#8B2E3D]/10 flex items-center justify-center group-hover:bg-[#8B2E3D]/20 transition-colors">
                  <Table className="h-7 w-7 text-[#8B2E3D]" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg font-bold">Adicionar Mesas</CardTitle>
                  <CardDescription className="mt-1 text-[#8B2E3D]/70">
                    Adicione todas as mesas do restaurante
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Link>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-[#8B2E3D]/50 group h-full">
          <Link href="/admin/documentos" className="block h-full">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-[#8B2E3D]/10 flex items-center justify-center group-hover:bg-[#8B2E3D]/20 transition-colors">
                  <FileUp className="h-7 w-7 text-[#8B2E3D]" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg font-bold">Documentos</CardTitle>
                  <CardDescription className="mt-1 text-[#8B2E3D]/70">
                    Gerencie cardápios e documentos do restaurante
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Link>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-[#8B2E3D]/50 group h-full">
          <Link href="/reservas" className="block h-full">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-[#8B2E3D]/10 flex items-center justify-center group-hover:bg-[#8B2E3D]/20 transition-colors">
                  <Calendar className="h-7 w-7 text-[#8B2E3D]" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg font-bold">Reservas</CardTitle>
                  <CardDescription className="mt-1 text-[#8B2E3D]/70">
                    Gerencie todas as reservas
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Link>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-[#8B2E3D]/50 group h-full">
          <Link href="/relatorios" className="block h-full">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-[#8B2E3D]/10 flex items-center justify-center group-hover:bg-[#8B2E3D]/20 transition-colors">
                  <BarChart3 className="h-7 w-7 text-[#8B2E3D]" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg font-bold">Relatórios</CardTitle>
                  <CardDescription className="mt-1 text-[#8B2E3D]/70">
                    Análise e métricas do sistema
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Link>
        </Card>
      </div>

      {/* Configurações Gerais - Card separado */}
      <Card className="border-2 hover:border-[#8B2E3D]/50 transition-all duration-300 hover:shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-[#8B2E3D]/10 flex items-center justify-center">
              <Settings className="h-7 w-7 text-[#8B2E3D]" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg font-bold">Configurações Gerais</CardTitle>
              <CardDescription className="mt-1 text-[#8B2E3D]/70">
                Horários, turnos e tolerâncias
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="p-4 border rounded-lg bg-gray-50/50">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-gray-700" />
                <p className="text-sm font-semibold text-gray-900">Tolerância de Atraso</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Tempo máximo de atraso antes de enviar mensagem</p>
                <Badge className="bg-[#8B2E3D]/10 text-[#8B2E3D] border-[#8B2E3D]/20">15 minutos</Badge>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg bg-gray-50/50">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4 text-gray-700" />
                <p className="text-sm font-semibold text-gray-900">Turnos Configurados</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Almoço</span>
                  <Badge variant="outline">11:30 - 15:00</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Jantar</span>
                  <Badge variant="outline">18:00 - 23:00</Badge>
                </div>
              </div>
            </div>

            <Button variant="outline" className="w-full">
              Editar Configurações
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
