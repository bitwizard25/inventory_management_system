"use client"

import { Search } from "lucide-react"
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
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={placeholder}
            aria-label={placeholder}
            className="h-9 w-full rounded-lg border border-[#E5E7EB] bg-white pl-9 pr-3 text-[13px] outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
          />
        </div>
        {children}
      </div>
      {summary && (
        <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-3 text-xs text-slate-500">
          <span>{summary}</span>
          {onClear && (
            <button
              onClick={onClear}
              className="font-medium text-slate-700 hover:text-slate-900 hover:underline"
            >
              Reset filters
            </button>
          )}
        </div>
      )}
    </div>
  )
}
