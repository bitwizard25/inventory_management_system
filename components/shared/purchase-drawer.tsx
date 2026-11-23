"use client"

import { Check, X } from "lucide-react"
import { primaryClass } from "@/lib/constants"
import { dateLabel, formatINR } from "@/lib/format"
import { useInventory } from "@/hooks/use-inventory"
import { Metric } from "@/components/ui/metric"
import { StatusBadge } from "@/components/ui/status-badge"

interface PurchaseDrawerProps {
  purchaseId: string
  onClose: () => void
  onReceive: (id: string) => void
}

export function PurchaseDrawer({ purchaseId, onClose, onReceive }: PurchaseDrawerProps) {
  const { purchases, suppliers } = useInventory()
  const po = purchases.find((entry) => entry.id === purchaseId)

  if (!po) return null

  const supplierObj = suppliers.find(
    (s) => s.id === po.supplierId || s.name.toLowerCase() === po.supplier.toLowerCase()
  )

  const subtotal = po.subtotal ?? po.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const taxAmount = po.taxAmount ?? Math.round(subtotal * 0.18)
  const totalAmount = po.totalAmount ?? subtotal + taxAmount

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
        aria-label="Purchase order details"
        className="flex h-full w-full max-w-[560px] flex-col border-l border-slate-200/80 bg-white shadow-2xl animate-in slide-in-from-right duration-200 ease-out motion-reduce:transition-none"
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <p className="font-mono text-xs tabular-nums text-slate-700 font-bold">{po.id}</p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">Purchase Order</h2>
            <p className="mt-1 text-[13px] text-slate-600">{po.supplier}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close purchase order"
            className="flex size-11 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-2 gap-3.5">
            <Metric label="Distributor" value={po.supplier} />
            <Metric label="Expected Delivery" value={dateLabel(po.expectedDate)} />
            <Metric label="Total Order Value" value={formatINR(totalAmount)} />
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">Status</p>
              <div className="mt-1.5">
                <StatusBadge status={po.status} />
              </div>
            </div>
          </div>

          {supplierObj && (
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 text-[13px] text-slate-700 space-y-1">
              <p className="font-bold text-slate-900">Distributor Information</p>
              <p>City: {supplierObj.city} · Ph: {supplierObj.phone}</p>
              <p className="font-mono text-xs font-semibold text-slate-800">GSTIN: {supplierObj.gstin}</p>
            </div>
          )}

          <div>
            <h3 className="text-[15px] font-bold text-slate-900 mb-3">Line items ({po.items.length})</h3>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {po.items.map((line) => (
                <div key={line.itemId} className="flex items-center justify-between p-4 hover:bg-slate-50/60 transition-colors">
                  <div>
                    <p className="text-[14px] font-semibold text-slate-900">{line.itemName}</p>
                    <p className="mt-0.5 font-mono text-xs text-slate-500">
                      {line.sku} · {line.quantity} units @ {formatINR(line.unitPrice)}
                    </p>
                  </div>
                  <span className="text-[14px] font-bold tabular-nums text-slate-900">
                    {formatINR(line.quantity * line.unitPrice)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/80 p-5 bg-white space-y-2.5 text-[14px]">
            <div className="flex justify-between text-slate-600">
              <span>Taxable Subtotal</span>
              <span className="tabular-nums font-semibold text-slate-900">{formatINR(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>GST (18% input credit)</span>
              <span className="tabular-nums font-semibold text-slate-900">{formatINR(taxAmount)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2.5 font-bold text-slate-900 text-base">
              <span>Grand Total</span>
              <span className="tabular-nums">{formatINR(totalAmount)}</span>
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
              <Check size={16} />
              <span>Mark purchase received (Update Stock)</span>
            </button>
          )}
        </div>
      </aside>
    </div>
  )
}
