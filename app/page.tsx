"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AlertTriangle, CheckCircle2, Info, RefreshCw } from "lucide-react"
import KpiCard from "@/components/kpi-card"
import ServiceTable from "@/components/service-table"
import { useKpis } from "@/lib/hooks"

const queryClient = new QueryClient()

function E2EPaymentMonitor() {
  const { data: kpiData, isLoading: kpisLoading } = useKpis()

  return (
    <div className="min-h-screen bg-gray-50/50">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center">
          <h1 className="font-semibold text-lg md:text-2xl">E2E Payment Monitor</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <KpiCard
            title="Recent Issues"
            value={kpiData?.recentIssues.value}
            change={kpiData?.recentIssues.change}
            icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />}
            isLoading={kpisLoading}
          />
          <KpiCard
            title="Pending Issues"
            value={kpiData?.pendingIssues.value}
            change={kpiData?.pendingIssues.change}
            icon={<Info className="h-4 w-4 text-muted-foreground" />}
            isLoading={kpisLoading}
          />
          <KpiCard
            title="Running Services"
            value={kpiData?.runningServices.value}
            change={kpiData?.runningServices.change}
            icon={<CheckCircle2 className="h-4 w-4 text-muted-foreground" />}
            isLoading={kpisLoading}
          />
          <KpiCard
            title="Interruptions"
            value={kpiData?.interruptions.value}
            change={kpiData?.interruptions.change}
            icon={<RefreshCw className="h-4 w-4 text-muted-foreground" />}
            isLoading={kpisLoading}
          />
        </div>
        <div>
          <ServiceTable />
        </div>
      </main>
    </div>
  )
}

export default function Page() {
  return (
    <QueryClientProvider client={queryClient}>
      <E2EPaymentMonitor />
    </QueryClientProvider>
  )
}
