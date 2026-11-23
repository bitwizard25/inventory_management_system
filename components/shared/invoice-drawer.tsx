"use client"

import { Check, Printer, X } from "lucide-react"
import { buttonClass, primaryClass } from "@/lib/constants"
import { dateLabel, formatINR } from "@/lib/format"
import { SELLER_METADATA } from "@/data/seed"
import { useInventory } from "@/hooks/use-inventory"
import { StatusBadge } from "@/components/ui/status-badge"

interface InvoiceDrawerProps {
  saleId: string
  onClose: () => void
  onPaid: (id: string) => void
}

export function InvoiceDrawer({ saleId, onClose, onPaid }: InvoiceDrawerProps) {
  const { sales, customers } = useInventory()
  const sale = sales.find((entry) => entry.id === saleId)

  if (!sale) return null

  const customerObj = customers.find(
    (c) => c.id === sale.customerId || c.name.toLowerCase() === sale.customer.toLowerCase()
  )

  const subtotal = sale.subtotal ?? sale.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const gstRate = sale.gstRate ?? 18
  const taxAmount = sale.taxAmount ?? Math.round(subtotal * (gstRate / 100))
  const totalAmount = sale.totalAmount ?? subtotal + taxAmount

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
        aria-label="Tax invoice details"
        className="flex h-full w-full max-w-[580px] flex-col border-l border-slate-200/80 bg-white shadow-2xl ring-1 ring-slate-900/5 animate-in slide-in-from-right duration-200 ease-out motion-reduce:transition-none print:static print:max-w-none print:shadow-none print:border-none"
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5 print:hidden">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tax Invoice & Dispatch Note</p>
            <h2 className="mt-1 text-xl font-bold tracking-[-0.025em] leading-tight text-slate-900">Invoice {sale.id}</h2>
            <p className="mt-1 text-[13px] text-slate-500">
              {sale.customer} · {dateLabel(sale.date)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close invoice"
            className="flex size-11 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 active:scale-[0.98] transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="invoice-content rounded-xl border border-slate-200/80 p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <div className="flex items-start justify-between border-b border-slate-200 pb-5">
              <div>
                <p className="text-xl font-bold tracking-[-0.025em] leading-tight text-slate-900">{SELLER_METADATA.name}</p>
                <p className="mt-0.5 text-xs text-slate-500">{SELLER_METADATA.tagline}</p>
                <p className="text-xs text-slate-600 mt-1">{SELLER_METADATA.address}</p>
                <p className="text-xs text-slate-700 mt-0.5 font-medium">
                  GSTIN: <span className="font-mono font-bold text-slate-900">{SELLER_METADATA.gstin}</span> · Ph: {SELLER_METADATA.phone}
                </p>
              </div>
              <StatusBadge status={sale.status} />
            </div>

            <div className="grid grid-cols-2 gap-4 py-5 text-[14px]">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Billed to</p>
                <p className="mt-1 font-bold text-slate-900">{sale.customer}</p>
                {customerObj && (
                  <>
                    <p className="text-xs text-slate-600">{customerObj.city}</p>
                    <p className="text-xs text-slate-600">Ph: {customerObj.phone}</p>
                    <p className="mt-0.5 font-mono text-xs font-medium text-slate-600">
                      GSTIN: {customerObj.gstin}
                    </p>
                  </>
                )}
                {!customerObj && (
                  <p className="text-xs text-slate-500">Gokuldham Co-op Housing Society, Mumbai</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Invoice details</p>
                <p className="mt-1 font-mono font-bold text-slate-900">{sale.id}</p>
                <p className="text-xs text-slate-600 mt-0.5">Date: {dateLabel(sale.date)}</p>
                <p className="text-xs text-slate-600">Place of supply: 27-Maharashtra</p>
              </div>
            </div>

            <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-3.5">Item & SKU</th>
                  <th className="py-3 px-3.5 text-right">Qty</th>
                  <th className="py-3 px-3.5 text-right">Unit Rate</th>
                  <th className="py-3 px-3.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sale.items.map((entry) => (
                  <tr key={entry.itemId} className="text-[13px]">
                    <td className="py-3 px-3.5">
                      <p className="font-semibold text-slate-900">{entry.itemName}</p>
                      <p className="font-mono text-xs text-slate-500">{entry.sku}</p>
                    </td>
                    <td className="py-3 px-3.5 text-right tabular-nums font-medium">{entry.quantity}</td>
                    <td className="py-3 px-3.5 text-right tabular-nums text-slate-700">{formatINR(entry.unitPrice)}</td>
                    <td className="py-3 px-3.5 text-right font-bold tabular-nums text-slate-900">
                      {formatINR(entry.quantity * entry.unitPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="ml-auto mt-5 max-w-[280px] space-y-2 text-[14px]">
              <div className="flex justify-between text-slate-600">
                <span>Taxable Subtotal</span>
                <span className="tabular-nums font-semibold text-slate-900">{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST ({gstRate}%)</span>
                <span className="tabular-nums font-semibold text-slate-900">{formatINR(taxAmount)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2.5 font-bold text-slate-900 text-base">
                <span>Grand Total</span>
                <span className="tabular-nums">{formatINR(totalAmount)}</span>
              </div>
            </div>

            <div className="mt-8 border-t border-slate-200 pt-4 flex items-center justify-between text-xs text-slate-600">
              <div>
                <p className="font-bold text-slate-800">Authorized Signatory</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{SELLER_METADATA.owner} · Gada Electronics</p>
              </div>
              <p className="text-[11px] text-slate-500 italic">Thank you for your business!</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 border-t border-slate-200 p-5 print:hidden">
          <button
            type="button"
            className={buttonClass}
            onClick={() => window.print()}
          >
            <Printer size={16} />
            <span>Print / Save PDF</span>
          </button>
          {sale.status === "Confirmed" && (
            <button
              type="button"
              className={`${primaryClass} flex-1`}
              onClick={(event) => {
                event.stopPropagation()
                onPaid(sale.id)
              }}
            >
              <Check size={16} />
              <span>Mark as paid</span>
            </button>
          )}
        </div>
      </aside>
    </div>
  )
}
