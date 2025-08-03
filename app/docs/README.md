Looking at your data, I can see the structure clearly. Let me explain what I read from the provided data and suggest how the API should return it for the charts:

## Data Structure Analysis

From your file data, I can see:
- **Date**: Day-Month format (01-Jan, 02-Jan, etc.)
- **Average Transaction Duration**: Time in HH:MM:SS format
- **Count of CTX_ID**: Number of transactions
- **Duration (seconds)**: The duration converted to seconds (this matches `avgSeconds` in your JSON)

## Suggested API Response Format

### For Daily Chart Data
```typescript
// GET /api/services/${serviceId}/daily-averages?timeRange=30d
interface DailyAverageResponse {
  service: string;
  timeRange: string;
  data: Array<{
    date: string;           // ISO date format: "2025-01-01"
    avgSeconds: number;     // Duration in seconds: 3845
    count: number;          // Transaction count: 21655
    avgFormatted: string;   // Human readable: "01:04:05"
  }>;
}
```


### For Hourly Chart Data
```typescript
// GET /api/services/${serviceId}/hourly-averages?date=2025-06-07
interface HourlyAverageResponse {
  service: string;
  date: string;
  data: Array<{
    timestamp: string;      // ISO timestamp: "2025-06-07T00:00:00Z"
    hour: number;          // Hour of day: 0-23
    avgSeconds: number;    // Duration in seconds: 1720
    count?: number;        // Optional transaction count for that hour
    avgFormatted: string;  // Human readable: "00:28:40"
  }>;
}
```


## Chart Integration

Based on your `ChartBlock` component, the data should be transformed to match the `ChartPoint` interface:

```typescript
// For daily chart
const dailyChartData: ChartPoint[] = dailyData.map(item => ({
  x: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), // "Jan 1"
  y: item.avgSeconds
}));

// For hourly chart  
const hourlyChartData: ChartPoint[] = hourlyData.map(item => ({
  x: `${item.hour}:00`, // "14:00"
  y: item.avgSeconds
}));
```


## Key Observations from Your Data

1. **Significant Outliers**: I notice some extreme values like "30:44:51" (May 18th) which is 110,691 seconds - this suggests either a system issue or a very long-running transaction that should be highlighted in the charts.

2. **Data Gaps**: Not every day has data (missing dates between entries), which the API should handle gracefully.

3. **Volume Correlation**: Higher transaction counts don't always correlate with higher average durations, which could be interesting to visualize.

4. **Seasonal Patterns**: The data spans several months, allowing for trend analysis.

The API should also support:
- **Time range filtering**: Last 7 days, 30 days, 90 days, etc.
- **Aggregation levels**: Daily, hourly, weekly
- **Outlier handling**: Option to exclude extreme values
- **Status metadata**: Include any service status information for correlation

Here's a suggested implementation for applying real data to your two charts:

## 1. Update API Route to Use Real Data

