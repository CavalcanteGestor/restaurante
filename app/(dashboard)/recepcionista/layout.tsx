import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth/user"
import Sidebar from "@/components/layout/Sidebar"
import Header from "@/components/layout/Header"

export default async function RecepcionistaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F0E8] via-white to-[#F5F0E8]">
      <div className="flex">
        <Sidebar userRole="recepcionista" />
        <div className="flex-1 flex flex-col">
          <Header user={user} />
          <main className="flex-1 p-6 md:p-8">{children}</main>
        </div>
      </div>
    </div>
  )
}

