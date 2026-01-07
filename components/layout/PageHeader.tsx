import { LucideIcon } from "lucide-react"
import { ReactNode } from "react"

interface PageHeaderProps {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
}

export default function PageHeader({ icon: Icon, title, description, action }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#8B2E3D] to-[#7A1F2E] flex items-center justify-center shadow-lg">
            <Icon className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold bg-gradient-to-r from-[#8B2E3D] to-[#7A1F2E] bg-clip-text text-transparent">
              {title}
            </h1>
            <p className="text-gray-600 mt-1">{description}</p>
          </div>
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  )
}

