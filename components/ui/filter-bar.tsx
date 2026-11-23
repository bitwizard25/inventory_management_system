"use client"

import { RotateCcw, Search, X } from "lucide-react"
import type { ReactNode } from "react"

export function FilterBar({
  search,
  onSearch,
  children,
  summary,
  onClear,
  placeholder,
}: {
  search: string
  onSearch: (value: string) => void
  children?: ReactNode
  summary?: string
  onClear?: () => void
  placeholder: string
}) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search input with rounded-lg 8px control shape, >=3:1 border contrast */}
        <div className="relative min-w-[240px] flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={placeholder}
            aria-label={placeholder}
            className="h-9 w-full rounded-lg border border-slate-300 bg-slate-50/50 pl-10 pr-9 text-[13px] text-slate-900 placeholder:text-slate-500 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 hover:border-slate-400"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearch("")}
              aria-label="Clear search input"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
            >
              <X size={15} />
            </button>
          )}
        </div>
        {children}
      </div>
      {summary && (
        <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-[14px] text-slate-600">
          <span className="font-medium text-slate-700">{summary}</span>
          {onClear && (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-950 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
            >
              <RotateCcw size={13} />
              <span>Reset filters</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
