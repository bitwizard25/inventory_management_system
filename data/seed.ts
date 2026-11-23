import type { InventoryItem, InventoryState, OrderLine } from "@/types/inventory"

export const STORAGE_KEY = "gada-electronics-clean-v1"

export const itemSeed: InventoryItem[] = [
  { id: "i1",  sku: "GE-TV-55",  name: 'Sony Bravia 55" 4K OLED TV',      category: "Televisions",       godown: "Showroom Floor",  quantity: 14, minLevel: 5,  unitPrice: 114990, unit: "pcs" },
  { id: "i2",  sku: "GE-AC-15",  name: "Voltas 1.5T 5-Star Split AC",      category: "Air Conditioners",  godown: "Goregaon Godown", quantity: 3,  minLevel: 10, unitPrice: 38500,  unit: "pcs" },
  { id: "i3",  sku: "GE-FR-340", name: "Samsung 340L Frost-Free Fridge",    category: "Refrigerators",     godown: "Goregaon Godown", quantity: 18, minLevel: 8,  unitPrice: 34900,  unit: "pcs" },
  { id: "i4",  sku: "GE-WM-75",  name: "LG 7.5kg Front Load Washer",       category: "Washing Machines",  godown: "Andheri Depot",   quantity: 8,  minLevel: 4,  unitPrice: 31200,  unit: "pcs" },
  { id: "i5",  sku: "GE-SP-310", name: "JBL PartyBox 310 Speaker",         category: "Audio",             godown: "Showroom Floor",  quantity: 0,  minLevel: 4,  unitPrice: 39999,  unit: "pcs" },
  { id: "i6",  sku: "GE-PH-16P", name: "Apple iPhone 16 Pro 256GB",        category: "Smartphones",       godown: "Showroom Floor",  quantity: 2,  minLevel: 4,  unitPrice: 119900, unit: "pcs" },
  { id: "i7",  sku: "GE-MW-28",  name: "IFB 28L Convection Microwave",     category: "Kitchen Appliances",godown: "Goregaon Godown", quantity: 22, minLevel: 10, unitPrice: 14800,  unit: "pcs" },
  { id: "i8",  sku: "GE-AC-20",  name: "Daikin 2.0T Inverter Split AC",    category: "Air Conditioners",  godown: "Andheri Depot",   quantity: 11, minLevel: 5,  unitPrice: 54000,  unit: "pcs" },
  { id: "i9",  sku: "GE-AF-22",  name: "Philips Air Fryer HD9270 XXL",     category: "Kitchen Appliances",godown: "Goregaon Godown", quantity: 16, minLevel: 6,  unitPrice: 12999,  unit: "pcs" },
  { id: "i10", sku: "GE-VC-V12", name: "Dyson V12 Detect Slim Vacuum",     category: "Home Appliances",   godown: "Showroom Floor",  quantity: 7,  minLevel: 3,  unitPrice: 52900,  unit: "pcs" },
]

function line(id: string, qty: number): OrderLine {
  const item = itemSeed.find((entry) => entry.id === id)!
  return {
    itemId: id,
    itemName: item.name,
    sku: item.sku,
    quantity: qty,
    unitPrice: item.unitPrice,
  }
}

