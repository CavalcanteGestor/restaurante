import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth/user"

/**
 * POST - Criar novo usuário
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores podem criar usuários." },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { nome, email, telefone, senha, tipo, funcao_id, status } = body

    if (!nome || !email || !senha || !tipo) {
      return NextResponse.json(
        { error: "Nome, email, senha e tipo são obrigatórios" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Para criar usuário, precisamos usar o service role key
    // Vamos usar uma abordagem diferente: criar via API do Supabase
    const supabaseAdminUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseServiceKey) {
      return NextResponse.json(
        { error: "Service role key não configurada. Configure SUPABASE_SERVICE_ROLE_KEY no .env.local" },
        { status: 500 }
      )
    }

    // Criar usuário usando fetch direto para a API do Supabase
    const createUserResponse = await fetch(`${supabaseAdminUrl}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
      },
      body: JSON.stringify({
        email,
        password: senha,
        email_confirm: true,
      }),
    })

    const authData = await createUserResponse.json()

    if (!createUserResponse.ok) {
      if (authData.message?.includes('already registered') || authData.error?.includes('already')) {
        return NextResponse.json(
          { error: "Este email já está cadastrado" },
          { status: 400 }
        )
      }
      throw new Error(authData.error || authData.message || "Erro ao criar usuário no sistema de autenticação")
    }

    if (!authData.user || !authData.user.id) {
      throw new Error("Erro ao criar usuário no sistema de autenticação")
    }

    // Criar registro na tabela usuarios
    const { data: usuarioData, error: usuarioError } = await supabase
      .from('usuarios')
      .insert({
        id: authData.user.id,
        nome,
        email,
        telefone: telefone || null,
        tipo: tipo === 'admin' ? 'admin' : 'recepcionista',
        funcao_id: funcao_id || null,
        status: status !== false,
      })
      .select()
      .single()

    if (usuarioError) {
      // Se der erro ao criar na tabela usuarios, tentar deletar o usuário do auth
      try {
        await fetch(`${supabaseAdminUrl}/auth/v1/admin/users/${authData.user.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'apikey': supabaseServiceKey,
          },
        })
      } catch (deleteError) {
        console.error("Erro ao deletar usuário do auth:", deleteError)
      }
      throw usuarioError
    }

    return NextResponse.json({
      message: "Usuário criado com sucesso",
      usuario: usuarioData,
    }, { status: 201 })
  } catch (error: any) {
    console.error("Erro ao criar usuário:", error)
    return NextResponse.json(
      { error: error.message || "Erro ao criar usuário" },
      { status: 500 }
    )
  }
}

