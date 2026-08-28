type SectionIntroProps = { id?: string; eyebrow: string; title: string; description: string; light?: boolean };

export function SectionIntro({ id, eyebrow, title, description, light = false }: SectionIntroProps) {
  return <div className="max-w-2xl"><p className={light ? "text-xs font-bold uppercase tracking-[0.12em] text-teal-200" : "eyebrow"}>{eyebrow}</p><h2 id={id} className={`mt-3 text-3xl font-bold tracking-tight sm:text-4xl ${light ? "text-white" : "text-slate-950"}`}>{title}</h2><p className={`mt-4 text-base leading-7 ${light ? "text-teal-50" : "text-[var(--muted)]"}`}>{description}</p></div>;
}
