"use client"

import type { ButtonHTMLAttributes, ReactNode } from "react"

export interface TableActionButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary"
  children: ReactNode
}

export function TableActionButton({
  variant = "secondary",
  children,
  className = "",
  type = "button",
  ...props
}: TableActionButtonProps) {
  const baseClasses =
    "inline-flex h-8 min-w-[98px] items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 text-xs font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 active:scale-[0.98] select-none disabled:cursor-not-allowed disabled:opacity-40"

  const variantClasses =
    variant === "primary"
      ? "bg-zinc-950 text-white hover:bg-zinc-800"
      : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400"

  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