```typescript
import { NextResponse } from "next/server"
import type { ServiceCharts } from "@/lib/types"

// Mock data based on your actual data structure
const mockDailyData = [
  { date: "2025-01-01", avgSeconds: 3845, count: 21655, avgFormatted: "01:04:05" },
  { date: "2025-01-02", avgSeconds: 1753, count: 882, avgFormatted: "00:29:13" },
  { date: "2025-01-03", avgSeconds: 1992, count: 911, avgFormatted: "00:33:12" },
  { date: "2025-01-06", avgSeconds: 1652, count: 1265, avgFormatted: "00:27:32" },
  { date: "2025-01-07", avgSeconds: 3301, count: 841, avgFormatted: "00:55:01" },
  { date: "2025-01-09", avgSeconds: 742, count: 872, avgFormatted: "00:12:22" },
  { date: "2025-01-13", avgSeconds: 1759, count: 929, avgFormatted: "00:29:19" },
]

const mockHourlyData = [
  { timestamp: "2025-08-03T00:00:00Z", hour: 0, avgSeconds: 1720, avgFormatted: "00:28:40" },
  { timestamp: "2025-08-03T01:00:00Z", hour: 1, avgSeconds: 845, avgFormatted: "00:14:05" },
  { timestamp: "2025-08-03T02:00:00Z", hour: 2, avgSeconds: 1250, avgFormatted: "00:20:50" },
  { timestamp: "2025-08-03T03:00:00Z", hour: 3, avgSeconds: 980, avgFormatted: "00:16:20" },
  { timestamp: "2025-08-03T04:00:00Z", hour: 4, avgSeconds: 2100, avgFormatted: "00:35:00" },
  { timestamp: "2025-08-03T05:00:00Z", hour: 5, avgSeconds: 1500, avgFormatted: "00:25:00" },
  { timestamp: "2025-08-03T06:00:00Z", hour: 6, avgSeconds: 3200, avgFormatted: "00:53:20" },
  { timestamp: "2025-08-03T07:00:00Z", hour: 7, avgSeconds: 2800, avgFormatted: "00:46:40" },
  { timestamp: "2025-08-03T08:00:00Z", hour: 8, avgSeconds: 1900, avgFormatted: "00:31:40" },
  { timestamp: "2025-08-03T09:00:00Z", hour: 9, avgSeconds: 2400, avgFormatted: "00:40:00" },
  { timestamp: "2025-08-03T10:00:00Z", hour: 10, avgSeconds: 1600, avgFormatted: "00:26:40" },
  { timestamp: "2025-08-03T11:00:00Z", hour: 11, avgSeconds: 2200, avgFormatted: "00:36:40" },
  { timestamp: "2025-08-03T12:00:00Z", hour: 12, avgSeconds: 3100, avgFormatted: "00:51:40" },
  { timestamp: "2025-08-03T13:00:00Z", hour: 13, avgSeconds: 2700, avgFormatted: "00:45:00" },
  { timestamp: "2025-08-03T14:00:00Z", hour: 14, avgSeconds: 1800, avgFormatted: "00:30:00" },
  { timestamp: "2025-08-03T15:00:00Z", hour: 15, avgSeconds: 2300, avgFormatted: "00:38:20" },
  { timestamp: "2025-08-03T16:00:00Z", hour: 16, avgSeconds: 2900, avgFormatted: "00:48:20" },
  { timestamp: "2025-08-03T17:00:00Z", hour: 17, avgSeconds: 2500, avgFormatted: "00:41:40" },
  { timestamp: "2025-08-03T18:00:00Z", hour: 18, avgSeconds: 1700, avgFormatted: "00:28:20" },
  { timestamp: "2025-08-03T19:00:00Z", hour: 19, avgSeconds: 2000, avgFormatted: "00:33:20" },
  { timestamp: "2025-08-03T20:00:00Z", hour: 20, avgSeconds: 1400, avgFormatted: "00:23:20" },
  { timestamp: "2025-08-03T21:00:00Z", hour: 21, avgSeconds: 1100, avgFormatted: "00:18:20" },
  { timestamp: "2025-08-03T22:00:00Z", hour: 22, avgSeconds: 900, avgFormatted: "00:15:00" },
  { timestamp: "2025-08-03T23:00:00Z", hour: 23, avgSeconds: 750, avgFormatted: "00:12:30" },
]

function transformDailyData(data: typeof mockDailyData, timeRange: string) {
  const now = new Date()
  let filteredData = data
  
  switch (timeRange) {
    case "Last 7 Days":
      filteredData = data.slice(-7)
      break
    case "Last 14 Days":
      filteredData = data.slice(-14)
      break
    case "Last 30 Days":
      filteredData = data.slice(-30)
      break
  }

  return filteredData.map(item => ({
    x: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    y: item.avgSeconds,
    count: item.count,
    formatted: item.avgFormatted
  }))
}

function transformHourlyData(data: typeof mockHourlyData, timeRange: string) {
  // For demo purposes, return all 24 hours for "Today"
  // In real implementation, you'd filter based on actual date
  return data.map(item => ({
    x: `${String(item.hour).padStart(2, "0")}:00`,
    y: item.avgSeconds,
    formatted: item.avgFormatted
  }))
}

export async function GET(request: Request, { params }: { params: { serviceId: string } }) {
  const { serviceId } = params
  const { searchParams } = new URL(request.url)
  const dailyTimeRange = searchParams.get("dailyTimeRange") || "Last 7 Days"
  const hourlyTimeRange = searchParams.get("hourlyTimeRange") || "Today"

  if (!serviceId) {
    return new NextResponse("Service ID is required", { status: 400 })
  }

  // Transform data based on time ranges
  const avgTransactionDurationData = transformDailyData(mockDailyData, dailyTimeRange)
  const currentHourlyAverageData = transformHourlyData(mockHourlyData, hourlyTimeRange)

  // Calculate dynamic descriptions
  const avgDaily = avgTransactionDurationData.reduce((sum, item) => sum + item.y, 0) / avgTransactionDurationData.length
  const avgHourly = currentHourlyAverageData.reduce((sum, item) => sum + item.y, 0) / currentHourlyAverageData.length

  const data: ServiceCharts & { descriptions: { daily: string; hourly: string } } = {
    averageTransactionDuration: avgTransactionDurationData,
    currentHourlyAverage: currentHourlyAverageData,
    descriptions: {
      daily: `The Average Time to complete a transaction in the ${dailyTimeRange.toLowerCase()} is ${Math.round(avgDaily)} seconds`,
      hourly: `The Current Hourly Average to complete a transaction ${hourlyTimeRange.toLowerCase()} is ${Math.round(avgHourly)} seconds`
    }
  }

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  return NextResponse.json(data)
}
```


## 2. Update Chart Block to Handle Time Range Changes

