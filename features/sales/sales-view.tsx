"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { primaryClass } from "@/lib/constants"
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
      <PageIntro
        title="Sales Orders"
        description="Customer billing invoices, dispatch tracking, and payment reconciliations."
        action={
          <button type="button" onClick={onCreate} className={primaryClass}>
            <Plus size={15} />
            New sale
          </button>
        }
      />

      <FilterBar
        search={search}
        onSearch={setSearch}
        placeholder="Search by SO# or customer name..."
        summary={
          isFilterActive ? `Showing ${filtered.length} of ${sales.length} orders · ${statusFilter}` : undefined
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

      <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="bg-slate-50/80">
              <tr className="border-b border-[#E5E7EB] text-xs font-medium text-slate-500">
                <th className="px-5 py-3 whitespace-nowrap">Invoice / SO#</th>
                <th className="px-4 py-3 whitespace-nowrap">Customer</th>
                <th className="px-4 py-3 whitespace-nowrap">Items summary</th>
                <th className="px-4 py-3 whitespace-nowrap">Date</th>
                <th className="px-4 py-3 text-right whitespace-nowrap">Order Total</th>
                <th className="px-4 py-3 whitespace-nowrap">Status</th>
                <th className="px-5 py-3 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filtered.map((sale) => (
                <tr
                  key={sale.id}
                  onClick={() => onSelect(sale.id)}
                  className="cursor-pointer hover:bg-slate-50/60 transition-colors"
                >
                  <td className="whitespace-nowrap px-5 py-3.5 font-mono text-xs tabular-nums text-slate-700 font-semibold">
                    {sale.id}
                  </td>
                  <td className="px-4 py-3.5 text-[13px] font-medium text-slate-900">
                    {sale.customer}
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-[13px] text-slate-800">
                      {sale.items.length} {sale.items.length === 1 ? "line item" : "line items"}
                    </p>
                    <p className="mt-0.5 max-w-[200px] truncate text-xs text-slate-400">
                      {sale.items[0]?.itemName ?? "—"}
                      {sale.items.length > 1 ? ` + ${sale.items.length - 1} more` : ""}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-[13px] tabular-nums text-slate-500">
                    {dateLabel(sale.date)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-right text-[13px] font-semibold tabular-nums text-slate-900">
                    {formatINR(sale.totalAmount)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5">
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
                        className="inline-flex h-8 items-center rounded-lg border border-[#E5E7EB] bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                      >
                        Mark paid
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onSelect(sale.id)
                        }}
                        className="rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
                      >
                        View invoice
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!filtered.length && (
            <EmptyState
              message="No sales orders found"
              detail="Try changing your search or filters."
              clear={
                isFilterActive
                  ? () => {
                      setSearch("")
                      setStatusFilter("All")
                    }
                  : undefined
              }
            />
          )}
        </div>

        <div className="border-t border-[#E5E7EB] px-5 py-3 text-xs text-slate-500">
          Showing {filtered.length} sales orders
        </div>
      </div>
    </div>
  )
}
