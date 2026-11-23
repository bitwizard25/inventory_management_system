"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { toast } from "sonner"

export type Godown = "Showroom Floor" | "Goregaon Godown" | "Andheri Depot"
export type InventoryItem = { id: string; sku: string; name: string; category: string; godown: Godown; quantity: number; minLevel: number; unitPrice: number; unit: string }
export type OrderLine = { itemId: string; itemName: string; sku: string; quantity: number; unitPrice: number }
export type SaleOrder = { id: string; customer: string; items: OrderLine[]; totalAmount: number; date: string; status: "Draft" | "Confirmed" | "Paid" }
export type PurchaseOrder = { id: string; supplier: string; items: OrderLine[]; totalAmount: number; expectedDate: string; status: "Pending" | "Received" }
export type StockMovement = { id: string; itemId: string; itemName: string; sku: string; type: "PURCHASE" | "SALE" | "ADJUSTMENT" | "TRANSFER"; delta: number; resultingQty: number; referenceId: string; timestamp: string; note: string }
export type InventoryState = { items: InventoryItem[]; sales: SaleOrder[]; purchases: PurchaseOrder[]; movements: StockMovement[] }
export type LineInput = { itemId: string; quantity: number; unitPrice?: number }
type InventoryContextValue = InventoryState & { createSale: (customer: string, lines: LineInput[]) => boolean; markPurchaseReceived: (purchaseId: string) => void; createPurchaseOrder: (supplier: string, lines: LineInput[], received?: boolean) => boolean; adjustStock: (itemId: string, delta: number, note: string) => boolean; transferStock: (itemId: string, fromGodown: Godown, toGodown: Godown, qty: number, note: string) => boolean; markSalePaid: (saleId: string) => void; resetDemoData: () => void }

/* ─── Seed data: Gada Electronics, Goregaon East, Mumbai ─── */

const itemSeed: InventoryItem[] = [
  { id: "i1", sku: "GE-TV-55", name: "Sony Bravia 55\" 4K OLED TV", category: "Televisions", godown: "Showroom Floor", quantity: 14, minLevel: 5, unitPrice: 114990, unit: "pcs" },
  { id: "i2", sku: "GE-AC-15", name: "Voltas 1.5T 5-Star Split AC", category: "Air Conditioners", godown: "Goregaon Godown", quantity: 3, minLevel: 10, unitPrice: 38500, unit: "pcs" },
  { id: "i3", sku: "GE-FR-340", name: "Samsung 340L Frost-Free Fridge", category: "Refrigerators", godown: "Goregaon Godown", quantity: 18, minLevel: 8, unitPrice: 34900, unit: "pcs" },
  { id: "i4", sku: "GE-WM-75", name: "LG 7.5kg Front Load Washer", category: "Washing Machines", godown: "Andheri Depot", quantity: 2, minLevel: 6, unitPrice: 31200, unit: "pcs" },
  { id: "i5", sku: "GE-SP-310", name: "JBL PartyBox 310 Speaker", category: "Audio", godown: "Showroom Floor", quantity: 0, minLevel: 4, unitPrice: 39999, unit: "pcs" },
  { id: "i6", sku: "GE-PH-16P", name: "Apple iPhone 16 Pro 256GB", category: "Smartphones", godown: "Showroom Floor", quantity: 9, minLevel: 4, unitPrice: 119900, unit: "pcs" },
  { id: "i7", sku: "GE-MW-28", name: "IFB 28L Convection Microwave", category: "Kitchen Appliances", godown: "Goregaon Godown", quantity: 22, minLevel: 10, unitPrice: 14800, unit: "pcs" },
  { id: "i8", sku: "GE-AC-20", name: "Daikin 2.0T Inverter Split AC", category: "Air Conditioners", godown: "Andheri Depot", quantity: 11, minLevel: 5, unitPrice: 54000, unit: "pcs" },
  { id: "i9", sku: "GE-AF-22", name: "Philips Air Fryer HD9270 XXL", category: "Kitchen Appliances", godown: "Goregaon Godown", quantity: 16, minLevel: 6, unitPrice: 12999, unit: "pcs" },
  { id: "i10", sku: "GE-VC-V12", name: "Dyson V12 Detect Slim Vacuum", category: "Home Appliances", godown: "Showroom Floor", quantity: 7, minLevel: 3, unitPrice: 52900, unit: "pcs" },
]

