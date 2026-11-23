"use client"

import { Activity, ArrowDownLeft, ArrowUpRight, Boxes, ChevronRight, PackageSearch, ShoppingCart, SlidersHorizontal, Truck } from "lucide-react"
import type { InventoryItem, StockMovement, View } from "@/types/inventory"
import { formatINR, timeLabel } from "@/lib/format"
import { MetricCard } from "@/components/ui/metric"
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
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-500">{currentDate}</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            Good morning, Jethalal
          </h2>
          <p className="mt-0.5 text-[13px] text-slate-500">
            Overview of live stock, urgent replenishment, and sales activity across Mumbai godowns.
          </p>
        </div>

        <div className="flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white p-1 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <span className="flex items-center gap-1.5 px-2 text-xs font-medium text-slate-400">
            <SlidersHorizontal size={13} />
            Period:
          </span>
          {[7, 30, 90].map((days) => (
            <button
              key={days}
              type="button"
              onClick={() => onPeriodChange(days)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                periodDays === days
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              Last {days}d
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total stock value"
          value={formatINR(stockValue)}
          note="Across 3 godowns"
          icon={Boxes}
          trend="+8.2%"
          trendColor="emerald"
        />
        <MetricCard
          title="Low stock alerts"
          value={`${lowStock.length} items`}
          note="Require reordering"
          icon={Activity}
          trend="Needs attention"
          trendColor="amber"
        />
        <MetricCard
          title={`Sales in last ${periodDays} days`}
          value={formatINR(periodSales)}
          note="Confirmed & paid orders"
          icon={ShoppingCart}
          trend="Live total"
          trendColor="emerald"
        />
        <MetricCard
          title="Pending purchase orders"
          value={`${pendingPOs} orders`}
          note="Expected this week"
          icon={Truck}
          trend="On track"
          trendColor="slate"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(340px,1fr)]">
        <section className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E7EB] px-5 py-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Low stock alerts</h3>
              <p className="mt-0.5 text-xs text-slate-500">Items at or below minimum threshold</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("Stock")}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              View all stock <ChevronRight size={14} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead className="bg-slate-50/80">
                <tr className="border-b border-[#E5E7EB] text-xs font-medium text-slate-500">
                  <th className="px-5 py-3 whitespace-nowrap">SKU</th>
                  <th className="px-4 py-3 whitespace-nowrap">Item & Category</th>
                  <th className="px-4 py-3 whitespace-nowrap">Godown</th>
                  <th className="px-4 py-3 whitespace-nowrap">Current vs Min</th>
                  <th className="px-4 py-3 whitespace-nowrap">Status</th>
                  <th className="px-5 py-3 text-right whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {lowStock.map((item) => {
                  const percent = item.minLevel
                    ? Math.min(100, Math.round((item.quantity / item.minLevel) * 100))
                    : 100
                  const status = itemStatus(item)

                  return (
                    <tr
                      key={item.id}
                      onClick={() => onSelect(item.id)}
                      className="cursor-pointer hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="whitespace-nowrap px-5 py-3.5 font-mono text-xs tabular-nums text-slate-600">
                        {item.sku}
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="max-w-[200px] truncate text-[13px] font-medium text-slate-900">
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
                        <div className="flex items-center gap-2">
                          <span className="w-[60px] text-xs font-medium tabular-nums text-slate-700">
                            {item.quantity} / {item.minLevel}
                          </span>
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={`h-full rounded-full ${
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
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <StatusBadge status={status} />
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            onReorder(item.id)
                          }}
                          className="inline-flex h-8 items-center rounded-lg border border-[#E5E7EB] bg-white px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
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
                <span className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <PackageSearch size={18} />
                </span>
                <p className="mt-3 text-[13px] font-semibold text-slate-800">
                  {items.some((i) => i.quantity <= i.minLevel)
                    ? "No matching stock alerts"
                    : "All stock levels are optimal"}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {items.some((i) => i.quantity <= i.minLevel)
                    ? "Try adjusting your search criteria."
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

          <div className="flex items-center justify-between border-t border-[#E5E7EB] px-5 py-3 text-xs text-slate-500">
            <span>{lowStock.length} items require replenishment</span>
            <button
              type="button"
              onClick={() => onNavigate("Stock")}
              className="font-medium text-slate-700 hover:text-slate-900"
            >
              Open stock report
            </button>
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Recent activity</h3>
              <p className="mt-0.5 text-xs text-slate-500">Latest stock entries & dispatches</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("Stock")}
              aria-label="View activity"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="divide-y divide-[#E5E7EB]">
            {movements.slice(0, 6).map((movement) => {
              const plus = movement.delta > 0
              return (
                <button
                  key={movement.id}
                  type="button"
                  onClick={() => onSelect(movement.itemId)}
                  className="flex w-full items-start gap-3 px-5 py-3.5 text-left hover:bg-slate-50/60 transition-colors"
                >
                  <span
                    className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full ${
                      plus ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                    }`}
                  >
                    {plus ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-[13px] font-medium text-slate-900">
                        {movement.itemName}
                      </span>
                      <span
                        className={`shrink-0 text-xs font-semibold tabular-nums ${
                          plus ? "text-emerald-700" : "text-rose-700"
                        }`}
                      >
                        {plus ? "+" : ""}
                        {movement.delta} units
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-[11px] text-slate-500">
                      {movement.referenceId} · {movement.note}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-400">{timeLabel(movement.timestamp)}</p>
                  </div>
                </button>
              )
            })}
          </div>

          <button
            type="button"
            onClick={() => onNavigate("Stock")}
            className="w-full border-t border-[#E5E7EB] px-5 py-3 text-left text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
          >
            View full stock ledger →
          </button>
        </section>
      </div>
    </div>
  )
}
