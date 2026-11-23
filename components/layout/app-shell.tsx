"use client"

import { useState } from "react"
import { Toaster } from "sonner"
import { useInventory } from "@/hooks/use-inventory"
import type { View } from "@/types/inventory"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { DetailDrawer } from "@/components/shared/detail-drawer"
import { OrderModal } from "@/components/shared/order-modal"
import { DashboardView } from "@/features/dashboard/dashboard-view"
import { PurchaseView } from "@/features/purchases/purchase-view"
import { ReportsView } from "@/features/reports/reports-view"
import { SalesView } from "@/features/sales/sales-view"
import { StockView } from "@/features/stock/stock-view"

export function AppShell() {
  const inventory = useInventory()
  const { items, sales, purchases, movements, resetDemoData } = inventory

  const [view, setView] = useState<View>("Dashboard")
  const [search, setSearch] = useState("")
  const [mobileNav, setMobileNav] = useState(false)
  const [periodDays, setPeriodDays] = useState(30)

  const [drawer, setDrawer] = useState<
    { type: "stock"; id: string } | { type: "purchase"; id: string } | { type: "sale"; id: string } | null
  >(null)

  const [modal, setModal] = useState<"sale" | "purchase" | null>(null)
  const [prefillItem, setPrefillItem] = useState<string | undefined>()

  const lowStock = items.filter((item) => item.quantity <= item.minLevel)
  const stockValue = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

  const cutoff = new Date(`${new Date(Date.now() + 330 * 60_000).toISOString().slice(0, 10)}T00:00:00Z`)
  cutoff.setUTCDate(cutoff.getUTCDate() - periodDays + 1)
  const periodSales = sales.filter((sale) => sale.date >= cutoff.toISOString().slice(0, 10))
  const periodSalesTotal = periodSales.reduce((sum, sale) => sum + sale.totalAmount, 0)
  const pendingPOs = purchases.filter((order) => order.status === "Pending").length

  const openPurchase = (itemId?: string) => {
    setPrefillItem(itemId)
    setModal("purchase")
  }

  const filteredLow = lowStock.filter((item) =>
    `${item.sku} ${item.name} ${item.godown}`.toLowerCase().includes(search.toLowerCase())
  )

  const showStockSearch = (value: string) => {
    setSearch(value)
    setView("Stock")
  }

  const openStockItem = (id: string) => {
    setView("Stock")
    setSearch("")
    setMobileNav(false)
    setDrawer({ type: "stock", id })
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 font-sans antialiased">
      <Toaster position="top-right" richColors closeButton />

      <Sidebar
        view={view}
        onNavigate={setView}
        lowStockCount={lowStock.length}
        mobileNav={mobileNav}
        onCloseMobileNav={() => setMobileNav(false)}
        onResetDemo={resetDemoData}
      />

      <div className="md:pl-[240px]">
        <Header
          view={view}
          search={search}
          onSearch={showStockSearch}
          lowStock={lowStock}
          onOpenMobileNav={() => setMobileNav(true)}
          onNewPurchase={() => openPurchase()}
          onNewSale={() => setModal("sale")}
          onOpenStockItem={openStockItem}
        />

        <main className="mx-auto max-w-[1600px] px-5 py-7 md:px-8">
          {view === "Dashboard" && (
            <DashboardView
              items={items}
              lowStock={filteredLow}
              stockValue={stockValue}
              periodSales={periodSalesTotal}
              periodDays={periodDays}
              onPeriodChange={setPeriodDays}
              pendingPOs={pendingPOs}
              movements={movements}
              onNavigate={setView}
              onSelect={(id) => setDrawer({ type: "stock", id })}
              onReorder={openPurchase}
              onClearSearch={() => setSearch("")}
            />
          )}

          {view === "Stock" && (
            <StockView
              items={items}
              movements={movements}
              search={search}
              onSearch={setSearch}
              onSelect={(id) => setDrawer({ type: "stock", id })}
            />
          )}

          {view === "Purchase" && (
            <PurchaseView
              purchases={purchases}
              onSelect={(id) => setDrawer({ type: "purchase", id })}
              onCreate={() => openPurchase()}
              onReceive={inventory.markPurchaseReceived}
            />
          )}

          {view === "Sales" && (
            <SalesView
              sales={sales}
              onSelect={(id) => setDrawer({ type: "sale", id })}
              onCreate={() => setModal("sale")}
              onPaid={inventory.markSalePaid}
            />
          )}

          {view === "Reports" && (
            <ReportsView items={items} sales={sales} purchases={purchases} />
          )}
        </main>
      </div>

      {drawer && (
        <DetailDrawer
          drawer={drawer}
          onClose={() => setDrawer(null)}
          onReceive={inventory.markPurchaseReceived}
          onAdjust={inventory.adjustStock}
          onPaid={inventory.markSalePaid}
        />
      )}

      {modal && (
        <OrderModal
          type={modal}
          prefillItem={prefillItem}
          onClose={() => setModal(null)}
          onSale={inventory.createSale}
          onPurchase={inventory.createPurchaseOrder}
        />
      )}
    </div>
  )
}
