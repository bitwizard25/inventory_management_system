"use client"

import { useState } from "react"
import { Download } from "lucide-react"
import { toast } from "sonner"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { buttonClass, godowns } from "@/lib/constants"
import { formatINR } from "@/lib/format"
import type { Godown, InventoryItem, PurchaseOrder, SaleOrder } from "@/types/inventory"
import { MetricCard } from "@/components/ui/metric"
import { PageIntro } from "@/components/ui/page-intro"
import { Pills } from "@/components/ui/pills"
import { itemStatus } from "@/components/ui/status-badge"

interface ReportsViewProps {
  items: InventoryItem[]
  sales: SaleOrder[]
  purchases: PurchaseOrder[]
}

export function ReportsView({ items, sales, purchases }: ReportsViewProps) {
  const [tab, setTab] = useState<"Stock report" | "Sales report" | "Purchase report">("Stock report")
  const [godownFilter, setGodownFilter] = useState<"All godowns" | Godown>("All godowns")
  const [statusFilter, setStatusFilter] = useState<string>("All")

  const currentItems = items.filter((item) => godownFilter === "All godowns" || item.godown === godownFilter)
  const currentSales = sales.filter((sale) => statusFilter === "All" || sale.status === statusFilter)
  const currentPurchases = purchases.filter((po) => statusFilter === "All" || po.status === statusFilter)

  const stockChart = Object.entries(
    currentItems.reduce<Record<string, number>>((acc, item) => {
      acc[item.category] = (acc[item.category] ?? 0) + item.quantity * item.unitPrice
      return acc
    }, {})
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  const salesChart = Object.entries(
    currentSales.reduce<Record<string, number>>((acc, sale) => {
      const cust = sale.customer.split(" ")[0] ?? sale.customer
      acc[cust] = (acc[cust] ?? 0) + sale.totalAmount * 1.18
      return acc
    }, {})
  )
    .map(([name, revenue]) => ({ name, revenue }))
    .sort((a, b) => b.revenue - a.revenue)

  const purchaseChart = Object.entries(
    currentPurchases.reduce<Record<string, { pending: number; received: number }>>((acc, po) => {
      acc[po.supplier] ??= { pending: 0, received: 0 }
      acc[po.supplier][po.status === "Pending" ? "pending" : "received"] += po.totalAmount
      return acc
    }, {})
  ).map(([name, value]) => ({
    name: name.split(" ").slice(0, 2).join(" "),
    ...value,
  }))

  const rows =
    tab === "Stock report"
      ? currentItems.map((item) => [
          item.sku,
          item.name,
          item.category,
          item.godown,
          item.quantity,
          item.minLevel,
          item.quantity * item.unitPrice,
          itemStatus(item),
        ])
      : tab === "Sales report"
      ? currentSales.map((sale) => [
          sale.id,
          sale.customer,
          sale.date,
          sale.items.reduce((sum, line) => sum + line.quantity, 0),
          sale.totalAmount,
          sale.totalAmount * 0.18,
          sale.totalAmount * 1.18,
          sale.status,
        ])
      : currentPurchases.map((po) => [
          po.id,
          po.supplier,
          po.expectedDate,
          po.items.reduce((sum, line) => sum + line.quantity, 0),
          po.totalAmount,
          po.status,
        ])

  const exportCsv = () => {
    const headers =
      tab === "Stock report"
        ? ["SKU", "Item", "Category", "Godown", "Quantity", "Minimum level", "Stock value INR", "Status"]
        : tab === "Sales report"
        ? ["SO", "Customer", "Date", "Units", "Subtotal INR", "GST INR", "Grand total INR", "Status"]
        : ["PO", "Supplier", "Expected date", "Units", "Total INR", "Status"]

    const csv = [headers, ...rows]
      .map((row) => row.map((val) => `"${String(val).replaceAll('"', '""')}"`).join(","))
      .join("\r\n")

    const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `${tab.toLowerCase().replaceAll(" ", "-")}.csv`
    anchor.click()
    URL.revokeObjectURL(url)
    toast.success(`${tab} exported to CSV`)
  }

  const setTabClean = (val: "Stock report" | "Sales report" | "Purchase report") => {
    setTab(val)
    setStatusFilter("All")
    setGodownFilter("All godowns")
  }

  return (
    <div className="space-y-6">
      <PageIntro
        title="Reports & Analytics"
        description="Exportable fiscal audit reports, category valuations, and vendor spend."
      />

      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5E7EB]">
        <div className="flex gap-2">
          {(["Stock report", "Sales report", "Purchase report"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTabClean(t)}
              className={`border-b-2 px-4 py-2.5 text-[13px] font-medium transition-colors ${
                tab === t
                  ? "border-slate-900 text-slate-900 font-semibold"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <button type="button" onClick={exportCsv} className={buttonClass}>
          <Download size={14} />
          Export CSV
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {tab === "Stock report" ? (
          <Pills
            label="Godown"
            options={["All godowns", ...godowns] as const}
            value={godownFilter}
            onChange={setGodownFilter}
          />
        ) : (
          <Pills
            label="Status"
            options={
              tab === "Sales report"
                ? ["All", "Draft", "Confirmed", "Paid"]
                : ["All", "Pending", "Received"]
            }
            value={statusFilter}
            onChange={setStatusFilter}
          />
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {tab === "Stock report" ? (
          <>
            <MetricCard
              title="Stock valuation"
              value={formatINR(currentItems.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0))}
              note={`${currentItems.length} active SKUs`}
            />
            <MetricCard
              title="Units on hand"
              value={currentItems.reduce((sum, it) => sum + it.quantity, 0).toLocaleString("en-IN")}
              note="Across selected godowns"
            />
            <MetricCard
              title="Low stock count"
              value={currentItems.filter((it) => it.quantity <= it.minLevel).length}
              note="At or below minimum limit"
            />
          </>
        ) : tab === "Sales report" ? (
          <>
            <MetricCard
              title="Order revenue"
              value={formatINR(currentSales.reduce((sum, s) => sum + s.totalAmount, 0))}
              note={`${currentSales.length} total orders`}
            />
            <MetricCard
              title="GST (18% output)"
              value={formatINR(currentSales.reduce((sum, s) => sum + s.totalAmount * 0.18, 0))}
              note="Tax liability estimate"
            />
            <MetricCard
              title="Invoice total (incl. GST)"
              value={formatINR(currentSales.reduce((sum, s) => sum + s.totalAmount * 1.18, 0))}
              note="Gross customer receivables"
            />
          </>
        ) : (
          <>
            <MetricCard
              title="Purchase spend"
              value={formatINR(currentPurchases.reduce((sum, po) => sum + po.totalAmount, 0))}
              note={`${currentPurchases.length} vendor orders`}
            />
            <MetricCard
              title="Pending replenishment"
              value={formatINR(
                currentPurchases.filter((po) => po.status === "Pending").reduce((sum, po) => sum + po.totalAmount, 0)
              )}
              note="Awaiting warehouse GRN"
            />
            <MetricCard
              title="Delivered orders"
              value={currentPurchases.filter((po) => po.status === "Received").length}
              note="Verified by Nattu Kaka"
            />
          </>
        )}
      </div>

      <section className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-slate-900">
            {tab === "Stock report"
              ? "Stock value by product category"
              : tab === "Sales report"
              ? "Sales revenue distribution by client"
              : "Purchase spend by distributor and delivery status"}
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">Live graphical data aggregated in real time</p>
        </div>

        <div className="h-[280px] w-full">
          {tab === "Stock report" ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockChart} layout="vertical" margin={{ left: 10, right: 30, top: 8, bottom: 8 }}>
                <CartesianGrid stroke="#F1F5F9" horizontal={false} />
                <XAxis
                  type="number"
                  tickFormatter={(val) => `₹${(Number(val) / 1000).toFixed(0)}k`}
                  tick={{ fill: "#64748B", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={140}
                  tick={{ fill: "#334155", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(val) => formatINR(Number(val))}
                  contentStyle={{ borderRadius: 8, borderColor: "#E2E8F0", fontSize: 12 }}
                />
                <Bar dataKey="value" fill="#09090B" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          ) : tab === "Sales report" ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesChart} margin={{ left: 8, right: 15, top: 10, bottom: 20 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#09090B" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#09090B" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis
                  tickFormatter={(val) => `₹${(Number(val) / 1000).toFixed(0)}k`}
                  tick={{ fill: "#64748B", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(val) => formatINR(Number(val))}
                  contentStyle={{ borderRadius: 8, borderColor: "#E2E8F0", fontSize: 12 }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#09090B" strokeWidth={1.75} fill="url(#salesGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={purchaseChart} margin={{ left: 6, right: 15, top: 12, bottom: 20 }}>
                <CartesianGrid stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis
                  tickFormatter={(val) => `₹${(Number(val) / 1000).toFixed(0)}k`}
                  tick={{ fill: "#64748B", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(val) => formatINR(Number(val))}
                  contentStyle={{ borderRadius: 8, borderColor: "#E2E8F0", fontSize: 12 }}
                />
                <Bar dataKey="pending" name="Pending" stackId="a" fill="#D97706" barSize={24} />
                <Bar dataKey="received" name="Received" stackId="a" fill="#09090B" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="border-b border-[#E5E7EB] px-5 py-4">
          <h3 className="text-sm font-semibold text-slate-900">{tab} Detailed Records</h3>
          <p className="mt-0.5 text-xs text-slate-500">{rows.length} rows in active report view</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left">
            <thead className="bg-slate-50/80">
              <tr className="border-b border-[#E5E7EB] text-xs font-medium text-slate-500">
                {(tab === "Stock report"
                  ? ["SKU", "Item", "Category", "Godown", "Quantity", "Min Level", "Valuation", "Status"]
                  : tab === "Sales report"
                  ? ["SO#", "Customer", "Date", "Units", "Subtotal", "GST (18%)", "Grand Total", "Status"]
                  : ["PO#", "Supplier", "Expected Date", "Units", "Total Amount", "Status"]
                ).map((heading) => (
                  <th
                    key={heading}
                    className={`px-4 py-3 whitespace-nowrap ${
                      ["Quantity", "Min Level", "Valuation", "Units", "Subtotal", "GST (18%)", "Grand Total", "Total Amount"].includes(
                        heading
                      )
                        ? "text-right"
                        : "text-left"
                    }`}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {rows.map((row, index) => (
                <tr key={index} className="hover:bg-slate-50/60 transition-colors text-[13px]">
                  {row.map((cell, cIndex) => {
                    const isCurrency =
                      typeof cell === "number" &&
                      ((tab === "Stock report" && cIndex === 6) ||
                        (tab === "Sales report" && [4, 5, 6].includes(cIndex)) ||
                        (tab === "Purchase report" && cIndex === 4))

                    return (
                      <td
                        key={cIndex}
                        className={`px-4 py-3 whitespace-nowrap ${
                          typeof cell === "number" ? "text-right tabular-nums" : ""
                        } ${cIndex === 0 ? "font-mono text-xs text-slate-600 font-semibold" : "text-slate-800"}`}
                      >
                        {isCurrency ? formatINR(cell as number) : String(cell)}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
