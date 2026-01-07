import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth/user"

export default async function HomePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  // Redirecionar baseado no role
  if (user.role === 'admin') {
    redirect("/admin")
  } else {
    redirect("/recepcionista")
  }
}

