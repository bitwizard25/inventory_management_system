"use client"

import { X } from "lucide-react"
import type { ReactNode } from "react"

export function Overlay({
  onClose,
  title,
  subtitle,
  children,
  width,
}: {
  onClose: () => void
  title: string
  subtitle: string
  children: ReactNode
  width: string
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200 motion-reduce:transition-none"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`flex max-h-[92vh] w-full ${width} flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-2xl ring-1 ring-slate-900/5 animate-in zoom-in-95 duration-200 ease-out motion-reduce:transition-none`}
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 id="modal-title" className="text-xl font-semibold tracking-tight leading-tight text-slate-900 whitespace-nowrap">
              {title}
            </h2>
            <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="flex size-11 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 active:scale-[0.98] transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </section>
    </div>
  )
}