export const seed: InventoryState = {
  items: itemSeed,
  sales: [
    { id: "SO-1048", customer: "Gokuldham Society Committee", items: [line("i1", 2), line("i10", 1)], totalAmount: 114990 * 2 + 52900, date: "2026-11-23", status: "Paid" },
    { id: "SO-1047", customer: "Roshan Singh Sodhi",          items: [line("i8", 1), line("i9", 2)],   totalAmount: 54000 + 12999 * 2,  date: "2026-11-23", status: "Confirmed" },
    { id: "SO-1046", customer: "Taarak Mehta",                items: [line("i3", 1), line("i7", 1)],   totalAmount: 34900 + 14800,      date: "2026-11-22", status: "Paid" },
    { id: "SO-1045", customer: "Krishnan Iyer",               items: [line("i6", 1)],                  totalAmount: 119900,             date: "2026-11-21", status: "Confirmed" },
    { id: "SO-1044", customer: "Patrakar Popatlal",           items: [line("i4", 1)],                  totalAmount: 31200,              date: "2026-11-20", status: "Draft" },
    { id: "SO-1043", customer: "Babita Iyer",                 items: [line("i9", 1), line("i10", 1)],  totalAmount: 12999 + 52900,      date: "2026-11-19", status: "Paid" },
  ],
  purchases: [
    { id: "PO-2024", supplier: "Sundarlal Enterprises",  items: [line("i5", 10)],               totalAmount: 39999 * 10,  expectedDate: "2026-11-30", status: "Pending" },
    { id: "PO-2023", supplier: "Sony India B2B",         items: [line("i1", 6)],                totalAmount: 114990 * 6,  expectedDate: "2026-11-28", status: "Pending" },
    { id: "PO-2022", supplier: "Voltas Regional Hub",    items: [line("i2", 15)],               totalAmount: 38500 * 15,  expectedDate: "2026-11-27", status: "Pending" },
    { id: "PO-2021", supplier: "LG Electronics West",    items: [line("i4", 8)],                totalAmount: 31200 * 8,   expectedDate: "2026-11-25", status: "Received" },
    { id: "PO-2020", supplier: "Bhogilal Distributors",  items: [line("i7", 12), line("i9", 8)], totalAmount: 14800 * 12 + 12999 * 8, expectedDate: "2026-11-22", status: "Received" },
  ],
  movements: [
    { id: "m1", itemId: "i4",  itemName: "LG 7.5kg Front Load Washer",    sku: "GE-WM-75",  type: "PURCHASE",   delta: 8,  resultingQty: 8,  referenceId: "PO-2021",  timestamp: "2026-11-23T11:30:00+05:30", note: "Verified & stocked by Nattu Kaka" },
    { id: "m2", itemId: "i7",  itemName: "IFB 28L Convection Microwave",  sku: "GE-MW-28",  type: "PURCHASE",   delta: 12, resultingQty: 22, referenceId: "PO-2020",  timestamp: "2026-11-23T10:42:00+05:30", note: "Verified & stocked by Nattu Kaka" },
    { id: "m3", itemId: "i9",  itemName: "Philips Air Fryer HD9270 XXL",  sku: "GE-AF-22",  type: "PURCHASE",   delta: 8,  resultingQty: 16, referenceId: "PO-2020",  timestamp: "2026-11-23T10:42:00+05:30", note: "Verified & stocked by Nattu Kaka" },
    { id: "m4", itemId: "i1",  itemName: 'Sony Bravia 55" 4K OLED TV',   sku: "GE-TV-55",  type: "SALE",       delta: -2, resultingQty: 14, referenceId: "SO-1048",  timestamp: "2026-11-23T09:15:00+05:30", note: "Dispatched by Bagha – Gokuldham delivery" },
    { id: "m5", itemId: "i10", itemName: "Dyson V12 Detect Slim Vacuum",  sku: "GE-VC-V12", type: "SALE",       delta: -1, resultingQty: 7,  referenceId: "SO-1048",  timestamp: "2026-11-23T09:15:00+05:30", note: "Dispatched by Bagha – Gokuldham delivery" },
    { id: "m6", itemId: "i6",  itemName: "Apple iPhone 16 Pro 256GB",     sku: "GE-PH-16P", type: "SALE",       delta: -1, resultingQty: 2,  referenceId: "SO-1045",  timestamp: "2026-11-21T16:30:00+05:30", note: "Dispatched by Bagha – Iyer Bhai" },
    { id: "m7", itemId: "i5",  itemName: "JBL PartyBox 310 Speaker",      sku: "GE-SP-310", type: "SALE",       delta: -3, resultingQty: 0,  referenceId: "SO-1041",  timestamp: "2026-11-19T18:00:00+05:30", note: "Dispatched by Bagha – Diwali party stock" },
  ],
}
