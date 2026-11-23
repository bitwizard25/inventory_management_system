"use client"

import { PackageSearch } from "lucide-react"

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
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <span className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <PackageSearch size={18} />
      </span>
      <p className="mt-3 text-[13px] font-semibold text-slate-800">{message}</p>
      {detail && <p className="mt-1 text-xs text-slate-400">{detail}</p>}
      {clear && (
        <button
          onClick={clear}
          className="mt-3 text-xs font-medium text-slate-700 hover:underline"
        >
          Reset filters
        </button>
      )}
    </div>
  )
}
