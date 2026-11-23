"use client"

import type { InventoryItem } from "@/types/inventory"
import { itemStatus } from "./status-badge"

export function StockLevel({ item }: { item: InventoryItem }) {
  const percent = item.minLevel
    ? Math.min(100, Math.round((item.quantity / item.minLevel) * 100))
    : 100

  const status = itemStatus(item)
  const barColor =
    status === "In stock"
      ? "bg-emerald-500"
      : status === "Out of stock"
      ? "bg-rose-500"
      : "bg-amber-500"

  return (
    <div className="flex min-w-[130px] items-center gap-2">
      <span className="w-[62px] whitespace-nowrap text-xs font-medium tabular-nums text-slate-700">
        {item.quantity} / {item.minLevel}
      </span>
      <div className="h-1.5 w-14 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
