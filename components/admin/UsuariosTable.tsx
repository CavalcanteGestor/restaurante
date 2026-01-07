"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Database } from "@/types/database"
import { Edit, Trash2, UserCheck, UserX, Shield, User } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type Usuario = Database['public']['Tables']['usuarios']['Row']
type Funcao = {
  id: string
  nome: string
}

interface UsuarioComFuncao extends Usuario {
  funcao_nome?: string
  funcao_tipo?: string | null
}

interface UsuariosTableProps {
  usuarios: UsuarioComFuncao[]
  funcoes: Funcao[]
}

export default function UsuariosTable({ usuarios, funcoes }: UsuariosTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const response = await fetch(`/api/usuarios/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Erro ao deletar usuário")
      }

      window.location.reload()
    } catch (error) {
      console.error("Erro ao deletar:", error)
      alert("Erro ao deletar usuário")
    } finally {
      setDeletingId(null)
    }
  }

  const getRoleBadge = (usuario: UsuarioComFuncao) => {
    const isAdmin = usuario.tipo === 'admin' || usuario.tipo === 'administrador' || usuario.funcao_tipo === 'admin'
    
    if (isAdmin) {
      return (
        <Badge className="bg-purple-600 text-white gap-1">
          <Shield className="h-3 w-3" />
          Admin
        </Badge>
      )
    }
    return (
      <Badge className="bg-blue-600 text-white gap-1">
        <User className="h-3 w-3" />
        Recepcionista
      </Badge>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border shadow-sm">
      <table className="w-full caption-bottom text-sm">
        <thead className="[&_tr]:border-b bg-gray-50">
          <tr className="border-b transition-colors hover:bg-muted/50">
            <th className="h-12 px-4 text-left align-middle font-medium text-gray-700">Nome</th>
            <th className="h-12 px-4 text-left align-middle font-medium text-gray-700">Email</th>
            <th className="h-12 px-4 text-left align-middle font-medium text-gray-700">Telefone</th>
            <th className="h-12 px-4 text-left align-middle font-medium text-gray-700">Função</th>
            <th className="h-12 px-4 text-left align-middle font-medium text-gray-700">Tipo</th>
            <th className="h-12 px-4 text-left align-middle font-medium text-gray-700">Status</th>
            <th className="h-12 px-4 text-left align-middle font-medium text-gray-700">Ações</th>
          </tr>
        </thead>
        <tbody className="[&_tr:last-child]:border-0">
          {usuarios.length === 0 ? (
            <tr>
              <td colSpan={7} className="p-8 text-center text-gray-700">
                Nenhum usuário encontrado
              </td>
            </tr>
          ) : (
            usuarios.map((usuario) => (
              <tr key={usuario.id} className="border-b transition-colors hover:bg-gray-50">
                <td className="p-4 align-middle font-medium">{usuario.nome}</td>
                <td className="p-4 align-middle text-gray-700">{usuario.email}</td>
                <td className="p-4 align-middle text-gray-700">{usuario.telefone || "-"}</td>
                <td className="p-4 align-middle">
                  <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300">
                    {usuario.funcao_nome || "Sem função"}
                  </Badge>
                </td>
                <td className="p-4 align-middle">
                  {getRoleBadge(usuario)}
                </td>
                <td className="p-4 align-middle">
                  {usuario.status ? (
                    <Badge className="bg-green-600 text-white gap-1">
                      <UserCheck className="h-3 w-3" />
                      Ativo
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-600 text-white gap-1">
                      <UserX className="h-3 w-3" />
                      Inativo
                    </Badge>
                  )}
                </td>
                <td className="p-4 align-middle">
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/usuarios/${usuario.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-600 hover:bg-gray-100">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-red-600 hover:bg-red-50"
                          disabled={deletingId === usuario.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir o usuário <strong>{usuario.nome}</strong>?
                            Esta ação não pode ser desfeita. O usuário não poderá mais fazer login no sistema.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(usuario.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

