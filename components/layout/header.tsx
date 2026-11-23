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

  return (
    <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-[#E5E7EB] bg-white/95 px-5 backdrop-blur md:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          aria-label="Open navigation"
          onClick={onOpenMobileNav}
        >
          <Menu size={18} />
        </button>
        <h1 className="text-base font-semibold tracking-tight text-slate-900">{view}</h1>
        <ChevronRight className="hidden text-slate-300 sm:block" size={14} />
        <span className="hidden text-xs text-slate-400 sm:block">
          {view === "Dashboard" ? "Inventory overview & alerts" : "Gada Electronics workspace"}
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <label className="relative hidden sm:block">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search inventory..."
            aria-label="Search inventory"
            className="h-9 w-[190px] rounded-lg border border-[#E5E7EB] bg-white pl-9 pr-3 text-[13px] outline-none transition focus:border-slate-900 focus:ring-1 focus:ring-slate-900 lg:w-[240px]"
          />
        </label>

        <div className="relative">
          <button
            type="button"
            aria-label="Notifications"
            aria-expanded={notificationsOpen}
            onClick={() => setNotificationsOpen((open) => !open)}
            className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <Bell size={18} />
            {lowStock.length > 0 && (
              <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>

          {notificationsOpen && (
            <section
              aria-label="Low stock notifications"
              className="absolute right-0 top-12 z-50 w-[min(340px,calc(100vw-2rem))] rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-xl"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
                <h2 className="text-xs font-semibold text-slate-900">Low stock alerts</h2>
                <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                  {lowStock.length}
                </span>
              </div>
              {lowStock.length ? (
                <ul className="mt-2 max-h-72 divide-y divide-slate-100 overflow-y-auto">
                  {lowStock.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setNotificationsOpen(false)
                          onOpenStockItem(item.id)
                        }}
                        className="w-full py-2.5 text-left hover:bg-slate-50 rounded-lg px-2 transition-colors"
                      >
                        <span className="block truncate text-[13px] font-medium text-slate-900">
                          {item.name}
                        </span>
                        <span className="text-xs text-slate-400">
                          {item.quantity} {item.unit} in stock · Minimum {item.minLevel}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-xs text-slate-400 text-center py-2">All items well stocked.</p>
              )}
            </section>
          )}
        </div>

        <button
          type="button"
          className="hidden sm:inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-3 text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          onClick={onNewPurchase}
        >
          <Plus size={15} />
          New purchase
        </button>

        <button
          type="button"
          className={primaryClass}
          onClick={onNewSale}
        >
          <Plus size={15} />
          New sale
        </button>
      </div>
    </header>
  )
}
