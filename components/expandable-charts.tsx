"use client"

import { useServiceCharts } from "@/lib/hooks"
import ChartBlock from "./chart-block"
import { Skeleton } from "./ui/skeleton"

export default function ExpandableCharts(props: any) {
  const serviceId = props.data.id
  const { data: chartData, isLoading } = useServiceCharts(serviceId)

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 gap-4 p-4 h-full bg-gray-50">
        <Skeleton className="h-full w-full" />
        <Skeleton className="h-full w-full" />
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 gap-4 p-4 h-full bg-gray-50">
      <ChartBlock
        title="Average Transaction Duration"
        description="The Average Time to complete a transaction in the last 7 Days is 10 seconds"
        data={chartData?.averageTransactionDuration || []}
        timeRanges={["Last 7 Days", "Last 14 Days", "Last 30 Days"]}
        yAxisLabel="Time in seconds"
        xAxisLabel="Days"
      />
      <ChartBlock
        title="Current Hourly Average Today"
        description="The Current Hourly Average to complete a transaction today is 3 seconds"
        data={chartData?.currentHourlyAverage || []}
        timeRanges={["Today", "Yesterday"]}
        yAxisLabel="Time in seconds"
        xAxisLabel="Time of the day"
      />
    </div>
  )
}
