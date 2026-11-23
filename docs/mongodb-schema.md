# Gada Electronics — MongoDB Database Architecture

This document defines the production MongoDB schema, document validation rules, indexing strategies, and aggregation pipelines for the Gada Electronics Inventory Management System.

---

## 1. Database Collections Overview

MongoDB's document model allows natural embedding of line items within order documents (`sales_orders` and `purchase_orders`), while maintaining relational references and an append-only transaction ledger (`stock_ledger`).

| Collection | Role | Document Pattern |
| :--- | :--- | :--- |
| `godowns` | Multi-warehouse physical locations | Master document |
| `customers` | B2B & retail buyers with GSTIN metadata | Master document |
| `suppliers` | OEM distributors & suppliers | Master document |
| `inventory_items` | SKU catalog, pricing & godown stock levels | Master document with quantity guard |
| `sales_orders` | Customer sales invoices & GST billing | Embedded line items (`items[]`) |
| `purchase_orders` | Procurement orders & GRN status | Embedded line items (`items[]`) |
| `stock_ledger` | Immutable chronological audit trail | Append-only event ledger |

---

## 2. Collection Schemas & JSON Schema Validation

### `godowns`
```javascript
db.createCollection("godowns", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["_id", "name", "code", "address", "city", "isActive"],
      properties: {
        _id: { bsonType: "string" }, // e.g. "g-showroom"
        name: { bsonType: "string" },
        code: { bsonType: "string" },
        address: { bsonType: "string" },
        city: { bsonType: "string" },
        isActive: { bsonType: "bool" },
        createdAt: { bsonType: "date" }
      }
    }
  }
});

// Indexes
db.godowns.createIndex({ code: 1 }, { unique: true });
db.godowns.createIndex({ name: 1 }, { unique: true });
```

---

### `customers`
```javascript
db.createCollection("customers", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["_id", "name", "phone", "gstin", "city"],
      properties: {
        _id: { bsonType: "string" }, // e.g. "c1"
        name: { bsonType: "string" },
        phone: { bsonType: "string" },
        gstin: { bsonType: "string" },
        city: { bsonType: "string" },
        address: { bsonType: "string" },
        createdAt: { bsonType: "date" }
      }
    }
  }
});

// Indexes
db.customers.createIndex({ name: 1 });
db.customers.createIndex({ gstin: 1 });
```

---

### `suppliers`
```javascript
db.createCollection("suppliers", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["_id", "name", "phone", "gstin", "city"],
      properties: {
        _id: { bsonType: "string" }, // e.g. "s1"
        name: { bsonType: "string" },
        phone: { bsonType: "string" },
        gstin: { bsonType: "string" },
        city: { bsonType: "string" },
        contactPerson: { bsonType: "string" },
        createdAt: { bsonType: "date" }
      }
    }
  }
});

// Indexes
db.suppliers.createIndex({ name: 1 });
db.suppliers.createIndex({ gstin: 1 });
```

---

### `inventory_items`
```javascript
db.createCollection("inventory_items", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["_id", "sku", "name", "category", "godown", "quantity", "minLevel", "unitPrice", "unit"],
      properties: {
        _id: { bsonType: "string" }, // e.g. "i1"
        sku: { bsonType: "string" },
        name: { bsonType: "string" },
        category: { bsonType: "string" },
        godown: { 
          enum: ["Showroom Floor", "Goregaon Godown", "Andheri Depot"] 
        },
        quantity: { 
          bsonType: "int",
          minimum: 0 // Strict oversell prevention
        },
        minLevel: { 
          bsonType: "int",
          minimum: 0 
        },
        unitPrice: { 
          bsonType: ["double", "int", "long", "decimal"],
          minimum: 0 
        },
        unit: { bsonType: "string" },
        updatedAt: { bsonType: "date" },
        createdAt: { bsonType: "date" }
      }
    }
  }
});

// Indexes
db.inventory_items.createIndex({ sku: 1 }, { unique: true });
db.inventory_items.createIndex({ godown: 1, category: 1 });
db.inventory_items.createIndex({ quantity: 1, minLevel: 1 });
```

---

