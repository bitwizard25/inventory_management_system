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
import type { PurchaseOrder } from "@/types/inventory"
import { TableActionButton } from "@/components/ui/table-action-button"
import { EmptyState } from "@/components/ui/empty-state"
import { FilterBar } from "@/components/ui/filter-bar"
import { PageIntro } from "@/components/ui/page-intro"
import { Pills } from "@/components/ui/pills"
import { StatusBadge } from "@/components/ui/status-badge"

interface PurchaseViewProps {
  purchases: PurchaseOrder[]
  onSelect: (id: string) => void
  onCreate: () => void
  onReceive: (id: string) => void
}

export function PurchaseView({
  purchases,
  onSelect,
  onCreate,
  onReceive,
}: PurchaseViewProps) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("All")

  // Hydrate filters from sessionStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return
    const saved = sessionStorage.getItem("inv_purchases_status")
    if (saved && ["All", "Pending", "Received"].includes(saved)) {
      setStatusFilter(saved)
    }
  }, [])

  const handleStatusChange = (val: string) => {
    setStatusFilter(val)
    try {
      sessionStorage.setItem("inv_purchases_status", val)
    } catch {}
  }

  const filtered = purchases.filter((po) => {
    const matchesSearch = `${po.id} ${po.supplier}`
      .toLowerCase()
      .includes(search.toLowerCase())
    const matchesStatus = statusFilter === "All" || po.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const isFilterActive = search.length > 0 || statusFilter !== "All"

  return (
    <div className="space-y-6">
      {/* 1. Page Title & Action: Symmetrical height and spacing */}
      <PageIntro
        title="Purchase Orders"
        description="OEM brand procurement, logistics tracking, and Goods Receipt Notes (GRN)."
        action={
          <button type="button" onClick={onCreate} className={primaryClass}>
            <Plus size={16} />
            <span>New purchase</span>
          </button>
        }
      />

      {/* 2. Unified Filter Toolbar */}
      <FilterBar
        search={search}
        onSearch={setSearch}
        placeholder="Search by PO# or distributor name..."
        summary={
          isFilterActive
            ? `Showing ${filtered.length} of ${purchases.length} orders (${statusFilter})`
            : undefined
        }
        onClear={() => {
          setSearch("")
          handleStatusChange("All")
        }}
      >
        <Pills
          label="Status"
          options={["All", "Pending", "Received"]}
          value={statusFilter}
          onChange={handleStatusChange}
        />
      </FilterBar>

      {/* 3. Primary Data Table: standardized table primitive */}
      <div className={tableWrapperClass}>
        <table className="w-full min-w-[900px] text-left">
          <thead>
            <tr className={tableHeadRowClass}>
              <th className={tableHeadCellClass}>PO#</th>
              <th className={tableHeadCellClass}>Distributor / Supplier</th>
              <th className={tableHeadCellClass}>Line Items</th>
              <th className={tableHeadCellClass}>Expected Delivery</th>
              <th className={`${tableHeadCellClass} text-right`}>Order Total (incl. GST)</th>
              <th className={tableHeadCellClass}>Status</th>
              <th className={`${tableHeadCellClass} text-right`}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((po) => (
              <tr
                key={po.id}
                onClick={() => onSelect(po.id)}
                className={`group cursor-pointer ${tableBodyRowClass}`}
              >
                <td className={`${tableBodyCellClass} font-mono text-xs text-slate-600 font-medium`}>
                  {po.id}
                </td>
                <td className={`${tableBodyCellClass} font-semibold text-slate-900 group-hover:text-slate-950`}>
                  {po.supplier}
                </td>
                <td className={tableBodyCellClass}>
                  <p className="text-[13px] font-medium text-slate-800">
                    {po.items.length} {po.items.length === 1 ? "line item" : "line items"}
                  </p>
                  <p className="mt-0.5 max-w-[210px] truncate text-xs text-slate-600">
                    {po.items[0]?.itemName ?? "—"}
                    {po.items.length > 1 ? ` + ${po.items.length - 1} more` : ""}
                  </p>
                </td>
                <td className={`${tableBodyCellClass} text-[13px] tabular-nums text-slate-600 font-medium whitespace-nowrap`}>
                  {dateLabel(po.expectedDate)}
                </td>
                <td className={`${tableBodyCellClass} text-right font-semibold tabular-nums text-slate-900 whitespace-nowrap`}>
                  {formatINR(po.totalAmount)}
                </td>
                <td className={tableBodyCellClass}>
                  <StatusBadge status={po.status} />
                </td>
                <td className={tableActionCellClass}>
                  {po.status === "Pending" ? (
                    <TableActionButton
                      variant="primary"
                      onClick={(e) => {
                        e.stopPropagation()
                        onReceive(po.id)
                      }}
                    >
                      <Check size={12} />
                      <span>Receive</span>
                    </TableActionButton>
                  ) : (
                    <TableActionButton
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelect(po.id)
                      }}
                    >
                      <span>Details</span>
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
            message="No purchase orders match your criteria"
            detail="Try adjusting search or status filters."
            clear={() => {
              setSearch("")
              setStatusFilter("All")
            }}
          />
        )}

        <div className={tableFooterClass}>
          <span>
            {filtered.length} of {purchases.length} orders
          </span>
          <span className="font-semibold text-slate-900">
            Total Spend: {formatINR(filtered.reduce((sum, p) => sum + p.totalAmount, 0))}
          </span>
        </div>
      </div>
    </div>
  )
}
