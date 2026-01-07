import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth/user"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import UsuarioForm from "@/components/admin/UsuarioForm"

export default async function NovoUsuarioPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== 'admin') {
    redirect("/login")
  }

  const supabase = await createClient()

  // Buscar funções disponíveis
  const { data: funcoes } = await supabase
    .from('funcoes')
    .select('*')
    .order('nome', { ascending: true })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-[#8B2E3D] to-[#7A1F2E] bg-clip-text text-transparent">
          Novo Usuário
        </h1>
        <p className="text-gray-600 mt-2 text-lg">
          Crie um novo usuário (admin ou recepcionista)
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Informações do Usuário</CardTitle>
          <CardDescription>
            Preencha os dados para criar um novo usuário no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UsuarioForm funcoes={funcoes || []} />
        </CardContent>
      </Card>
    </div>
  )
}

