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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-[2px] p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`flex max-h-[92vh] w-full ${width} flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-2xl`}
      >
        <div className="flex items-start justify-between border-b border-[#E5E7EB] px-6 py-5">
          <div>
            <h2 id="modal-title" className="text-lg font-semibold tracking-tight text-slate-900">
              {title}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </section>
    </div>
  )
}
