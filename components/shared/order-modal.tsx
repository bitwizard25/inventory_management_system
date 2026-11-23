"use client"

import { useState } from "react"
import { Check, Plus, X } from "lucide-react"
import { buttonClass, primaryClass } from "@/lib/constants"
import { formatINR } from "@/lib/format"
import { useInventory } from "@/hooks/use-inventory"
import type { LineInput } from "@/types/inventory"
import { Overlay } from "@/components/ui/overlay"

interface OrderModalProps {
  type: "sale" | "purchase"
  prefillItem?: string
  onClose: () => void
  onSale: (customer: string, lines: LineInput[]) => boolean
  onPurchase: (supplier: string, lines: LineInput[], received?: boolean) => boolean
}

export function OrderModal({
  type,
  prefillItem,
  onClose,
  onSale,
  onPurchase,
}: OrderModalProps) {
  const { items, sales, purchases } = useInventory()
  const [party, setParty] = useState("")

  const initialQty = () => {
    if (!prefillItem) return 1
    const found = items.find((it) => it.id === prefillItem)
    if (!found) return 1
    return Math.max(1, found.minLevel * 2 - found.quantity)
  }

  const [lines, setLines] = useState<LineInput[]>([
    {
      itemId: prefillItem ?? "",
      quantity: initialQty(),
      unitPrice: prefillItem ? items.find((it) => it.id === prefillItem)?.unitPrice : undefined,
    },
  ])
  const [showError, setShowError] = useState(false)
  const [saving, setSaving] = useState(false)

  const selectLine = (index: number, itemId: string) => {
    const product = items.find((it) => it.id === itemId)
    setLines((curr) =>
      curr.map((l, i) =>
        i === index
          ? {
              ...l,
              itemId,
              unitPrice: type === "purchase" ? product?.unitPrice : undefined,
            }
          : l
      )
    )
  }

  const updateLine = (index: number, patch: Partial<LineInput>) => {
    setLines((curr) => curr.map((l, i) => (i === index ? { ...l, ...patch } : l)))
  }

  const isValid =
    party.trim().length > 0 &&
    lines.length > 0 &&
    lines.every((line) => {
      if (!line.itemId || !Number.isInteger(line.quantity) || line.quantity <= 0) return false
      if (type === "sale") {
        const product = items.find((candidate) => candidate.id === line.itemId)
        if (!product) return false
        const totalRequested = lines
          .filter((l) => l.itemId === line.itemId)
          .reduce((sum, l) => sum + l.quantity, 0)
        return totalRequested <= product.quantity
      }
      return true
    })

  const total = lines.reduce((sum, entry) => {
    const item = items.find((candidate) => candidate.id === entry.itemId)
    const rate = entry.unitPrice ?? item?.unitPrice ?? 0
    return sum + entry.quantity * rate
  }, 0)

  const submit = (received = false) => {
    setShowError(true)
    if (!isValid) return
    setSaving(true)
    const success = type === "sale" ? onSale(party, lines) : onPurchase(party, lines, received)
    setSaving(false)
    if (success) onClose()
  }

  const partySuggestions = Array.from(
    new Set(type === "sale" ? sales.map((s) => s.customer) : purchases.map((p) => p.supplier))
  )

  return (
    <Overlay
      onClose={onClose}
      title={type === "sale" ? "Create a sale" : "New purchase order"}
      subtitle={
        type === "sale"
          ? "Create an order and update live warehouse inventory"
          : "Add supplier items and specify quantities for replenishment"
      }
      width="max-w-[720px]"
    >
      <div className="flex-1 space-y-5 overflow-y-auto p-6">
        <label className="block text-xs font-medium text-slate-700">
          {type === "sale" ? "Customer" : "Supplier / Distributor"}
          <input
            list={type === "sale" ? "customer-options" : "supplier-options"}
            value={party}
            onChange={(event) => setParty(event.target.value)}
            placeholder={
              type === "sale" ? "Select or enter customer name" : "Select or enter distributor name"
            }
            className="mt-1.5 h-9 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-[13px] outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
          />
          <datalist id={type === "sale" ? "customer-options" : "supplier-options"}>
            {partySuggestions.map((value) => (
              <option key={value} value={value} />
            ))}
          </datalist>
          {showError && !party.trim() && (
            <span className="mt-1 block text-xs text-rose-600">
              Please enter a {type === "sale" ? "customer" : "supplier"} name.
            </span>
          )}
        </label>

        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Line items</h3>
              <p className="text-xs text-slate-400">Select items from your live inventory database</p>
            </div>
            <button
              type="button"
              onClick={() => setLines((current) => [...current, { itemId: "", quantity: 1 }])}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 hover:text-slate-900"
            >
              <Plus size={14} /> Add line
            </button>
          </div>

          <div className="space-y-3">
            {lines.map((entry, index) => {
              const item = items.find((candidate) => candidate.id === entry.itemId)
              const requestedTotal = lines
                .filter((l) => l.itemId === entry.itemId)
                .reduce((sum, l) => sum + l.quantity, 0)
              const exceeds = type === "sale" && item && requestedTotal > item.quantity

              return (
                <div key={index} className="rounded-xl border border-[#E5E7EB] p-4 bg-slate-50/30">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_110px_130px_auto]">
                    <label className="text-xs font-medium text-slate-600">
                      Product
                      <select
                        value={entry.itemId}
                        onChange={(event) => selectLine(index, event.target.value)}
                        className="mt-1.5 h-9 w-full rounded-lg border border-[#E5E7EB] bg-white px-2 text-[13px] outline-none focus:border-slate-900"
                      >
                        <option value="">Select an item...</option>
                        {items.map((candidate) => (
                          <option
                            key={candidate.id}
                            value={candidate.id}
                            disabled={
                              type === "sale"
                                ? candidate.quantity <= 0
                                : lines.some((l, li) => li !== index && l.itemId === candidate.id)
                            }
                          >
                            {candidate.sku} · {candidate.name} ({candidate.quantity} available in {candidate.godown})
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="text-xs font-medium text-slate-600">
                      Quantity
                      <input
                        type="number"
                        min="1"
                        value={entry.quantity}
                        onChange={(event) => updateLine(index, { quantity: Number(event.target.value) })}
                        className={`mt-1.5 h-9 w-full rounded-lg border px-3 text-[13px] tabular-nums outline-none ${
                          exceeds
                            ? "border-rose-400 bg-rose-50 text-rose-900"
                            : "border-[#E5E7EB] bg-white focus:border-slate-900"
                        }`}
                      />
                    </label>

                    <label className="text-xs font-medium text-slate-600">
                      Unit price (₹)
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={entry.unitPrice ?? item?.unitPrice ?? ""}
                        disabled={type === "sale"}
                        onChange={(event) => updateLine(index, { unitPrice: Number(event.target.value) })}
                        className="mt-1.5 h-9 w-full rounded-lg border border-[#E5E7EB] px-3 text-[13px] tabular-nums disabled:bg-slate-100/70 disabled:text-slate-600 outline-none focus:border-slate-900"
                      />
                    </label>

                    <div className="flex items-end">
                      <button
                        type="button"
                        disabled={lines.length === 1}
                        onClick={() => setLines((current) => current.filter((_, i) => i !== index))}
                        className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label="Remove line item"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  </div>

                  {item && (
                    <p className={`mt-2 text-xs ${exceeds ? "text-rose-600 font-medium" : "text-slate-400"}`}>
                      {type === "sale"
                        ? `Available: ${item.quantity} units in ${item.godown}`
                        : `Current stock: ${item.quantity} units in ${item.godown}`}
                      {exceeds ? ` (Total ${requestedTotal} exceeds available stock)` : ""}
                    </p>
                  )}
                  {showError && !item && (
                    <p className="mt-2 text-xs text-rose-600">Please choose an inventory product.</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-4">
          <span className="text-[13px] font-medium text-slate-600">Order total</span>
          <span className="text-xl font-bold tabular-nums text-slate-900">{formatINR(total)}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-[#E5E7EB] bg-slate-50/50 p-4">
        <button type="button" className={buttonClass} onClick={onClose}>
          Cancel
        </button>
        {type === "purchase" && (
          <button
            type="button"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-3.5 text-[13px] font-medium text-slate-900 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!isValid || saving}
            onClick={() => submit(true)}
          >
            <Check size={14} /> Create & mark received
          </button>
        )}
        <button
          type="button"
          className={primaryClass}
          disabled={!isValid || saving}
          onClick={() => submit(false)}
        >
          {type === "sale" ? "Confirm sale & Update Stock" : "Create purchase order (Pending)"}
        </button>
      </div>
    </Overlay>
  )
}
