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
      className="inline-flex h-9 items-center gap-1 rounded-lg bg-slate-100 p-0.5 select-none"
      role="group"
    >
      {label && <span className="px-2 text-xs font-medium text-slate-600">{label}:</span>}
      {options.map((option) => {
        const active = option === value
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            aria-pressed={active}
            className={`h-8 whitespace-nowrap rounded-md px-3 text-[13px] transition-all duration-200 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 ${
              active
                ? "bg-white text-slate-950 shadow-sm font-medium"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}
