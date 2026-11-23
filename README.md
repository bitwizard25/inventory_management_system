# Gada Electronics — Enterprise Inventory Management System

[![Live Demo on Vercel](https://img.shields.io/badge/Live_Demo-Vercel-09090B?style=for-the-badge&logo=vercel&logoColor=white)](https://gada-electronics-inventory.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16.4-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

A high-density B2B inventory, multi-godown warehouse ledger, procurement, and GST billing platform designed with a sleek **Linear / Vercel / Mercury** aesthetic. Built for real-world enterprise workflows with zero mock latency, optimistic state reconciliation, and full client-side persistence.

---

## ⚡ Connected Enterprise Workflows

The application models complete end-to-end retail and procurement lifecycles in real time:

- **Purchase Received → Stock ↑**: Marking an OEM Purchase Order as received immediately updates warehouse inventory quantities, generates an immutable Goods Receipt Note (`GRN`), and logs an audit record tagged with the warehouse technician (`Nattu Kaka` / `Bagha`).
- **Sale Confirmed → Stock ↓ + Oversell Guard**: Customer invoices enforce real-time stock validation to prevent negative warehouse balances, immediately deduct inventory upon order confirmation, and generate a printable 18% GST B2B tax invoice.
- **Low Stock → Dashboard Alert → 1-Click Reorder**: Stock levels falling at or below critical minimum thresholds automatically trigger urgent dashboard alerts with a 1-click reorder CTA that pre-fills a supplier Purchase Order with smart replenishment math (`minLevel * 2 - currentQty`).

---

## 📐 Architecture & Modular Structure

Engineered using strict single-responsibility principles and zero monostore lock-in. Domain models directly mirror our production MongoDB schema specification in [`docs/mongodb-schema.md`](./docs/mongodb-schema.md).

```
inoventry/
├── app/                        # Next.js 16 App Router (SSR layout + metadata)
├── types/                      # Canonical domain models (Item, Order, Ledger, Party)
│   └── inventory.ts            # SaleOrder, PurchaseOrder, Customer, Supplier, Movement
├── data/                       # Seed fixtures & initial demo state
│   └── seed.ts                 # Catalog items, seed parties & Maharashtra GSTIN metadata
├── hooks/                      # Business logic & reactive state orchestration
│   └── use-inventory.tsx       # Context provider with localStorage v5 persistence & rollback
├── components/
│   ├── layout/                 # AppShell orchestrator, sticky TopBar & responsive Sidebar
│   ├── shared/                 # Focused composite drawers & dialogs
│   │   ├── detail-drawer.tsx   # Thin router delegating to specialized drawer subcomponents
│   │   ├── stock-detail-drawer.tsx # Stock history timeline & quick manual adjustments
│   │   ├── invoice-drawer.tsx  # Print-friendly 18% GST tax invoice with customer metadata
│   │   ├── purchase-drawer.tsx # PO supplier summary & one-click GRN intake
│   │   └── order-modal.tsx     # B2B order creation with live warehouse oversell guards
│   └── ui/                     # Atomic micro-components (FilterBar, Pills, StatusBadge, Metric)
├── features/                   # Self-contained view modules
│   ├── dashboard/              # KPI metrics, low-stock alerts & recent ledger timeline
│   ├── stock/                  # Live catalog search, godown filters & stock-level indicators
│   ├── sales/                  # Customer sales orders, status filters & invoice drawer triggers
│   ├── purchases/              # Distributor procurement orders & receipt tracking
│   └── reports/                # Recharts visualizations (valuation, revenue, vendor spend) + CSV export
└── docs/
    └── mongodb-schema.md       # Production MongoDB collection validation, indexes & pipelines
```

---

## 🎨 Key UI / UX Decisions

- **Linear / Mercury Aesthetic**: High-contrast `#F8F9FA` canvas with crisp `#FFFFFF` cards, 1px `#E5E7EB` borders, and obsidian black (`#09090B`) primary CTAs. Semantic amber, emerald, and rose are strictly reserved for 6px status indicators and soft-tinted micro-badges.
- **Progressive Disclosure Drawers**: Multi-level operations (inventory adjustments, stock ledger history, printable B2B GST tax invoices, and PO inspections) slide smoothly in contextual 540px drawers without ripping users out of their current filter or table scroll position.
- **Enterprise Density & Zero Text-Wrap**: Designed with strict enterprise typography (`text-[13px]` tabular data, `font-mono` on SKUs and currency values, `whitespace-nowrap` on action buttons and badges) preventing broken two-line wrapping on enterprise viewports (1280px–1440px+).
- **Zero-Latency Client-Side State**: Powered by React Context and `localStorage` (`gada-electronics-demo-v5`) with safe hydration fallbacks, enabling rapid testing, offline demonstration, and single-click demo data resets.

---

## 🚀 Quick Local Setup

Ensure you have **Node.js 18+** and **pnpm** installed.

```bash
# 1. Clone repository
git clone git@github-personal:bitwizard25/inventory_management_system.git
cd inventory_management_system

# 2. Install dependencies
pnpm install

# 3. Start development server (Turbopack enabled)
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the live app.

### Production Build & Type Check
```bash
pnpm tsc --noEmit && pnpm build
```

---

## 📄 License

MIT © [Gada Electronics](https://github.com/bitwizard25/inventory_management_system)