```
"use client"

import { useState, useEffect } from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ChartPoint } from "@/lib/types"
import { Info } from "lucide-react"

interface ChartBlockProps {
  title: string
  description: string
  data: ChartPoint[]
  timeRanges: string[]
  yAxisLabel: string
  xAxisLabel: string
  onTimeRangeChange?: (timeRange: string) => void
}

export default function ChartBlock({ 
  title, 
  description, 
  data, 
  timeRanges, 
  yAxisLabel, 
  xAxisLabel,
  onTimeRangeChange 
}: ChartBlockProps) {
  const [timeRange, setTimeRange] = useState(timeRanges[0])

  const handleTimeRangeChange = (newTimeRange: string) => {
    setTimeRange(newTimeRange)
    onTimeRangeChange?.(newTimeRange)
  }

  const chartConfig = {
    duration: {
      label: "Duration (sec)",
      color: "hsl(217, 91%, 60%)",
    },
  }

  // Format Y-axis to show time format for better readability
  const formatYAxisTick = (value: number) => {
    if (value < 60) return `${value}s`
    if (value < 3600) return `${Math.floor(value / 60)}m`
    return `${Math.floor(value / 3600)}h ${Math.floor((value % 3600) / 60)}m`
  }

  // Custom tooltip to show formatted time
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value
      const hours = Math.floor(value / 3600)
      const minutes = Math.floor((value % 3600) / 60)
      const seconds = value % 60
      const formatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      
      return (
        <div className="bg-white p-2 border rounded shadow">
          <p className="font-medium">{label}</p>
          <p className="text-blue-600">
            Duration: {formatted} ({value}s)
          </p>
        </div>
      )
    }
    return null
  }

  return (
      <Card className="flex flex-col h-full">
        <CardHeader className="flex-row items-center justify-between pb-2">
          <div className="grid gap-1.5">
            <CardTitle>{title}</CardTitle>
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
          <Select value={timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              {timeRanges.map((range) => (
                  <SelectItem key={range} value={range}>
                    {range}
                  </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="flex-1 flex">
          <ChartContainer config={chartConfig} className="w-full h-[250px]">
            <LineChart
                accessibilityLayer
                data={data}
                margin={{
                  left: 12,
                  right: 12,
                  top: 5,
                  bottom: 20,
                }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                  dataKey="x"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  label={{ value: xAxisLabel, position: "insideBottom", offset: -15 }}
              />
              <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={formatYAxisTick}
                  label={{ value: yAxisLabel, angle: -90, position: "insideLeft" }}
              />
              <ChartTooltip cursor={false} content={<CustomTooltip />} />
              <Line dataKey="y" type="monotone" stroke="var(--color-duration)" strokeWidth={2} dot={false} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
  )
}
```


## 3. Update Expandable Charts to Handle Time Range Changes

```
"use client"

import { useState } from "react"
import { useServiceCharts } from "@/lib/hooks"
import ChartBlock from "./chart-block"
import { Skeleton } from "./ui/skeleton"

export default function ExpandableCharts(props: any) {
  const serviceId = props.data.id
  const [dailyTimeRange, setDailyTimeRange] = useState("Last 7 Days")
  const [hourlyTimeRange, setHourlyTimeRange] = useState("Today")
  
  const { data: chartData, isLoading, refetch } = useServiceCharts(serviceId, {
    dailyTimeRange,
    hourlyTimeRange
  })

  const handleDailyTimeRangeChange = (timeRange: string) => {
    setDailyTimeRange(timeRange)
    // Trigger refetch with new parameters
    refetch()
  }

  const handleHourlyTimeRangeChange = (timeRange: string) => {
    setHourlyTimeRange(timeRange)
    // Trigger refetch with new parameters
    refetch()
  }

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
        description={chartData?.descriptions?.daily || "The Average Time to complete a transaction in the last 7 Days is 10 seconds"}
        data={chartData?.averageTransactionDuration || []}
        timeRanges={["Last 7 Days", "Last 14 Days", "Last 30 Days"]}
        yAxisLabel="Time in seconds"
        xAxisLabel="Days"
        onTimeRangeChange={handleDailyTimeRangeChange}
      />
      <ChartBlock
        title="Current Hourly Average Today"
        description={chartData?.descriptions?.hourly || "The Current Hourly Average to complete a transaction today is 3 seconds"}
        data={chartData?.currentHourlyAverage || []}
        timeRanges={["Today", "Yesterday"]}
        yAxisLabel="Time in seconds"
        xAxisLabel="Time of the day"
        onTimeRangeChange={handleHourlyTimeRangeChange}
      />
    </div>
  )
}
```


## 4. Update the Hook to Support Parameters

You'll need to update your `useServiceCharts` hook to accept and pass the time range parameters. The hook should look something like this:

```typescript
// In your hooks file
export function useServiceCharts(serviceId: string, params?: { dailyTimeRange?: string; hourlyTimeRange?: string }) {
  return useQuery({
    queryKey: ['service-charts', serviceId, params],
    queryFn: async () => {
      const searchParams = new URLSearchParams()
      if (params?.dailyTimeRange) searchParams.set('dailyTimeRange', params.dailyTimeRange)
      if (params?.hourlyTimeRange) searchParams.set('hourlyTimeRange', params.hourlyTimeRange)
      
      const response = await fetch(`/api/services/${serviceId}/charts?${searchParams}`)
      if (!response.ok) throw new Error('Failed to fetch chart data')
      return response.json()
    },
    enabled: !!serviceId
  })
}
```


This implementation provides:

1. **Real data structure** based on your actual data format
2. **Dynamic time range filtering** for both charts
3. **Better tooltips** showing formatted time
4. **Y-axis formatting** for better readability
5. **Dynamic descriptions** that update based on the actual data
6. **Proper data transformation** from seconds to chart-friendly format


CHANGES to implement the real data structure and time range functionality for the charts. 

## 1. Update the API Route with Real Data Structure

