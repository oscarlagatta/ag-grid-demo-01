import { NextResponse } from "next/server"
import type { ServiceStatus } from "@/lib/types"

const services = [
  "US Wires",
  "India Payments",
  "China Payments",
  "Singapore",
  "Malaysia",
  "Service A",
  "Service B",
  "Service C",
  "Service D",
  "Service E",
]

function generateStatuses() {
  const statuses: Record<string, "✅" | "❌"> = {}
  for (let i = 0; i < 7; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const day = date.toLocaleDateString("en-US", { day: "numeric" })
    const month = date.toLocaleDateString("en-US", { month: "short" })
    const key = `${day} ${month}`
    statuses[key] = Math.random() > 0.2 ? "✅" : "❌"
  }
  return statuses
}

export async function GET() {
  const data: ServiceStatus[] = services.map((service, index) => ({
    id: `service-${index + 1}`,
    service,
    statuses: generateStatuses(),
    currentHourlyAverage: `${(Math.random() * 3 + 1).toFixed(2)} sec`,
    averagePerDay: `${(Math.random() * 5 + 2).toFixed(2)} sec`,
  }))

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  return NextResponse.json(data)
}
