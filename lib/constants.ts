import {
  Boxes,
  ChartNoAxesCombined,
  LayoutDashboard,
  ShoppingCart,
  Truck,
} from "lucide-react"
import type { Godown, View } from "@/types/inventory"

export const godowns: Godown[] = [
  "Showroom Floor",
  "Goregaon Godown",
  "Andheri Depot",
]

export const navItems: { label: View; icon: typeof LayoutDashboard }[] = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Stock", icon: Boxes },
  { label: "Sales", icon: ShoppingCart },
  { label: "Purchase", icon: Truck },
  { label: "Reports", icon: ChartNoAxesCombined },
]

// 1. Primary Obsidian CTA Button (min 44px hit target, rounded-lg 8px control)
export const primaryClass =
  "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-[#09090B] px-4 py-2.5 text-[14px] font-medium text-white shadow-sm transition-all duration-200 ease-out hover:bg-[#27272A] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 whitespace-nowrap select-none motion-reduce:transition-none"

// 2. Secondary Bordered Button (min 44px hit target, rounded-lg 8px control, >=3:1 border contrast)
export const buttonClass =
  "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-[14px] font-medium text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 ease-out hover:bg-slate-50 hover:border-slate-500 hover:text-slate-950 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 whitespace-nowrap select-none motion-reduce:transition-none"

// 3. Dense Inline Table Action Button (min 40px hit target, rounded-md 6px inside rounded-lg track/rounded-xl table)
export const tableActionClass =
  "inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-[13px] font-medium text-slate-800 shadow-[0_1px_1px_rgba(15,23,42,0.03)] transition-all duration-200 ease-out hover:bg-slate-50 hover:border-slate-500 hover:text-slate-950 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 whitespace-nowrap select-none motion-reduce:transition-none"

// 4. Tertiary Ghost Button (min 44px hit target, rounded-lg 8px control)
export const ghostClass =
  "inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[14px] font-medium text-slate-700 transition-all duration-200 ease-out hover:bg-slate-100 hover:text-slate-950 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 whitespace-nowrap select-none motion-reduce:transition-none"

// 5. Standardized Shared Table Primitives
export const tableWrapperClass =
  "overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]"

export const tableHeadRowClass =
  "border-b border-slate-200/80 bg-slate-50/70 text-left text-xs font-medium text-slate-600"

export const tableHeadCellClass = "whitespace-nowrap px-4 py-3"

export const tableBodyRowClass =
  "border-b border-slate-100 last:border-b-0 transition-colors duration-150 hover:bg-slate-900/[0.025]"

export const tableBodyCellClass = "px-4 py-3.5 align-middle text-[14px] text-slate-900"

export const tableActionCellClass = "px-4 py-3.5 align-middle text-right whitespace-nowrap"

export const tableFooterClass =
  "flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs font-medium text-slate-600 tabular-nums bg-slate-50/40"
