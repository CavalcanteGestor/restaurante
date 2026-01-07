"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Lock, AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        // Mensagens de erro mais amigáveis
        if (authError.message.includes('Invalid API key') || authError.message.includes('JWT') || authError.message.includes('apikey')) {
          throw new Error("❌ Chave de API inválida. Verifique o arquivo .env.local e reinicie o servidor (npm run dev)")
        }
        if (authError.message.includes('Invalid login credentials') || authError.message.includes('credentials')) {
          throw new Error("Email ou senha incorretos. Verifique suas credenciais.")
        }
        if (authError.message.includes('Email not confirmed')) {
          throw new Error("Email não confirmado. Verifique sua caixa de entrada ou contate o administrador.")
        }
        if (authError.message.includes('User not found')) {
          throw new Error("Usuário não encontrado. Verifique se o email está correto ou contate o administrador.")
        }
        throw new Error(authError.message || "Erro ao fazer login. Tente novamente.")
      }

      if (!authData.user) {
        throw new Error("Usuário não encontrado")
      }

      // Buscar dados do usuário para determinar o tipo
      const { data: usuario, error: userError } = await supabase
        .from('usuarios')
        .select('tipo, funcao_id, status')
        .eq('id', authData.user.id)
        .single()

      if (userError || !usuario) {
        throw new Error("Dados do usuário não encontrados. Entre em contato com o administrador.")
      }

      if (usuario.status === false) {
        throw new Error("Sua conta está desativada. Entre em contato com o administrador.")
      }

      // Redirecionar baseado no tipo
      if (usuario.tipo === 'admin' || usuario.tipo === 'administrador') {
        router.push("/admin")
      } else {
        router.push("/recepcionista")
      }
      
      router.refresh()
    } catch (error: any) {
      setError(error.message || "Erro ao fazer login. Verifique suas credenciais.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-800 font-medium">
            {error}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-semibold text-[#8B2E3D]">
          Email
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#8B2E3D]/50" />
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            autoComplete="email"
            className="pl-10 h-12 bg-white/80 border-2 border-[#8B2E3D]/20 rounded-xl focus:bg-white focus:border-[#8B2E3D] focus:shadow-rustic transition-all text-[#8B2E3D] placeholder:text-[#8B2E3D]/40 font-medium"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-semibold text-[#8B2E3D]">
          Senha
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#8B2E3D]/50" />
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            autoComplete="current-password"
            className="pl-10 h-12 bg-white/80 border-2 border-[#8B2E3D]/20 rounded-xl focus:bg-white focus:border-[#8B2E3D] focus:shadow-rustic transition-all text-[#8B2E3D] placeholder:text-[#8B2E3D]/40 font-medium"
          />
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full h-12 text-base font-semibold shadow-rustic-lg hover:shadow-rustic-lg transition-all duration-300 bg-gradient-to-r from-[#8B2E3D] to-[#7A1F2E] hover:from-[#7A1F2E] hover:to-[#6A1A28] text-white rounded-xl hover:scale-[1.02]" 
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Entrando...
          </>
        ) : (
          "Entrar"
        )}
      </Button>

      <div className="text-center pt-2">
        <p className="text-sm text-[#8B2E3D]/70 font-medium">
          Esqueceu sua senha?{" "}
          <a href="#" className="text-[#8B2E3D] hover:text-[#7A1F2E] hover:underline font-semibold transition-colors">
            Recuperar senha
          </a>
        </p>
      </div>
    </form>
  )
}
