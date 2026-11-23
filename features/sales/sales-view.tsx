"use client"

import { useEffect, useState } from "react"
import { Check, ChevronRight, Plus } from "lucide-react"
import {
  primaryClass,
  tableActionCellClass,
  tableBodyCellClass,
  tableBodyRowClass,
  tableFooterClass,
  tableHeadCellClass,
  tableHeadRowClass,
  tableWrapperClass,
} from "@/lib/constants"
import { dateLabel, formatINR } from "@/lib/format"
import type { SaleOrder } from "@/types/inventory"
import { TableActionButton } from "@/components/ui/table-action-button"
import { EmptyState } from "@/components/ui/empty-state"
import { FilterBar } from "@/components/ui/filter-bar"
import { PageIntro } from "@/components/ui/page-intro"
import { Pills } from "@/components/ui/pills"
import { StatusBadge } from "@/components/ui/status-badge"

interface SalesViewProps {
  sales: SaleOrder[]
  onSelect: (id: string) => void
  onCreate: () => void
  onPaid: (id: string) => void
}

export function SalesView({ sales, onSelect, onCreate, onPaid }: SalesViewProps) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("All")

  // Hydrate filters from sessionStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return
    const saved = sessionStorage.getItem("inv_sales_status")
    if (saved && ["All", "Draft", "Confirmed", "Paid"].includes(saved)) {
      setStatusFilter(saved)
    }
  }, [])

  const handleStatusChange = (val: string) => {
    setStatusFilter(val)
    try {
      sessionStorage.setItem("inv_sales_status", val)
    } catch {}
  }

  const filtered = sales.filter((sale) => {
    const matchesSearch = `${sale.id} ${sale.customer}`
      .toLowerCase()
      .includes(search.toLowerCase())
    const matchesStatus = statusFilter === "All" || sale.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const isFilterActive = search.length > 0 || statusFilter !== "All"

  return (
    <div className="space-y-6">
      {/* 1. Page Title & Action: Symmetrical height and spacing */}
      <PageIntro
        title="Sales Orders & Invoices"
        description="Customer billing, 18% GST tax invoices, and dispatch reconciliations."
        action={
          <button type="button" onClick={onCreate} className={primaryClass}>
            <Plus size={16} />
            <span>New sale</span>
          </button>
        }
      />

      {/* 2. Unified Filter Toolbar */}
      <FilterBar
        search={search}
        onSearch={setSearch}
        placeholder="Search by SO# or customer name..."
        summary={
          isFilterActive ? `Showing ${filtered.length} of ${sales.length} orders (${statusFilter})` : undefined
        }
        onClear={() => {
          setSearch("")
          handleStatusChange("All")
        }}
      >
        <Pills
          label="Status"
          options={["All", "Draft", "Confirmed", "Paid"]}
          value={statusFilter}
          onChange={handleStatusChange}
        />
      </FilterBar>

      {/* 3. Primary Data Table: standardized table primitive */}
      <div className={tableWrapperClass}>
        <table className="w-full min-w-[900px] text-left">
          <thead>
            <tr className={tableHeadRowClass}>
              <th className={tableHeadCellClass}>Invoice / SO#</th>
              <th className={tableHeadCellClass}>Customer</th>
              <th className={tableHeadCellClass}>Items Summary</th>
              <th className={tableHeadCellClass}>Date</th>
              <th className={`${tableHeadCellClass} text-right`}>Order Total (incl. GST)</th>
              <th className={tableHeadCellClass}>Status</th>
              <th className={`${tableHeadCellClass} text-right`}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((sale) => (
              <tr
                key={sale.id}
                onClick={() => onSelect(sale.id)}
                className={`group cursor-pointer ${tableBodyRowClass}`}
              >
                <td className={`${tableBodyCellClass} font-mono text-xs text-slate-600 font-medium`}>
                  {sale.id}
                </td>
                <td className={`${tableBodyCellClass} font-semibold text-slate-900 group-hover:text-slate-950`}>
                  {sale.customer}
                </td>
                <td className={tableBodyCellClass}>
                  <p className="text-[13px] font-medium text-slate-800">
                    {sale.items.length} {sale.items.length === 1 ? "line item" : "line items"}
                  </p>
                  <p className="mt-0.5 max-w-[210px] truncate text-xs text-slate-600">
                    {sale.items[0]?.itemName ?? "—"}
                    {sale.items.length > 1 ? ` + ${sale.items.length - 1} more` : ""}
                  </p>
                </td>
                <td className={`${tableBodyCellClass} text-[13px] tabular-nums text-slate-600 font-medium whitespace-nowrap`}>
                  {dateLabel(sale.date)}
                </td>
                <td className={`${tableBodyCellClass} text-right font-semibold tabular-nums text-slate-900 whitespace-nowrap`}>
                  {formatINR(sale.totalAmount)}
                </td>
                <td className={tableBodyCellClass}>
                  <StatusBadge status={sale.status} />
                </td>
                <td className={tableActionCellClass}>
                  {sale.status === "Confirmed" ? (
                    <TableActionButton
                      variant="primary"
                      onClick={(e) => {
                        e.stopPropagation()
                        onPaid(sale.id)
                      }}
                    >
                      <Check size={12} />
                      <span>Mark paid</span>
                    </TableActionButton>
                  ) : (
                    <TableActionButton
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelect(sale.id)
                      }}
                    >
                      <span>Invoice</span>
                      <ChevronRight size={13} className="text-slate-500" />
                    </TableActionButton>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!filtered.length && (
          <EmptyState
            message="No sales orders match your criteria"
            detail="Try adjusting search or status filters."
            clear={() => {
              setSearch("")
              setStatusFilter("All")
            }}
          />
        )}

        <div className={tableFooterClass}>
          <span>
            {filtered.length} of {sales.length} orders
          </span>
          <span className="font-semibold text-slate-900">
            Total Revenue: {formatINR(filtered.reduce((sum, s) => sum + s.totalAmount, 0))}
          </span>
        </div>
      </div>
    </div>
  )
}
