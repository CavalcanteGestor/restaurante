"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { cn } from "@/lib/utils/cn"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  LayoutDashboard,
  Calendar,
  Users,
  MessageSquare,
  BarChart3,
  Settings,
  Table,
  Phone,
  Shield,
  UserCircle,
  Menu,
  X,
} from "lucide-react"
import { UserRole } from "@/lib/auth/user"

interface MobileMenuProps {
  userRole?: UserRole
}

// Menu Admin
const adminNavigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Reservas", href: "/reservas", icon: Calendar },
  { name: "Mesas", href: "/mesas", icon: Table },
  { name: "Clientes", href: "/clientes", icon: UserCircle },
  { name: "Leads", href: "/leads", icon: Users },
  { name: "WhatsApp", href: "/whatsapp", icon: Phone },
  { name: "Relatórios", href: "/relatorios", icon: BarChart3 },
  { name: "Automatizações", href: "/automatizacoes", icon: Settings },
  { name: "Usuários", href: "/admin/usuarios", icon: Shield },
]

// Menu Recepcionista
const recepcionistaNavigation = [
  { name: "Dashboard", href: "/recepcionista", icon: LayoutDashboard },
  { name: "Reservas", href: "/recepcionista/reservas", icon: Calendar },
  { name: "Mesas", href: "/recepcionista/mesas", icon: Table },
  { name: "WhatsApp", href: "/recepcionista/whatsapp", icon: Phone },
]

export default function MobileMenu({ userRole = 'recepcionista' }: MobileMenuProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const navigation = userRole === 'admin' ? adminNavigation : recepcionistaNavigation

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden hover:bg-[#8B2E3D]/10 rounded-xl border-2 border-transparent hover:border-[#8B2E3D]/20"
        >
          <Menu className="h-6 w-6 text-[#8B2E3D]" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0 bg-gradient-to-b from-[#F5F0E8] via-white to-[#F5F0E8]/80">
        <SheetHeader className="p-6 border-b-2 border-[#8B2E3D]/20 bg-gradient-to-br from-white via-[#F5F0E8]/50 to-white">
          <div className="flex items-center justify-between">
            <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
            <div className="flex flex-col items-center gap-4 w-full">
              <div className="bg-white rounded-2xl p-4 shadow-rustic border-2 border-[#8B2E3D]/10 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#8B2E3D]/20 rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#8B2E3D]/20 rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#8B2E3D]/20 rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#8B2E3D]/20 rounded-br-lg"></div>
                <Image
                  src="/images/logo.jpg"
                  alt="Est! Est!! Est!!! Ristorante"
                  width={120}
                  height={80}
                  className="object-contain relative z-10"
                  style={{ width: "auto", height: "auto" }}
                  priority
                />
              </div>
              <p className="text-sm text-[#8B2E3D] font-semibold text-center font-serif italic">
                {userRole === 'admin' ? 'Painel Administrativo' : 'Área do Recepcionista'}
              </p>
            </div>
          </div>
        </SheetHeader>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && item.href !== "/recepcionista" && pathname.startsWith(item.href + "/"))
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "group flex items-center px-4 py-3.5 text-sm font-semibold rounded-xl transition-all duration-300 relative border-2",
                  isActive
                    ? "bg-gradient-to-r from-[#8B2E3D] via-[#7A1F2E] to-[#8B2E3D] text-white shadow-rustic-lg border-[#8B2E3D] transform scale-[1.02]"
                    : "text-[#8B2E3D]/80 hover:bg-[#F5F0E8]/80 hover:text-[#8B2E3D] border-transparent hover:border-[#8B2E3D]/30 hover:shadow-rustic"
                )}
              >
                <item.icon 
                  className={cn(
                    "mr-3 h-5 w-5 transition-all duration-300",
                    isActive ? "text-white" : "text-[#8B2E3D]/70 group-hover:text-[#8B2E3D]",
                    "group-hover:scale-110"
                  )} 
                />
                <span className="font-semibold tracking-wide">{item.name}</span>
                {isActive && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-white/90 shadow-lg" />
                )}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t-2 border-[#8B2E3D]/20 bg-gradient-to-t from-white/80 to-transparent">
          <div className="text-xs text-[#8B2E3D]/70 text-center">
            <p className="font-semibold italic">Sistema de Gestão</p>
            <p className="text-[10px] mt-1 font-serif">v1.0.0 - 2026</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

