"use client"

import type { LucideIcon } from "lucide-react"

export function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">{label}</p>
      <p className="mt-1 text-base font-semibold tabular-nums text-slate-900 truncate">{value}</p>
    </div>
  )
}

export function MetricCard({
  title,
  value,
  note,
  icon: Icon,
  trend,
  trendColor = "slate",
}: {
  title: string
  value: string | number
  note: string
  icon?: LucideIcon
  trend?: string
  trendColor?: "emerald" | "amber" | "slate"
}) {
  const trendClass =
    trendColor === "emerald"
      ? "bg-emerald-500/10 text-emerald-700 ring-1 ring-inset ring-emerald-500/20"
      : trendColor === "amber"
      ? "bg-amber-500/10 text-amber-700 ring-1 ring-inset ring-amber-500/20"
      : "bg-slate-500/10 text-slate-700 ring-1 ring-inset ring-slate-500/20"

  return (
    <article className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all hover:border-slate-300">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-500">{title}</span>
        {Icon && (
          <span className="flex size-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 border border-slate-200/60">
            <Icon size={17} strokeWidth={1.75} />
          </span>
        )}
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight leading-tight tabular-nums text-slate-900">
        {value}
      </p>
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
        <span className="text-xs font-medium text-slate-500 truncate">{note}</span>
        {trend && (
          <span
            className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${trendClass}`}
          >
            {trend}
          </span>
        )}
      </div>
    </article>
  )
}
