const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
]

export function formatINR(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value)
}

export function dateLabel(date: string): string {
  const [year, month, day] = date.split("-").map(Number)
  return `${day} ${monthNames[month - 1]} ${year}`
}

export function timeLabel(date: string): string {
  const indiaTime = new Date(new Date(date).getTime() + 330 * 60_000)
  const hours = indiaTime.getUTCHours()
  return `${indiaTime.getUTCDate()} ${monthNames[indiaTime.getUTCMonth()]}, ${
    hours % 12 || 12
  }:${String(indiaTime.getUTCMinutes()).padStart(2, "0")} ${
    hours >= 12 ? "pm" : "am"
  }`
}