```typescript
import { NextResponse } from "next/server"
import type { ServiceCharts } from "@/lib/types"

// Mock data based on your actual data structure
const mockDailyData = [
  { date: "2025-01-01", avgSeconds: 3845, count: 21655, avgFormatted: "01:04:05" },
  { date: "2025-01-02", avgSeconds: 1753, count: 882, avgFormatted: "00:29:13" },
  { date: "2025-01-03", avgSeconds: 1992, count: 911, avgFormatted: "00:33:12" },
  { date: "2025-01-06", avgSeconds: 1652, count: 1265, avgFormatted: "00:27:32" },
  { date: "2025-01-07", avgSeconds: 3301, count: 841, avgFormatted: "00:55:01" },
  { date: "2025-01-09", avgSeconds: 742, count: 872, avgFormatted: "00:12:22" },
  { date: "2025-01-13", avgSeconds: 1759, count: 929, avgFormatted: "00:29:19" },
  { date: "2025-01-15", avgSeconds: 7672, count: 1462, avgFormatted: "02:07:52" },
  { date: "2025-01-16", avgSeconds: 3456, count: 1209, avgFormatted: "00:57:36" },
  { date: "2025-01-18", avgSeconds: 6070, count: 1475, avgFormatted: "01:41:10" },
  { date: "2025-01-20", avgSeconds: 60, count: 353, avgFormatted: "00:01:00" },
  { date: "2025-01-23", avgSeconds: 388, count: 436, avgFormatted: "00:06:28" },
  { date: "2025-01-27", avgSeconds: 256, count: 501, avgFormatted: "00:04:16" },
  { date: "2025-01-30", avgSeconds: 641, count: 381, avgFormatted: "00:10:41" },
]

const mockHourlyData = [
  { timestamp: "2025-08-03T00:00:00Z", hour: 0, avgSeconds: 1720, avgFormatted: "00:28:40" },
  { timestamp: "2025-08-03T01:00:00Z", hour: 1, avgSeconds: 845, avgFormatted: "00:14:05" },
  { timestamp: "2025-08-03T02:00:00Z", hour: 2, avgSeconds: 1250, avgFormatted: "00:20:50" },
  { timestamp: "2025-08-03T03:00:00Z", hour: 3, avgSeconds: 980, avgFormatted: "00:16:20" },
  { timestamp: "2025-08-03T04:00:00Z", hour: 4, avgSeconds: 2100, avgFormatted: "00:35:00" },
  { timestamp: "2025-08-03T05:00:00Z", hour: 5, avgSeconds: 1500, avgFormatted: "00:25:00" },
  { timestamp: "2025-08-03T06:00:00Z", hour: 6, avgSeconds: 3200, avgFormatted: "00:53:20" },
  { timestamp: "2025-08-03T07:00:00Z", hour: 7, avgSeconds: 2800, avgFormatted: "00:46:40" },
  { timestamp: "2025-08-03T08:00:00Z", hour: 8, avgSeconds: 1900, avgFormatted: "00:31:40" },
  { timestamp: "2025-08-03T09:00:00Z", hour: 9, avgSeconds: 2400, avgFormatted: "00:40:00" },
  { timestamp: "2025-08-03T10:00:00Z", hour: 10, avgSeconds: 1600, avgFormatted: "00:26:40" },
  { timestamp: "2025-08-03T11:00:00Z", hour: 11, avgSeconds: 2200, avgFormatted: "00:36:40" },
  { timestamp: "2025-08-03T12:00:00Z", hour: 12, avgSeconds: 3100, avgFormatted: "00:51:40" },
  { timestamp: "2025-08-03T13:00:00Z", hour: 13, avgSeconds: 2700, avgFormatted: "00:45:00" },
  { timestamp: "2025-08-03T14:00:00Z", hour: 14, avgSeconds: 1800, avgFormatted: "00:30:00" },
  { timestamp: "2025-08-03T15:00:00Z", hour: 15, avgSeconds: 2300, avgFormatted: "00:38:20" },
  { timestamp: "2025-08-03T16:00:00Z", hour: 16, avgSeconds: 2900, avgFormatted: "00:48:20" },
  { timestamp: "2025-08-03T17:00:00Z", hour: 17, avgSeconds: 2500, avgFormatted: "00:41:40" },
  { timestamp: "2025-08-03T18:00:00Z", hour: 18, avgSeconds: 1700, avgFormatted: "00:28:20" },
  { timestamp: "2025-08-03T19:00:00Z", hour: 19, avgSeconds: 2000, avgFormatted: "00:33:20" },
  { timestamp: "2025-08-03T20:00:00Z", hour: 20, avgSeconds: 1400, avgFormatted: "00:23:20" },
  { timestamp: "2025-08-03T21:00:00Z", hour: 21, avgSeconds: 1100, avgFormatted: "00:18:20" },
  { timestamp: "2025-08-03T22:00:00Z", hour: 22, avgSeconds: 900, avgFormatted: "00:15:00" },
  { timestamp: "2025-08-03T23:00:00Z", hour: 23, avgSeconds: 750, avgFormatted: "00:12:30" },
]

function transformDailyData(data: typeof mockDailyData, timeRange: string) {
  let filteredData = data
  
  switch (timeRange) {
    case "Last 7 Days":
      filteredData = data.slice(-7)
      break
    case "Last 14 Days":
      filteredData = data.slice(-14)
      break
    case "Last 30 Days":
      filteredData = data.slice(-30)
      break
  }

  return filteredData.map(item => ({
    x: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    y: item.avgSeconds,
    count: item.count,
    formatted: item.avgFormatted
  }))
}

function transformHourlyData(data: typeof mockHourlyData, timeRange: string) {
  // For demo purposes, return all 24 hours for "Today"
  // In real implementation, you'd filter based on actual date
  return data.map(item => ({
    x: `${String(item.hour).padStart(2, "0")}:00`,
    y: item.avgSeconds,
    formatted: item.avgFormatted
  }))
}

export async function GET(request: Request, { params }: { params: { serviceId: string } }) {
  const { serviceId } = params
  const { searchParams } = new URL(request.url)
  const dailyTimeRange = searchParams.get("dailyTimeRange") || "Last 7 Days"
  const hourlyTimeRange = searchParams.get("hourlyTimeRange") || "Today"

  if (!serviceId) {
    return new NextResponse("Service ID is required", { status: 400 })
  }

  // Transform data based on time ranges
  const avgTransactionDurationData = transformDailyData(mockDailyData, dailyTimeRange)
  const currentHourlyAverageData = transformHourlyData(mockHourlyData, hourlyTimeRange)

  // Calculate dynamic descriptions
  const avgDaily = avgTransactionDurationData.reduce((sum, item) => sum + item.y, 0) / avgTransactionDurationData.length
  const avgHourly = currentHourlyAverageData.reduce((sum, item) => sum + item.y, 0) / currentHourlyAverageData.length

  const data: ServiceCharts & { descriptions: { daily: string; hourly: string } } = {
    averageTransactionDuration: avgTransactionDurationData,
    currentHourlyAverage: currentHourlyAverageData,
    descriptions: {
      daily: `The Average Time to complete a transaction in the ${dailyTimeRange.toLowerCase()} is ${Math.round(avgDaily)} seconds`,
      hourly: `The Current Hourly Average to complete a transaction ${hourlyTimeRange.toLowerCase()} is ${Math.round(avgHourly)} seconds`
    }
  }

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  return NextResponse.json(data)
}
```


