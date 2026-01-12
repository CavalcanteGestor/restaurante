import { createClient } from "@/lib/supabase/server"
import { Database } from "@/types/database"

type Notification = Database['public']['Tables']['notifications']['Row']
type NotificationInsert = Database['public']['Tables']['notifications']['Insert']
type NotificationUpdate = Database['public']['Tables']['notifications']['Update']

export interface NotificationFilters {
  user_id?: string
  read?: boolean
  type?: 'info' | 'success' | 'warning' | 'error'
  limit?: number
}

/**
 * Busca notificações do usuário
 */
export async function getNotifications(filters?: NotificationFilters): Promise<Notification[]> {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (filters?.read !== undefined) {
    query = query.eq('read', filters.read)
  }

  if (filters?.type) {
    query = query.eq('type', filters.type)
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  } else {
    query = query.limit(50)
  }

  const { data, error } = await query

  if (error) {
    console.error("Erro ao buscar notificações:", error)
    return []
  }

  return (data || []) as Notification[]
}

/**
 * Conta notificações não lidas do usuário
 */
export async function getUnreadNotificationsCount(): Promise<number> {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return 0

  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('read', false)

  if (error) {
    console.error("Erro ao contar notificações não lidas:", error)
    return 0
  }

  return count || 0
}

/**
 * Cria uma nova notificação
 */
export async function createNotification(notification: NotificationInsert): Promise<Notification> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      ...notification,
      created_at: notification.created_at || new Date().toISOString(),
      updated_at: notification.updated_at || new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data as Notification
}

/**
 * Marca notificação como lida
 */
export async function markNotificationAsRead(id: string): Promise<Notification> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('notifications')
    .update({
      read: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Notification
}

/**
 * Marca todas as notificações do usuário como lidas
 */
export async function markAllNotificationsAsRead(): Promise<void> {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  await supabase
    .from('notifications')
    .update({
      read: true,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)
    .eq('read', false)
}

/**
 * Deleta uma notificação
 */
export async function deleteNotification(id: string): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', id)

  if (error) throw error
}

/**
 * Cria notificação para todos os administradores
 */
export async function notifyAllAdmins(
  title: string,
  message: string,
  type: 'info' | 'success' | 'warning' | 'error' = 'info',
  action_url?: string
): Promise<void> {
  const supabase = await createClient()
  
  // Buscar todos os usuários admin
  const { data: admins } = await supabase
    .from('usuarios')
    .select('id')
    .or('tipo.eq.admin,tipo.eq.administrador')

  if (!admins || admins.length === 0) return

  // Criar notificação para cada admin
  const notifications: NotificationInsert[] = admins.map((admin) => ({
    user_id: admin.id,
    title,
    message,
    type,
    read: false,
    action_url: action_url || null,
  }))

  await supabase.from('notifications').insert(notifications)
}