### `sales_orders`
```javascript
db.createCollection("sales_orders", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["_id", "customer", "items", "subtotal", "gstRate", "taxAmount", "totalAmount", "date", "status"],
      properties: {
        _id: { bsonType: "string" }, // e.g. "SO-1081"
        customerId: { bsonType: "string" },
        customer: { bsonType: "string" },
        items: {
          bsonType: "array",
          minItems: 1,
          items: {
            bsonType: "object",
            required: ["itemId", "itemName", "sku", "quantity", "unitPrice"],
            properties: {
              itemId: { bsonType: "string" },
              itemName: { bsonType: "string" },
              sku: { bsonType: "string" },
              quantity: { bsonType: "int", minimum: 1 },
              unitPrice: { bsonType: ["double", "int", "long", "decimal"], minimum: 0 }
            }
          }
        },
        subtotal: { bsonType: ["double", "int", "long", "decimal"] },
        gstRate: { bsonType: ["double", "int"], enum: [0, 5, 12, 18, 28] },
        taxAmount: { bsonType: ["double", "int", "long", "decimal"] },
        totalAmount: { bsonType: ["double", "int", "long", "decimal"] },
        date: { bsonType: "string" }, // YYYY-MM-DD
        status: { enum: ["Draft", "Confirmed", "Paid"] },
        createdAt: { bsonType: "date" }
      }
    }
  }
});

// Indexes
db.sales_orders.createIndex({ date: -1 });
db.sales_orders.createIndex({ status: 1 });
db.sales_orders.createIndex({ customer: 1 });
```

---

### `purchase_orders`
```javascript
db.createCollection("purchase_orders", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["_id", "supplier", "items", "subtotal", "taxAmount", "totalAmount", "expectedDate", "status"],
      properties: {
        _id: { bsonType: "string" }, // e.g. "PO-1042"
        supplierId: { bsonType: "string" },
        supplier: { bsonType: "string" },
        items: {
          bsonType: "array",
          minItems: 1,
          items: {
            bsonType: "object",
            required: ["itemId", "itemName", "sku", "quantity", "unitPrice"],
            properties: {
              itemId: { bsonType: "string" },
              itemName: { bsonType: "string" },
              sku: { bsonType: "string" },
              quantity: { bsonType: "int", minimum: 1 },
              unitPrice: { bsonType: ["double", "int", "long", "decimal"], minimum: 0 }
            }
          }
        },
        subtotal: { bsonType: ["double", "int", "long", "decimal"] },
        taxAmount: { bsonType: ["double", "int", "long", "decimal"] },
        totalAmount: { bsonType: ["double", "int", "long", "decimal"] },
        expectedDate: { bsonType: "string" },
        status: { enum: ["Pending", "Received"] },
        createdAt: { bsonType: "date" }
      }
    }
  }
});

// Indexes
db.purchase_orders.createIndex({ status: 1 });
db.purchase_orders.createIndex({ expectedDate: 1 });
db.purchase_orders.createIndex({ supplier: 1 });
```

---

### `stock_ledger` (Append-Only Audit Collection)
```javascript
db.createCollection("stock_ledger", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["_id", "itemId", "sku", "type", "delta", "resultingQty", "referenceId", "timestamp", "performedBy"],
      properties: {
        _id: { bsonType: "string" },
        itemId: { bsonType: "string" },
        itemName: { bsonType: "string" },
        sku: { bsonType: "string" },
        type: { enum: ["PURCHASE", "SALE", "ADJUSTMENT", "TRANSFER"] },
        delta: { bsonType: "int" },
        resultingQty: { bsonType: "int", minimum: 0 },
        referenceId: { bsonType: "string" },
        fromGodown: { bsonType: "string" },
        toGodown: { bsonType: "string" },
        performedBy: { enum: ["Jethalal Gada", "Nattu Kaka", "Bagha"] },
        note: { bsonType: "string" },
        timestamp: { bsonType: "string" },
        createdAt: { bsonType: "date" }
      }
    }
  }
});

// Indexes
db.stock_ledger.createIndex({ itemId: 1, timestamp: -1 });
db.stock_ledger.createIndex({ referenceId: 1 });
db.stock_ledger.createIndex({ type: 1 });
db.stock_ledger.createIndex({ createdAt: -1 });
```

---

## 3. Real-Time Low-Stock Aggregation Pipeline

```javascript
db.inventory_items.aggregate([
  {
    $match: {
      $expr: { $lte: ["$quantity", "$minLevel"] }
    }
  },
  {
    $project: {
      sku: 1,
      name: 1,
      category: 1,
      godown: 1,
      quantity: 1,
      minLevel: 1,
      shortageQty: { $subtract: ["$minLevel", "$quantity"] },
      suggestedReorderQty: {
        $subtract: [{ $multiply: ["$minLevel", 2] }, "$quantity"]
      },
      unitPrice: 1,
      estimatedReorderCost: {
        $multiply: [
          { $subtract: [{ $multiply: ["$minLevel", 2] }, "$quantity"] },
          "$unitPrice"
        ]
      }
    }
  },
  { $sort: { shortageQty: -1 } }
]);
```
