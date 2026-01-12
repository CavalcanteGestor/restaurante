import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import {
  getNotifications,
  getUnreadNotificationsCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "@/lib/db/notifications"

/**
 * GET - Busca notificações do usuário
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const read = searchParams.get('read')
    const type = searchParams.get('type') as 'info' | 'success' | 'warning' | 'error' | null
    const limit = searchParams.get('limit')

    const notifications = await getNotifications({
      read: read === 'true' ? true : read === 'false' ? false : undefined,
      type: type || undefined,
      limit: limit ? parseInt(limit) : undefined,
    })

    const unreadCount = await getUnreadNotificationsCount()

    return NextResponse.json({
      notifications,
      unreadCount,
    })
  } catch (error: any) {
    console.error("Erro ao buscar notificações:", error)
    return NextResponse.json(
      { error: error.message || "Erro ao buscar notificações" },
      { status: 500 }
    )
  }
}

/**
 * PATCH - Marca notificação como lida ou todas como lidas
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, markAll } = body

    if (markAll) {
      await markAllNotificationsAsRead()
      return NextResponse.json({ success: true })
    }

    if (!id) {
      return NextResponse.json(
        { error: "ID da notificação é obrigatório" },
        { status: 400 }
      )
    }

    const notification = await markNotificationAsRead(id)
    return NextResponse.json({ notification })
  } catch (error: any) {
    console.error("Erro ao atualizar notificação:", error)
    return NextResponse.json(
      { error: error.message || "Erro ao atualizar notificação" },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Deleta uma notificação
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: "ID da notificação é obrigatório" },
        { status: 400 }
      )
    }

    await deleteNotification(id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Erro ao deletar notificação:", error)
    return NextResponse.json(
      { error: error.message || "Erro ao deletar notificação" },
      { status: 500 }
    )
  }
}
