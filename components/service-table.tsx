"use client"

import { AgGridReact } from "@ag-grid-community/react"
import "@ag-grid-community/styles/ag-grid.css"
import "@ag-grid-community/styles/ag-theme-quartz.css"

import { ModuleRegistry } from "@ag-grid-community/core"
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model"
import { MasterDetailModule } from "@ag-grid-community/master-detail"

import { useMemo, useState, useCallback } from "react"
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

  const [colDefs] = useState<ColDef<ServiceStatus>[]>([
    {
      field: "service",
      headerName: "Service",
      pinned: "left",
      cellRenderer: "agGroupCellRenderer",
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
        headerClass: "text-center",
        cellStyle: { textAlign: "center" },
      }
    }),
    {
      field: "currentHourlyAverage",
      headerName: "Current Hourly Average",
      minWidth: 180,
    },
    { field: "averagePerDay", headerName: "Average per day", minWidth: 150 },
  ])

  const detailCellRenderer = useMemo(() => {
    return ExpandableCharts
  }, [])

  const onFirstDataRendered = useCallback((params: any) => {
    // Expand the first row by default
    setTimeout(() => {
      params.api.getDisplayedRowAtIndex(0)?.setExpanded(true)
    }, 100)
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
    <div className="ag-theme-quartz" style={{ height: 600, width: "100%" }}>
      <AgGridReact<ServiceStatus>
        rowData={rowData}
        columnDefs={colDefs}
        masterDetail={true}
        detailCellRenderer={detailCellRenderer}
        detailRowHeight={400}
        pagination={true}
        paginationPageSize={10}
        paginationPageSizeSelector={[10, 20, 50]}
        onFirstDataRendered={onFirstDataRendered}
      />
    </div>
  )
}

export default ServiceTable
