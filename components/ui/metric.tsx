"use client"

import type { LucideIcon } from "lucide-react"

export function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] p-3.5 bg-slate-50/50">
      <p className="text-xs text-slate-500 font-medium">{label}</p>
      <p className="mt-1 text-sm font-semibold tabular-nums text-slate-900 truncate">{value}</p>
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
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
      : trendColor === "amber"
      ? "bg-amber-50 text-amber-700 border-amber-100"
      : "bg-slate-50 text-slate-600 border-slate-200"

  return (
    <article className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-slate-500">{title}</span>
        {Icon && (
          <span className="flex size-8 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
            <Icon size={16} strokeWidth={1.75} />
          </span>
        )}
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight tabular-nums text-slate-900">
        {value}
      </p>
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="text-xs text-slate-400 truncate">{note}</span>
        {trend && (
          <span
            className={`whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium ${trendClass}`}
          >
            {trend}
          </span>
        )}
      </div>
    </article>
  )
}
