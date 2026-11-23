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
    <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-slate-50/50 p-1" role="group">
      {label && <span className="px-2 text-xs font-medium text-slate-400">{label}:</span>}
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          aria-pressed={option === value}
          className={`whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
            option === value
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  )
}
