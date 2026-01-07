import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth/user"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import AdicionarMesasForm from "@/components/admin/AdicionarMesasForm"
import { Database, Plus } from "lucide-react"

export default async function AdicionarMesasPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== 'admin') {
    redirect("/login")
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-[#8B2E3D] to-[#7A1F2E] bg-clip-text text-transparent flex items-center gap-3">
          <Plus className="h-10 w-10 text-[#8B2E3D]" />
          Adicionar Mesas
        </h1>
        <p className="text-gray-600 mt-2 text-lg">
          Adicione todas as mesas do restaurante ao sistema
        </p>
      </div>

      <Alert className="border-[#8B2E3D]/20 bg-[#8B2E3D]/5">
        <Database className="h-4 w-4 text-[#8B2E3D]" />
        <AlertTitle className="text-[#8B2E3D]">Importante</AlertTitle>
        <AlertDescription className="text-gray-700">
          Esta ação irá adicionar todas as mesas do restaurante conforme as regras definidas.
          Mesas que já existem serão atualizadas, novas mesas serão criadas.
        </AlertDescription>
      </Alert>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Adicionar Todas as Mesas</CardTitle>
          <CardDescription>
            Clique no botão abaixo para adicionar todas as mesas do restaurante ao banco de dados.
            Isso inclui:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 mb-6">
            <li>Salão Externo Coberto (Mesas 1-6)</li>
            <li>Salão Interno - Cristal (Mesas 7-11)</li>
            <li>Salão Interno - Bandeira (Mesas 12-14)</li>
            <li>Segundo Andar Externo Coberto (Mesas 21-24)</li>
            <li>Sala Cinema (Mesas 25-26)</li>
            <li>Sala Opera (Mesas 27-34)</li>
            <li>Sala Palio di Siena (Mesas 35-38)</li>
            <li>Terraço (Mesas 61-82)</li>
            <li>Empório (Mesas 41-52)</li>
          </ul>
          <AdicionarMesasForm />
        </CardContent>
      </Card>
    </div>
  )
}

