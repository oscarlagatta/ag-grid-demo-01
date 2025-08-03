import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"
import { BarChart3 } from "lucide-react"


interface KpiCardProps {
  title: string
  value?: number
  change?: string
  icon: ReactNode
  isLoading: boolean
}

export default function KpiCard({ title, value, change, icon, isLoading }: KpiCardProps) {
  const isPositive = change && Number.parseFloat(change) > 0
  const isNegative = change && Number.parseFloat(change) < 0

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-24 mb-2" />
          <Skeleton className="h-4 w-32" />
        </CardContent>
      </Card>
    )
  }

  return (
      <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{title}</CardTitle>
              <div className="relative">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shadow-lg shadow-green-200/50">
                      <BarChart3 className="h-4 w-4 text-green-600" />
                  </div>
              </div>
          </CardHeader>
          <CardContent>
              <div className="text-2xl font-bold">{value}</div>
              <p
                  className={cn("text-xs text-muted-foreground", isPositive && "text-green-600", isNegative && "text-red-600")}
              >
                  {change}% vs last period
              </p>
          </CardContent>
      </Card>

  )
}
