import { NextResponse } from "next/server"
import type { KPIStats } from "@/lib/types"

export async function GET() {
  const data: KPIStats = {
    recentIssues: { value: 204, change: "+8.93" },
    pendingIssues: { value: 34, change: "-10.64" },
    runningServices: { value: 34, change: "+4.29" },
    interruptions: { value: 204, change: "+12.5" },
  }

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  return NextResponse.json(data)
}
