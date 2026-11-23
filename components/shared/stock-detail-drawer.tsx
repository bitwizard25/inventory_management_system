"use client"

import { useState } from "react"
import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight, User, X } from "lucide-react"
import { primaryClass } from "@/lib/constants"
import { formatINR, timeLabel } from "@/lib/format"
import { useInventory } from "@/hooks/use-inventory"
import { Metric } from "@/components/ui/metric"

interface StockDetailDrawerProps {
  itemId: string
  onClose: () => void
  onAdjust: (id: string, delta: number, note: string) => boolean
}

export function StockDetailDrawer({ itemId, onClose, onAdjust }: StockDetailDrawerProps) {
  const { items, movements } = useInventory()
  const item = items.find((entry) => entry.id === itemId)

  const [direction, setDirection] = useState<"Add" | "Remove">("Add")
  const [qty, setQty] = useState(1)
  const [note, setNote] = useState("")

  if (!item) return null

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm transition-opacity duration-200 motion-reduce:transition-none"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Stock item details"
        className="flex h-full w-full max-w-[560px] flex-col border-l border-slate-200/80 bg-white shadow-2xl ring-1 ring-slate-900/5 animate-in slide-in-from-right duration-200 ease-out motion-reduce:transition-none"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <p className="font-mono text-xs tabular-nums text-slate-600 font-medium">{item.sku}</p>
            <h2 className="mt-1 text-xl font-bold tracking-[-0.025em] leading-tight text-slate-900">{item.name}</h2>
            <p className="mt-1 text-[13px] text-slate-500">
              {item.godown} · {item.category}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="flex size-11 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 active:scale-[0.98] transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-2 gap-3.5">
            <Metric label="Current Stock" value={`${item.quantity} ${item.unit}`} />
            <Metric label="Safety Minimum" value={`${item.minLevel} ${item.unit}`} />
            <Metric label="Godown Location" value={item.godown} />
            <Metric label="Stock Valuation" value={formatINR(item.quantity * item.unitPrice)} />
          </div>

          {/* Quick Adjustment Card: rounded-xl container */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <h3 className="text-[15px] font-bold tracking-[-0.025em] leading-tight text-slate-900">Physical Audit Adjustment</h3>
            <p className="mt-0.5 text-[13px] text-slate-500">Reconcile counts or record physical damage</p>
            <div className="mt-4 grid grid-cols-[130px_1fr] gap-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Action
                <div className="mt-1.5 flex min-h-[44px] rounded-lg border border-slate-300 p-1 bg-slate-100/70">
                  <button
                    type="button"
                    onClick={() => setDirection("Add")}
                    className={`flex-1 rounded-md py-1.5 text-xs font-bold transition-all duration-200 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 ${
                      direction === "Add"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600 hover:text-slate-950"
                    }`}
                  >
                    + Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setDirection("Remove")}
                    className={`flex-1 rounded-md py-1.5 text-xs font-bold transition-all duration-200 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 ${
                      direction === "Remove"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600 hover:text-slate-950"
                    }`}
                  >
                    - Deduct
                  </button>
                </div>
              </label>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Units
                <input
                  type="number"
                  min="1"
                  value={qty}
                  onChange={(event) => setQty(Math.max(1, Number(event.target.value)))}
                  className="mt-1.5 min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3.5 text-[16px] tabular-nums outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900 hover:border-slate-500"
                />
              </label>
            </div>
            <label className="mt-3.5 block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Reason / note
              <input
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="e.g. Audit verified by Nattu Kaka"
                className="mt-1.5 min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3.5 text-[16px] outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900 hover:border-slate-500"
              />
            </label>
            <button
              type="button"
              className={`${primaryClass} mt-4 w-full`}
              onClick={() => {
                if (onAdjust(item.id, direction === "Add" ? qty : -qty, note)) {
                  setQty(1)
                  setNote("")
                }
              }}
            >
              Save adjustment
            </button>
          </div>

          {/* Historical Ledger Timeline */}
          <div>
            <h3 className="text-[15px] font-bold text-slate-900">Chronological Ledger History</h3>
            <p className="mt-0.5 text-[13px] text-slate-600">Immutable audit record for {item.sku}</p>
            <div className="mt-3.5 space-y-3">
              {movements
                .filter((entry) => entry.itemId === item.id)
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .map((entry) => {
                  const plus = entry.delta > 0
                  return (
                    <div
                      key={entry.id}
                      className="relative flex items-start gap-3.5 rounded-lg border border-slate-200/80 bg-slate-50/60 p-3.5"
                    >
                      <span
                        className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md ${
                          entry.type === "TRANSFER"
                            ? "bg-blue-500/10 text-blue-700 ring-1 ring-inset ring-blue-500/20"
                            : plus
                            ? "bg-emerald-500/10 text-emerald-700 ring-1 ring-inset ring-emerald-500/20"
                            : "bg-rose-500/10 text-rose-700 ring-1 ring-inset ring-rose-500/20"
                        }`}
                      >
                        {entry.type === "TRANSFER" ? (
                          <ArrowLeftRight size={14} />
                        ) : plus ? (
                          <ArrowDownLeft size={14} />
                        ) : (
                          <ArrowUpRight size={14} />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[13px] font-bold text-slate-900">
                            {entry.type === "PURCHASE"
                              ? "Purchase received"
                              : entry.type === "SALE"
                              ? "Sale dispatched"
                              : entry.type === "TRANSFER"
                              ? "Godown transfer"
                              : "Stock adjustment"}
                          </span>
                          <span
                            className={`text-xs font-bold tabular-nums ${
                              plus ? "text-emerald-700" : "text-rose-700"
                            }`}
                          >
                            {plus ? "+" : ""}
                            {entry.delta} units
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-slate-700">
                            {entry.referenceId} · Bal: {entry.resultingQty}
                          </span>
                          {entry.performedBy && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-slate-200/60 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                              <User size={11} className="text-slate-500" />
                              {entry.performedBy}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-[13px] text-slate-600">{entry.note}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{timeLabel(entry.timestamp)}</p>
                      </div>
                    </div>
                  )
                })}
              {!movements.some((entry) => entry.itemId === item.id) && (
                <p className="text-xs text-slate-500 py-4 text-center">No stock movements recorded yet.</p>
              )}
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}
