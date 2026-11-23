"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { toast } from "sonner"
import type {
  Godown,
  InventoryItem,
  InventoryState,
  LineInput,
  OrderLine,
  PerformedBy,
  PurchaseOrder,
  SaleOrder,
  StockMovement,
} from "@/types/inventory"
import { seed, STORAGE_KEY } from "@/data/seed"

type InventoryContextValue = InventoryState & {
  createSale: (customer: string, lines: LineInput[], customerId?: string) => boolean
  markPurchaseReceived: (purchaseId: string, performedBy?: PerformedBy) => void
  createPurchaseOrder: (
    supplier: string,
    lines: LineInput[],
    received?: boolean,
    supplierId?: string
  ) => boolean
  adjustStock: (
    itemId: string,
    delta: number,
    note: string,
    performedBy?: PerformedBy
  ) => boolean
  transferStock: (
    itemId: string,
    fromGodown: Godown,
    toGodown: Godown,
    qty: number,
    note: string,
    performedBy?: PerformedBy
  ) => boolean
  markSalePaid: (saleId: string) => void
  resetDemoData: () => void
}

const Context = createContext<InventoryContextValue | null>(null)

function toOrderLines(items: InventoryItem[], inputs: LineInput[]): OrderLine[] {
  return inputs.map((input) => {
    const item = items.find((entry) => entry.id === input.itemId)!
    return {
      itemId: item.id,
      itemName: item.name,
      sku: item.sku,
      quantity: input.quantity,
      unitPrice: input.unitPrice ?? item.unitPrice,
    }
  })
}

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<InventoryState>(seed)
  const isHydrated = useRef(false)

  // Safe schema fallback on hydration with race-condition guard
  useEffect(() => {
    try {
      const value = localStorage.getItem(STORAGE_KEY)
      if (value) {
        const parsed = JSON.parse(value) as Partial<InventoryState>
        const validItems = Array.isArray(parsed.items) && parsed.items.length > 0 ? parsed.items : seed.items
        const validSales = Array.isArray(parsed.sales) && parsed.sales.length > 0 ? parsed.sales : seed.sales
        const validPurchases = Array.isArray(parsed.purchases) && parsed.purchases.length > 0 ? parsed.purchases : seed.purchases
        const validMovements = Array.isArray(parsed.movements) ? parsed.movements : seed.movements
        const validCustomers = Array.isArray(parsed.customers) && parsed.customers.length > 0 ? parsed.customers : seed.customers
        const validSuppliers = Array.isArray(parsed.suppliers) && parsed.suppliers.length > 0 ? parsed.suppliers : seed.suppliers

        setState({
          items: validItems,
          customers: validCustomers,
          suppliers: validSuppliers,
          sales: validSales,
          purchases: validPurchases,
          movements: validMovements,
        })
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY)
      setState(seed)
    } finally {
      isHydrated.current = true
    }
  }, [])

  useEffect(() => {
    if (!isHydrated.current) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (err) {
      console.error("Failed to save state to localStorage", err)
    }
  }, [state])

  const createSale = useCallback(
    (customerName: string, inputs: LineInput[], customerId?: string) => {
      let created = false
      setState((current) => {
        if (
          !customerName.trim() ||
          !inputs.length ||
          inputs.some(
            (input) =>
              !Number.isInteger(input.quantity) ||
              input.quantity < 1 ||
              !current.items.some((item) => item.id === input.itemId)
          ) ||
          current.items.some(
            (item) =>
              inputs
                .filter((input) => input.itemId === item.id)
                .reduce((sum, input) => sum + input.quantity, 0) > item.quantity
          )
        ) {
          return current
        }

        const lines = toOrderLines(current.items, inputs)
        const subtotal = lines.reduce((sum, entry) => sum + entry.quantity * entry.unitPrice, 0)
        const gstRate = 18
        const taxAmount = Math.round(subtotal * (gstRate / 100))
        const totalAmount = subtotal + taxAmount

        const existingNumericIds = current.sales
          .map((s) => Number(s.id.replace(/\D/g, "")))
          .filter(Boolean)
        const nextIdNumber = Math.max(1040, ...existingNumericIds) + 1
        const id = `SO-${nextIdNumber}`
        const timestamp = new Date().toISOString()
        const date = timestamp.slice(0, 10)

        const matchedCustomer =
          current.customers.find((c) => c.id === customerId) ||
          current.customers.find((c) => c.name.toLowerCase() === customerName.trim().toLowerCase())

        const stock = current.items.map((item) => {
          const qty = inputs
            .filter((entry) => entry.itemId === item.id)
            .reduce((sum, entry) => sum + entry.quantity, 0)
          return qty ? { ...item, quantity: item.quantity - qty } : item
        })

        const newMovements: StockMovement[] = inputs.map((input, index) => {
          const item = current.items.find((entry) => entry.id === input.itemId)!
          const priorUnits = inputs
            .slice(0, index + 1)
            .filter((entry) => entry.itemId === item.id)
            .reduce((sum, entry) => sum + entry.quantity, 0)
          return {
            id: `m-sale-${Date.now()}-${index}`,
            itemId: item.id,
            itemName: item.name,
            sku: item.sku,
            type: "SALE",
            delta: -input.quantity,
            resultingQty: item.quantity - priorUnits,
            referenceId: id,
            timestamp,
            note: `Dispatched to ${customerName.trim()} · Invoice ${id}`,
            performedBy: "Bagha",
            fromGodown: item.godown,
          }
        })

        const newSale: SaleOrder = {
          id,
          customerId: matchedCustomer?.id,
          customer: customerName.trim(),
          items: lines,
          subtotal,
          gstRate,
          taxAmount,
          totalAmount,
          date,
          createdAt: timestamp,
          status: "Confirmed",
        }

        created = true
        return {
          ...current,
          items: stock,
          sales: [newSale, ...current.sales],
          movements: [...newMovements, ...current.movements],
        }
      })

      if (created) {
        toast.success(
          `Sale confirmed · Stock updated for ${inputs
            .map((input) => `${input.quantity}x ${state.items.find((item) => item.id === input.itemId)?.name ?? "item"}`)
            .join(", ")}`
        )
      } else {
        toast.error("Sale could not be created. Check stock availability.")
      }
      return created
    },
    [state]
  )

  const markPurchaseReceived = useCallback(
    (id: string, performedBy: PerformedBy = "Nattu Kaka") => {
      let message = ""
      setState((current) => {
        const po = current.purchases.find((entry) => entry.id === id)
        if (!po || po.status === "Received") return current
        const timestamp = new Date().toISOString()

        const items = current.items.map((item) => {
          const line = po.items.find((entry) => entry.itemId === item.id)
          return line ? { ...item, quantity: item.quantity + line.quantity } : item
        })

        const movements: StockMovement[] = po.items.map((entry, index) => {
          const item = current.items.find((candidate) => candidate.id === entry.itemId)
          return {
            id: `m-po-${Date.now()}-${index}`,
            itemId: entry.itemId,
            itemName: entry.itemName,
            sku: entry.sku,
            type: "PURCHASE",
            delta: entry.quantity,
            resultingQty: (item?.quantity ?? 0) + entry.quantity,
            referenceId: po.id,
            timestamp,
            note: `Goods intake verified from ${po.supplier}`,
            performedBy,
            toGodown: item?.godown,
          }
        })

        const units = po.items.reduce((sum, entry) => sum + entry.quantity, 0)
        message = `${po.id} marked received · +${units} units stocked`

        return {
          ...current,
          items,
          purchases: current.purchases.map((entry) => (entry.id === id ? { ...entry, status: "Received" } : entry)),
          movements: [...movements, ...current.movements],
        }
      })
      if (message) toast.success(message)
    },
    []
  )

  const createPurchaseOrder = useCallback(
    (
      supplierName: string,
      inputs: LineInput[],
      received = false,
      supplierId?: string
    ) => {
      let success = false
      setState((current) => {
        if (
          !supplierName.trim() ||
          !inputs.length ||
          new Set(inputs.map((input) => input.itemId)).size !== inputs.length ||
          inputs.some(
            (input) =>
              !current.items.some((item) => item.id === input.itemId) ||
              !Number.isInteger(input.quantity) ||
              input.quantity < 1 ||
              (input.unitPrice ?? current.items.find((item) => item.id === input.itemId)!.unitPrice) <= 0
          )
        ) {
          return current
        }

        const lines = toOrderLines(current.items, inputs)
        const subtotal = lines.reduce((sum, entry) => sum + entry.quantity * entry.unitPrice, 0)
        const taxAmount = Math.round(subtotal * 0.18)
        const totalAmount = subtotal + taxAmount

        const existingNumericIds = current.purchases
          .map((p) => Number(p.id.replace(/\D/g, "")))
          .filter(Boolean)
        const nextIdNumber = Math.max(2017, ...existingNumericIds) + 1
        const id = `PO-${nextIdNumber}`
        const timestamp = new Date().toISOString()

        const matchedSupplier =
          current.suppliers.find((s) => s.id === supplierId) ||
          current.suppliers.find((s) => s.name.toLowerCase() === supplierName.trim().toLowerCase())

        const newItems = received
          ? current.items.map((item) => {
              const entry = lines.find((line) => line.itemId === item.id)
              return entry ? { ...item, quantity: item.quantity + entry.quantity } : item
            })
          : current.items

        const movements: StockMovement[] = received
          ? lines.map((entry, index) => {
              const item = current.items.find((candidate) => candidate.id === entry.itemId)
              return {
                id: `m-po-init-${Date.now()}-${index}`,
                itemId: entry.itemId,
                itemName: entry.itemName,
                sku: entry.sku,
                type: "PURCHASE",
                delta: entry.quantity,
                resultingQty: (item?.quantity ?? 0) + entry.quantity,
                referenceId: id,
                timestamp,
                note: `Direct replenishment intake from ${supplierName.trim()}`,
                performedBy: "Nattu Kaka",
                toGodown: item?.godown,
              }
            })
          : []

        const newPO: PurchaseOrder = {
          id,
          supplierId: matchedSupplier?.id,
          supplier: supplierName.trim(),
          items: lines,
          subtotal,
          taxAmount,
          totalAmount,
          expectedDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
          createdAt: timestamp,
          status: received ? "Received" : "Pending",
        }

        success = true
        return {
          ...current,
          items: newItems,
          purchases: [newPO, ...current.purchases],
          movements: [...movements, ...current.movements],
        }
      })

      if (success) {
        toast.success(received ? "PO created & marked received · Stock updated" : "Purchase order created")
      } else {
        toast.error("Check supplier, items, quantities, and rates.")
      }
      return success
    },
    []
  )

  const adjustStock = useCallback(
    (
      itemId: string,
      delta: number,
      note: string,
      performedBy: PerformedBy = "Nattu Kaka"
    ) => {
      const targetItem = state.items.find((entry) => entry.id === itemId)
      if (!targetItem || !Number.isInteger(delta) || delta === 0 || targetItem.quantity + delta < 0) {
        toast.error("Enter a valid adjustment that does not make stock negative.")
        return false
      }

      const finalNote = note.trim() || "Physical stock audit"
      const timestamp = new Date().toISOString()
      const refId = `ADJ-${Date.now().toString().slice(-4)}`

      setState((current) => {
        const item = current.items.find((entry) => entry.id === itemId)
        if (!item || item.quantity + delta < 0) return current
        const result = item.quantity + delta

        const movement: StockMovement = {
          id: `m-adj-${Date.now()}`,
          itemId,
          itemName: item.name,
          sku: item.sku,
          type: "ADJUSTMENT",
          delta,
          resultingQty: result,
          referenceId: refId,
          timestamp,
          note: finalNote,
          performedBy,
          fromGodown: delta < 0 ? item.godown : undefined,
          toGodown: delta > 0 ? item.godown : undefined,
        }

        return {
          ...current,
          items: current.items.map((entry) => (entry.id === itemId ? { ...entry, quantity: result } : entry)),
          movements: [movement, ...current.movements],
        }
      })

      toast.success(`Stock adjusted · ${delta > 0 ? "+" : ""}${delta} units`)
      return true
    },
    [state.items]
  )

  const transferStock = useCallback(
    (
      itemId: string,
      fromGodown: Godown,
      toGodown: Godown,
      qty: number,
      note: string,
      performedBy: PerformedBy = "Bagha"
    ) => {
      if (fromGodown === toGodown) {
        toast.error("Source and destination godowns must be different.")
        return false
      }
      if (!Number.isInteger(qty) || qty < 1) {
        toast.error("Transfer quantity must be at least 1.")
        return false
      }
      let success = false
      setState((current) => {
        const sourceItem = current.items.find((entry) => entry.id === itemId && entry.godown === fromGodown)
        if (!sourceItem || sourceItem.quantity < qty) return current

        const destItem = current.items.find((entry) => entry.id === itemId && entry.godown === toGodown)
        const timestamp = new Date().toISOString()
        const refId = `TRF-${Date.now().toString().slice(-4)}`
        const transferNote = note.trim() || `Transferred ${qty} units: ${fromGodown} → ${toGodown}`
        const sourceResult = sourceItem.quantity - qty
        const destResult = (destItem?.quantity ?? 0) + qty

        const updatedItems = destItem
          ? current.items.map((entry) => {
              if (entry.id === itemId && entry.godown === fromGodown) return { ...entry, quantity: sourceResult }
              if (entry.id === itemId && entry.godown === toGodown) return { ...entry, quantity: destResult }
              return entry
            })
          : [
              ...current.items.map((entry) =>
                entry.id === itemId && entry.godown === fromGodown ? { ...entry, quantity: sourceResult } : entry
              ),
              {
                ...sourceItem,
                godown: toGodown,
                quantity: qty,
                id: `${itemId}-${toGodown.replace(/\s/g, "").toLowerCase().slice(0, 6)}`,
              },
            ]

        const movements: StockMovement[] = [
          {
            id: `m-trf-out-${Date.now()}`,
            itemId: sourceItem.id,
            itemName: sourceItem.name,
            sku: sourceItem.sku,
            type: "TRANSFER",
            delta: -qty,
            resultingQty: sourceResult,
            referenceId: refId,
            timestamp,
            note: `${transferNote} (Outbound: ${fromGodown})`,
            performedBy,
            fromGodown,
            toGodown,
          },
          {
            id: `m-trf-in-${Date.now()}`,
            itemId: destItem?.id ?? sourceItem.id,
            itemName: sourceItem.name,
            sku: sourceItem.sku,
            type: "TRANSFER",
            delta: qty,
            resultingQty: destResult,
            referenceId: refId,
            timestamp,
            note: `${transferNote} (Inbound: ${toGodown})`,
            performedBy,
            fromGodown,
            toGodown,
          },
        ]

        success = true
        return { ...current, items: updatedItems, movements: [...movements, ...current.movements] }
      })

      if (success) toast.success(`Transferred ${qty} units: ${fromGodown} → ${toGodown}`)
      else toast.error("Transfer failed. Check source warehouse stock.")
      return success
    },
    []
  )

  const markSalePaid = useCallback((saleId: string) => {
    let updated = false
    setState((current) => {
      const sale = current.sales.find((entry) => entry.id === saleId)
      if (!sale || sale.status !== "Confirmed") return current
      updated = true
      return {
        ...current,
        sales: current.sales.map((entry) => (entry.id === saleId ? { ...entry, status: "Paid" } : entry)),
      }
    })
    if (updated) toast.success(`${saleId} marked as paid`)
  }, [])

  const resetDemoData = useCallback(() => {
    setState(seed)
    try {
      localStorage.removeItem(STORAGE_KEY)
      if (typeof window !== "undefined") {
        sessionStorage.clear()
      }
    } catch (err) {
      console.error("Failed to clear storage", err)
    }
    toast.success("Demo catalog & transactions restored")
  }, [])

  const value = useMemo(
    () => ({
      ...state,
      createSale,
      markPurchaseReceived,
      createPurchaseOrder,
      adjustStock,
      transferStock,
      markSalePaid,
      resetDemoData,
    }),
    [
      state,
      createSale,
      markPurchaseReceived,
      createPurchaseOrder,
      adjustStock,
      transferStock,
      markSalePaid,
      resetDemoData,
    ]
  )

  return <Context.Provider value={value}>{children}</Context.Provider>
}

export function useInventory() {
  const value = useContext(Context)
  if (!value) throw new Error("useInventory must be used inside InventoryProvider")
  return value
}
