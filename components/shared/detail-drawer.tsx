"use client"

import { InvoiceDrawer } from "./invoice-drawer"
import { PurchaseDrawer } from "./purchase-drawer"
import { StockDetailDrawer } from "./stock-detail-drawer"

export interface DetailDrawerProps {
  drawer:
    | { type: "stock"; id: string }
    | { type: "purchase"; id: string }
    | { type: "sale"; id: string }
  onClose: () => void
  onReceive: (id: string) => void
  onAdjust: (id: string, delta: number, note: string) => boolean
  onPaid: (id: string) => void
}

export function DetailDrawer({ drawer, onClose, onReceive, onAdjust, onPaid }: DetailDrawerProps) {
  if (drawer.type === "stock") {
    return <StockDetailDrawer itemId={drawer.id} onClose={onClose} onAdjust={onAdjust} />
  }
  if (drawer.type === "purchase") {
    return <PurchaseDrawer purchaseId={drawer.id} onClose={onClose} onReceive={onReceive} />
  }
  if (drawer.type === "sale") {
    return <InvoiceDrawer saleId={drawer.id} onClose={onClose} onPaid={onPaid} />
  }
  return null
}
