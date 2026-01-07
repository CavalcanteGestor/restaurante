import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import ReservaForm from "@/components/reservas/ReservaForm"
import { Calendar, Sparkles } from "lucide-react"

export default function NovaReservaPage() {
  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-serif font-bold bg-gradient-to-r from-[#8B2E3D] to-[#7A1F2E] bg-clip-text text-transparent flex items-center gap-3">
            <Calendar className="h-10 w-10 text-[#8B2E3D]" />
            Nova Reserva
          </h1>
          <p className="text-[#8B2E3D]/70 mt-2 text-lg font-medium">
            Criar uma nova reserva para o restaurante
          </p>
        </div>
      </div>

      {/* Main Form Card */}
      <Card className="border-2 border-[#8B2E3D]/20 shadow-rustic-lg bg-gradient-to-br from-white to-[#F5F0E8]/30">
        <CardHeader className="bg-gradient-to-r from-[#8B2E3D]/10 to-transparent border-b-2 border-[#8B2E3D]/20">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-[#8B2E3D]/10 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-[#8B2E3D]" />
            </div>
            <div>
              <CardTitle className="text-2xl font-serif font-bold text-[#8B2E3D]">
                Informações da Reserva
              </CardTitle>
              <CardDescription className="text-[#8B2E3D]/70 mt-1 font-medium">
                Preencha os dados abaixo para criar a reserva
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-8">
          <ReservaForm />
        </CardContent>
      </Card>
    </div>
  )
}

