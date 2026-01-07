"use client"

import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { LogOut, User, Bell } from "lucide-react"
import { UserWithRole } from "@/lib/auth/user"
import { Badge } from "@/components/ui/badge"
import GlobalSearch from "./GlobalSearch"
import ThemeToggle from "./ThemeToggle"
import MobileMenu from "./MobileMenu"

interface HeaderProps {
  user?: UserWithRole | null
}

export default function Header({ user }: HeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <header className="bg-white/95 backdrop-blur-md border-b-2 border-[#8B2E3D]/20 sticky top-0 z-50 shadow-rustic bg-rustic-texture">
      <div className="px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center justify-between gap-2">
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <MobileMenu userRole={user?.role} />
          </div>

          {/* Global Search - Desktop */}
          <div className="flex-1 max-w-md hidden md:block">
            <GlobalSearch />
          </div>

          {/* Global Search - Mobile */}
          <div className="md:hidden">
            <GlobalSearch mobile />
          </div>

          {/* Mobile: Logo/Title */}
          <div className="md:hidden flex-1 text-center">
            <p className="text-sm font-semibold text-[#8B2E3D] font-serif italic truncate">
              {user?.role === 'admin' ? 'Admin' : 'Recep'}
            </p>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1 md:gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="relative hover:bg-[#8B2E3D]/10 rounded-xl border-2 border-transparent hover:border-[#8B2E3D]/20">
              <Bell className="h-4 w-4 md:h-5 md:w-5 text-[#8B2E3D]/70" />
              <span className="absolute top-1 right-1 h-2 w-2 md:h-2.5 md:w-2.5 bg-[#8B2E3D] rounded-full border-2 border-white shadow-rustic" />
            </Button>
            
            {user && (
              <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-br from-white to-[#F5F0E8]/50 border-2 border-[#8B2E3D]/20 shadow-rustic">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#8B2E3D] to-[#7A1F2E] flex items-center justify-center shadow-rustic border-2 border-white">
                  <User className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-[#8B2E3D] truncate max-w-[120px]">{user.nome}</span>
                  <Badge 
                    variant="outline" 
                    className={`text-[10px] font-semibold px-1.5 py-0 ${
                      user.role === 'admin' 
                        ? 'border-[#8B2E3D] text-[#8B2E3D] bg-[#8B2E3D]/10' 
                        : 'border-[#8B2E3D]/40 text-[#8B2E3D]/70 bg-[#F5F0E8]'
                    }`}
                  >
                    {user.role === 'admin' ? 'Admin' : 'Recep'}
                  </Badge>
                </div>
              </div>
            )}
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="gap-1.5 text-[#8B2E3D]/70 hover:text-[#8B2E3D] hover:bg-[#8B2E3D]/10 rounded-xl border-2 border-transparent hover:border-[#8B2E3D]/20 font-semibold text-xs px-2 md:px-3"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Sair</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
