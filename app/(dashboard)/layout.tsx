import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Sidebar from "@/components/layout/Sidebar"
import Header from "@/components/layout/Header"
import RealtimeAlerts from "@/components/layout/RealtimeAlerts"
import { getCurrentUser } from "@/lib/auth/user"
import { Toaster } from "@/components/ui/toaster"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-rustic-texture bg-paper-texture" style={{ background: 'linear-gradient(135deg, hsl(38 25% 95%) 0%, hsl(38 20% 97%) 50%, hsl(38 25% 95%) 100%)' }}>
      <div className="flex">
        <Sidebar userRole={user.role} />
        <div className="flex-1 flex flex-col min-w-0">
          <Header user={user} />
          <main className="flex-1 overflow-auto bg-transparent">{children}</main>
        </div>
      </div>
      
      {/* Alertas em tempo real */}
      <RealtimeAlerts />
      
      {/* Toast notifications */}
      <Toaster />
    </div>
  )
}
