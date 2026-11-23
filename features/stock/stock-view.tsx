"use client"

import { useState } from "react"
import { ChevronRight } from "lucide-react"
import {
  godowns,
  tableActionCellClass,
  tableBodyCellClass,
  tableBodyRowClass,
  tableFooterClass,
  tableHeadCellClass,
  tableHeadRowClass,
  tableWrapperClass,
} from "@/lib/constants"
import { formatINR } from "@/lib/format"
import type { Godown, InventoryItem, StockMovement } from "@/types/inventory"
import { TableActionButton } from "@/components/ui/table-action-button"
import { EmptyState } from "@/components/ui/empty-state"
import { FilterBar } from "@/components/ui/filter-bar"
import { PageIntro } from "@/components/ui/page-intro"
import { Pills } from "@/components/ui/pills"
import { StatusBadge, itemStatus, type ItemStatus } from "@/components/ui/status-badge"
import { StockLevel } from "@/components/ui/stock-level"

interface StockViewProps {
  items: InventoryItem[]
  movements: StockMovement[]
  search: string
  onSearch: (value: string) => void
  onSelect: (id: string) => void
}

export function StockView({
  items,
  movements,
  search,
  onSearch,
  onSelect,
}: StockViewProps) {
  const [statusFilter, setStatusFilter] = useState<"All" | ItemStatus>("All")
  const [godownFilter, setGodownFilter] = useState<"All godowns" | Godown>("All godowns")

  const filtered = items.filter((item) => {
    const matchesSearch = `${item.sku} ${item.name} ${item.category}`
      .toLowerCase()
      .includes(search.toLowerCase())
    const matchesStatus = statusFilter === "All" || itemStatus(item) === statusFilter
    const matchesGodown = godownFilter === "All godowns" || item.godown === godownFilter
    return matchesSearch && matchesStatus && matchesGodown
  })

  const isFilterActive = search.length > 0 || statusFilter !== "All" || godownFilter !== "All godowns"

  const clearFilters = () => {
    onSearch("")
    setStatusFilter("All")
    setGodownFilter("All godowns")
  }

  return (
    <div className="space-y-6">
      {/* 1. Page Title & Action: Symmetrical height and spacing */}
      <PageIntro
        title="Warehouse Inventory"
        description="Physical stock levels across Showroom, Goregaon Godown, and Andheri Depot."
      />

      {/* 2. Unified Filter Toolbar */}
      <FilterBar
        search={search}
        onSearch={onSearch}
        placeholder="Filter by SKU, product name, or category..."
        summary={
          isFilterActive
            ? `Showing ${filtered.length} of ${items.length} items (${statusFilter} · ${godownFilter})`
            : undefined
        }
        onClear={clearFilters}
      >
        <Pills
          label="Status"
          options={["All", "In stock", "Low stock", "Out of stock"] as const}
          value={statusFilter}
          onChange={setStatusFilter}
        />
        <div className="inline-flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 whitespace-nowrap">Godown:</span>
          <select
            value={godownFilter}
            onChange={(e) => setGodownFilter(e.target.value as "All godowns" | Godown)}
            className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-[13px] font-medium text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)] outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900 hover:border-slate-400"
          >
            <option value="All godowns">All godowns</option>
            {godowns.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      </FilterBar>

      {/* 3. Primary Data Table: standardized table primitive */}
      <div className={tableWrapperClass}>
        <table className="w-full min-w-[950px] text-left">
          <thead>
            <tr className={tableHeadRowClass}>
              <th className={tableHeadCellClass}>SKU</th>
              <th className={tableHeadCellClass}>Product & Category</th>
              <th className={tableHeadCellClass}>Godown</th>
              <th className={tableHeadCellClass}>Stock Level</th>
              <th className={`${tableHeadCellClass} text-right`}>Unit Price</th>
              <th className={`${tableHeadCellClass} text-right`}>Valuation</th>
              <th className={tableHeadCellClass}>Status</th>
              <th className={`${tableHeadCellClass} text-right`}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr
                key={item.id}
                onClick={() => onSelect(item.id)}
                className={`group cursor-pointer ${tableBodyRowClass}`}
              >
                <td className={`${tableBodyCellClass} font-mono text-xs text-slate-600 font-medium`}>
                  {item.sku}
                </td>
                <td className={tableBodyCellClass}>
                  <p className="max-w-[240px] truncate text-[13px] font-semibold text-slate-900 group-hover:text-slate-950 leading-snug">
                    {item.name}
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">{item.category}</p>
                </td>
                <td className={tableBodyCellClass}>
                  <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
                    {item.godown}
                  </span>
                </td>
                <td className={tableBodyCellClass}>
                  <StockLevel item={item} />
                </td>
                <td className={`${tableBodyCellClass} text-right font-semibold tabular-nums text-slate-900 whitespace-nowrap`}>
                  {formatINR(item.unitPrice)}
                </td>
                <td className={`${tableBodyCellClass} text-right font-semibold tabular-nums text-slate-900 whitespace-nowrap`}>
                  {formatINR(item.quantity * item.unitPrice)}
                </td>
                <td className={tableBodyCellClass}>
                  <StatusBadge status={itemStatus(item)} />
                </td>
                <td className={tableActionCellClass}>
                  <TableActionButton
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelect(item.id)
                    }}
                  >
                    <span>Details</span>
                    <ChevronRight size={13} className="text-slate-500" />
                  </TableActionButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!filtered.length && (
          <EmptyState
            message="No inventory items match your criteria"
            detail="Try selecting a different godown, status filter, or clearing search."
            clear={clearFilters}
          />
        )}

        <div className={tableFooterClass}>
          <span>
            Showing {filtered.length} of {items.length} SKUs
          </span>
          <span className="font-semibold text-slate-900">
            Total Valuation: {formatINR(filtered.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0))}
          </span>
        </div>
      </div>
    </div>
  )
}