## 2. Update Types to Include Descriptions

```typescript
export interface KPIStats {
  recentIssues: { value: number; change: string }
  pendingIssues: { value: number; change: string }
  runningServices: { value: number; change: string }
  interruptions: { value: number; change: string }
}

export interface ServiceStatus {
  id: string
  service: string
  statuses: Record<string, "✅" | "❌">
  currentHourlyAverage: string
  averagePerDay: string
}

export interface ChartPoint {
  x: string
  y: number
  count?: number
  formatted?: string
}

export interface ServiceCharts {
  averageTransactionDuration: ChartPoint[]
  currentHourlyAverage: ChartPoint[]
  descriptions?: {
    daily: string
    hourly: string
  }
}
```


## 3. Update Hooks to Support Parameters

```typescript
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

export function useServiceCharts(serviceId: string, params?: { dailyTimeRange?: string; hourlyTimeRange?: string }) {
  return useQuery<ServiceCharts>({
    queryKey: ["service-charts", serviceId, params],
    queryFn: async () => {
      const searchParams = new URLSearchParams()
      if (params?.dailyTimeRange) searchParams.set('dailyTimeRange', params.dailyTimeRange)
      if (params?.hourlyTimeRange) searchParams.set('hourlyTimeRange', params.hourlyTimeRange)
      
      const url = `/api/monitor/charts/${serviceId}${searchParams.toString() ? `?${searchParams}` : ''}`
      return fetcher(url)
    },
    enabled: !!serviceId,
  })
}
```


## 4. Update Chart Block with Better Formatting and Time Range Support

```
"use client"

import { useState } from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ChartPoint } from "@/lib/types"
import { Info } from "lucide-react"

interface ChartBlockProps {
  title: string
  description: string
  data: ChartPoint[]
  timeRanges: string[]
  yAxisLabel: string
  xAxisLabel: string
  onTimeRangeChange?: (timeRange: string) => void
}

export default function ChartBlock({ 
  title, 
  description, 
  data, 
  timeRanges, 
  yAxisLabel, 
  xAxisLabel,
  onTimeRangeChange 
}: ChartBlockProps) {
  const [timeRange, setTimeRange] = useState(timeRanges[0])

  const handleTimeRangeChange = (newTimeRange: string) => {
    setTimeRange(newTimeRange)
    onTimeRangeChange?.(newTimeRange)
  }

  const chartConfig = {
    duration: {
      label: "Duration (sec)",
      color: "hsl(217, 91%, 60%)",
    },
  }

  // Format Y-axis to show time format for better readability
  const formatYAxisTick = (value: number) => {
    if (value < 60) return `${value}s`
    if (value < 3600) return `${Math.floor(value / 60)}m`
    return `${Math.floor(value / 3600)}h ${Math.floor((value % 3600) / 60)}m`
  }

  // Custom tooltip to show formatted time
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value
      const hours = Math.floor(value / 3600)
      const minutes = Math.floor((value % 3600) / 60)
      const seconds = value % 60
      const formatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      
      return (
        <div className="bg-white p-2 border rounded shadow">
          <p className="font-medium">{label}</p>
          <p className="text-blue-600">
            Duration: {formatted} ({value}s)
          </p>
        </div>
      )
    }
    return null
  }

  return (
      <Card className="flex flex-col h-full">
        <CardHeader className="flex-row items-center justify-between pb-2">
          <div className="grid gap-1.5">
            <CardTitle>{title}</CardTitle>
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
          <Select value={timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              {timeRanges.map((range) => (
                  <SelectItem key={range} value={range}>
                    {range}
                  </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="flex-1 flex">
          <ChartContainer config={chartConfig} className="w-full h-[250px]">
            <LineChart
                accessibilityLayer
                data={data}
                margin={{
                  left: 12,
                  right: 12,
                  top: 5,
                  bottom: 20,
                }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                  dataKey="x"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  label={{ value: xAxisLabel, position: "insideBottom", offset: -15 }}
              />
              <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={formatYAxisTick}
                  label={{ value: yAxisLabel, angle: -90, position: "insideLeft" }}
              />
              <ChartTooltip cursor={false} content={<CustomTooltip />} />
              <Line dataKey="y" type="monotone" stroke="var(--color-duration)" strokeWidth={2} dot={false} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
  )
}
```


