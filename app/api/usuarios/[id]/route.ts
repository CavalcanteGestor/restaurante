import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth/user"
import { logAuditoria } from "@/lib/db/auditoria"

/**
 * GET - Buscar usuário por ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: "Acesso negado" },
        { status: 403 }
      )
    }

    const { id } = await params
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('usuarios')
      .select(`
        *,
        funcoes (
          id,
          nome,
          tipo
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao buscar usuário" },
      { status: 500 }
    )
  }
}

/**
 * PUT - Atualizar usuário
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores podem editar usuários." },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { nome, telefone, tipo, funcao_id, status, senha } = body

    const supabase = await createClient()

    // Atualizar senha se fornecida
    if (senha && senha.length >= 6) {
      const supabaseAdminUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

      if (supabaseServiceKey) {
        try {
          await fetch(`${supabaseAdminUrl}/auth/v1/admin/users/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'apikey': supabaseServiceKey,
            },
            body: JSON.stringify({
              password: senha,
            }),
          })
        } catch (passwordError) {
          console.error("Erro ao atualizar senha:", passwordError)
        }
      }
    }

    // Atualizar dados na tabela usuarios com tipos garantidos
    const updateData: any = {}
    if (nome !== undefined) updateData.nome = String(nome || '')
    if (telefone !== undefined) updateData.telefone = telefone ? String(telefone) : null
    if (tipo !== undefined) updateData.tipo = tipo === 'admin' ? 'admin' : 'recepcionista'
    if (funcao_id !== undefined) updateData.funcao_id = funcao_id ? String(funcao_id) : null
    if (status !== undefined) updateData.status = Boolean(status)

    const { data, error } = await supabase
      .from('usuarios')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // Registrar auditoria
    await logAuditoria(
      'UPDATE',
      'USUARIOS',
      `Usuário ${id} atualizado`,
      id,
      updateData,
      request
    )

    return NextResponse.json({
      message: "Usuário atualizado com sucesso",
      usuario: data,
    })
  } catch (error: any) {
    console.error("Erro ao atualizar usuário:", error)
    return NextResponse.json(
      { error: error.message || "Erro ao atualizar usuário" },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Deletar usuário
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores podem deletar usuários." },
        { status: 403 }
      )
    }

    const { id } = await params

    // Não permitir deletar a si mesmo
    if (id === user.id) {
      return NextResponse.json(
        { error: "Você não pode deletar seu próprio usuário" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Buscar dados do usuário antes de deletar para auditoria
    const { data: usuarioAntes } = await supabase
      .from('usuarios')
      .select('nome, email')
      .eq('id', id)
      .single()

    // Registrar auditoria antes de deletar
    await logAuditoria(
      'DELETE',
      'USUARIOS',
      `Usuário deletado: ${usuarioAntes?.nome || 'N/A'} (${usuarioAntes?.email || 'N/A'})`,
      id,
      usuarioAntes || undefined,
      request
    )

    // Deletar da tabela usuarios primeiro
    const { error: usuarioError } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', id)

    if (usuarioError) throw usuarioError

    // Deletar do Supabase Auth
    const supabaseAdminUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (supabaseServiceKey) {
      try {
        await fetch(`${supabaseAdminUrl}/auth/v1/admin/users/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'apikey': supabaseServiceKey,
          },
        })
      } catch (authError) {
        console.error("Erro ao deletar do auth (pode já ter sido deletado):", authError)
      }
    }

    return NextResponse.json({
      message: "Usuário deletado com sucesso",
    })
  } catch (error: any) {
    console.error("Erro ao deletar usuário:", error)
    return NextResponse.json(
      { error: error.message || "Erro ao deletar usuário" },
      { status: 500 }
    )
  }
}

