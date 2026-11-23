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

  const labelText =
    status === "In stock"
      ? `${item.quantity} units (Healthy)`
      : status === "Out of stock"
      ? "0 units (Depleted)"
      : `${item.quantity} units (Reorder)`

  return (
    <div
      className="flex flex-col gap-1 min-w-[130px]"
      title={`${item.quantity} units in stock / ${item.minLevel} safety min threshold (${status})`}
    >
      <div className="flex items-center gap-2">
        <span className="w-[62px] whitespace-nowrap text-xs font-semibold tabular-nums text-slate-900">
          {item.quantity} <span className="font-normal text-slate-500">/ {item.minLevel}</span>
        </span>
        <div className="h-1.5 w-14 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all duration-300 ${barColor}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
      <span className="text-[11px] font-medium text-slate-500 leading-none">
        {labelText}
      </span>
    </div>
  )
}
