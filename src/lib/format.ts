export function formatCurrencyInPaise(amountInPaise: number): string {
  return new Intl.NumberFormat("en-IN", {
    currency: "INR",
    maximumFractionDigits: 2,
    style: "currency",
  }).format(amountInPaise / 100);
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00Z`));
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatEmploymentPeriod(startDate: string, endDate: string | null): string {
  const start = formatDate(startDate);
  return endDate ? `${start} – ${formatDate(endDate)}` : `${start} – Present`;
}
