import { useQuery } from "@tanstack/react-query"
import type { KPIStats, ServiceStatus, ServiceCharts } from "./types"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useKpis() {
  return useQuery<KPIStats>({
    queryKey: ["kpis"],
    queryFn: () => fetcher("/api/monitor/kpis"),
  })
}

export function useServices() {
  return useQuery<ServiceStatus[]>({
    queryKey: ["services"],
    queryFn: () => fetcher("/api/monitor/services"),
  })
}

export function useServiceCharts(serviceId: string) {
  return useQuery<ServiceCharts>({
    queryKey: ["service-charts", serviceId],
    queryFn: () => fetcher(`/api/monitor/charts/${serviceId}`),
    enabled: !!serviceId,
  })
}
