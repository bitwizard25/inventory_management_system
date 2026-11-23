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
  { label: "Sales", icon: ShoppingCart },
  { label: "Purchase", icon: Truck },
  { label: "Stock", icon: Boxes },
  { label: "Reports", icon: ChartNoAxesCombined },
]

export const buttonClass =
  "inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3 text-[13px] font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-50"

export const primaryClass =
  "inline-flex min-h-9 items-center justify-center gap-2 rounded-lg bg-[#09090B] px-3.5 text-[13px] font-medium text-white transition-colors duration-200 hover:bg-[#27272A] disabled:cursor-not-allowed disabled:opacity-50"
