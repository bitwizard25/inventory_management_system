"use client"

import { useState } from "react"
import { Boxes, ChevronDown, X } from "lucide-react"
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
        className={`fixed inset-y-0 left-0 z-40 flex w-[240px] flex-col border-r border-[#E5E7EB] bg-white transition-transform duration-200 ease-out md:translate-x-0 ${
          mobileNav ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[72px] items-center justify-between border-b border-[#E5E7EB] px-6">
          <button
            type="button"
            className="flex items-center gap-3 text-left"
            onClick={() => {
              onNavigate("Dashboard")
              onCloseMobileNav()
            }}
            aria-label="Gada Electronics home"
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#09090B] text-white shadow-sm">
              <Boxes size={18} />
            </span>
            <span className="min-w-0">
              <span className="block text-[15px] font-semibold tracking-tight text-slate-900 leading-tight">
                Gada Electronics
              </span>
              <span className="block text-[11px] text-slate-400">Goregaon East · Mumbai</span>
            </span>
          </button>
          <button
            type="button"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 md:hidden"
            onClick={onCloseMobileNav}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-3 pt-6">
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Workspace
          </p>
          <nav aria-label="Main navigation" className="flex flex-col gap-1">
            {navItems.map(({ label, icon: Icon }) => {
              const active = view === label
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    onNavigate(label)
                    onCloseMobileNav()
                  }}
                  className={`flex h-9 items-center gap-3 rounded-lg px-3 text-[13px] font-medium transition-colors ${
                    active
                      ? "bg-slate-100 text-slate-900 font-semibold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon
                    size={16}
                    strokeWidth={1.8}
                    className={active ? "text-slate-900" : "text-slate-400"}
                  />
                  <span>{label}</span>
                  {label === "Stock" && lowStockCount > 0 && (
                    <span className="ml-auto rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                      {lowStockCount}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="relative mt-auto border-t border-[#E5E7EB] p-4">
          <button
            type="button"
            aria-expanded={profileOpen}
            aria-haspopup="menu"
            onClick={() => setProfileOpen((open) => !open)}
            className="flex w-full items-center gap-3 rounded-xl border border-[#E5E7EB] bg-slate-50/60 p-2.5 text-left hover:bg-slate-100/60 transition-colors"
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-slate-900 text-xs font-semibold text-white shadow-sm">
              JG
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-semibold text-slate-900">Jethalal Gada</span>
              <span className="block truncate text-[11px] text-slate-400">Owner · Goregaon East</span>
            </span>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {profileOpen && (
            <div
              role="menu"
              className="absolute bottom-20 left-4 right-4 z-50 rounded-xl border border-[#E5E7EB] bg-white p-1 shadow-lg"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setProfileOpen(false)
                  if (window.confirm("Restore all sample inventory, orders, and ledger activity?")) {
                    onResetDemo()
                  }
                }}
                className="w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Reset demo data
              </button>
            </div>
          )}
        </div>
      </aside>

      {mobileNav && (
        <button
          type="button"
          aria-label="Dismiss navigation"
          className="fixed inset-0 z-30 bg-slate-900/20 backdrop-blur-[1px] md:hidden"
          onClick={onCloseMobileNav}
        />
      )}
    </>
  )
}
