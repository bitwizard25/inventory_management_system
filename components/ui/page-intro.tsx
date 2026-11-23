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
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h2>
        <p className="mt-0.5 text-[13px] text-slate-500">{description}</p>
      </div>
      {action}
    </div>
  )
}
