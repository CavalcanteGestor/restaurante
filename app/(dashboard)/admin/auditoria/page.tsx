import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth/user"
import { getAuditoria } from "@/lib/db/auditoria"
import { createClient } from "@/lib/supabase/server"
import PageHeader from "@/components/layout/PageHeader"
import { FileText, Filter, Download } from "lucide-react"
import AuditoriaTable from "@/components/admin/AuditoriaTable"

export const dynamic = 'force-dynamic'

export default async function AuditoriaPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const user = await getCurrentUser()

  if (!user || user.role !== 'admin') {
    redirect("/login")
  }

  const params = await searchParams
  const module = params.module as string | undefined
  const action = params.action as string | undefined
  const user_id = params.user_id as string | undefined

  const registros = await getAuditoria({
    module,
    action,
    user_id,
    limit: 200,
  })

  // Buscar usuários para exibir nomes
  const supabase = await createClient()
  const { data: usuarios } = await supabase
    .from('usuarios')
    .select('id, nome, email')

  const usuariosMap = new Map((usuarios || []).map(u => [u.id, u]))

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F0E8] via-white to-[#F5F0E8]/50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader
          icon={FileText}
          title="Auditoria do Sistema"
          description="Registro completo de todas as ações realizadas no sistema"
        />

        <AuditoriaTable registros={registros} usuariosMap={usuariosMap} />
      </div>
    </div>
  )
}
