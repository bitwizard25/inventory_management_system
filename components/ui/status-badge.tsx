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
    return "bg-emerald-500/10 text-emerald-700 ring-1 ring-inset ring-emerald-500/20"
  }
  if (status === "Draft" || status === "Pending" || status === "Low stock") {
    return "bg-amber-500/10 text-amber-700 ring-1 ring-inset ring-amber-500/20"
  }
  if (status === "Out of stock") {
    return "bg-rose-500/10 text-rose-700 ring-1 ring-inset ring-rose-500/20"
  }
  return "bg-slate-500/10 text-slate-700 ring-1 ring-inset ring-slate-500/20"
}

// Non-clickable status badges: rounded-full pills ONLY
export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold select-none ${statusBadgeClass(
        status
      )}`}
    >
      <span className={`size-1.5 rounded-full shrink-0 ${statusDot(status)}`} />
      <span>{status}</span>
    </span>
  )
}
