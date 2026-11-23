export type Godown = "Showroom Floor" | "Goregaon Godown" | "Andheri Depot"

export type Customer = {
  id: string
  name: string
  phone: string
  gstin: string
  city: string
}

export type Supplier = {
  id: string
  name: string
  phone: string
  gstin: string
  city: string
}

export type SellerInfo = {
  name: string
  tagline: string
  gstin: string
  address: string
  phone: string
  owner: string
}

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
  customerId?: string
  customer: string
  items: OrderLine[]
  subtotal: number
  gstRate: number
  taxAmount: number
  totalAmount: number
  date: string
  createdAt: string
  status: "Draft" | "Confirmed" | "Paid"
}

export type PurchaseOrder = {
  id: string
  supplierId?: string
  supplier: string
  items: OrderLine[]
  subtotal: number
  taxAmount: number
  totalAmount: number
  expectedDate: string
  createdAt: string
  status: "Pending" | "Received"
}

export type PerformedBy = "Jethalal Gada" | "Nattu Kaka" | "Bagha"

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
  performedBy: PerformedBy
  fromGodown?: Godown
  toGodown?: Godown
}

export type InventoryState = {
  items: InventoryItem[]
  customers: Customer[]
  suppliers: Supplier[]
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
