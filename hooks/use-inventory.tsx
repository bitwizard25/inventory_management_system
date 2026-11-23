"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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
  StockMovement,
} from "@/types/inventory"
import { seed, STORAGE_KEY } from "@/data/seed"

type InventoryContextValue = InventoryState & {
  createSale: (customer: string, lines: LineInput[]) => boolean
  markPurchaseReceived: (purchaseId: string) => void
  createPurchaseOrder: (supplier: string, lines: LineInput[], received?: boolean) => boolean
  adjustStock: (itemId: string, delta: number, note: string) => boolean
  transferStock: (itemId: string, fromGodown: Godown, toGodown: Godown, qty: number, note: string) => boolean
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
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const value = localStorage.getItem(STORAGE_KEY)
      if (value) {
        const saved = JSON.parse(value) as InventoryState
        setState({
          ...seed,
          ...saved,
          items: [
            ...saved.items,
            ...seed.items.filter((item) => !saved.items.some((entry) => entry.id === item.id)),
          ],
          sales: [
            ...saved.sales,
            ...seed.sales.filter((sale) => !saved.sales.some((entry) => entry.id === sale.id)),
          ],
          purchases: [
            ...saved.purchases,
            ...seed.purchases.filter((purchase) => !saved.purchases.some((entry) => entry.id === purchase.id)),
          ],
          movements: [
            ...saved.movements,
            ...seed.movements.filter((movement) => !saved.movements.some((entry) => entry.id === movement.id)),
          ],
        })
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
    setReady(true)
  }, [])

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state, ready])

  const createSale = useCallback(
    (customer: string, inputs: LineInput[]) => {
      let created = false
      setState((current) => {
        if (
          !customer.trim() ||
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
        const id = `SO-${Math.max(1040, ...current.sales.map((sale) => Number(sale.id.slice(3)))) + 1}`
        const timestamp = new Date().toISOString()
        const stock = current.items.map((item) => {
          const qty = inputs
            .filter((entry) => entry.itemId === item.id)
            .reduce((sum, entry) => sum + entry.quantity, 0)
          return qty ? { ...item, quantity: item.quantity - qty } : item
        })
        const movements: StockMovement[] = inputs.map((input, index) => {
          const item = current.items.find((entry) => entry.id === input.itemId)!
          const priorUnits = inputs
            .slice(0, index + 1)
            .filter((entry) => entry.itemId === item.id)
            .reduce((sum, entry) => sum + entry.quantity, 0)
          return {
            id: `${Date.now()}-${index}`,
            itemId: item.id,
            itemName: item.name,
            sku: item.sku,
            type: "SALE",
            delta: -input.quantity,
            resultingQty: item.quantity - priorUnits,
            referenceId: id,
            timestamp,
            note: "Sale confirmed",
          }
        })

        created = true
        return {
          ...current,
          items: stock,
          sales: [
            {
              id,
              customer: customer.trim(),
              items: lines,
              totalAmount: lines.reduce((sum, entry) => sum + entry.quantity * entry.unitPrice, 0),
              date: timestamp.slice(0, 10),
              status: "Confirmed",
            },
            ...current.sales,
          ],
          movements: [...movements, ...current.movements],
        }
      })

      if (created) {
        toast.success(
          `Sale confirmed · ${inputs
            .map((input) => `-${input.quantity} ${state.items.find((item) => item.id === input.itemId)?.name ?? "units"}`)
            .join(", ")}`
        )
      } else {
        toast.error("Sale could not be created. Check available stock and quantities.")
      }
      return created
    },
    [state]
  )

  const markPurchaseReceived = useCallback((id: string) => {
    let message = ""
    setState((current) => {
      const po = current.purchases.find((entry) => entry.id === id)
      if (!po || po.status === "Received") return current
      const timestamp = new Date().toISOString()
      const items = current.items.map((item) => {
        const line = po.items.find((entry) => entry.itemId === item.id)
        return line ? { ...item, quantity: item.quantity + line.quantity } : item
      })
      const movements: StockMovement[] = po.items.map((entry, index) => ({
        id: `${Date.now()}-${index}`,
        itemId: entry.itemId,
        itemName: entry.itemName,
        sku: entry.sku,
        type: "PURCHASE",
        delta: entry.quantity,
        resultingQty: (current.items.find((item) => item.id === entry.itemId)?.quantity ?? 0) + entry.quantity,
        referenceId: po.id,
        timestamp,
        note: "Purchase order received",
      }))
      const units = po.items.reduce((sum, entry) => sum + entry.quantity, 0)
      message = `${po.id} marked received · +${units} units added to stock`
      return {
        ...current,
        items,
        purchases: current.purchases.map((entry) => (entry.id === id ? { ...entry, status: "Received" } : entry)),
        movements: [...movements, ...current.movements],
      }
    })
    if (message) toast.success(message)
  }, [])

  const createPurchaseOrder = useCallback((supplier: string, inputs: LineInput[], received = false) => {
    let success = false
    setState((current) => {
      if (
        !supplier.trim() ||
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
      const id = `PO-${Math.max(2017, ...current.purchases.map((purchase) => Number(purchase.id.slice(3)))) + 1}`
      const timestamp = new Date().toISOString()
      const newItems = received
        ? current.items.map((item) => {
            const entry = lines.find((line) => line.itemId === item.id)
            return entry ? { ...item, quantity: item.quantity + entry.quantity } : item
          })
        : current.items
      const movements: StockMovement[] = received
        ? lines.map((entry, index) => ({
            id: `${Date.now()}-${index}`,
            itemId: entry.itemId,
            itemName: entry.itemName,
            sku: entry.sku,
            type: "PURCHASE",
            delta: entry.quantity,
            resultingQty: (current.items.find((item) => item.id === entry.itemId)?.quantity ?? 0) + entry.quantity,
            referenceId: id,
            timestamp,
            note: "Purchase order received on creation",
          }))
        : []
      const totalAmount = lines.reduce((sum, entry) => sum + entry.quantity * entry.unitPrice, 0)
      success = true
      return {
        ...current,
        items: newItems,
        purchases: [
          {
            id,
            supplier: supplier.trim(),
            items: lines,
            totalAmount,
            expectedDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
            status: received ? "Received" : "Pending",
          },
          ...current.purchases,
        ],
        movements: [...movements, ...current.movements],
      }
    })
    if (success) {
      toast.success(received ? "Purchase order created and received · stock updated" : "Purchase order created")
    } else {
      toast.error("Check supplier, items, quantities, and unit costs")
    }
    return success
  }, [])

  const adjustStock = useCallback((itemId: string, delta: number, note: string) => {
    let success = false
    setState((current) => {
      const item = current.items.find((entry) => entry.id === itemId)
      if (!item || !Number.isInteger(delta) || delta === 0 || item.quantity + delta < 0) return current
      const result = item.quantity + delta
      success = true
      return {
        ...current,
        items: current.items.map((entry) => (entry.id === itemId ? { ...entry, quantity: result } : entry)),
        movements: [
          {
            id: `${Date.now()}`,
            itemId,
            itemName: item.name,
            sku: item.sku,
            type: "ADJUSTMENT",
            delta,
            resultingQty: result,
            referenceId: `ADJ-${Date.now().toString().slice(-4)}`,
            timestamp: new Date().toISOString(),
            note: note.trim() || "Manual stock correction",
          },
          ...current.movements,
        ],
      }
    })
    if (success) {
      toast.success(`Stock adjusted · ${delta > 0 ? "+" : ""}${delta} units`)
    } else {
      toast.error("Enter a valid adjustment that does not make stock negative")
    }
    return success
  }, [])

  const transferStock = useCallback((itemId: string, fromGodown: Godown, toGodown: Godown, qty: number, note: string) => {
    if (fromGodown === toGodown) {
      toast.error("Source and destination godowns must be different")
      return false
    }
    if (!Number.isInteger(qty) || qty < 1) {
      toast.error("Transfer quantity must be at least 1")
      return false
    }
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
          id: `${Date.now()}-out`,
          itemId: sourceItem.id,
          itemName: sourceItem.name,
          sku: sourceItem.sku,
          type: "TRANSFER",
          delta: -qty,
          resultingQty: sourceResult,
          referenceId: refId,
          timestamp,
          note: `${transferNote} (out → ${toGodown})`,
        },
        {
          id: `${Date.now()}-in`,
          itemId: destItem?.id ?? sourceItem.id,
          itemName: sourceItem.name,
          sku: sourceItem.sku,
          type: "TRANSFER",
          delta: qty,
          resultingQty: destResult,
          referenceId: refId,
          timestamp,
          note: `${transferNote} (in ← ${fromGodown})`,
        },
      ]
      success = true
      return { ...current, items: updatedItems, movements: [...movements, ...current.movements] }
    })
    if (success) toast.success(`Transferred ${qty} units: ${fromGodown} → ${toGodown}`)
    else toast.error("Transfer failed. Check source godown stock.")
    return success
  }, [])

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
    localStorage.removeItem(STORAGE_KEY)
    toast.success("Demo data restored")
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
