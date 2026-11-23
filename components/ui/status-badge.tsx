"use client"

import type { InventoryItem } from "@/types/inventory"

export type ItemStatus = "In stock" | "Low stock" | "Out of stock"

export function itemStatus(item: InventoryItem): ItemStatus {
  if (item.quantity === 0) return "Out of stock"
  if (item.quantity <= item.minLevel) return "Low stock"
  return "In stock"
}

export function statusDot(status: string): string {
  if (status === "Paid" || status === "Received" || status === "In stock") {
    return "bg-emerald-500"
  }
  if (status === "Draft" || status === "Pending" || status === "Low stock") {
    return "bg-amber-500"
  }
  if (status === "Out of stock") {
    return "bg-rose-500"
  }
  return "bg-slate-400"
}

export function statusBadgeClass(status: string): string {
  if (status === "Paid" || status === "Received" || status === "In stock") {
    return "bg-emerald-50 text-emerald-700 border-emerald-100"
  }
  if (status === "Draft" || status === "Pending" || status === "Low stock") {
    return "bg-amber-50 text-amber-700 border-amber-100"
  }
  if (status === "Out of stock") {
    return "bg-rose-50 text-rose-700 border-rose-100"
  }
  return "bg-slate-50 text-slate-600 border-slate-200"
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium ${statusBadgeClass(
        status
      )}`}
    >
      <span className={`size-1.5 rounded-full shrink-0 ${statusDot(status)}`} />
      {status}
    </span>
  )
}