const line = (id: string, qty: number): OrderLine => { const item = itemSeed.find((entry) => entry.id === id)!; return { itemId: id, itemName: item.name, sku: item.sku, quantity: qty, unitPrice: item.unitPrice } }

const seed: InventoryState = {
  items: itemSeed,
  sales: [
    { id: "SO-1048", customer: "Gokuldham Society Committee", items: [line("i1", 2), line("i10", 1)], totalAmount: 114990 * 2 + 52900, date: "2026-11-23", status: "Paid" },
    { id: "SO-1047", customer: "Roshan Singh Sodhi", items: [line("i8", 1), line("i9", 2)], totalAmount: 54000 + 12999 * 2, date: "2026-11-23", status: "Confirmed" },
    { id: "SO-1046", customer: "Taarak Mehta", items: [line("i3", 1), line("i7", 1)], totalAmount: 34900 + 14800, date: "2026-11-22", status: "Paid" },
    { id: "SO-1045", customer: "Krishnan Iyer", items: [line("i6", 1)], totalAmount: 119900, date: "2026-11-21", status: "Confirmed" },
    { id: "SO-1044", customer: "Patrakar Popatlal", items: [line("i4", 1)], totalAmount: 31200, date: "2026-11-20", status: "Draft" },
    { id: "SO-1043", customer: "Babita Iyer", items: [line("i9", 1), line("i10", 1)], totalAmount: 12999 + 52900, date: "2026-11-19", status: "Paid" },
    { id: "SO-1042", customer: "Taarak Mehta", items: [line("i1", 1)], totalAmount: 114990, date: "2026-11-17", status: "Paid" },
  ],
  purchases: [
    { id: "PO-2024", supplier: "Sundarlal Enterprises", items: [line("i5", 10)], totalAmount: 39999 * 10, expectedDate: "2026-11-30", status: "Pending" },
    { id: "PO-2023", supplier: "Sony India B2B", items: [line("i1", 6)], totalAmount: 114990 * 6, expectedDate: "2026-11-28", status: "Pending" },
    { id: "PO-2022", supplier: "Voltas Regional Hub", items: [line("i2", 15)], totalAmount: 38500 * 15, expectedDate: "2026-11-27", status: "Pending" },
    { id: "PO-2021", supplier: "LG Electronics West", items: [line("i4", 8)], totalAmount: 31200 * 8, expectedDate: "2026-11-25", status: "Received" },
    { id: "PO-2020", supplier: "Bhogilal Distributors", items: [line("i7", 12), line("i9", 8)], totalAmount: 14800 * 12 + 12999 * 8, expectedDate: "2026-11-22", status: "Received" },
  ],
  movements: [
    { id: "m1", itemId: "i4", itemName: "LG 7.5kg Front Load Washer", sku: "GE-WM-75", type: "PURCHASE", delta: 8, resultingQty: 10, referenceId: "PO-2021", timestamp: "2026-11-23T11:30:00+05:30", note: "Verified & stocked by Nattu Kaka" },
    { id: "m2", itemId: "i7", itemName: "IFB 28L Convection Microwave", sku: "GE-MW-28", type: "PURCHASE", delta: 12, resultingQty: 22, referenceId: "PO-2020", timestamp: "2026-11-23T10:42:00+05:30", note: "Verified & stocked by Nattu Kaka" },
    { id: "m3", itemId: "i9", itemName: "Philips Air Fryer HD9270 XXL", sku: "GE-AF-22", type: "PURCHASE", delta: 8, resultingQty: 16, referenceId: "PO-2020", timestamp: "2026-11-23T10:42:00+05:30", note: "Verified & stocked by Nattu Kaka" },
    { id: "m4", itemId: "i1", itemName: "Sony Bravia 55\" 4K OLED TV", sku: "GE-TV-55", type: "SALE", delta: -2, resultingQty: 14, referenceId: "SO-1048", timestamp: "2026-11-23T09:15:00+05:30", note: "Dispatched by Bagha – Gokuldham delivery" },
    { id: "m5", itemId: "i10", itemName: "Dyson V12 Detect Slim Vacuum", sku: "GE-VC-V12", type: "SALE", delta: -1, resultingQty: 7, referenceId: "SO-1048", timestamp: "2026-11-23T09:15:00+05:30", note: "Dispatched by Bagha – Gokuldham delivery" },
    { id: "m6", itemId: "i6", itemName: "Apple iPhone 16 Pro 256GB", sku: "GE-PH-16P", type: "ADJUSTMENT", delta: 1, resultingQty: 9, referenceId: "ADJ-0091", timestamp: "2026-11-22T14:10:00+05:30", note: "Cycle count correction – verified by Nattu Kaka" },
    { id: "m7", itemId: "i5", itemName: "JBL PartyBox 310 Speaker", sku: "GE-SP-310", type: "SALE", delta: -3, resultingQty: 0, referenceId: "SO-1040", timestamp: "2026-11-18T16:20:00+05:30", note: "Dispatched by Bagha – bulk Diwali order" },
    { id: "m8", itemId: "i3", itemName: "Samsung 340L Frost-Free Fridge", sku: "GE-FR-340", type: "TRANSFER", delta: -2, resultingQty: 18, referenceId: "TRF-0014", timestamp: "2026-11-17T12:00:00+05:30", note: "Moved 2 units Goregaon → Showroom Floor – Nattu Kaka" },
  ],
}

