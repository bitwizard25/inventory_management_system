"use client"

import { useState } from "react"
import { ChevronRight } from "lucide-react"
import { godowns, tableActionClass } from "@/lib/constants"
import { formatINR } from "@/lib/format"
import type { Godown, InventoryItem, StockMovement } from "@/types/inventory"
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
        <Pills
          label="Godown"
          options={["All godowns", ...godowns] as const}
          value={godownFilter}
          onChange={setGodownFilter}
        />
      </FilterBar>

      {/* 3. Primary Data Table: rounded-xl container */}
      <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left">
            <thead className="bg-slate-50/80">
              <tr className="border-b border-slate-200/80 text-xs font-semibold uppercase tracking-wider text-slate-600">
                <th className="px-5 py-3.5 whitespace-nowrap">SKU</th>
                <th className="px-5 py-3.5 whitespace-nowrap">Product & Category</th>
                <th className="px-5 py-3.5 whitespace-nowrap">Godown</th>
                <th className="px-5 py-3.5 whitespace-nowrap">Stock Level</th>
                <th className="px-5 py-3.5 text-right whitespace-nowrap">Unit Price</th>
                <th className="px-5 py-3.5 text-right whitespace-nowrap">Valuation</th>
                <th className="px-5 py-3.5 whitespace-nowrap">Status</th>
                <th className="px-5 py-3.5 text-right whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => onSelect(item.id)}
                  className="group cursor-pointer hover:bg-slate-50/80 transition-colors"
                >
                  <td className="whitespace-nowrap px-5 py-4 font-mono text-xs tabular-nums text-slate-700 font-bold">
                    {item.sku}
                  </td>
                  <td className="px-5 py-4">
                    <p className="max-w-[240px] truncate text-[14px] font-semibold text-slate-900 group-hover:text-black leading-snug">
                      {item.name}
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">{item.category}</p>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
                      {item.godown}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <StockLevel item={item} />
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-right font-mono text-[14px] tabular-nums text-slate-700 font-medium">
                    {formatINR(item.unitPrice)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-right font-mono text-[14px] font-bold tabular-nums text-slate-900">
                    {formatINR(item.quantity * item.unitPrice)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <StatusBadge status={itemStatus(item)} />
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelect(item.id)
                      }}
                      className={tableActionClass}
                    >
                      <span>Details</span>
                      <ChevronRight size={13} className="text-slate-500" />
                    </button>
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
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 text-[14px] text-slate-600 bg-slate-50/40">
          <span>
            Showing {filtered.length} of {items.length} SKUs
          </span>
          <span className="font-mono tabular-nums font-bold text-slate-900">
            Total Valuation: {formatINR(filtered.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0))}
          </span>
        </div>
      </div>
    </div>
  )
}
