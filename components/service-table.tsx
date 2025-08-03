"use client"
import { AgGridReact } from "@ag-grid-community/react"
import "@ag-grid-community/styles/ag-grid.css"
import "@ag-grid-community/styles/ag-theme-quartz.css"
import { ModuleRegistry } from "@ag-grid-community/core"
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model"
import { MasterDetailModule } from "@ag-grid-enterprise/master-detail"
import { useMemo, useState } from "react"
import type { ColDef, ICellRendererParams } from "@ag-grid-community/core"
import { useServices } from "@/lib/hooks"
import type { ServiceStatus } from "@/lib/types"
import StatusIcon from "./status-icon"
import ExpandableCharts from "./expandable-charts"
import { Skeleton } from "./ui/skeleton"
import { AlertTriangle } from "lucide-react"

// Register the required AG Grid modules
ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  MasterDetailModule
])

const StatusCellRenderer = (props: ICellRendererParams) => {
  if (!props.value) return null
  return (
      <div className="flex items-center justify-center h-full">
        <StatusIcon status={props.value} />
      </div>
  )
}

const AverageWithWarningRenderer = (props: ICellRendererParams) => {
  if (!props.value) return null
  return (
      <div className="flex items-center justify-center h-full gap-2">
        <AlertTriangle className="h-5 w-5 text-amber-500" />
        <span>{props.value}</span>
      </div>
  )
}

const ServiceTable = () => {
  const { data: rowData, isLoading } = useServices()

  const [colDefs] = useState<ColDef<ServiceStatus>[]>([
    {
      field: "service" as keyof ServiceStatus,
      headerName: "Service",
      pinned: "left",
      cellRenderer: "agGroupCellRenderer",
      minWidth: 200,
      flex: 2,
      headerClass: "centered-header",
    },
    ...Array.from({ length: 7 }).map((_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const day = date.toLocaleDateString("en-US", { day: "numeric" })
      const month = date.toLocaleDateString("en-US", { month: "short" })
      const key = `${day} ${month}`
      return {
        field: `statuses.${key}` as keyof ServiceStatus,
        headerName: i === 0 ? "Today" : key,
        cellRenderer: StatusCellRenderer,
        minWidth: 100,
        flex: 1,
        headerClass: "centered-header",
        cellStyle: {
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        },
      }
    }),
    {
      field: "currentHourlyAverage" as keyof ServiceStatus,
      headerName: "Current Hourly Average",
      minWidth: 180,
      flex: 1.5,
      headerClass: "centered-header",
      cellRenderer: AverageWithWarningRenderer,
      cellStyle: {
        textAlign: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      },
    },
    {
      field: "averagePerDay" as keyof ServiceStatus,
      headerName: "Average per day",
      minWidth: 150,
      flex: 1.5,
      headerClass: "centered-header",
      cellRenderer: AverageWithWarningRenderer,
      cellStyle: {
        textAlign: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      },
    },
  ])

  const detailCellRenderer = useMemo(() => {
    return ExpandableCharts
  }, [])

  if (isLoading) {
    return (
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
    )
  }

  return (
      <div className="ag-theme-quartz w-full ag-grid-centered-headers">
        <AgGridReact<ServiceStatus>
            rowData={rowData}
            columnDefs={colDefs}
            masterDetail={true}
            detailCellRenderer={detailCellRenderer}
            detailRowHeight={400}
            domLayout="autoHeight"
            suppressColumnVirtualisation={true}
            pagination={true}
            paginationPageSize={10}
            paginationPageSizeSelector={[10, 20, 50]}
            animateRows={true}
        />
      </div>
  )
}

export default ServiceTable
