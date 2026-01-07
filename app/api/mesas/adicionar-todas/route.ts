import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth/user"

/**
 * API Route para adicionar TODAS as mesas do restaurante
 * Apenas admin pode usar
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores podem adicionar mesas." },
        { status: 403 }
      )
    }

    const supabase = await createClient()

    // Todas as mesas conforme as regras fornecidas
    const todasMesas = [
      // SALÃO EXTERNO, COBERTO (Primeiro Andar)
      { codigo: '1', capacidade: 4, tipo: 'redonda', andar: 'primeiro', ambiente: 'Salão Externo Coberto', pode_juntar: false, eventos_pessoais: true, eventos_corporativos: false, so_eventos: false },
      { codigo: '2', capacidade: 4, tipo: 'redonda', andar: 'primeiro', ambiente: 'Salão Externo Coberto', pode_juntar: false, eventos_pessoais: true, eventos_corporativos: false, so_eventos: false },
      { codigo: '3', capacidade: 3, tipo: 'redonda', andar: 'primeiro', ambiente: 'Salão Externo Coberto', pode_juntar: false, eventos_pessoais: true, eventos_corporativos: false, so_eventos: false },
      { codigo: '4', capacidade: 4, tipo: 'redonda', andar: 'primeiro', ambiente: 'Salão Externo Coberto', pode_juntar: false, eventos_pessoais: true, eventos_corporativos: false, so_eventos: false },
      { codigo: '5', capacidade: 4, tipo: 'redonda', andar: 'primeiro', ambiente: 'Salão Externo Coberto', pode_juntar: false, eventos_pessoais: true, eventos_corporativos: false, so_eventos: false },
      { codigo: '6', capacidade: 4, tipo: 'redonda', andar: 'primeiro', ambiente: 'Salão Externo Coberto', pode_juntar: false, eventos_pessoais: true, eventos_corporativos: false, so_eventos: false },
      
      // SALÃO INTERNO — CRISTAL
      { codigo: '7', capacidade: 6, tipo: 'retangular', andar: 'primeiro', ambiente: 'Cristal', pode_juntar: false, eventos_pessoais: true, eventos_corporativos: true, so_eventos: false, tem_tv: true },
      { codigo: '8', capacidade: 4, tipo: 'retangular', andar: 'primeiro', ambiente: 'Cristal', pode_juntar: true, junta_com: '11,9,10', eventos_pessoais: true, eventos_corporativos: true, so_eventos: false },
      { codigo: '9', capacidade: 4, tipo: 'retangular', andar: 'primeiro', ambiente: 'Cristal', pode_juntar: true, junta_com: '10,8,11', eventos_pessoais: true, eventos_corporativos: true, so_eventos: false },
      { codigo: '10', capacidade: 5, tipo: 'retangular', andar: 'primeiro', ambiente: 'Cristal', pode_juntar: true, junta_com: '11,9,8', eventos_pessoais: true, eventos_corporativos: true, so_eventos: false },
      { codigo: '11', capacidade: 5, tipo: 'retangular', andar: 'primeiro', ambiente: 'Cristal', pode_juntar: true, junta_com: '10,8,9', eventos_pessoais: true, eventos_corporativos: true, so_eventos: false },
      
      // SALÃO INTERNO — BANDEIRA
      { codigo: '12', capacidade: 4, tipo: 'retangular', andar: 'primeiro', ambiente: 'Bandeira', pode_juntar: true, junta_com: '13,14', eventos_pessoais: true, eventos_corporativos: true, so_eventos: false, tem_tv: true },
      { codigo: '13', capacidade: 2, tipo: 'retangular', andar: 'primeiro', ambiente: 'Bandeira', pode_juntar: true, junta_com: '12,14', eventos_pessoais: true, eventos_corporativos: true, so_eventos: false, tem_tv: true },
      { codigo: '14', capacidade: 2, tipo: 'retangular', andar: 'primeiro', ambiente: 'Bandeira', pode_juntar: true, junta_com: '12,13', eventos_pessoais: true, eventos_corporativos: true, so_eventos: false, tem_tv: true },
      
      // SEGUNDO ANDAR, EXTERNO COBERTO
      { codigo: '21', capacidade: 7, tipo: 'retangular', andar: 'segundo', ambiente: 'Segundo Andar Externo Coberto', pode_juntar: false, eventos_pessoais: true, eventos_corporativos: false, so_eventos: false },
      { codigo: '22', capacidade: 3, tipo: 'retangular', andar: 'segundo', ambiente: 'Segundo Andar Externo Coberto', pode_juntar: false, eventos_pessoais: true, eventos_corporativos: false, so_eventos: false },
      { codigo: '23', capacidade: 2, tipo: 'retangular', andar: 'segundo', ambiente: 'Segundo Andar Externo Coberto', pode_juntar: false, eventos_pessoais: true, eventos_corporativos: false, so_eventos: false },
      { codigo: '24', capacidade: 2, tipo: 'retangular', andar: 'segundo', ambiente: 'Segundo Andar Externo Coberto', pode_juntar: false, eventos_pessoais: true, eventos_corporativos: false, so_eventos: false },
      
      // SALA "CINEMA"
      { codigo: '25', capacidade: 4, tipo: 'retangular', andar: 'segundo', ambiente: 'Cinema', pode_juntar: true, junta_com: '26', eventos_pessoais: true, eventos_corporativos: false, so_eventos: false },
      { codigo: '26', capacidade: 4, tipo: 'retangular', andar: 'segundo', ambiente: 'Cinema', pode_juntar: true, junta_com: '25', eventos_pessoais: true, eventos_corporativos: false, so_eventos: false },
      
      // SALA "OPERA"
      { codigo: '27', capacidade: 2, tipo: 'retangular', andar: 'segundo', ambiente: 'Opera', pode_juntar: true, junta_com: '28,29,34', eventos_pessoais: true, eventos_corporativos: true, so_eventos: false },
      { codigo: '28', capacidade: 2, tipo: 'retangular', andar: 'segundo', ambiente: 'Opera', pode_juntar: true, junta_com: '27,29,34', eventos_pessoais: true, eventos_corporativos: true, so_eventos: false },
      { codigo: '29', capacidade: 2, tipo: 'retangular', andar: 'segundo', ambiente: 'Opera', pode_juntar: true, junta_com: '27,28,34', eventos_pessoais: true, eventos_corporativos: true, so_eventos: false },
      { codigo: '30', capacidade: 2, tipo: 'retangular', andar: 'segundo', ambiente: 'Opera', pode_juntar: true, junta_com: '33', eventos_pessoais: true, eventos_corporativos: true, so_eventos: false },
      { codigo: '31', capacidade: 4, tipo: 'retangular', andar: 'segundo', ambiente: 'Opera', pode_juntar: false, eventos_pessoais: true, eventos_corporativos: true, so_eventos: false },
      { codigo: '32', capacidade: 4, tipo: 'retangular', andar: 'segundo', ambiente: 'Opera', pode_juntar: false, eventos_pessoais: true, eventos_corporativos: true, so_eventos: false },
      { codigo: '33', capacidade: 2, tipo: 'retangular', andar: 'segundo', ambiente: 'Opera', pode_juntar: true, junta_com: '30', eventos_pessoais: true, eventos_corporativos: true, so_eventos: false },
      { codigo: '34', capacidade: 2, tipo: 'retangular', andar: 'segundo', ambiente: 'Opera', pode_juntar: true, junta_com: '27,28,29', eventos_pessoais: true, eventos_corporativos: true, so_eventos: false },
      
      // SALA PALIO DI SIENA
      { codigo: '35', capacidade: 2, tipo: 'retangular', andar: 'segundo', ambiente: 'Palio di Siena', pode_juntar: true, junta_com: '36,37,38', eventos_pessoais: true, eventos_corporativos: true, so_eventos: false },
      { codigo: '36', capacidade: 2, tipo: 'retangular', andar: 'segundo', ambiente: 'Palio di Siena', pode_juntar: true, junta_com: '35,37,38', eventos_pessoais: true, eventos_corporativos: true, so_eventos: false },
      { codigo: '37', capacidade: 2, tipo: 'retangular', andar: 'segundo', ambiente: 'Palio di Siena', pode_juntar: true, junta_com: '38,35,36', eventos_pessoais: true, eventos_corporativos: true, so_eventos: false },
      { codigo: '38', capacidade: 2, tipo: 'retangular', andar: 'segundo', ambiente: 'Palio di Siena', pode_juntar: true, junta_com: '37,35,36', eventos_pessoais: true, eventos_corporativos: true, so_eventos: false },
      
      // TERRAÇO (Só eventos)
      ...Array.from({ length: 22 }, (_, i) => ({
        codigo: String(61 + i),
        capacidade: 4,
        tipo: 'retangular',
        andar: 'segundo',
        ambiente: 'Terraço',
        pode_juntar: false,
        eventos_pessoais: false,
        eventos_corporativos: false,
        so_eventos: true,
      })),
      
      // EMPORIO (Só eventos)
      ...Array.from({ length: 12 }, (_, i) => ({
        codigo: String(41 + i),
        capacidade: 4,
        tipo: 'retangular',
        andar: 'primeiro',
        ambiente: 'Empório',
        pode_juntar: true,
        eventos_pessoais: false,
        eventos_corporativos: true,
        so_eventos: true,
        tem_tv: true,
        observacao: 'Capacidade variável conforme evento. Aluguel de mídia à parte.',
      })),
    ]

    // Preparar dados para inserção com tipos garantidos
    const mesasParaInserir = todasMesas.map(mesa => ({
      codigo: String(mesa.codigo),
      capacidade: typeof mesa.capacidade === 'number' ? mesa.capacidade : parseInt(String(mesa.capacidade), 10),
      tipo: String(mesa.tipo),
      andar: String(mesa.andar),
      ambiente: String(mesa.ambiente),
      disponivel: true,
      pode_juntar: Boolean(mesa.pode_juntar || false),
      junta_com: (mesa as any).junta_com ? String((mesa as any).junta_com) : null,
      eventos_pessoais: Boolean(mesa.eventos_pessoais || false),
      eventos_corporativos: Boolean(mesa.eventos_corporativos || false),
      so_eventos: Boolean(mesa.so_eventos || false),
      tem_tv: Boolean((mesa as any).tem_tv || false),
      privativa: false,
      observacao: (mesa as any).observacao ? String((mesa as any).observacao) : null,
      posicao_x: null,
      posicao_y: null,
    }))

    // Inserir mesas (ignorar duplicatas)
    const { data, error } = await supabase
      .from('mesas')
      .upsert(mesasParaInserir, { 
        onConflict: 'codigo',
        ignoreDuplicates: false 
      })
      .select()

    if (error) {
      console.error("Erro ao inserir mesas:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      // Se for erro de duplicata em algumas, continuar
      if (error.code !== '23505') {
        throw error
      }
    }

    return NextResponse.json({
      message: `${mesasParaInserir.length} mesas processadas. Mesas novas adicionadas, existentes atualizadas.`,
      mesas: data || [],
      total: mesasParaInserir.length
    })
  } catch (error: any) {
    console.error("Erro ao adicionar mesas:", error)
    return NextResponse.json(
      { error: error.message || "Erro ao adicionar mesas" },
      { status: 500 }
    )
  }
}