## 5. Update Expandable Charts to Handle Time Range Changes

```
"use client"

import { useState } from "react"
import { useServiceCharts } from "@/lib/hooks"
import ChartBlock from "./chart-block"
import { Skeleton } from "./ui/skeleton"

export default function ExpandableCharts(props: any) {
  const serviceId = props.data.id
  const [dailyTimeRange, setDailyTimeRange] = useState("Last 7 Days")
  const [hourlyTimeRange, setHourlyTimeRange] = useState("Today")
  
  const { data: chartData, isLoading, refetch } = useServiceCharts(serviceId, {
    dailyTimeRange,
    hourlyTimeRange
  })

  const handleDailyTimeRangeChange = (timeRange: string) => {
    setDailyTimeRange(timeRange)
    // Trigger refetch with new parameters
    refetch()
  }

  const handleHourlyTimeRangeChange = (timeRange: string) => {
    setHourlyTimeRange(timeRange)
    // Trigger refetch with new parameters
    refetch()
  }

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
        description={chartData?.descriptions?.daily || "The Average Time to complete a transaction in the last 7 Days is 10 seconds"}
        data={chartData?.averageTransactionDuration || []}
        timeRanges={["Last 7 Days", "Last 14 Days", "Last 30 Days"]}
        yAxisLabel="Time in seconds"
        xAxisLabel="Days"
        onTimeRangeChange={handleDailyTimeRangeChange}
      />
      <ChartBlock
        title="Current Hourly Average Today"
        description={chartData?.descriptions?.hourly || "The Current Hourly Average to complete a transaction today is 3 seconds"}
        data={chartData?.currentHourlyAverage || []}
        timeRanges={["Today", "Yesterday"]}
        yAxisLabel="Time in seconds"
        xAxisLabel="Time of the day"
        onTimeRangeChange={handleHourlyTimeRangeChange}
      />
    </div>
  )
}
```


These changes implement:

1. **Real data structure** - Uses actual transaction data with realistic durations
2. **Dynamic time range filtering** - Both charts respond to time range selection
3. **Better formatting** - Y-axis shows human-readable time formats (1h 5m, 30s, etc.)
4. **Enhanced tooltips** - Shows both formatted time and raw seconds
5. **Dynamic descriptions** - Updates based on actual averages from the data
6. **Proper API integration** - Supports query parameters for time ranges
7. **Type safety** - Updated TypeScript types to support new features

The charts now display meaningful transaction duration data that matches your actual data structure, with interactive time range selection and better user experience.


API Requirements

Based on your Payment Monitor application, 

API specification document to backend:

# Payment Monitor - Backend API Requirements

## Overview
The Payment Monitor page requires 3 main API endpoints to display KPIs, service statuses, and detailed charts for transaction monitoring.

## 1. KPI Statistics Endpoint

**Endpoint:** `GET /api/monitor/kpis`

**Purpose:** Provides high-level metrics for the dashboard cards

**Response Format:**
```json
{
  "recentIssues": {
    "value": 204,
    "change": "+8.93"
  },
  "pendingIssues": {
    "value": 34,
    "change": "-10.64"
  },
  "runningServices": {
    "value": 34,
    "change": "+4.29"
  },
  "interruptions": {
    "value": 204,
    "change": "+12.5"
  }
}
```


**Field Descriptions:**
- `value`: Current count/number for the metric
- `change`: Percentage change from previous period (include + or - sign)

## 2. Services Status Endpoint

**Endpoint:** `GET /api/monitor/services`

**Purpose:** Provides service list with daily status history and current averages

**Response Format:**
```json
[
  {
    "id": "service-1",
    "service": "Payment Gateway",
    "statuses": {
      "3 Aug": "✅",
      "2 Aug": "✅", 
      "1 Aug": "❌",
      "31 Jul": "✅",
      "30 Jul": "✅",
      "29 Jul": "✅",
      "28 Jul": "✅"
    },
    "currentHourlyAverage": "00:02:15",
    "averagePerDay": "00:03:45"
  }
]
```


**Field Descriptions:**
- `id`: Unique service identifier (used for chart API calls)
- `service`: Display name of the service
- `statuses`: Object with date keys (last 7 days) and status values ("✅" or "❌")
- `currentHourlyAverage`: Current hour's average transaction time (HH:MM:SS format)
- `averagePerDay`: Daily average transaction time (HH:MM:SS format)

**Date Format for Status Keys:**
- Use format: "D MMM" (e.g., "3 Aug", "28 Jul")
- Provide exactly 7 days of data (today + 6 previous days)
- Most recent date should be first in the object

## 3. Service Charts Endpoint

**Endpoint:** `GET /api/monitor/charts/{serviceId}`

**Query Parameters:**
- `dailyTimeRange` (optional): "Last 7 Days" | "Last 14 Days" | "Last 30 Days"
- `hourlyTimeRange` (optional): "Today" | "Yesterday"

**Purpose:** Provides detailed chart data for a specific service

