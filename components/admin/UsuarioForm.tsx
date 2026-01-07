"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PhoneInput } from "@/components/ui/phone-input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2, User, Mail, Phone, Shield, Lock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type Funcao = {
  id: string
  nome: string
}

interface UsuarioFormProps {
  funcoes: Funcao[]
  usuario?: any
  isEdit?: boolean
}

  // Schema base
const baseUsuarioSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  telefone: z.string().optional(),
  tipo: z.enum(["admin", "recepcionista"]),
  funcao_id: z.string().optional(),
  status: z.boolean().default(true),
})

// Schema para criação (senha obrigatória)
const createUsuarioSchema = baseUsuarioSchema.extend({
  senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
})

// Schema para edição (senha opcional)
const editUsuarioSchema = baseUsuarioSchema.extend({
  senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").optional().or(z.literal("")),
})

export default function UsuarioForm({ funcoes, usuario, isEdit = false }: UsuarioFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const usuarioSchema = isEdit ? editUsuarioSchema : createUsuarioSchema
  type UsuarioFormData = z.infer<typeof usuarioSchema>

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<UsuarioFormData>({
    resolver: zodResolver(usuarioSchema) as any,
    defaultValues: usuario ? {
      nome: usuario.nome,
      email: usuario.email,
      telefone: usuario.telefone || "",
      tipo: usuario.tipo === 'admin' || usuario.tipo === 'administrador' ? 'admin' : 'recepcionista',
      funcao_id: usuario.funcao_id || "",
      status: usuario.status !== false,
    } : {
      tipo: 'recepcionista',
      status: true,
    },
  })

  const tipoSelecionado = watch("tipo")

  const onSubmit = async (data: UsuarioFormData) => {
    setError(null)
    setLoading(true)

    try {
      const url = isEdit && usuario ? `/api/usuarios/${usuario.id}` : "/api/usuarios"
      const method = isEdit ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erro ao salvar usuário")
      }

      toast({
        title: isEdit ? "Usuário atualizado!" : "Usuário criado!",
        description: `O usuário ${data.nome} foi ${isEdit ? 'atualizado' : 'criado'} com sucesso.`,
      })

      router.push("/admin/usuarios")
      router.refresh()
    } catch (error: any) {
      setError(error.message || "Erro ao salvar usuário")
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="nome" className="text-sm font-semibold text-gray-900">
            Nome Completo *
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="nome"
              {...register("nome")}
              placeholder="João Silva"
              className="pl-10"
              disabled={loading}
            />
          </div>
          {errors.nome && (
            <p className="text-sm text-red-600">{errors.nome.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-semibold text-gray-900">
            Email *
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="joao@exemplo.com"
              className="pl-10"
              disabled={loading || isEdit}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
          {isEdit && (
            <p className="text-xs text-gray-600">O email não pode ser alterado</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="telefone" className="text-sm font-semibold text-gray-900">
            Telefone
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
            <PhoneInput
              id="telefone"
              {...register("telefone", {
                validate: (value) => {
                  if (!value || value.trim() === "") return true // Opcional
                  const numbers = value.replace(/\D/g, "")
                  if (numbers.length < 10) {
                    return "Telefone deve ter DDD + número (mínimo 10 dígitos)"
                  }
                  if (numbers.length === 11) {
                    const numero = numbers.slice(2)
                    if (!numero.startsWith("9")) {
                      return "Número de celular deve começar com 9"
                    }
                  }
                  return true
                }
              })}
              className="pl-10"
              disabled={loading}
            />
          </div>
          {errors.telefone && (
            <p className="text-sm text-red-600">{errors.telefone.message}</p>
          )}
          <p className="text-xs text-gray-600">Formato: (DDD) 9XXXX-XXXX</p>
        </div>

        {!isEdit && (
          <div className="space-y-2">
            <Label htmlFor="senha" className="text-sm font-semibold text-gray-900">
              Senha *
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="senha"
                type="password"
                {...register("senha")}
                placeholder="Mínimo 6 caracteres"
                className="pl-10"
                disabled={loading}
              />
            </div>
            {errors.senha && (
              <p className="text-sm text-red-600">{errors.senha.message}</p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="tipo" className="text-sm font-semibold text-gray-900">
            Tipo de Usuário *
          </Label>
          <Select
            onValueChange={(value) => setValue("tipo", value as "admin" | "recepcionista")}
            defaultValue={usuario?.tipo === 'admin' || usuario?.tipo === 'administrador' ? 'admin' : 'recepcionista'}
            disabled={loading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Administrador
                </div>
              </SelectItem>
              <SelectItem value="recepcionista">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Recepcionista
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          {errors.tipo && (
            <p className="text-sm text-red-600">{errors.tipo.message}</p>
          )}
        </div>

        {funcoes.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="funcao_id" className="text-sm font-semibold text-gray-900">
              Função
            </Label>
                 <Select
                   onValueChange={(value) => setValue("funcao_id", value === "none" ? "" : value)}
                   defaultValue={usuario?.funcao_id || "none"}
                   disabled={loading}
                 >
                   <SelectTrigger className="w-full">
                     <SelectValue placeholder="Selecione uma função (opcional)" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="none">Sem função</SelectItem>
                     {funcoes.map((funcao) => (
                       <SelectItem key={funcao.id} value={funcao.id}>
                         {funcao.nome}
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 pt-4 border-t">
        <Button
          type="submit"
          disabled={loading}
          className="bg-[#8B2E3D] hover:bg-[#7A1F2E] text-white"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              {isEdit ? "Atualizar Usuário" : "Criar Usuário"}
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}

