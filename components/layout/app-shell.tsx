"use client"

import { useCallback, useEffect, useState } from "react"
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

const VIEW_MAP: Record<string, View> = {
  dashboard: "Dashboard",
  stock: "Stock",
  sales: "Sales",
  purchase: "Purchase",
  reports: "Reports",
}

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

  // Sync navigation and state to URL and sessionStorage
  const syncToUrl = useCallback(
    (
      newView: View,
      newPeriod: number,
      newDrawer: { type: "stock"; id: string } | { type: "purchase"; id: string } | { type: "sale"; id: string } | null,
      newSearch: string,
      push = false
    ) => {
      if (typeof window === "undefined") return
      const params = new URLSearchParams()
      if (newView !== "Dashboard") params.set("view", newView.toLowerCase())
      if (newPeriod !== 30) params.set("period", String(newPeriod))
      if (newDrawer) params.set("drawer", `${newDrawer.type}:${newDrawer.id}`)
      if (newSearch.trim()) params.set("q", newSearch.trim())

      const qs = params.toString()
      const newUrl = qs ? `?${qs}` : window.location.pathname

      try {
        sessionStorage.setItem("inv_view", newView)
        sessionStorage.setItem("inv_period", String(newPeriod))
      } catch {}

      if (push) {
        window.history.pushState(null, "", newUrl)
      } else {
        window.history.replaceState(null, "", newUrl)
      }
    },
    []
  )

  // Hydration-safe initial restoration from URL or sessionStorage
  useEffect(() => {
    if (typeof window === "undefined") return

    const restoreFromUrlOrStorage = () => {
      const params = new URLSearchParams(window.location.search)
      const urlView = params.get("view")?.toLowerCase()
      const urlPeriod = params.get("period")
      const urlDrawer = params.get("drawer")
      const urlSearch = params.get("q")

      if (urlView && VIEW_MAP[urlView]) {
        setView(VIEW_MAP[urlView])
      } else {
        const savedView = sessionStorage.getItem("inv_view") as View | null
        if (savedView && Object.values(VIEW_MAP).includes(savedView)) {
          setView(savedView)
        }
      }

      if (urlPeriod && ["7", "30", "90"].includes(urlPeriod)) {
        setPeriodDays(Number(urlPeriod))
      } else {
        const savedPeriod = sessionStorage.getItem("inv_period")
        if (savedPeriod && ["7", "30", "90"].includes(savedPeriod)) {
          setPeriodDays(Number(savedPeriod))
        }
      }

      if (urlSearch !== null) {
        setSearch(urlSearch)
      }

      if (urlDrawer) {
        const [type, id] = urlDrawer.split(":")
        if (id && (type === "stock" || type === "purchase" || type === "sale")) {
          setDrawer({ type: type as "stock" | "purchase" | "sale", id })
        }
      }
    }

    restoreFromUrlOrStorage()

    const onPopState = () => {
      restoreFromUrlOrStorage()
    }
    window.addEventListener("popstate", onPopState)
    return () => window.removeEventListener("popstate", onPopState)
  }, [])

  const handleNavigate = (nextView: View) => {
    setView(nextView)
    syncToUrl(nextView, periodDays, drawer, search, true)
  }

  const handlePeriodChange = (days: number) => {
    setPeriodDays(days)
    syncToUrl(view, days, drawer, search, false)
  }

  const handleSelectDrawer = (newDrawer: { type: "stock"; id: string } | { type: "purchase"; id: string } | { type: "sale"; id: string } | null) => {
    setDrawer(newDrawer)
    syncToUrl(view, periodDays, newDrawer, search, false)
  }

  const lowStock = items.filter((item) => item.quantity <= item.minLevel)
  const stockValue = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

  // Anchor period calculations to the active dataset timeline so 7d/30d/90d always filter accurately
  const latestSaleDateStr = sales.reduce((max, s) => (s.date > max ? s.date : max), "")
  const todayStr = new Date(Date.now() + 330 * 60_000).toISOString().slice(0, 10)
  const baseDateStr = latestSaleDateStr > todayStr ? latestSaleDateStr : todayStr
  const baseDate = new Date(`${baseDateStr}T00:00:00Z`)

  const cutoff = new Date(baseDate)
  cutoff.setUTCDate(cutoff.getUTCDate() - periodDays + 1)
  const cutoffStr = cutoff.toISOString().slice(0, 10)

  const periodSales = sales.filter((sale) => sale.date >= cutoffStr && sale.date <= baseDateStr)
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
    syncToUrl("Stock", periodDays, drawer, value, true)
  }

  const openStockItem = (id: string) => {
    setView("Stock")
    setSearch("")
    setMobileNav(false)
    const newDrawer = { type: "stock" as const, id }
    setDrawer(newDrawer)
    syncToUrl("Stock", periodDays, newDrawer, "", true)
  }

  return (
    <div className="min-h-screen bg-[#F6F7F9] text-slate-900 font-sans antialiased">
      <div className="print:hidden">
        <Toaster position="top-right" richColors closeButton />
      </div>

      <div className="print:hidden">
        <Sidebar
          view={view}
          onNavigate={handleNavigate}
          lowStockCount={lowStock.length}
          mobileNav={mobileNav}
          onCloseMobileNav={() => setMobileNav(false)}
          onResetDemo={resetDemoData}
        />
      </div>

      <div className="md:pl-[250px] print:hidden">
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

        {/* Locked structural frame across all views: uniform max-w-7xl, consistent px-6 py-6 md:px-8 space-y-6 */}
        <main className="mx-auto max-w-7xl px-6 py-6 md:px-8 space-y-6">
          {view === "Dashboard" && (
            <DashboardView
              items={items}
              lowStock={filteredLow}
              stockValue={stockValue}
              periodSales={periodSalesTotal}
              periodSalesCount={periodSales.length}
              periodDays={periodDays}
              onPeriodChange={handlePeriodChange}
              pendingPOs={pendingPOs}
              movements={movements}
              onNavigate={handleNavigate}
              onSelect={(id) => handleSelectDrawer({ type: "stock", id })}
              onReorder={openPurchase}
              onClearSearch={() => {
                setSearch("")
                syncToUrl(view, periodDays, drawer, "", false)
              }}
            />
          )}

          {view === "Stock" && (
            <StockView
              items={items}
              movements={movements}
              search={search}
              onSearch={(val) => {
                setSearch(val)
                syncToUrl("Stock", periodDays, drawer, val, false)
              }}
              onSelect={(id) => handleSelectDrawer({ type: "stock", id })}
            />
          )}

          {view === "Purchase" && (
            <PurchaseView
              purchases={purchases}
              onSelect={(id) => handleSelectDrawer({ type: "purchase", id })}
              onCreate={() => openPurchase()}
              onReceive={inventory.markPurchaseReceived}
            />
          )}

          {view === "Sales" && (
            <SalesView
              sales={sales}
              onSelect={(id) => handleSelectDrawer({ type: "sale", id })}
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
          onClose={() => handleSelectDrawer(null)}
          onReceive={inventory.markPurchaseReceived}
          onAdjust={inventory.adjustStock}
          onPaid={inventory.markSalePaid}
        />
      )}

      {modal && (
        <div className="print:hidden">
          <OrderModal
            type={modal}
            prefillItem={prefillItem}
            onClose={() => setModal(null)}
            onSale={inventory.createSale}
            onPurchase={inventory.createPurchaseOrder}
          />
        </div>
      )}
    </div>
  )
}
