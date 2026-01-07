import { redirect, notFound } from "next/navigation"
import { getCurrentUser } from "@/lib/auth/user"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import UsuarioForm from "@/components/admin/UsuarioForm"

export default async function EditarUsuarioPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await getCurrentUser()

  if (!user || user.role !== 'admin') {
    redirect("/login")
  }

  const { id } = await params
  const supabase = await createClient()

  if (!id) {
    notFound()
  }

  // Buscar usuário (sem join para evitar erros)
  const { data: usuario, error: usuarioError } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', id)
    .single()

  if (usuarioError || !usuario) {
    console.error("Erro ao buscar usuário:", {
      message: usuarioError?.message,
      code: usuarioError?.code,
      details: usuarioError?.details
    })
    notFound()
  }

  // Buscar funções disponíveis
  const { data: funcoes, error: funcoesError } = await supabase
    .from('funcoes')
    .select('*')
    .order('nome', { ascending: true })

  if (funcoesError) {
    console.error("Erro ao buscar funções:", funcoesError)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-[#8B2E3D] to-[#7A1F2E] bg-clip-text text-transparent">
          Editar Usuário
        </h1>
        <p className="text-gray-600 mt-2 text-lg">
          Edite as informações do usuário {usuario.nome}
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Informações do Usuário</CardTitle>
          <CardDescription>
            Atualize os dados do usuário. A senha só será alterada se você preencher o campo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UsuarioForm 
            funcoes={funcoes || []} 
            usuario={usuario}
            isEdit={true}
          />
        </CardContent>
      </Card>
    </div>
  )
}

