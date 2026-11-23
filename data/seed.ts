import type {
  Customer,
  InventoryItem,
  InventoryState,
  OrderLine,
  PurchaseOrder,
  SaleOrder,
  SellerInfo,
  StockMovement,
  Supplier,
} from "@/types/inventory"

export const STORAGE_KEY = "gada-electronics-demo-v10"

export const SELLER_METADATA: SellerInfo = {
  name: "Gada Electronics",
  tagline: "Consumer Electronics & Home Appliances",
  gstin: "27AABCG4821K1Z5",
  address: "Shop 12-14, Ground Floor, Gokuldham Commercial Complex, Goregaon East, Mumbai 400063",
  phone: "+91 98200 12345",
  owner: "Jethalal Champaklal Gada",
}

export const customersSeed: Customer[] = [
  { id: "c1", name: "Gokuldham Society Committee", phone: "+91 98201 11223", gstin: "27AAATG1122C1Z8", city: "Mumbai" },
  { id: "c2", name: "Roshan Singh Sodhi", phone: "+91 98202 33445", gstin: "27AABPS3344D1Z2", city: "Mumbai" },
  { id: "c3", name: "Taarak Mehta", phone: "+91 98203 55667", gstin: "27AAAPM5566E1Z6", city: "Mumbai" },
  { id: "c4", name: "Krishnan Iyer", phone: "+91 98204 77889", gstin: "27AAAKI7788F1Z0", city: "Mumbai" },
  { id: "c5", name: "Patrakar Popatlal", phone: "+91 98205 99001", gstin: "27AAAPP9900G1Z4", city: "Mumbai" },
  { id: "c6", name: "Babita Iyer", phone: "+91 98206 22334", gstin: "27AAABI2233H1Z7", city: "Mumbai" },
  { id: "c7", name: "Aatmaram Tukaram Bhide", phone: "+91 98207 44556", gstin: "27AAATB4455J1Z1", city: "Mumbai" },
  { id: "c8", name: "Dr. Hansraj Hathi", phone: "+91 98208 66778", gstin: "27AAAHH6677K1Z5", city: "Mumbai" },
]

export const suppliersSeed: Supplier[] = [
  { id: "s1", name: "Sony India B2B", phone: "+91 22 6677 8899", gstin: "27AABCS1972B1Z8", city: "Mumbai" },
  { id: "s2", name: "Voltas Regional Hub", phone: "+91 22 2544 1122", gstin: "27AABCV5544C1Z1", city: "Thane" },
  { id: "s3", name: "LG Electronics West", phone: "+91 20 6711 2233", gstin: "27AABCL9988D1Z5", city: "Pune" },
  { id: "s4", name: "Bhogilal Distributors", phone: "+91 22 2899 4455", gstin: "27AABCB3322E1Z9", city: "Mumbai" },
  { id: "s5", name: "Sundarlal Enterprises", phone: "+91 79 2655 7788", gstin: "24AABCS4455F1Z3", city: "Ahmedabad" },
]

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

function makeSale(
  id: string,
  customerId: string,
  customerName: string,
  lines: OrderLine[],
  date: string,
  status: "Draft" | "Confirmed" | "Paid"
): SaleOrder {
  const subtotal = lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0)
  const gstRate = 18
  const taxAmount = Math.round(subtotal * (gstRate / 100))
  const totalAmount = subtotal + taxAmount

  return {
    id,
    customerId,
    customer: customerName,
    items: lines,
    subtotal,
    gstRate,
    taxAmount,
    totalAmount,
    date,
    createdAt: `${date}T10:00:00+05:30`,
    status,
  }
}

function makePO(
  id: string,
  supplierId: string,
  supplierName: string,
  lines: OrderLine[],
  expectedDate: string,
  status: "Pending" | "Received"
): PurchaseOrder {
  const subtotal = lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0)
  const taxAmount = Math.round(subtotal * 0.18)
  const totalAmount = subtotal + taxAmount

  return {
    id,
    supplierId,
    supplier: supplierName,
    items: lines,
    subtotal,
    taxAmount,
    totalAmount,
    expectedDate,
    createdAt: "2026-11-20T11:00:00+05:30",
    status,
  }
}

