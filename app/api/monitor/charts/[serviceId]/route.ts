import { NextResponse } from "next/server"
import type { ServiceCharts } from "@/lib/types"

function generateRandomWalk(points: number, min: number, max: number, step: number) {
  const data = []
  let lastY = Math.random() * (max - min) + min
  for (let i = 0; i < points; i++) {
    let newY = lastY + (Math.random() * 2 - 1) * step
    newY = Math.max(min, Math.min(max, newY))
    data.push(newY)
    lastY = newY
  }
  return data
}

export async function GET(request: Request, { params }: { params: { serviceId: string } }) {
  const { serviceId } = params

  if (!serviceId) {
    return new NextResponse("Service ID is required", { status: 400 })
  }

  const avgTransactionDurationData = generateRandomWalk(7, 5, 15, 1).map((y, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return {
      x: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      y: Number.parseFloat(y.toFixed(2)),
    }
  })

  const currentHourlyAverageData = generateRandomWalk(24, 2, 4, 0.2).map((y, i) => ({
    x: `${String(i).padStart(2, "0")}:00`,
    y: Number.parseFloat(y.toFixed(2)),
  }))

  const data: ServiceCharts = {
    averageTransactionDuration: avgTransactionDurationData,
    currentHourlyAverage: currentHourlyAverageData,
  }

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  return NextResponse.json(data)
}
