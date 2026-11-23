"use client"

import { useState } from "react"
import { Check, ChevronRight, Plus } from "lucide-react"
import { primaryClass, tableActionClass } from "@/lib/constants"
import { dateLabel, formatINR } from "@/lib/format"
import type { SaleOrder } from "@/types/inventory"
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
          setStatusFilter("All")
        }}
      >
        <Pills
          label="Status"
          options={["All", "Draft", "Confirmed", "Paid"]}
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
                <th className="px-5 py-3.5 whitespace-nowrap">Invoice / SO#</th>
                <th className="px-5 py-3.5 whitespace-nowrap">Customer</th>
                <th className="px-5 py-3.5 whitespace-nowrap">Items Summary</th>
                <th className="px-5 py-3.5 whitespace-nowrap">Date</th>
                <th className="px-5 py-3.5 text-right whitespace-nowrap">Order Total (incl. GST)</th>
                <th className="px-5 py-3.5 whitespace-nowrap">Status</th>
                <th className="px-5 py-3.5 text-right whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((sale) => (
                <tr
                  key={sale.id}
                  onClick={() => onSelect(sale.id)}
                  className="group cursor-pointer hover:bg-slate-900/[0.03] transition-colors"
                >
                  <td className="whitespace-nowrap px-5 py-3.5 font-mono text-xs tabular-nums text-slate-600 font-medium">
                    {sale.id}
                  </td>
                  <td className="px-5 py-3.5 text-[14px] font-semibold text-slate-900 group-hover:text-slate-950">
                    {sale.customer}
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-[14px] font-medium text-slate-800">
                      {sale.items.length} {sale.items.length === 1 ? "line item" : "line items"}
                    </p>
                    <p className="mt-0.5 max-w-[210px] truncate text-xs text-slate-500">
                      {sale.items[0]?.itemName ?? "—"}
                      {sale.items.length > 1 ? ` + ${sale.items.length - 1} more` : ""}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-[14px] tabular-nums text-slate-600 font-medium">
                    {dateLabel(sale.date)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-right font-mono text-[14px] font-bold tabular-nums text-slate-900">
                    {formatINR(sale.totalAmount)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5">
                    <StatusBadge status={sale.status} />
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-right">
                    {sale.status === "Confirmed" ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onPaid(sale.id)
                        }}
                        className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-md bg-[#09090B] px-3.5 text-xs font-semibold text-white shadow-sm hover:bg-[#27272A] active:scale-[0.98] transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 whitespace-nowrap"
                      >
                        <Check size={12} />
                        <span>Mark paid</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onSelect(sale.id)
                        }}
                        className={tableActionClass}
                      >
                        <span>Invoice</span>
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
              message="No sales orders match your criteria"
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
            {filtered.length} of {sales.length} orders
          </span>
          <span className="font-mono tabular-nums font-bold text-slate-900">
            Total Revenue: {formatINR(filtered.reduce((sum, s) => sum + s.totalAmount, 0))}
          </span>
        </div>
      </div>
    </div>
  )
}
