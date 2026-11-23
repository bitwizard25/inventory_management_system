"use client"

import { useState } from "react"
import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight, Printer, X } from "lucide-react"
import { buttonClass, primaryClass } from "@/lib/constants"
import { dateLabel, formatINR, timeLabel } from "@/lib/format"
import { useInventory } from "@/hooks/use-inventory"
import { Metric } from "@/components/ui/metric"
import { StatusBadge } from "@/components/ui/status-badge"

interface DetailDrawerProps {
  drawer:
    | { type: "stock"; id: string }
    | { type: "purchase"; id: string }
    | { type: "sale"; id: string }
  onClose: () => void
  onReceive: (id: string) => void
  onAdjust: (id: string, delta: number, note: string) => boolean
  onPaid: (id: string) => void
}

export function DetailDrawer({
  drawer,
  onClose,
  onReceive,
  onAdjust,
  onPaid,
}: DetailDrawerProps) {
  const { items, movements, purchases, sales } = useInventory()
  const item = drawer.type === "stock" ? items.find((entry) => entry.id === drawer.id) : undefined
  const po = drawer.type === "purchase" ? purchases.find((entry) => entry.id === drawer.id) : undefined
  const sale = drawer.type === "sale" ? sales.find((entry) => entry.id === drawer.id) : undefined

  const [direction, setDirection] = useState<"Add" | "Remove">("Add")
  const [qty, setQty] = useState(1)
  const [note, setNote] = useState("")

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/20 backdrop-blur-[1px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={item ? "Stock item details" : po ? "Purchase order details" : "Tax invoice details"}
        className={`flex h-full w-full max-w-[540px] flex-col border-l border-[#E5E7EB] bg-white shadow-2xl ${
          sale ? "print:static print:max-w-none print:shadow-none print:border-none" : ""
        }`}
      >
        <div className="flex items-start justify-between border-b border-[#E5E7EB] px-6 py-5 print:hidden">
          <div>
            {item && (
              <>
                <p className="font-mono text-xs tabular-nums text-slate-500">{item.sku}</p>
                <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">{item.name}</h2>
                <p className="mt-0.5 text-[13px] text-slate-500">{item.godown} · {item.category}</p>
              </>
            )}
            {po && (
              <>
                <p className="font-mono text-xs tabular-nums text-slate-500">{po.id}</p>
                <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">Purchase Order</h2>
                <p className="mt-0.5 text-[13px] text-slate-500">{po.supplier}</p>
              </>
            )}
            {sale && (
              <>
                <p className="text-xs font-medium text-slate-500">Gada Electronics · Tax invoice</p>
                <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">Invoice {sale.id}</h2>
                <p className="mt-0.5 text-[13px] text-slate-500">{sale.customer} · {dateLabel(sale.date)}</p>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors print:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {item && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Metric label="Current stock" value={`${item.quantity} ${item.unit}`} />
                <Metric label="Minimum level" value={`${item.minLevel} ${item.unit}`} />
                <Metric label="Godown" value={item.godown} />
                <Metric label="Stock valuation" value={formatINR(item.quantity * item.unitPrice)} />
              </div>

              <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                <h3 className="text-[13px] font-semibold text-slate-900">Quick stock adjustment</h3>
                <p className="mt-0.5 text-xs text-slate-500">Record physical audit discrepancies or adjustments</p>
                <div className="mt-3 grid grid-cols-[110px_1fr] gap-3">
                  <label className="text-xs font-medium text-slate-600">
                    Action
                    <div className="mt-1.5 flex rounded-lg border border-[#E5E7EB] p-0.5 bg-slate-50">
                      <button
                        type="button"
                        onClick={() => setDirection("Add")}
                        className={`flex-1 rounded-md py-1 text-xs font-medium transition-all ${
                          direction === "Add"
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-500 hover:text-slate-900"
                        }`}
                      >
                        + Add
                      </button>
                      <button
                        type="button"
                        onClick={() => setDirection("Remove")}
                        className={`flex-1 rounded-md py-1 text-xs font-medium transition-all ${
                          direction === "Remove"
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-500 hover:text-slate-900"
                        }`}
                      >
                        - Deduct
                      </button>
                    </div>
                  </label>
                  <label className="text-xs font-medium text-slate-600">
                    Units
                    <input
                      type="number"
                      min="1"
                      value={qty}
                      onChange={(event) => setQty(Math.max(1, Number(event.target.value)))}
                      className="mt-1.5 h-9 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-[13px] tabular-nums outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                    />
                  </label>
                </div>
                <label className="mt-3 block text-xs font-medium text-slate-600">
                  Reason / note
                  <input
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="e.g. Verified & stocked by Nattu Kaka"
                    className="mt-1.5 h-9 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-[13px] outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
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

              <div>
                <h3 className="text-[13px] font-semibold text-slate-900">Stock movement history</h3>
                <p className="mt-0.5 text-xs text-slate-500">Chronological ledger for {item.sku}</p>
                <div className="mt-4 space-y-3">
                  {movements
                    .filter((entry) => entry.itemId === item.id)
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .map((entry) => {
                      const plus = entry.delta > 0
                      return (
                        <div
                          key={entry.id}
                          className="relative flex items-start gap-3 rounded-lg border border-[#E5E7EB] bg-slate-50/40 p-3"
                        >
                          <span
                            className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full ${
                              entry.type === "TRANSFER"
                                ? "bg-blue-50 text-blue-600"
                                : plus
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-rose-50 text-rose-600"
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
                              <span className="text-xs font-semibold text-slate-900">
                                {entry.type === "PURCHASE"
                                  ? "Purchase received"
                                  : entry.type === "SALE"
                                  ? "Sale dispatched"
                                  : entry.type === "TRANSFER"
                                  ? "Godown transfer"
                                  : "Stock adjustment"}
                              </span>
                              <span
                                className={`text-xs font-semibold tabular-nums ${
                                  plus ? "text-emerald-700" : "text-rose-700"
                                }`}
                              >
                                {plus ? "+" : ""}
                                {entry.delta} units
                              </span>
                            </div>
                            <p className="mt-0.5 text-[11px] font-mono text-slate-500">
                              {entry.referenceId} · Balance {entry.resultingQty} units
                            </p>
                            <p className="mt-1 text-xs text-slate-600">{entry.note}</p>
                            <p className="mt-1 text-[11px] text-slate-400">{timeLabel(entry.timestamp)}</p>
                          </div>
                        </div>
                      )
                    })}
                  {!movements.some((entry) => entry.itemId === item.id) && (
                    <p className="text-xs text-slate-400 py-3 text-center">No stock movements recorded yet.</p>
                  )}
                </div>
              </div>
            </>
          )}

          {po && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Metric label="Supplier" value={po.supplier} />
                <Metric label="Expected date" value={dateLabel(po.expectedDate)} />
                <Metric label="Total amount" value={formatINR(po.totalAmount)} />
                <div className="rounded-xl border border-[#E5E7EB] p-3.5 bg-slate-50/50">
                  <p className="text-xs text-slate-500 font-medium">Status</p>
                  <div className="mt-1">
                    <StatusBadge status={po.status} />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-[13px] font-semibold text-slate-900 mb-3">Line items ({po.items.length})</h3>
                <div className="divide-y divide-[#E5E7EB] border border-[#E5E7EB] rounded-xl overflow-hidden">
                  {po.items.map((line) => (
                    <div key={line.itemId} className="flex items-center justify-between p-3.5 hover:bg-slate-50/50">
                      <div>
                        <p className="text-[13px] font-medium text-slate-900">{line.itemName}</p>
                        <p className="mt-0.5 font-mono text-xs text-slate-500">
                          {line.sku} · {line.quantity} units
                        </p>
                      </div>
                      <span className="text-[13px] font-semibold tabular-nums text-slate-900">
                        {formatINR(line.quantity * line.unitPrice)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {po.status === "Pending" && (
                <button
                  type="button"
                  className={`${primaryClass} mt-6 w-full`}
                  onClick={(event) => {
                    event.stopPropagation()
                    onReceive(po.id)
                  }}
                >
                  Mark purchase received (Update Stock)
                </button>
              )}
            </>
          )}

          {sale && (
            <div className="invoice-content">
              <div className="flex items-start justify-between border-b border-[#E5E7EB] pb-5">
                <div>
                  <p className="text-lg font-bold tracking-tight text-slate-900">Gada Electronics</p>
                  <p className="mt-0.5 text-xs text-slate-500">Consumer Electronics & Appliances Store</p>
                  <p className="text-xs text-slate-500">Goregaon East, Mumbai · GSTIN 27AABCG1234F1Z5</p>
                </div>
                <StatusBadge status={sale.status} />
              </div>

              <div className="grid grid-cols-2 gap-4 py-5 text-[13px]">
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Bill to</p>
                  <p className="mt-1 font-semibold text-slate-900">{sale.customer}</p>
                  <p className="text-xs text-slate-500">Gokuldham Co-op Housing Society</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Invoice number</p>
                  <p className="mt-1 font-mono font-semibold text-slate-900">{sale.id}</p>
                  <p className="text-xs text-slate-500">Invoice date: {dateLabel(sale.date)}</p>
                </div>
              </div>

              <table className="w-full text-left text-xs border border-[#E5E7EB] rounded-xl overflow-hidden">
                <thead className="bg-slate-50">
                  <tr className="border-b border-[#E5E7EB] text-slate-500">
                    <th className="py-2.5 px-3 font-medium">Item & SKU</th>
                    <th className="py-2.5 px-3 text-right font-medium">Qty</th>
                    <th className="py-2.5 px-3 text-right font-medium">Rate</th>
                    <th className="py-2.5 px-3 text-right font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {sale.items.map((entry) => (
                    <tr key={entry.itemId} className="text-[13px]">
                      <td className="py-2.5 px-3">
                        <p className="font-medium text-slate-900">{entry.itemName}</p>
                        <p className="font-mono text-xs text-slate-400">{entry.sku}</p>
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums">{entry.quantity}</td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-slate-600">{formatINR(entry.unitPrice)}</td>
                      <td className="py-2.5 px-3 text-right font-medium tabular-nums text-slate-900">
                        {formatINR(entry.quantity * entry.unitPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="ml-auto mt-4 max-w-[240px] space-y-2 text-[13px]">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span className="tabular-nums font-medium text-slate-900">{formatINR(sale.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>GST (18%)</span>
                  <span className="tabular-nums font-medium text-slate-900">{formatINR(sale.totalAmount * 0.18)}</span>
                </div>
                <div className="flex justify-between border-t border-[#E5E7EB] pt-2 font-semibold text-slate-900">
                  <span>Grand total</span>
                  <span className="tabular-nums">{formatINR(sale.totalAmount * 1.18)}</span>
                </div>
              </div>

              <p className="mt-8 border-t border-[#E5E7EB] pt-4 text-xs text-slate-400">
                Authorized signatory: Jethalal Champaklal Gada · Thank you for your business!
              </p>
            </div>
          )}
        </div>

        {(item || sale) && (
          <div className="flex gap-2 border-t border-[#E5E7EB] p-4 print:hidden">
            {sale && (
              <button
                type="button"
                className={buttonClass}
                onClick={() => window.print()}
              >
                <Printer size={15} />
                Print / Save PDF
              </button>
            )}
            {sale?.status === "Confirmed" && (
              <button
                type="button"
                className={`${primaryClass} flex-1`}
                onClick={(event) => {
                  event.stopPropagation()
                  onPaid(sale.id)
                }}
              >
                Mark as paid
              </button>
            )}
          </div>
        )}
      </aside>
    </div>
  )
}
