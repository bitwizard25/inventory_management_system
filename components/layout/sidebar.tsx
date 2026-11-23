"use client"

import { useState } from "react"
import { AlertCircle, Boxes, ChevronDown, RotateCcw, X } from "lucide-react"
import { navItems } from "@/lib/constants"
import type { View } from "@/types/inventory"

interface SidebarProps {
  view: View
  onNavigate: (view: View) => void
  lowStockCount: number
  mobileNav: boolean
  onCloseMobileNav: () => void
  onResetDemo: () => void
}

export function Sidebar({
  view,
  onNavigate,
  lowStockCount,
  mobileNav,
  onCloseMobileNav,
  onResetDemo,
}: SidebarProps) {
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[250px] flex-col border-r border-slate-200/80 bg-white transition-transform duration-200 ease-out md:translate-x-0 ${
          mobileNav ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Brand header */}
        <div className="flex h-[72px] items-center justify-between border-b border-slate-200/80 px-6">
          <button
            type="button"
            className="flex items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 rounded-lg"
            onClick={() => {
              onNavigate("Dashboard")
              onCloseMobileNav()
            }}
            aria-label="Gada Electronics home"
          >
            <span className="flex size-10 items-center justify-center rounded-lg bg-[#09090B] text-white shadow-sm shrink-0">
              <Boxes size={20} />
            </span>
            <span className="min-w-0">
              <span className="block text-[15px] font-bold tracking-tight text-slate-900 leading-tight truncate">
                Gada Electronics
              </span>
              <span className="block text-xs font-medium text-slate-500 truncate">Goregaon East · Mumbai</span>
            </span>
          </button>
          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 md:hidden"
            onClick={onCloseMobileNav}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Workspace
          </p>
          <nav aria-label="Main navigation" className="space-y-1.5">
            {navItems.map(({ label, icon: Icon }) => {
              const active = view === label
              const isStock = label === "Stock"
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    onNavigate(label)
                    onCloseMobileNav()
                  }}
                  className={`flex min-h-[44px] w-full items-center justify-between rounded-lg px-3.5 text-[14px] transition-all duration-200 ease-out active:scale-[0.98] select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 ${
                    active
                      ? "bg-slate-100 text-slate-950 font-semibold"
                      : "text-slate-700 hover:bg-slate-900/[0.03] hover:text-slate-950 font-medium"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      size={18}
                      strokeWidth={active ? 2 : 1.75}
                      className={active ? "text-slate-900" : "text-slate-500"}
                    />
                    <span>{label}</span>
                  </div>
                  {isStock && lowStockCount > 0 && (
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold tracking-tight whitespace-nowrap ${
                        active
                          ? "bg-amber-500/15 text-amber-800 ring-1 ring-inset ring-amber-500/20"
                          : "bg-amber-500/10 text-amber-700 ring-1 ring-inset ring-amber-500/20"
                      }`}
                    >
                      <AlertCircle size={11} />
                      {lowStockCount}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Footer profile & compact demo reset */}
        <div className="border-t border-slate-200/80 p-3 space-y-1.5">
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((o) => !o)}
              className="flex min-h-[44px] w-full items-center justify-between rounded-lg p-2 text-left hover:bg-slate-900/[0.03] active:scale-[0.98] transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="flex size-7 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white shrink-0">
                  JG
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-slate-900 truncate">Jethalal Gada</p>
                  <p className="text-[11px] text-slate-500 truncate">Proprietor · Admin</p>
                </div>
              </div>
              <ChevronDown size={14} className="text-slate-500 shrink-0" />
            </button>

            {profileOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-full rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xl ring-1 ring-slate-900/5 text-xs space-y-2.5 z-50">
                <div>
                  <p className="font-bold text-slate-900">Gada Electronics</p>
                  <p className="font-mono text-xs text-slate-600">GST: 27AABCG4821K1Z5</p>
                </div>
                <div className="border-t border-slate-100 pt-2 text-slate-600 space-y-1">
                  <p>Staff: Nattu Kaka (Manager)</p>
                  <p>Logistics: Bagha (Warehouse)</p>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onResetDemo}
            className="flex h-8 w-full items-center justify-center gap-1.5 rounded-md px-2 text-xs text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
          >
            <RotateCcw size={12} />
            <span>Reset demo data</span>
          </button>
        </div>
      </aside>

      {mobileNav && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm md:hidden"
          onClick={onCloseMobileNav}
        />
      )}
    </>
  )
}
