import { LucideIcon } from "lucide-react"
import { ReactNode } from "react"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center max-w-md p-8">
        <div className="h-24 w-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#8B2E3D]/10 to-[#7A1F2E]/10 flex items-center justify-center">
          <Icon className="h-12 w-12 text-[#8B2E3D]/60" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{description}</p>
        {action && <div>{action}</div>}
      </div>
    </div>
  )
}

