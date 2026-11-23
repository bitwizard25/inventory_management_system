export type Godown = "Showroom Floor" | "Goregaon Godown" | "Andheri Depot"

export type InventoryItem = {
  id: string
  sku: string
  name: string
  category: string
  godown: Godown
  quantity: number
  minLevel: number
  unitPrice: number
  unit: string
}

export type OrderLine = {
  itemId: string
  itemName: string
  sku: string
  quantity: number
  unitPrice: number
}

export type SaleOrder = {
  id: string
  customer: string
  items: OrderLine[]
  totalAmount: number
  date: string
  status: "Draft" | "Confirmed" | "Paid"
}

export type PurchaseOrder = {
  id: string
  supplier: string
  items: OrderLine[]
  totalAmount: number
  expectedDate: string
  status: "Pending" | "Received"
}

export type StockMovement = {
  id: string
  itemId: string
  itemName: string
  sku: string
  type: "PURCHASE" | "SALE" | "ADJUSTMENT" | "TRANSFER"
  delta: number
  resultingQty: number
  referenceId: string
  timestamp: string
  note: string
}

export type InventoryState = {
  items: InventoryItem[]
  sales: SaleOrder[]
  purchases: PurchaseOrder[]
  movements: StockMovement[]
}

export type LineInput = {
  itemId: string
  quantity: number
  unitPrice?: number
}

export type View = "Dashboard" | "Sales" | "Purchase" | "Stock" | "Reports"
export type Status = "All" | "In stock" | "Low stock" | "Out of stock"
