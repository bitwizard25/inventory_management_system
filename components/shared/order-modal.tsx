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
  const { items, sales, purchases, customers, suppliers } = useInventory()
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
    new Set([
      ...(type === "sale" ? customers.map((c) => c.name) : suppliers.map((s) => s.name)),
      ...(type === "sale" ? sales.map((s) => s.customer) : purchases.map((p) => p.supplier)),
    ])
  )

  return (
    <Overlay
      onClose={onClose}
      title={type === "sale" ? "New Customer Sale" : "New Purchase Order"}
      subtitle={
        type === "sale"
          ? "Create an order and validate live warehouse inventory"
          : "Procure inventory from authorized OEM brand distributors"
      }
      width="max-w-[720px]"
    >
      <div className="flex-1 space-y-6 overflow-y-auto p-6">
        {/* Persistent, high-contrast label above field */}
        <div>
          <label htmlFor="party-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            {type === "sale" ? "Customer Name" : "Distributor / Supplier"}
          </label>
          <input
            id="party-input"
            list={type === "sale" ? "customer-options" : "supplier-options"}
            value={party}
            onChange={(event) => setParty(event.target.value)}
            placeholder={
              type === "sale" ? "e.g. Taarak Mehta or Gokuldham Committee" : "e.g. Voltas Regional Hub"
            }
            className="mt-2 min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3.5 text-[16px] text-slate-900 placeholder:text-slate-500 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900 hover:border-slate-500"
          />
          <datalist id={type === "sale" ? "customer-options" : "supplier-options"}>
            {partySuggestions.map((value) => (
              <option key={value} value={value} />
            ))}
          </datalist>
          {showError && !party.trim() && (
            <span className="mt-1.5 block text-xs font-medium text-rose-600">
              Please enter or select a {type === "sale" ? "customer" : "supplier"} name.
            </span>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">Order Line Items</h3>
              <p className="text-[13px] text-slate-600">Select items from live catalog</p>
            </div>
            <button
              type="button"
              onClick={() => setLines((current) => [...current, { itemId: "", quantity: 1 }])}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 hover:text-slate-950 hover:border-slate-500 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
            >
              <Plus size={14} /> Add line item
            </button>
          </div>

          <div className="space-y-3.5">
            {lines.map((entry, index) => {
              const item = items.find((candidate) => candidate.id === entry.itemId)
              const requestedTotal = lines
                .filter((l) => l.itemId === entry.itemId)
                .reduce((sum, l) => sum + l.quantity, 0)
              const exceeds = type === "sale" && item && requestedTotal > item.quantity

              return (
                <div key={index} className="rounded-xl border border-slate-200/80 p-5 bg-slate-50/50 shadow-[0_1px_2px_rgba(15,23,42,0.02)]">
                  <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-[1fr_110px_140px_auto]">
                    {/* Persistent label above field */}
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Product
                      <select
                        value={entry.itemId}
                        onChange={(event) => selectLine(index, event.target.value)}
                        className="mt-1.5 min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3 text-[16px] outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900 hover:border-slate-500"
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
                            {candidate.sku} · {candidate.name} ({candidate.quantity} {candidate.unit} in {candidate.godown})
                          </option>
                        ))}
                      </select>
                    </label>

                    {/* Persistent label above field */}
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Quantity
                      <input
                        type="number"
                        min="1"
                        value={entry.quantity}
                        onChange={(event) => updateLine(index, { quantity: Number(event.target.value) })}
                        className={`mt-1.5 min-h-[44px] w-full rounded-lg border px-3 text-[16px] tabular-nums outline-none transition ${
                          exceeds
                            ? "border-rose-400 bg-rose-50 text-rose-900"
                            : "border-slate-300 bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900 hover:border-slate-500"
                        }`}
                      />
                    </label>

                    {/* Persistent label above field */}
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Unit price (₹)
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={entry.unitPrice ?? item?.unitPrice ?? ""}
                        disabled={type === "sale"}
                        onChange={(event) => updateLine(index, { unitPrice: Number(event.target.value) })}
                        className="mt-1.5 min-h-[44px] w-full rounded-lg border border-slate-300 px-3 text-[16px] tabular-nums disabled:bg-slate-100 disabled:text-slate-600 outline-none focus:border-slate-900 hover:border-slate-500"
                      />
                    </label>

                    <div className="flex items-end">
                      <button
                        type="button"
                        disabled={lines.length === 1}
                        onClick={() => setLines((current) => current.filter((_, i) => i !== index))}
                        className="flex size-11 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-500 hover:text-slate-900 hover:border-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
                        aria-label="Remove line item"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  {item && (
                    <p className={`mt-2.5 text-xs font-medium ${exceeds ? "text-rose-600 font-bold" : "text-slate-600"}`}>
                      {type === "sale"
                        ? `Available: ${item.quantity} units in ${item.godown}`
                        : `Current stock: ${item.quantity} units in ${item.godown}`}
                      {exceeds ? ` (Warning: requested ${requestedTotal} exceeds available stock)` : ""}
                    </p>
                  )}
                  {showError && !item && (
                    <p className="mt-2 text-xs font-medium text-rose-600">Please choose an inventory product.</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 pt-5">
          <span className="text-[14px] font-semibold text-slate-700">Order Taxable Subtotal</span>
          <span className="text-2xl font-bold tabular-nums text-slate-900">{formatINR(total)}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 bg-slate-50/70 p-5">
        <button type="button" className={buttonClass} onClick={onClose}>
          Cancel
        </button>
        {type === "purchase" && (
          <button
            type="button"
            className={buttonClass}
            disabled={!isValid || saving}
            onClick={() => submit(true)}
          >
            <Check size={16} />
            <span>Create & receive stock</span>
          </button>
        )}
        <button
          type="button"
          className={primaryClass}
          disabled={!isValid || saving}
          onClick={() => submit(false)}
        >
          {type === "sale" ? "Confirm sale & dispatch" : "Create purchase order"}
        </button>
      </div>
    </Overlay>
  )
}
