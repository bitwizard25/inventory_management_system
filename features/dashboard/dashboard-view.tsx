"use client"

import { Activity, ArrowDownLeft, ArrowUpRight, Boxes, ChevronRight, PackageSearch, ShoppingCart, SlidersHorizontal, Truck, User } from "lucide-react"
import type { InventoryItem, StockMovement, View } from "@/types/inventory"
import { formatINR, timeLabel } from "@/lib/format"
import {
  tableActionCellClass,
  tableBodyCellClass,
  tableBodyRowClass,
  tableFooterClass,
  tableHeadCellClass,
  tableHeadRowClass,
  tableWrapperClass,
} from "@/lib/constants"
import { TableActionButton } from "@/components/ui/table-action-button"
import { MetricCard } from "@/components/ui/metric"
import { PageIntro } from "@/components/ui/page-intro"
import { StatusBadge, itemStatus } from "@/components/ui/status-badge"

interface DashboardViewProps {
  items: InventoryItem[]
  lowStock: InventoryItem[]
  stockValue: number
  periodSales: number
  periodDays: number
  onPeriodChange: (days: number) => void
  pendingPOs: number
  movements: StockMovement[]
  onNavigate: (view: View) => void
  onSelect: (id: string) => void
  onReorder: (id?: string) => void
  onClearSearch: () => void
}

