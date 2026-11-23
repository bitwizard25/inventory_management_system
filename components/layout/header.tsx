"use client"

import { useState } from "react"
import { Bell, ChevronRight, Menu, Plus, Search } from "lucide-react"
import { primaryClass } from "@/lib/constants"
import type { InventoryItem, View } from "@/types/inventory"

interface HeaderProps {
  view: View
  search: string
  onSearch: (value: string) => void
  lowStock: InventoryItem[]
  onOpenMobileNav: () => void
  onNewPurchase: () => void
  onNewSale: () => void
  onOpenStockItem: (id: string) => void
}

export function Header({
  view,
  search,
  onSearch,
  lowStock,
  onOpenMobileNav,
  onNewPurchase,
  onNewSale,
  onOpenStockItem,
}: HeaderProps) {
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  const viewDescriptions: Record<View, string> = {
    Dashboard: "Executive summary & real-time alerts",
    Stock: "Multi-godown inventory & reorder levels",
    Sales: "Customer billing & dispatch tracking",
    Purchase: "OEM procurement & GRN stock intake",
    Reports: "Analytics, tax ledger & CSV export",
  }

  return (
    <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-slate-200 bg-white px-6 md:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
          aria-label="Open navigation"
          onClick={onOpenMobileNav}
        >
          <Menu size={20} />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-[-0.025em] leading-tight text-slate-900 whitespace-nowrap">{view}</h1>
            <ChevronRight className="hidden text-slate-400 sm:block" size={15} />
            <span className="hidden text-[13px] font-medium text-slate-500 sm:block">
              {viewDescriptions[view]}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Global Search Input: rounded-lg control with >=3:1 contrast border */}
        <label className="relative hidden sm:block">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search catalog or SKU..."
            aria-label="Search catalog or SKU"
            className="h-9 w-[210px] rounded-lg border border-slate-300 bg-slate-50/60 pl-10 pr-3.5 text-[13px] text-slate-900 placeholder:text-slate-500 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 hover:border-slate-400 lg:w-[260px]"
          />
        </label>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            type="button"
            aria-label="Notifications"
            aria-expanded={notificationsOpen}
            onClick={() => setNotificationsOpen((open) => !open)}
            className="relative flex size-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 hover:text-slate-950 active:scale-[0.98] transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
          >
            <Bell size={18} />
            {lowStock.length > 0 && (
              <span className="absolute right-2 top-2 size-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>

          {notificationsOpen && (
            <section
              aria-label="Low stock notifications"
              className="absolute right-0 top-14 z-50 w-[min(360px,calc(100vw-2rem))] rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xl ring-1 ring-slate-900/5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-sm font-semibold text-slate-900">Low Stock Alerts</h2>
                <span className="rounded-full bg-amber-500/10 text-amber-700 ring-1 ring-inset ring-amber-500/20 px-2.5 py-0.5 text-xs font-bold">
                  {lowStock.length} items
                </span>
              </div>
              {lowStock.length ? (
                <ul className="mt-2.5 max-h-72 divide-y divide-slate-100 overflow-y-auto">
                  {lowStock.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setNotificationsOpen(false)
                          onOpenStockItem(item.id)
                        }}
                        className="flex min-h-[44px] w-full items-start justify-between py-2.5 text-left hover:bg-slate-900/[0.03] px-2.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="truncate text-[13px] font-semibold text-slate-900">{item.name}</p>
                          <p className="mt-0.5 font-mono text-xs text-slate-600">
                            {item.sku} · {item.godown}
                          </p>
                        </div>
                        <span className="shrink-0 font-mono text-xs font-bold tabular-nums text-rose-600">
                          {item.quantity} / {item.minLevel}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-6 text-center text-[13px] text-slate-600">
                  All inventory items are above safety thresholds.
                </p>
              )}
            </section>
          )}
        </div>

        {/* Global Primary Action Button: rounded-lg control shape */}
        <button
          type="button"
          onClick={onNewSale}
          className={primaryClass}
        >
          <Plus size={16} />
          <span>New sale</span>
        </button>
      </div>
    </header>
  )
}
