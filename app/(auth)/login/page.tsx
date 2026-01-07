import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import LoginForm from "@/components/auth/LoginForm"
import Image from "next/image"
import { UtensilsCrossed, Shield, User } from "lucide-react"

export default async function LoginPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    // Redirecionar baseado no role
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('tipo, funcao_id')
      .eq('id', user.id)
      .single()

    if (usuario?.tipo === 'admin' || usuario?.tipo === 'administrador') {
      redirect("/admin")
    } else {
      redirect("/recepcionista")
    }
  }

  return (
    <div className="min-h-screen flex bg-rustic-texture bg-paper-texture">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#8B2E3D] via-[#7A1F2E] to-[#6B1525] relative overflow-hidden bg-italian-pattern">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,transparent)]" />
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="mb-8">
            {/* Logo */}
            <div className="mb-8 flex justify-center">
              <div className="bg-white/95 rounded-2xl p-6 shadow-rustic-lg border-2 border-white/20 relative overflow-hidden">
                {/* Decorative corners */}
                <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-[#8B2E3D]/30 rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-[#8B2E3D]/30 rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-[#8B2E3D]/30 rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-[#8B2E3D]/30 rounded-br-lg"></div>
                <Image
                  src="/images/logo.jpg"
                  alt="Est! Est!! Est!!! Ristorante"
                  width={300}
                  height={200}
                  className="object-contain relative z-10"
                  style={{ width: "auto", height: "auto" }}
                  priority
                />
              </div>
            </div>
            
            <h2 className="text-4xl font-serif font-bold mb-4 text-white text-center italic">
              Sistema de Gestão de Reservas
            </h2>
            <p className="text-lg text-white/95 leading-relaxed text-center font-medium">
              Gerencie todas as reservas do restaurante de forma eficiente e profissional.
              Acesse o dashboard completo com todas as ferramentas necessárias.
            </p>
          </div>
          
          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-3 text-white/95 justify-center">
              <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30 shadow-rustic">
                <UtensilsCrossed className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-white font-serif">Gestão Completa</p>
                <p className="text-sm text-white/90">Reservas, mesas e atendimentos</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-[#F5F0E8] via-white to-[#F5F0E8] p-8 bg-rustic-texture">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex flex-col items-center gap-4 mb-6">
              <div className="bg-white rounded-2xl p-4 shadow-rustic-lg border-2 border-[#8B2E3D]/20">
                <Image
                  src="/images/logo.jpg"
                  alt="Est! Est!! Est!!! Ristorante"
                  width={200}
                  height={130}
                  className="object-contain"
                  style={{ width: "auto", height: "auto" }}
                  priority
                />
              </div>
            </div>
          </div>

          {/* Login Card */}
          <div className="bg-white/95 rounded-2xl shadow-rustic-lg border-2 border-[#8B2E3D]/20 overflow-hidden backdrop-blur-sm bg-rustic-texture">
            <div className="bg-gradient-to-r from-[#8B2E3D]/10 via-[#8B2E3D]/5 to-transparent p-6 border-b-2 border-[#8B2E3D]/20">
              <h2 className="text-3xl font-serif font-bold text-[#8B2E3D] italic">Bem-vindo de volta</h2>
              <p className="text-[#8B2E3D]/80 mt-2 font-medium">
                Entre com suas credenciais para acessar o sistema
              </p>
            </div>
            <div className="p-6">
              <LoginForm />
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-[#8B2E3D]/70 font-medium">
            <p className="font-serif italic">© 2026 Est! Est!! Est!!! Ristorante. Todos os direitos reservados.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
