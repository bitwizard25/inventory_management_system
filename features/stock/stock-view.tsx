"use client"

import { useState } from "react"
import { godowns } from "@/lib/constants"
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
      <PageIntro
        title="Live Stock"
        description="Real-time warehouse quantities, reorder thresholds, and valuations."
      />

      <FilterBar
        search={search}
        onSearch={onSearch}
        placeholder="Search by SKU, product name, or category..."
        summary={
          isFilterActive
            ? `Showing ${filtered.length} of ${items.length} items · ${statusFilter} · ${godownFilter}`
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

      <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left">
            <thead className="bg-slate-50/80">
              <tr className="border-b border-[#E5E7EB] text-xs font-medium text-slate-500">
                <th className="px-5 py-3 whitespace-nowrap">SKU</th>
                <th className="px-4 py-3 whitespace-nowrap">Product & Category</th>
                <th className="px-4 py-3 whitespace-nowrap">Godown</th>
                <th className="px-4 py-3 whitespace-nowrap">Stock Level</th>
                <th className="px-4 py-3 text-right whitespace-nowrap">Unit Price</th>
                <th className="px-4 py-3 text-right whitespace-nowrap">Total Value</th>
                <th className="px-4 py-3 whitespace-nowrap">Status</th>
                <th className="px-5 py-3 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filtered.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => onSelect(item.id)}
                  className="cursor-pointer hover:bg-slate-50/60 transition-colors"
                >
                  <td className="whitespace-nowrap px-5 py-3.5 font-mono text-xs tabular-nums text-slate-600 font-medium">
                    {item.sku}
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="max-w-[220px] truncate text-[13px] font-medium text-slate-900">
                      {item.name}
                    </p>
                    <p className="text-xs text-slate-400">{item.category}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5">
                    <span className="rounded-md border border-[#E5E7EB] bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600">
                      {item.godown}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5">
                    <StockLevel item={item} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-right text-[13px] font-medium tabular-nums text-slate-800">
                    {formatINR(item.unitPrice)}
                    <span className="text-xs font-normal text-slate-400"> / {item.unit}</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-right text-[13px] font-semibold tabular-nums text-slate-900">
                    {formatINR(item.quantity * item.unitPrice)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5">
                    <StatusBadge status={itemStatus(item)} />
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelect(item.id)
                      }}
                      className="rounded-md border border-[#E5E7EB] bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    >
                      Ledger
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!filtered.length && (
            <EmptyState
              message="No stock items found"
              detail="Try changing your search keywords or active filters."
              clear={isFilterActive ? clearFilters : undefined}
            />
          )}
        </div>

        <div className="border-t border-[#E5E7EB] px-5 py-3 text-xs text-slate-500">
          Showing {filtered.length} of {items.length} SKUs across all warehouses · {movements.length} logged audit entries
        </div>
      </div>
    </div>
  )
}
