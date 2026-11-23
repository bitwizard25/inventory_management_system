# Gada Electronics — Inventory Management System

A modern, high-performance inventory, warehouse, sales, and purchasing management application built for **Gada Electronics** (Goregaon East, Mumbai). Engineered with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS**, styled with a refined **Linear / Vercel / Mercury B2B SaaS** aesthetic.

---

## Overview

Gada Electronics operates across three primary warehouse facilities in Mumbai:
- **Showroom Floor** (Retail showcase & high-value electronics)
- **Goregaon Godown** (Central warehouse & cooling appliances)
- **Andheri Depot** (Depot storage & home appliances)

This system provides real-time stock ledger synchronization, intelligent low-stock replenishment alerts, printable GST-compliant tax invoices, and fiscal analytics.

---

## Key Features

### 1. Real-Time Stock Tracking & Multi-Godown Ledger
- Live quantities, safety minimums, and inventory valuations across all warehouses.
- Immutable audit ledger recording every transaction: `PURCHASE`, `SALE`, `ADJUSTMENT`, and `TRANSFER`.
- Quick stock adjustment drawer with audit notes referencing floor managers (*Nattu Kaka*, *Bagha*).

### 2. Low-Stock Alerts & Connected Reordering
- Visual threshold indicators with micro-badges and progress trackers.
- One-click **Reorder** triggers a pre-filled Purchase Order modal calculating required units based on minimum stock rules.
- **Mark Received** actions automatically restock warehouse inventory and update the ledger.

### 3. Sales Order & Invoice Management
- Live customer order creation with inventory validation (prevents overselling beyond available warehouse stock).
- Instant printable tax invoices with automatic 18% GST calculation, customer bill-to details, and authorized sign-off.
- Order lifecycle states: `Draft` → `Confirmed` → `Paid`.

### 4. Interactive Reports & CSV Export
- Dynamic charts powered by **Recharts**:
  - Horizontal Bar Chart for product category valuation
  - Area Chart for customer revenue distribution (incl. GST)
  - Stacked Bar Chart for vendor spend (Pending vs. Received)
- Comprehensive table breakdown with single-click **Export to CSV**.

### 5. Linear / Vercel Design System
- `#F8F9FA` canvas with crisp 1px bordered `#FFFFFF` cards (`#E5E7EB`).
- Obsidian black primary CTAs (`#09090B`, hover `#27272A`).
- Delicate 6px status dots for semantic indicators (`In stock`, `Low stock`, `Out of stock`).
- Monospaced numeric density (`tabular-nums`) across all SKUs, ₹ INR currencies, and timestamps.
- Zero horizontal clipping with calibrated table layouts for 1280px–1440px+ displays.

---

## Clean Architecture Structure

The codebase is organized following Clean Architecture principles with strict separation of concerns:

```
├── app/
│   ├── globals.css                   # Global styles & Tailwind configuration
│   ├── layout.tsx                    # Root layout with Vercel Analytics
│   └── page.tsx                      # Page entry point wrapping AppShell
├── components/
│   ├── layout/
│   │   ├── app-shell.tsx             # Root layout orchestrator & drawer/modal host
│   │   ├── header.tsx                # Sticky top bar with search & notification dropdown
│   │   └── sidebar.tsx               # Navigation drawer with warehouse selection & profile
│   ├── shared/
│   │   ├── detail-drawer.tsx         # Slide-in drawer for stock history & invoices
│   │   └── order-modal.tsx           # Modals for creating sales and purchase orders
│   └── ui/
│       ├── button.tsx                # Base button component
│       ├── empty-state.tsx           # Empty state with search icon
│       ├── filter-bar.tsx            # Filter toolbar wrapper
│       ├── metric.tsx                # Metric boxes and KPI cards
│       ├── overlay.tsx               # Reusable dialog backdrop
│       ├── page-intro.tsx            # Page header and action section
│       ├── pills.tsx                 # Segmented button controls
│       ├── status-badge.tsx          # Micro-badges with status indicator dots
│       └── stock-level.tsx           # Ratio progress bar
├── data/
│   └── seed.ts                       # Realistic initial catalog & demo records
├── features/
│   ├── dashboard/
│   │   └── dashboard-view.tsx        # Overview cards, low-stock table & recent activity
│   ├── purchases/
│   │   └── purchase-view.tsx         # B2B vendor purchase orders & receipts
│   ├── reports/
│   │   └── reports-view.tsx          # Charts, valuation summaries & CSV exports
│   ├── sales/
│   │   └── sales-view.tsx            # Customer sales orders & invoices
│   └── stock/
│       └── stock-view.tsx            # Live inventory table & godown filters
├── hooks/
│   └── use-inventory.tsx             # Centralized React context, actions & localStorage sync
├── lib/
│   ├── constants.ts                  # Godown names, navigation config & button styles
│   ├── format.ts                     # Currency (₹ INR), date and time formatters
│   └── utils.ts                      # Tailwind merge utility (cn)
├── types/
│   └── inventory.ts                  # TypeScript models, order lines & status types
└── public/                           # Application icons and manifest
```

---

## Getting Started

### Prerequisites
- **Node.js** >= 18.0.0
- **pnpm** >= 9.0.0 (recommended)

### Installation
```bash
# Clone the repository
git clone git@github-personal:bitwizard25/inventory_management_system.git
cd inventory_management_system

# Install dependencies
pnpm install
```

### Running Locally
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Type Checking & Production Build
```bash
# Verify TypeScript types
pnpm tsc --noEmit

# Create optimized production build
pnpm build

# Start production server
pnpm start
```

---

## Tech Stack

- **Framework**: Next.js 16 (App Router with Turbopack)
- **UI Library**: React 19
- **Language**: TypeScript 5.7
- **Styling**: Tailwind CSS v4, Lucide React icons
- **Charts**: Recharts
- **Notifications**: Sonner

---

## License

Private & proprietary — Gada Electronics.