export const seed: InventoryState = {
  items: itemSeed,
  customers: customersSeed,
  suppliers: suppliersSeed,
  sales: [
    // --- Last 7 Days (Nov 18 - Nov 24, 2026) --- Total: ₹7,42,901 (6 orders)
    makeSale("SO-1048", "c1", "Gokuldham Society Committee", [line("i1", 2), line("i10", 1)], "2026-11-23", "Paid"),
    makeSale("SO-1047", "c2", "Roshan Singh Sodhi",          [line("i8", 1), line("i9", 2)],   "2026-11-23", "Confirmed"),
    makeSale("SO-1046", "c3", "Taarak Mehta",                [line("i3", 1), line("i7", 1)],   "2026-11-22", "Paid"),
    makeSale("SO-1045", "c4", "Krishnan Iyer",               [line("i6", 1)],                  "2026-11-21", "Confirmed"),
    makeSale("SO-1044", "c5", "Patrakar Popatlal",           [line("i4", 1)],                  "2026-11-20", "Draft"),
    makeSale("SO-1043", "c6", "Babita Iyer",                 [line("i9", 1), line("i10", 1)],  "2026-11-19", "Paid"),

    // --- 8 to 30 Days Ago (Oct 26 - Nov 17, 2026) --- Brings 30d Total to ₹15,20,148 (13 orders)
    makeSale("SO-1042", "c8", "Dr. Hansraj Hathi",           [line("i3", 1), line("i7", 1), line("i9", 2)], "2026-11-15", "Paid"),
    makeSale("SO-1041", "c7", "Aatmaram Tukaram Bhide",       [line("i4", 1), line("i9", 1)],                 "2026-11-12", "Paid"),
    makeSale("SO-1040", "s5", "Sundarlal Enterprises",       [line("i5", 3)],                                "2026-11-10", "Paid"),
    makeSale("SO-1039", "c2", "Roshan Singh Sodhi",          [line("i1", 1)],                                "2026-11-06", "Paid"),
    makeSale("SO-1038", "c1", "Gokuldham Society Committee", [line("i2", 2), line("i8", 1)],                 "2026-11-03", "Paid"),
    makeSale("SO-1037", "c5", "Patrakar Popatlal",           [line("i6", 1)],                                "2026-10-31", "Paid"),
    makeSale("SO-1036", "c6", "Babita Iyer",                 [line("i10", 1)],                               "2026-10-28", "Paid"),

    // --- 31 to 90 Days Ago (Aug 27 - Oct 25, 2026) --- Brings 90d Total to ₹25,07,532 (21 orders)
    makeSale("SO-1035", "c3", "Taarak Mehta",                [line("i1", 1), line("i7", 1)],                 "2026-10-20", "Paid"),
    makeSale("SO-1034", "c8", "Dr. Hansraj Hathi",           [line("i2", 1), line("i3", 1)],                 "2026-10-14", "Paid"),
    makeSale("SO-1033", "c1", "Gokuldham Society Committee", [line("i5", 2), line("i1", 1)],                 "2026-10-05", "Paid"),
    makeSale("SO-1032", "c4", "Krishnan Iyer",               [line("i8", 1), line("i9", 1)],                 "2026-09-28", "Paid"),
    makeSale("SO-1031", "c7", "Aatmaram Tukaram Bhide",       [line("i2", 1)],                                "2026-09-21", "Paid"),
    makeSale("SO-1030", "c2", "Roshan Singh Sodhi",          [line("i8", 1), line("i4", 1)],                 "2026-09-15", "Paid"),
    makeSale("SO-1029", "c6", "Babita Iyer",                 [line("i6", 1), line("i9", 1)],                 "2026-09-08", "Paid"),
    makeSale("SO-1028", "c5", "Patrakar Popatlal",           [line("i1", 1)],                                "2026-09-02", "Paid"),
  ],
  purchases: [
    makePO("PO-2024", "s5", "Sundarlal Enterprises",  [line("i5", 10)],               "2026-11-30", "Pending"),
    makePO("PO-2023", "s1", "Sony India B2B",         [line("i1", 6)],                "2026-11-28", "Pending"),
    makePO("PO-2022", "s2", "Voltas Regional Hub",    [line("i2", 15)],               "2026-11-27", "Pending"),
    makePO("PO-2021", "s3", "LG Electronics West",    [line("i4", 8)],                "2026-11-25", "Received"),
    makePO("PO-2020", "s4", "Bhogilal Distributors",  [line("i7", 12), line("i9", 8)], "2026-11-22", "Received"),
    makePO("PO-2019", "s1", "Sony India B2B",         [line("i1", 8)],                "2026-11-10", "Received"),
    makePO("PO-2018", "s2", "Voltas Regional Hub",    [line("i8", 10)],               "2026-10-25", "Received"),
    makePO("PO-2017", "s3", "LG Electronics West",    [line("i3", 12)],               "2026-10-15", "Received"),
  ],
  movements: [
    {
      id: "m1",
      itemId: "i4",
      itemName: "LG 7.5kg Front Load Washer",
      sku: "GE-WM-75",
      type: "PURCHASE",
      delta: 8,
      resultingQty: 8,
      referenceId: "PO-2021",
      timestamp: "2026-11-23T11:30:00+05:30",
      note: "Stock intake verified from LG Pune Hub",
      performedBy: "Nattu Kaka",
      toGodown: "Andheri Depot",
    },
    {
      id: "m2",
      itemId: "i7",
      itemName: "IFB 28L Convection Microwave",
      sku: "GE-MW-28",
      type: "PURCHASE",
      delta: 12,
      resultingQty: 22,
      referenceId: "PO-2020",
      timestamp: "2026-11-23T10:42:00+05:30",
      note: "Bulk kitchen stock intake verified",
      performedBy: "Nattu Kaka",
      toGodown: "Goregaon Godown",
    },
    {
      id: "m3",
      itemId: "i9",
      itemName: "Philips Air Fryer HD9270 XXL",
      sku: "GE-AF-22",
      type: "PURCHASE",
      delta: 8,
      resultingQty: 16,
      referenceId: "PO-2020",
      timestamp: "2026-11-23T10:42:00+05:30",
      note: "Bulk appliance intake verified",
      performedBy: "Nattu Kaka",
      toGodown: "Goregaon Godown",
    },
    {
      id: "m4",
      itemId: "i1",
      itemName: 'Sony Bravia 55" 4K OLED TV',
      sku: "GE-TV-55",
      type: "SALE",
      delta: -2,
      resultingQty: 14,
      referenceId: "SO-1048",
      timestamp: "2026-11-23T09:15:00+05:30",
      note: "Dispatched for Gokuldham Society clubhouse",
      performedBy: "Bagha",
      fromGodown: "Showroom Floor",
    },
    {
      id: "m5",
      itemId: "i10",
      itemName: "Dyson V12 Detect Slim Vacuum",
      sku: "GE-VC-V12",
      type: "SALE",
      delta: -1,
      resultingQty: 7,
      referenceId: "SO-1048",
      timestamp: "2026-11-23T09:15:00+05:30",
      note: "Dispatched with TV order",
      performedBy: "Bagha",
      fromGodown: "Showroom Floor",
    },
    {
      id: "m6",
      itemId: "i6",
      itemName: "Apple iPhone 16 Pro 256GB",
      sku: "GE-PH-16P",
      type: "SALE",
      delta: -1,
      resultingQty: 2,
      referenceId: "SO-1045",
      timestamp: "2026-11-21T16:30:00+05:30",
      note: "Handed over to Krishnan Iyer at showroom",
      performedBy: "Jethalal Gada",
      fromGodown: "Showroom Floor",
    },
    {
      id: "m7",
      itemId: "i5",
      itemName: "JBL PartyBox 310 Speaker",
      sku: "GE-SP-310",
      type: "SALE",
      delta: -3,
      resultingQty: 0,
      referenceId: "SO-1041",
      timestamp: "2026-11-19T18:00:00+05:30",
      note: "Diwali event dispatch - showroom stock depleted",
      performedBy: "Bagha",
      fromGodown: "Showroom Floor",
    },
  ],
}
