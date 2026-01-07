import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth/user"
import Sidebar from "@/components/layout/Sidebar"
import Header from "@/components/layout/Header"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (user.role !== 'admin') {
    redirect("/recepcionista")
  }

  return (
    <>
      {children}
    </>
  )
}