**Response Format:**
```json
{
  "averageTransactionDuration": [
    {
      "x": "Jan 1",
      "y": 3845,
      "count": 21655,
      "formatted": "01:04:05"
    },
    {
      "x": "Jan 2", 
      "y": 1753,
      "count": 882,
      "formatted": "00:29:13"
    }
  ],
  "currentHourlyAverage": [
    {
      "x": "00:00",
      "y": 1720,
      "formatted": "00:28:40"
    },
    {
      "x": "01:00",
      "y": 845,
      "formatted": "00:14:05"
    }
  ],
  "descriptions": {
    "daily": "The Average Time to complete a transaction in the last 7 days is 2150 seconds",
    "hourly": "The Current Hourly Average to complete a transaction today is 1823 seconds"
  }
}
```


**Field Descriptions:**

**Daily Chart Data (`averageTransactionDuration`):**
- `x`: Date label in "MMM D" format (e.g., "Jan 1", "Feb 28")
- `y`: Average transaction duration in seconds
- `count`: Number of transactions for that day
- `formatted`: Human-readable time format "HH:MM:SS"

**Hourly Chart Data (`currentHourlyAverage`):**
- `x`: Hour in "HH:00" format (e.g., "00:00", "23:00")
- `y`: Average transaction duration in seconds for that hour
- `formatted`: Human-readable time format "HH:MM:SS"

**Descriptions (optional but recommended):**
- `daily`: Dynamic description based on selected time range and actual averages
- `hourly`: Dynamic description based on selected time range and actual averages

## Data Requirements & Business Logic

### Service Status Logic
- **Green (✅)**: Service operating normally (e.g., < 5% error rate, average response time within SLA)
- **Red (❌)**: Service experiencing issues (e.g., > 5% error rate, response time exceeding SLA)

### Transaction Duration Data
- Should be based on actual payment transaction processing times
- Include all payment types (card payments, bank transfers, digital wallets, etc.)
- Exclude failed/cancelled transactions from duration calculations
- Handle outliers appropriately (very long transactions due to timeouts)

### Time Range Filtering
- **Daily data**: Filter based on transaction date
- **Hourly data**: Filter based on transaction timestamp within the selected date
- Handle missing data gracefully (gaps in dates/hours should be acceptable)

### Performance Considerations
- **Caching**: Consider caching KPI and service status data for 5-15 minutes
- **Chart data**: Can be cached for 1-5 minutes depending on real-time requirements
- **Pagination**: Not required for current scope, but consider if service count grows beyond 50

## Error Handling

All endpoints should return appropriate HTTP status codes:
- **200**: Success
- **400**: Bad request (invalid parameters)
- **404**: Service not found (for charts endpoint)
- **500**: Internal server error

Error response format:
```json
{
  "error": "Service not found",
  "code": "SERVICE_NOT_FOUND"
}
```

## Authentication & Authorization
- Include any required authentication headers/tokens
- Specify user permissions needed to access payment monitoring data
- Consider rate limiting if applicable

## Data Sources
Please confirm which systems/databases contain:
- Payment transaction logs
- Service health/status information
- Performance metrics
- Historical transaction data

This specification should provide everything needed to build a fully functional Payment Monitor dashboard. Let me know if you need clarification on any specific requirements!

# Data example

Here's the data formatted in a much more readable table format:

# Payment Transaction Duration Data

## Summary
This dataset contains **58 data points** spanning from **January 1st to June 7th**, showing daily average transaction durations, transaction counts, and performance metrics.

## Formatted Data Table

| Date     | Avg Duration | Transaction Count | Duration (sec) | Performance Notes |
|----------|--------------|-------------------|----------------|-------------------|
| **January 2025** |
| Jan 1    | 01:04:05     | 21,655           | 3,845          | High volume day |
| Jan 2    | 00:29:13     | 882              | 1,753          | |
| Jan 3    | 00:33:12     | 911              | 1,992          | |
| Jan 6    | 00:27:32     | 1,265            | 1,652          | |
| Jan 7    | 00:55:01     | 841              | 3,301          | |
| Jan 9    | 00:12:22     | 872              | 742            | Fast processing |
| Jan 13   | 00:29:19     | 929              | 1,759          | |
| Jan 15   | 02:07:52     | 1,462            | 7,672          | Slow day |
| Jan 16   | 00:57:36     | 1,209            | 3,456          | |
| Jan 18   | 01:41:10     | 1,475            | 6,070          | |
| Jan 20   | 00:01:00     | 353              | 60             | Very fast |
| Jan 23   | 00:06:28     | 436              | 388            | |
| Jan 27   | 00:04:16     | 501              | 256            | |
| Jan 30   | 00:10:41     | 381              | 641            | |
| Jan 31   | 00:00:19     | 357              | 19             | Extremely fast |
| **February 2025** |
| Feb 1    | 00:52:42     | 485              | 3,162          | |
| Feb 5    | 00:04:44     | 424              | 284            | |
| Feb 8    | 00:06:19     | 385              | 379            | |
| Feb 12   | 00:06:01     | 385              | 361            | |
| Feb 17   | 13:33:50     | 523              | 48,830         | ⚠️ **MAJOR ISSUE** |
| Feb 18   | 00:54:41     | 500              | 3,281          | Recovered |
| Feb 20   | 00:01:01     | 703              | 61             | |
| Feb 23   | 00:13:26     | 377              | 806            | |
| Feb 25   | 00:10:16     | 488              | 616            | |
| **March 2025** |
| Mar 1    | 00:35:50     | 9,114            | 2,150          | High volume |
| Mar 4    | 00:08:59     | 408              | 539            | |
| Mar 6    | 00:16:25     | 465              | 985            | |
| Mar 7    | 02:11:15     | 520              | 7,875          | Slow processing |
| Mar 11   | 00:00:59     | 399              | 59             | |
| Mar 17   | 00:00:25     | 533              | 25             | Very fast |
| Mar 20   | 00:00:29     | 366              | 29             | |
| Mar 26   | 00:00:36     | 386              | 36             | |
| Mar 31   | 00:03:11     | 497              | 191            | |
| **April 2025** |
| Apr 1    | 00:40:44     | 8,854            | 2,444          | High volume |
| Apr 7    | 01:38:00     | 495              | 5,880          | |
| Apr 9    | 00:03:41     | 350              | 221            | |
| Apr 10   | 00:03:02     | 384              | 182            | |
| Apr 15   | 00:12:54     | 502              | 774            | |
| Apr 18   | 00:02:14     | 360              | 134            | |
| Apr 20   | 00:01:00     | 416              | 60             | |
| Apr 26   | 00:00:36     | 344              | 36             | |
| **May 2025** |
| May 1    | 00:37:07     | 14,976           | 2,227          | **Highest volume** |
| May 3    | 01:36:15     | 485              | 5,775          | |
| May 5    | 01:30:00     | 476              | 5,400          | |
| May 8    | 00:00:47     | 354              | 47             | |
| May 9    | 03:17:29     | 471              | 11,849         | Very slow |
| May 13   | 00:00:53     | 481              | 53             | |
| May 18   | 30:44:51     | 1                | 110,691        | ⚠️ **CRITICAL ISSUE** |
| May 20   | 00:10:46     | 658              | 646            | |
| May 23   | 00:11:02     | 900              | 662            | |
| May 27   | 00:12:38     | 1,755            | 758            | |
| May 29   | 00:02:13     | 978              | 133            | |
| May 31   | 01:28:51     | 1,175            | 5,331          | |
| **June 2025** |
| Jun 1    | 00:23:31     | 8,733            | 1,411          | High volume |
| Jun 3    | 00:01:56     | 1,116            | 116            | |
| Jun 5    | 00:02:01     | 971              | 121            | |
| Jun 7    | 00:02:27     | 891              | 147            | |

