import Link from "next/link";

type GoalCardProps = { title: string; description: string; href: string; label: string; primary?: boolean };

export function GoalCard({ title, description, href, label, primary = false }: GoalCardProps) {
  return <Link href={href} className={`group rounded-2xl p-4 transition hover:-translate-y-0.5 ${primary ? "bg-[var(--brand)] text-white shadow-md hover:bg-[var(--brand-dark)]" : "bg-white text-slate-950 shadow-sm hover:shadow-md"}`}><span className="flex items-start justify-between gap-3"><span className="font-semibold">{title}</span><span aria-hidden="true" className="text-lg transition-transform group-hover:translate-x-1">↗</span></span><span className={`mt-2 block text-sm leading-5 ${primary ? "text-teal-50" : "text-[var(--muted)]"}`}>{description}</span><span className={`mt-4 block text-xs font-semibold ${primary ? "text-teal-100" : "text-[var(--brand-dark)]"}`}>{label}</span></Link>;
}
