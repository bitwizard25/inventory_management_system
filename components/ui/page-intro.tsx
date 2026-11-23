"use client"

import type { ReactNode } from "react"

export function PageIntro({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="flex min-h-[48px] flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        <h2 className="text-2xl font-bold tracking-[-0.025em] leading-tight text-slate-900 whitespace-nowrap">{title}</h2>
        <p className="mt-1 text-[14px] text-slate-500 leading-normal">{description}</p>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
