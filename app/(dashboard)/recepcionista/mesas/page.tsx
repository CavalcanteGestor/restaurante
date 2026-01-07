import Link from "next/link"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth/user"
import { getMesas } from "@/lib/db/mesas"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Plus, Map, LayoutGrid } from "lucide-react"
import MesasGrid from "@/components/mesas/MesasGrid"

export default async function RecepcionistaMesasPage({
  searchParams,
}: {
  searchParams: Promise<{ andar?: string; ambiente?: string }>
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const params = await searchParams
  const mesas = await getMesas({
    andar: params.andar,
    ambiente: params.ambiente,
  })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Mesas</h1>
          <p className="text-gray-600 mt-2 text-lg">Visualize a disponibilidade das mesas</p>
        </div>
        <div className="flex gap-3">
          <Link href="/recepcionista/mesas/mapa">
            <Button variant="outline" className="text-[#8B2E3D] border-[#8B2E3D]/20 hover:bg-[#8B2E3D]/5 transition-colors duration-200 shadow-sm hover:shadow-md">
              <Map className="h-5 w-5 mr-2" />
              Mapa Visual
            </Button>
          </Link>
        </div>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Mesas Disponíveis</CardTitle>
          <CardDescription className="text-gray-700">
            Visualize a disponibilidade das mesas do restaurante.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MesasGrid mesas={mesas} />
        </CardContent>
      </Card>
    </div>
  )
}

