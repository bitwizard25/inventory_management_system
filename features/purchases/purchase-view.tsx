"use client"

import { useState } from "react"
import { Check, ChevronRight, Plus } from "lucide-react"
import { primaryClass, tableActionClass } from "@/lib/constants"
import { dateLabel, formatINR } from "@/lib/format"
import type { PurchaseOrder } from "@/types/inventory"
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
          setStatusFilter("All")
        }}
      >
        <Pills
          label="Status"
          options={["All", "Pending", "Received"]}
          value={statusFilter}
          onChange={setStatusFilter}
        />
      </FilterBar>

      {/* 3. Primary Data Table: rounded-xl container */}
      <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="bg-slate-50/80">
              <tr className="border-b border-slate-200/80 text-xs font-semibold uppercase tracking-wider text-slate-600">
                <th className="px-5 py-3.5 whitespace-nowrap">PO#</th>
                <th className="px-5 py-3.5 whitespace-nowrap">Distributor / Supplier</th>
                <th className="px-5 py-3.5 whitespace-nowrap">Line Items</th>
                <th className="px-5 py-3.5 whitespace-nowrap">Expected Delivery</th>
                <th className="px-5 py-3.5 text-right whitespace-nowrap">Order Total (incl. GST)</th>
                <th className="px-5 py-3.5 whitespace-nowrap">Status</th>
                <th className="px-5 py-3.5 text-right whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((po) => (
                <tr
                  key={po.id}
                  onClick={() => onSelect(po.id)}
                  className="group cursor-pointer hover:bg-slate-50/80 transition-colors"
                >
                  <td className="whitespace-nowrap px-5 py-4 font-mono text-xs tabular-nums text-slate-700 font-bold">
                    {po.id}
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-[14px] font-semibold text-slate-900 group-hover:text-black">
                      {po.supplier}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-[14px] font-medium text-slate-800">
                      {po.items.length} {po.items.length === 1 ? "line item" : "line items"}
                    </p>
                    <p className="mt-0.5 max-w-[210px] truncate text-xs text-slate-600">
                      {po.items[0]?.itemName ?? "—"}
                      {po.items.length > 1 ? ` + ${po.items.length - 1} more` : ""}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-[14px] tabular-nums text-slate-600 font-medium">
                    {dateLabel(po.expectedDate)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-right font-mono text-[14px] font-bold tabular-nums text-slate-900">
                    {formatINR(po.totalAmount)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <StatusBadge status={po.status} />
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-right">
                    {po.status === "Pending" ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onReceive(po.id)
                        }}
                        className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-md bg-[#09090B] px-3.5 text-xs font-semibold text-white shadow-sm hover:bg-[#27272A] active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
                      >
                        <Check size={12} />
                        <span>Receive</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onSelect(po.id)
                        }}
                        className={tableActionClass}
                      >
                        <span>Details</span>
                        <ChevronRight size={13} className="text-slate-500" />
                      </button>
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
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 text-[14px] text-slate-600 bg-slate-50/40">
          <span>
            {filtered.length} of {purchases.length} orders
          </span>
          <span className="font-mono tabular-nums font-bold text-slate-900">
            Total Spend: {formatINR(filtered.reduce((sum, p) => sum + p.totalAmount, 0))}
          </span>
        </div>
      </div>
    </div>
  )
}
