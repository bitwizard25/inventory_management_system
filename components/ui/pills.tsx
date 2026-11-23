"use client"

export function Pills<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: readonly T[] | T[]
  value: T
  onChange: (value: T) => void
  label?: string
}) {
  return (
    <div
      className="inline-flex min-h-[44px] flex-wrap items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-100/70 p-1 select-none"
      role="group"
    >
      {label && <span className="px-2 text-xs font-semibold uppercase tracking-wider text-slate-600">{label}:</span>}
      {options.map((option) => {
        const active = option === value
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            aria-pressed={active}
            className={`min-h-[36px] whitespace-nowrap rounded-md px-3 text-[13px] font-medium transition-all duration-200 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 ${
              active
                ? "bg-[#09090B] text-white shadow-sm font-semibold"
                : "text-slate-700 hover:bg-white/80 hover:text-slate-950"
            }`}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}