export function DashboardView({
  items,
  lowStock,
  stockValue,
  periodSales,
  periodDays,
  onPeriodChange,
  pendingPOs,
  movements,
  onNavigate,
  onSelect,
  onReorder,
  onClearSearch,
}: DashboardViewProps) {
  const currentDate = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date())

  return (
    <div className="space-y-6">
      {/* 1. Page Header with Period Filter: Symmetrical height and spacing */}
      <PageIntro
        title="Good morning, Jethalal"
        description={`${currentDate} · Multi-godown inventory parity, low-stock reorder triggers, and customer sales.`}
        action={
          <div className="flex min-h-[44px] items-center gap-1.5 rounded-lg border border-slate-300 bg-white p-1 shadow-[0_1px_2px_rgba(15,23,42,0.04)] select-none">
            <span className="flex items-center gap-1 px-2.5 text-xs font-semibold uppercase tracking-wider text-slate-600">
              <SlidersHorizontal size={13} />
              Period:
            </span>
            {[7, 30, 90].map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => onPeriodChange(days)}
                className={`min-h-[36px] whitespace-nowrap rounded-md px-3 text-xs font-medium transition-all duration-200 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 ${
                  periodDays === days
                    ? "bg-[#09090B] text-white shadow-sm font-semibold"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                }`}
              >
                Last {days}d
              </button>
            ))}
          </div>
        }
      />

      {/* 2. Primary KPI Metrics Grid (12-column alignment) */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total Stock Valuation"
          value={formatINR(stockValue)}
          note="Across 3 Mumbai godowns"
          icon={Boxes}
          trend="+8.2% vs last month"
          trendColor="emerald"
        />
        <MetricCard
          title="Low Stock Alerts"
          value={`${lowStock.length} items`}
          note="At or below safety threshold"
          icon={Activity}
          trend={lowStock.length > 0 ? "Requires reorder" : "Optimal"}
          trendColor={lowStock.length > 0 ? "amber" : "emerald"}
        />
        <MetricCard
          title={`Sales (${periodDays}d)`}
          value={formatINR(periodSales)}
          note="Gross customer invoices"
          icon={ShoppingCart}
          trend="Live total"
          trendColor="emerald"
        />
        <MetricCard
          title="Pending Purchase Orders"
          value={`${pendingPOs} orders`}
          note="OEM shipments in transit"
          icon={Truck}
          trend={pendingPOs > 0 ? "Awaiting delivery" : "All received"}
          trendColor={pendingPOs > 0 ? "slate" : "emerald"}
        />
      </div>

      {/* 3. Primary Data Panels: Proportional 65/35 Split */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.75fr)_minmax(360px,1fr)]">
        {/* Left: Low Stock Alerts Table: rounded-xl container */}
        <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
            <div>
              <h3 className="text-[15px] font-bold tracking-[-0.025em] leading-tight text-slate-900">Urgent Replenishment Alerts</h3>
              <p className="mt-0.5 text-[13px] text-slate-500">
                Products at or below safety reorder threshold requiring purchase orders
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("Stock")}
              className="inline-flex min-h-[36px] items-center gap-1 rounded-md px-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-950 transition-all duration-200 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 whitespace-nowrap"
            >
              <span>View catalog</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead className="bg-slate-50/80">
                <tr className="border-b border-slate-200/80 text-xs font-semibold uppercase tracking-wider text-slate-600">
                  <th className="px-5 py-3.5 whitespace-nowrap">SKU</th>
                  <th className="px-5 py-3.5 whitespace-nowrap">Item & Category</th>
                  <th className="px-5 py-3.5 whitespace-nowrap">Godown</th>
                  <th className="px-5 py-3.5 whitespace-nowrap">Stock / Min</th>
                  <th className="px-5 py-3.5 whitespace-nowrap">Status</th>
                  <th className="px-5 py-3.5 text-right whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lowStock.map((item) => {
                  const percent = item.minLevel
                    ? Math.min(100, Math.round((item.quantity / item.minLevel) * 100))
                    : 100
                  const status = itemStatus(item)

                  return (
                    <tr
                      key={item.id}
                      onClick={() => onSelect(item.id)}
                      className="group cursor-pointer hover:bg-slate-900/[0.03] transition-colors"
                    >
                      <td className="whitespace-nowrap px-5 py-3.5 font-mono text-xs tabular-nums text-slate-600 font-medium">
                        {item.sku}
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="max-w-[210px] truncate text-[14px] font-semibold text-slate-900 group-hover:text-slate-950 leading-snug">
                          {item.name}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">{item.category}</p>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
                          {item.godown}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <span className="w-[56px] text-xs font-bold tabular-nums text-slate-900">
                            {item.quantity} / {item.minLevel}
                          </span>
                          <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                status === "In stock"
                                  ? "bg-emerald-500"
                                  : status === "Out of stock"
                                  ? "bg-rose-500"
                                  : "bg-amber-500"
                              }`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <StatusBadge status={status} />
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            onReorder(item.id)
                          }}
                          className={tableActionClass}
                        >
                          Reorder
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {!lowStock.length && (
              <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                <span className="flex size-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500 border border-slate-200">
                  <PackageSearch size={20} />
                </span>
                <p className="mt-3.5 text-[15px] font-bold text-slate-900">
                  {items.some((i) => i.quantity <= i.minLevel)
                    ? "No matching alerts"
                    : "All stock levels optimal"}
                </p>
                <p className="mt-1 text-[14px] text-slate-600">
                  {items.some((i) => i.quantity <= i.minLevel)
                    ? "Try adjusting search criteria"
                    : "No SKUs currently fall at or below their reorder threshold."}
                </p>
                {items.some((i) => i.quantity <= i.minLevel) && (
                  <button
                    type="button"
                    onClick={onClearSearch}
                    className="mt-3 text-xs font-medium text-slate-700 hover:underline"
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-3.5 text-[14px] text-slate-600 bg-slate-50/40">
            <span>
              {lowStock.length} {lowStock.length === 1 ? "item requires" : "items require"} replenishment
            </span>
            <button
              type="button"
              onClick={() => onNavigate("Stock")}
              className="font-semibold text-slate-900 hover:underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 rounded"
            >
              Open stock manager →
            </button>
          </div>
        </section>

        {/* Right: Recent Ledger Activity: rounded-xl container */}
        <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div>
              <h3 className="text-[15px] font-bold tracking-[-0.025em] leading-tight text-slate-900">Recent Movements</h3>
              <p className="mt-0.5 text-[13px] text-slate-500">Ledger entries with technician signatures</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("Stock")}
              aria-label="View activity"
              className="flex size-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 active:scale-[0.98] transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
            >
              <ChevronRight size={17} />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {movements.slice(0, 6).map((movement) => {
              const plus = movement.delta > 0
              return (
                <button
                  key={movement.id}
                  type="button"
                  onClick={() => onSelect(movement.itemId)}
                  className="flex w-full items-start gap-3.5 px-6 py-3.5 text-left hover:bg-slate-900/[0.03] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
                >
                  <span
                    className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ${
                      plus ? "bg-emerald-500/10 text-emerald-700 ring-1 ring-inset ring-emerald-500/20" : "bg-rose-500/10 text-rose-700 ring-1 ring-inset ring-rose-500/20"
                    }`}
                  >
                    {plus ? <ArrowDownLeft size={15} /> : <ArrowUpRight size={15} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-[14px] font-semibold text-slate-900">
                        {movement.itemName}
                      </span>
                      <span
                        className={`shrink-0 text-xs font-bold tabular-nums ${
                          plus ? "text-emerald-700" : "text-rose-700"
                        }`}
                      >
                        {plus ? "+" : ""}
                        {movement.delta}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-slate-600">
                      <span className="font-mono text-xs text-slate-600 font-medium">{movement.referenceId}</span>
                      <span>·</span>
                      {movement.performedBy && (
                        <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                          <User size={11} className="text-slate-400" />
                          {movement.performedBy}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">{timeLabel(movement.timestamp)}</p>
                  </div>
                </button>
              )
            })}
          </div>

          <button
            type="button"
            onClick={() => onNavigate("Stock")}
            className="w-full border-t border-slate-100 px-6 py-3.5 text-left text-xs font-semibold text-slate-700 hover:text-slate-950 hover:bg-slate-900/[0.03] active:scale-[0.98] transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
          >
            Open complete audit ledger →
          </button>
        </section>
      </div>
    </div>
  )
}