const STORAGE_KEY = "gada-electronics-demo-v5"
const Context = createContext<InventoryContextValue | null>(null)
const money = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value)
const toOrderLines = (items: InventoryItem[], inputs: LineInput[]) => inputs.map((input) => { const item = items.find((entry) => entry.id === input.itemId)!; return { itemId: item.id, itemName: item.name, sku: item.sku, quantity: input.quantity, unitPrice: input.unitPrice ?? item.unitPrice } })

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<InventoryState>(seed)
  const [ready, setReady] = useState(false)
  useEffect(() => { try { const value = localStorage.getItem(STORAGE_KEY); if (value) { const saved = JSON.parse(value) as InventoryState; setState({ ...seed, ...saved, items: [...saved.items, ...seed.items.filter((item) => !saved.items.some((entry) => entry.id === item.id))], sales: [...saved.sales, ...seed.sales.filter((sale) => !saved.sales.some((entry) => entry.id === sale.id))], purchases: [...saved.purchases, ...seed.purchases.filter((purchase) => !saved.purchases.some((entry) => entry.id === purchase.id))], movements: [...saved.movements, ...seed.movements.filter((movement) => !saved.movements.some((entry) => entry.id === movement.id))] }) } } catch { localStorage.removeItem(STORAGE_KEY) } setReady(true) }, [])
  useEffect(() => { if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) }, [state, ready])

  const createSale = useCallback((customer: string, inputs: LineInput[]) => {
    let created = false
    setState((current) => {
      if (!customer.trim() || !inputs.length || inputs.some((input) => !Number.isInteger(input.quantity) || input.quantity < 1 || !current.items.some((item) => item.id === input.itemId)) || current.items.some((item) => inputs.filter((input) => input.itemId === item.id).reduce((sum, input) => sum + input.quantity, 0) > item.quantity)) return current
      const items = toOrderLines(current.items, inputs); const id = `SO-${Math.max(1040, ...current.sales.map((sale) => Number(sale.id.slice(3)))) + 1}`; const timestamp = new Date().toISOString()
      const stock = current.items.map((item) => { const quantity = inputs.filter((entry) => entry.itemId === item.id).reduce((sum, entry) => sum + entry.quantity, 0); return quantity ? { ...item, quantity: item.quantity - quantity } : item })
      const movements = inputs.map((input, index) => { const item = current.items.find((entry) => entry.id === input.itemId)!; const priorUnits = inputs.slice(0, index + 1).filter((entry) => entry.itemId === item.id).reduce((sum, entry) => sum + entry.quantity, 0); return { id: `${Date.now()}-${index}`, itemId: item.id, itemName: item.name, sku: item.sku, type: "SALE" as const, delta: -input.quantity, resultingQty: item.quantity - priorUnits, referenceId: id, timestamp, note: "Sale confirmed" } })
      created = true; return { ...current, items: stock, sales: [{ id, customer: customer.trim(), items, totalAmount: items.reduce((sum, entry) => sum + entry.quantity * entry.unitPrice, 0), date: timestamp.slice(0, 10), status: "Confirmed" }, ...current.sales], movements: [...movements, ...current.movements] }
    })
    if (created) toast.success(`Sale confirmed · ${inputs.map((input) => `-${input.quantity} ${state.items.find((item) => item.id === input.itemId)?.name ?? "units"}`).join(", ")}`)
    else toast.error("Sale could not be created. Check available stock and quantities.")
    return created
  }, [state])

  const markPurchaseReceived = useCallback((id: string) => {
    let message = ""
    setState((current) => {
      const po = current.purchases.find((entry) => entry.id === id); if (!po || po.status === "Received") return current
      const timestamp = new Date().toISOString(); const items = current.items.map((item) => { const line = po.items.find((entry) => entry.itemId === item.id); return line ? { ...item, quantity: item.quantity + line.quantity } : item })
      const movements = po.items.map((entry, index) => ({ id: `${Date.now()}-${index}`, itemId: entry.itemId, itemName: entry.itemName, sku: entry.sku, type: "PURCHASE" as const, delta: entry.quantity, resultingQty: (current.items.find((item) => item.id === entry.itemId)?.quantity ?? 0) + entry.quantity, referenceId: po.id, timestamp, note: "Purchase order received" }))
      const units = po.items.reduce((sum, entry) => sum + entry.quantity, 0); message = `${po.id} marked received · +${units} units added to stock`
      return { ...current, items, purchases: current.purchases.map((entry) => entry.id === id ? { ...entry, status: "Received" } : entry), movements: [...movements, ...current.movements] }
    }); if (message) toast.success(message)
  }, [])

  const createPurchaseOrder = useCallback((supplier: string, inputs: LineInput[], received = false) => {
    let success = false
    setState((current) => {
      if (!supplier.trim() || !inputs.length || new Set(inputs.map((input) => input.itemId)).size !== inputs.length || inputs.some((input) => !current.items.some((item) => item.id === input.itemId) || !Number.isInteger(input.quantity) || input.quantity < 1 || (input.unitPrice ?? current.items.find((item) => item.id === input.itemId)!.unitPrice) <= 0)) return current
      const lines = toOrderLines(current.items, inputs); const id = `PO-${Math.max(2017, ...current.purchases.map((purchase) => Number(purchase.id.slice(3)))) + 1}`; const timestamp = new Date().toISOString()
      const newItems = received ? current.items.map((item) => { const entry = lines.find((line) => line.itemId === item.id); return entry ? { ...item, quantity: item.quantity + entry.quantity } : item }) : current.items
      const movements = received ? lines.map((entry, index) => ({ id: `${Date.now()}-${index}`, itemId: entry.itemId, itemName: entry.itemName, sku: entry.sku, type: "PURCHASE" as const, delta: entry.quantity, resultingQty: (current.items.find((item) => item.id === entry.itemId)?.quantity ?? 0) + entry.quantity, referenceId: id, timestamp, note: "Purchase order received on creation" })) : []
      const totalAmount = lines.reduce((sum, entry) => sum + entry.quantity * entry.unitPrice, 0); success = true
      return { ...current, items: newItems, purchases: [{ id, supplier: supplier.trim(), items: lines, totalAmount, expectedDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10), status: received ? "Received" : "Pending" }, ...current.purchases], movements: [...movements, ...current.movements] }
    }); if (success) toast.success(received ? "Purchase order created and received · stock updated" : "Purchase order created")
    else toast.error("Check the supplier, items, quantities, and unit costs"); return success
  }, [])

  const adjustStock = useCallback((itemId: string, delta: number, note: string) => {
    let success = false
    setState((current) => {
      const item = current.items.find((entry) => entry.id === itemId); if (!item || !Number.isInteger(delta) || delta === 0 || item.quantity + delta < 0) return current
      const result = item.quantity + delta; success = true
      return { ...current, items: current.items.map((entry) => entry.id === itemId ? { ...entry, quantity: result } : entry), movements: [{ id: `${Date.now()}`, itemId, itemName: item.name, sku: item.sku, type: "ADJUSTMENT", delta, resultingQty: result, referenceId: `ADJ-${Date.now().toString().slice(-4)}`, timestamp: new Date().toISOString(), note: note.trim() || "Manual stock correction" }, ...current.movements] }
    }); if (success) toast.success(`Stock adjusted · ${delta > 0 ? "+" : ""}${delta} units`); else toast.error("Enter a valid adjustment that does not make stock negative"); return success
  }, [])

  const transferStock = useCallback((itemId: string, fromGodown: Godown, toGodown: Godown, qty: number, note: string) => {
    if (fromGodown === toGodown) { toast.error("Source and destination godowns must be different"); return false }
    if (!Number.isInteger(qty) || qty < 1) { toast.error("Transfer quantity must be at least 1"); return false }
    let success = false
    setState((current) => {
      const sourceItem = current.items.find((entry) => entry.id === itemId && entry.godown === fromGodown)
      if (!sourceItem || sourceItem.quantity < qty) return current
      const destItem = current.items.find((entry) => entry.id === itemId && entry.godown === toGodown)
      const timestamp = new Date().toISOString()
      const refId = `TRF-${Date.now().toString().slice(-4)}`
      const transferNote = note.trim() || `Transferred ${qty} units from ${fromGodown} to ${toGodown}`
      const sourceResult = sourceItem.quantity - qty
      const destResult = (destItem?.quantity ?? 0) + qty
      const updatedItems = destItem
        ? current.items.map((entry) => {
          if (entry.id === itemId && entry.godown === fromGodown) return { ...entry, quantity: sourceResult }
          if (entry.id === itemId && entry.godown === toGodown) return { ...entry, quantity: destResult }
          return entry
        })
        : [
          ...current.items.map((entry) => entry.id === itemId && entry.godown === fromGodown ? { ...entry, quantity: sourceResult } : entry),
          { ...sourceItem, godown: toGodown, quantity: qty, id: `${itemId}-${toGodown.replace(/\s/g, "").toLowerCase().slice(0, 6)}` },
        ]
      const movements: StockMovement[] = [
        { id: `${Date.now()}-out`, itemId: sourceItem.id, itemName: sourceItem.name, sku: sourceItem.sku, type: "TRANSFER", delta: -qty, resultingQty: sourceResult, referenceId: refId, timestamp, note: `${transferNote} (out → ${toGodown})` },
        { id: `${Date.now()}-in`, itemId: destItem?.id ?? sourceItem.id, itemName: sourceItem.name, sku: sourceItem.sku, type: "TRANSFER", delta: qty, resultingQty: destResult, referenceId: refId, timestamp, note: `${transferNote} (in ← ${fromGodown})` },
      ]
      success = true
      return { ...current, items: updatedItems, movements: [...movements, ...current.movements] }
    })
    if (success) toast.success(`Transferred ${qty} units: ${fromGodown} → ${toGodown}`)
    else toast.error("Transfer failed. Check source godown stock.")
    return success
  }, [])

  const markSalePaid = useCallback((saleId: string) => { let updated = false; setState((current) => { const sale = current.sales.find((entry) => entry.id === saleId); if (!sale || sale.status !== "Confirmed") return current; updated = true; return { ...current, sales: current.sales.map((entry) => entry.id === saleId ? { ...entry, status: "Paid" } : entry) } }); if (updated) toast.success(`${saleId} marked as paid`) }, [])
  const resetDemoData = useCallback(() => { setState(seed); localStorage.removeItem(STORAGE_KEY); toast.success("Demo data restored") }, [])
  const value = useMemo(() => ({ ...state, createSale, markPurchaseReceived, createPurchaseOrder, adjustStock, transferStock, markSalePaid, resetDemoData }), [state, createSale, markPurchaseReceived, createPurchaseOrder, adjustStock, transferStock, markSalePaid, resetDemoData])
  return <Context.Provider value={value}>{children}</Context.Provider>
}
export function useInventory() { const value = useContext(Context); if (!value) throw new Error("useInventory must be used inside InventoryProvider"); return value }
export function formatINR(value: number) { return money(value) }
export const godowns: Godown[] = ["Showroom Floor", "Goregaon Godown", "Andheri Depot"]
