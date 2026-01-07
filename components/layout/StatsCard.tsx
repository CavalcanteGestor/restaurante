import { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface StatsCardProps {
  icon: LucideIcon
  title: string
  value: string | number
  subtitle?: string
  trend?: {
    value: string
    positive: boolean
  }
  color?: "primary" | "success" | "warning" | "info"
}

export default function StatsCard({ 
  icon: Icon, 
  title, 
  value, 
  subtitle, 
  trend,
  color = "primary" 
}: StatsCardProps) {
  const colorClasses = {
    primary: "from-[#8B2E3D] to-[#7A1F2E]",
    success: "from-green-600 to-green-700",
    warning: "from-yellow-600 to-yellow-700",
    info: "from-blue-600 to-blue-700",
  }

  return (
    <Card className="border-2 border-gray-100 hover:border-[#8B2E3D]/30 transition-all duration-300 hover:shadow-xl">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center shadow-md`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          {trend && (
            <div className={`text-sm font-semibold ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.positive ? '↑' : '↓'} {trend.value}
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

