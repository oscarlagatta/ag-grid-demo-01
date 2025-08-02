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

// Register the required AG Grid modules
ModuleRegistry.registerModules([ClientSideRowModelModule, MasterDetailModule])

const StatusCellRenderer = (props: ICellRendererParams) => {
  if (!props.value) return null
  return <StatusIcon status={props.value} />
}

const ServiceTable = () => {
  const { data: rowData, isLoading } = useServices()

  const defaultColDef = useMemo<ColDef>(() => {
    return {
      resizable: true,
      filter: true,
      // Vertically center cell content
      cellStyle: { display: "flex", alignItems: "center" },
    }
  }, [])

  const [colDefs] = useState<ColDef<ServiceStatus>[]>([
    {
      field: "service",
      headerName: "Service",
      cellRenderer: "agGroupCellRenderer",
      flex: 2,
      minWidth: 200,
    },
    ...Array.from({ length: 7 }).map((_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const day = date.toLocaleDateString("en-US", { day: "numeric" })
      const month = date.toLocaleDateString("en-US", { month: "short" })
      const key = `${day} ${month}`
      return {
        field: `statuses.${key}`,
        headerName: i === 0 ? "Today" : key,
        cellRenderer: StatusCellRenderer,
        width: 100,
        // Center both header and cell content
        headerClass: "text-center",
        cellStyle: { display: "flex", alignItems: "center", justifyContent: "center" },
      }
    }),
    {
      field: "currentHourlyAverage",
      headerName: "Current Hourly Average",
      flex: 1,
      minWidth: 180,
    },
    {
      field: "averagePerDay",
      headerName: "Average per day",
      flex: 1,
      minWidth: 150,
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
    <div className="ag-theme-quartz w-full">
      <AgGridReact<ServiceStatus>
        rowData={rowData}
        columnDefs={colDefs}
        defaultColDef={defaultColDef}
        masterDetail={true}
        detailCellRenderer={detailCellRenderer}
        detailRowHeight={400}
        domLayout="autoHeight"
        pagination={true}
        paginationPageSize={10}
        paginationPageSizeSelector={[10, 20, 50]}
      />
    </div>
  )
}

export default ServiceTable
