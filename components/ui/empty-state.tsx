"use client"

import { PackageSearch, RotateCcw } from "lucide-react"

export function EmptyState({
  message,
  detail,
  clear,
}: {
  message: string
  detail?: string
  clear?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.02)]">
      <span className="flex size-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500 border border-slate-200/80">
        <PackageSearch size={22} />
      </span>
      <p className="mt-4 text-sm font-semibold text-slate-900">{message}</p>
      {detail && <p className="mt-1 max-w-sm text-[13px] text-slate-600 leading-normal">{detail}</p>}
      {clear && (
        <button
          type="button"
          onClick={clear}
          className="mt-5 inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 text-[13px] font-medium text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:bg-slate-50 hover:border-slate-400 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 transition-colors"
        >
          <RotateCcw size={14} />
          <span>Reset filters</span>
        </button>
      )}
    </div>
  )
}
