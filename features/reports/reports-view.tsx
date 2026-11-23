"use client"

import { useState } from "react"
import { Download } from "lucide-react"
import { toast } from "sonner"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { godowns, primaryClass } from "@/lib/constants"
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
  const [tab, setTab] = useState<"Stock valuation" | "Sales & GST revenue" | "Distributor spend">("Stock valuation")
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
      acc[cust] = (acc[cust] ?? 0) + sale.totalAmount
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
    tab === "Stock valuation"
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
      : tab === "Sales & GST revenue"
      ? currentSales.map((sale) => [
          sale.id,
          sale.customer,
          sale.date,
          sale.items.reduce((sum, line) => sum + line.quantity, 0),
          sale.subtotal,
          sale.taxAmount,
          sale.totalAmount,
          sale.status,
        ])
      : currentPurchases.map((po) => [
          po.id,
          po.supplier,
          po.expectedDate,
          po.items.reduce((sum, line) => sum + line.quantity, 0),
          po.subtotal,
          po.taxAmount,
          po.totalAmount,
          po.status,
        ])

  const exportCsv = () => {
    const headers =
      tab === "Stock valuation"
        ? ["SKU", "Item", "Category", "Godown", "Quantity", "Minimum level", "Stock value INR", "Status"]
        : tab === "Sales & GST revenue"
        ? ["SO", "Customer", "Date", "Units", "Subtotal INR", "GST (18%) INR", "Grand total INR", "Status"]
        : ["PO", "Supplier", "Expected date", "Units", "Subtotal INR", "GST INR", "Grand total INR", "Status"]

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
    toast.success(`${tab} exported successfully to CSV`)
  }

  const setTabClean = (val: "Stock valuation" | "Sales & GST revenue" | "Distributor spend") => {
    setTab(val)
    setStatusFilter("All")
    setGodownFilter("All godowns")
  }

  return (
    <div className="space-y-6">
      {/* 1. Page Title & Action: Symmetrical height and spacing */}
      <PageIntro
        title="Fiscal Reports & Analytics"
        description="Comprehensive inventory valuations, GST tax liabilities, and vendor procurement spend."
        action={
          <button type="button" onClick={exportCsv} className={primaryClass}>
            <Download size={16} />
            <span>Export CSV</span>
          </button>
        }
      />

      {/* 2. Sub-Navigation Tabs & Segmented Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1.5">
          {(["Stock valuation", "Sales & GST revenue", "Distributor spend"] as const).map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => setTabClean(label)}
              className={`min-h-[44px] whitespace-nowrap rounded-lg px-4 py-2 text-[14px] font-medium transition-all duration-200 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 ${
                tab === label
                  ? "bg-[#09090B] text-white shadow-sm font-semibold"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "Stock valuation" ? (
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
              tab === "Sales & GST revenue"
                ? ["All", "Draft", "Confirmed", "Paid"]
                : ["All", "Pending", "Received"]
            }
            value={statusFilter}
            onChange={setStatusFilter}
          />
        )}
      </div>

      {/* 3. Recharts Analytics Panel: rounded-xl container */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="mb-4">
          <h3 className="text-[15px] font-bold tracking-[-0.025em] leading-tight text-slate-900">
            {tab === "Stock valuation"
              ? "Valuation by Product Category"
              : tab === "Sales & GST revenue"
              ? "Gross Revenue by Client"
              : "Procurement Spend by Vendor"}
          </h3>
          <p className="mt-0.5 text-[13px] text-slate-500">Live breakdown calculated in Indian Rupees (₹)</p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {tab === "Stock valuation" ? (
              <BarChart data={stockChart} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#475569" }} tickLine={false} />
                <YAxis
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 12, fill: "#475569" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(val: any) => [formatINR(Number(val ?? 0)), "Value"]}
                  contentStyle={{
                    backgroundColor: "#09090B",
                    borderRadius: "8px",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
                    fontSize: "13px",
                    padding: "8px 12px",
                  }}
                  itemStyle={{ color: "#F8FAFC" }}
                  labelStyle={{ color: "#94A3B8", fontWeight: 600, marginBottom: "4px" }}
                  cursor={{ fill: "rgba(15, 23, 42, 0.04)" }}
                />
                <Bar dataKey="value" fill="#09090B" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : tab === "Sales & GST revenue" ? (
              <AreaChart data={salesChart} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#475569" }} tickLine={false} />
                <YAxis
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 12, fill: "#475569" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(val: any) => [formatINR(Number(val ?? 0)), "Revenue"]}
                  contentStyle={{
                    backgroundColor: "#09090B",
                    borderRadius: "8px",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
                    fontSize: "13px",
                    padding: "8px 12px",
                  }}
                  itemStyle={{ color: "#F8FAFC" }}
                  labelStyle={{ color: "#94A3B8", fontWeight: 600, marginBottom: "4px" }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#09090B" fill="#F1F5F9" strokeWidth={2.5} />
              </AreaChart>
            ) : (
              <BarChart data={purchaseChart} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#475569" }} tickLine={false} />
                <YAxis
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 12, fill: "#475569" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(val: any) => [formatINR(Number(val ?? 0))]}
                  contentStyle={{
                    backgroundColor: "#09090B",
                    borderRadius: "8px",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
                    fontSize: "13px",
                    padding: "8px 12px",
                  }}
                  itemStyle={{ color: "#F8FAFC" }}
                  labelStyle={{ color: "#94A3B8", fontWeight: 600, marginBottom: "4px" }}
                  cursor={{ fill: "rgba(15, 23, 42, 0.04)" }}
                />
                <Bar dataKey="received" stackId="a" fill="#09090B" radius={[0, 0, 0, 0]} name="Received" />
                <Bar dataKey="pending" stackId="a" fill="#64748B" radius={[4, 4, 0, 0]} name="Pending" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. KPI Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {tab === "Stock valuation" ? (
          <>
            <MetricCard
              title="Catalog Items"
              value={`${currentItems.length} SKUs`}
              note={`${godownFilter}`}
            />
            <MetricCard
              title="Total Quantity"
              value={`${currentItems.reduce((sum, item) => sum + item.quantity, 0)} units`}
              note="Across selected locations"
            />
            <MetricCard
              title="Portfolio Valuation"
              value={formatINR(currentItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0))}
              note="At current retail pricing"
            />
          </>
        ) : tab === "Sales & GST revenue" ? (
          <>
            <MetricCard
              title="Taxable Subtotal"
              value={formatINR(currentSales.reduce((sum, s) => sum + s.subtotal, 0))}
              note={`${currentSales.length} total orders`}
            />
            <MetricCard
              title="GST (18% output)"
              value={formatINR(currentSales.reduce((sum, s) => sum + s.taxAmount, 0))}
              note="Tax liability collected"
            />
            <MetricCard
              title="Gross Invoice Total"
              value={formatINR(currentSales.reduce((sum, s) => sum + s.totalAmount, 0))}
              note="Total customer receivables"
            />
          </>
        ) : (
          <>
            <MetricCard
              title="Total Spend (incl. GST)"
              value={formatINR(currentPurchases.reduce((sum, po) => sum + po.totalAmount, 0))}
              note={`${currentPurchases.length} vendor orders`}
            />
            <MetricCard
              title="Pending Inflow"
              value={formatINR(
                currentPurchases.filter((po) => po.status === "Pending").reduce((sum, po) => sum + po.totalAmount, 0)
              )}
              note="Awaiting warehouse GRN"
            />
            <MetricCard
              title="Received Orders"
              value={currentPurchases.filter((po) => po.status === "Received").length}
              note="Verified by Nattu Kaka"
            />
          </>
        )}
      </div>

      {/* 5. Detailed Breakdown Table: rounded-xl container */}
      <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead className="bg-slate-50/80">
              <tr className="border-b border-slate-200/80 text-xs font-semibold uppercase tracking-wider text-slate-600">
                {tab === "Stock valuation" ? (
                  <>
                    <th className="px-5 py-3.5 whitespace-nowrap">SKU</th>
                    <th className="px-5 py-3.5 whitespace-nowrap">Product</th>
                    <th className="px-5 py-3.5 whitespace-nowrap">Category</th>
                    <th className="px-5 py-3.5 whitespace-nowrap">Godown</th>
                    <th className="px-5 py-3.5 text-right whitespace-nowrap">Quantity</th>
                    <th className="px-5 py-3.5 text-right whitespace-nowrap">Min Level</th>
                    <th className="px-5 py-3.5 text-right whitespace-nowrap">Valuation</th>
                    <th className="px-5 py-3.5 whitespace-nowrap">Status</th>
                  </>
                ) : tab === "Sales & GST revenue" ? (
                  <>
                    <th className="px-5 py-3.5 whitespace-nowrap">Invoice#</th>
                    <th className="px-5 py-3.5 whitespace-nowrap">Customer</th>
                    <th className="px-5 py-3.5 whitespace-nowrap">Date</th>
                    <th className="px-5 py-3.5 text-right whitespace-nowrap">Qty</th>
                    <th className="px-5 py-3.5 text-right whitespace-nowrap">Subtotal</th>
                    <th className="px-5 py-3.5 text-right whitespace-nowrap">GST (18%)</th>
                    <th className="px-5 py-3.5 text-right whitespace-nowrap">Total</th>
                    <th className="px-5 py-3.5 whitespace-nowrap">Status</th>
                  </>
                ) : (
                  <>
                    <th className="px-5 py-3.5 whitespace-nowrap">PO#</th>
                    <th className="px-5 py-3.5 whitespace-nowrap">Distributor</th>
                    <th className="px-5 py-3.5 whitespace-nowrap">Expected Date</th>
                    <th className="px-5 py-3.5 text-right whitespace-nowrap">Qty</th>
                    <th className="px-5 py-3.5 text-right whitespace-nowrap">Subtotal</th>
                    <th className="px-5 py-3.5 text-right whitespace-nowrap">GST (18%)</th>
                    <th className="px-5 py-3.5 text-right whitespace-nowrap">Total</th>
                    <th className="px-5 py-3.5 whitespace-nowrap">Status</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-900/[0.03] transition-colors">
                  <td className="whitespace-nowrap px-5 py-3.5 font-mono text-xs tabular-nums text-slate-600 font-medium">
                    {row[0]}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-[14px] font-semibold text-slate-900">{row[1]}</td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-[13px] text-slate-500">{row[2]}</td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-[13px] text-slate-700">
                    {tab === "Stock valuation" ? (
                      <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
                        {row[3]}
                      </span>
                    ) : (
                      row[3]
                    )}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-right font-mono text-[13px] tabular-nums text-slate-600 font-medium">
                    {row[4]}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-right font-mono text-[13px] tabular-nums text-slate-600 font-medium">
                    {typeof row[5] === "number" ? formatINR(row[5]) : row[5]}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-right font-mono text-[13px] font-bold tabular-nums text-slate-900">
                    {typeof row[6] === "number" ? formatINR(row[6]) : row[6]}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5">
                    <span className="text-[13px] font-medium text-slate-700">{row[7]}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