## Key Insights

### 🚨 Critical Issues Identified
- **Feb 17**: 13+ hours average duration (48,830 sec) - System failure or timeout issues
- **May 18**: 30+ hours average duration (110,691 sec) - Single transaction, likely stuck process

### 📊 Performance Patterns
- **Best Performance**: Jan 31 (19 sec), Mar 17 (25 sec), Mar 20 (29 sec)
- **High Volume Days**: Jan 1 (21,655 transactions), May 1 (14,976 transactions)
- **Typical Range**: Most days between 1-60 minutes average duration
- **Monthly Trend**: Performance generally improves from Jan to June (excluding outliers)

### 💡 Recommendations
1. Investigate the Feb 17 and May 18 incidents
2. Implement alerting for transactions exceeding 10 minutes
3. Consider auto-timeout mechanisms for stuck transactions
4. Monitor correlation between volume and performance

This formatted version makes it much easier to spot trends, outliers, and performance issues in your payment transaction data!

More Calculations and corrected insights:

## Verified Calculations for Critical Issues

### May 18th Data:
- **Duration**: 110,691 seconds
- **Calculation**: 110,691 ÷ 3,600 = **30.75 hours** = **30 hours, 44 minutes, 51 seconds**
- **Transaction Count**: 1

### February 17th Data:
- **Duration**: 48,830 seconds
- **Calculation**: 48,830 ÷ 3,600 = **13.56 hours** = **13 hours, 33 minutes, 50 seconds**
- **Transaction Count**: 523

## Revised Critical Insights

### 🚨 **May 18th - Multi-Day Transaction Issue**
Since **30+ hours exceeds 24 hours**, this indicates:
- **Cross-day transaction**: Started on May 17th, completed on May 19th
- **System failure**: Transaction got stuck and wasn't properly handled across day boundaries
- **Only 1 transaction processed** that entire day - suggests system was blocked/hung
- **Business impact**: Likely prevented other transactions from processing

### 🔍 **February 17th - Heavy Load Day**
- **13.5 hours average** with **523 transactions**
- This suggests system overload rather than a single stuck transaction
- Multiple transactions were all taking extremely long to process
- Possible causes: High volume, system resource exhaustion, or cascading failures

## Key Operational Insights

### **System Architecture Issues**
1. **No proper timeout mechanisms** - transactions shouldn't run beyond business hours
2. **Cross-day boundary handling** - system doesn't properly manage day rollover
3. **Resource contention** - one stuck transaction can block others

### **Monitoring Gaps**
1. **Missing real-time alerts** for transactions > 1 hour
2. **No automatic timeout/kill switches** for runaway processes
3. **Insufficient load balancing** during high-volume periods

### **Business Impact**
- **May 18th**: Essentially a full day outage (only 1 transaction)
- **Feb 17th**: Severe performance degradation affecting 523 transactions
- **Customer experience**: Likely resulted in payment failures, timeouts, and complaints

### **Immediate Actions Needed**
1. **Implement hard timeouts** (e.g., 10-15 minutes maximum)
2. **Add cross-day transaction handling**
3. **Create alerting** for any transaction > 5 minutes
4. **Investigate root causes** of these specific incidents
5. **Review system capacity** during high-volume periods

The fact that a transaction can run for **30+ hours** crossing multiple calendar days indicates serious architectural flaws in the payment processing system that need immediate attention.