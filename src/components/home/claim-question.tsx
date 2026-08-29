import Link from "next/link";

type ClaimQuestionProps = {
  helpPrompt: {
    title: string;
    description: string;
    href: string;
    linkLabel: string;
  };
};

export function ClaimQuestion({ helpPrompt }: ClaimQuestionProps) {
  return (
    <aside className="mt-8 flex flex-col gap-4 rounded-2xl border border-teal-200 bg-teal-50 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div>
        <h2 className="font-semibold text-slate-950">{helpPrompt.title}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-700">{helpPrompt.description}</p>
      </div>
      <Link href={helpPrompt.href} className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl border border-[var(--brand)] px-4 text-sm font-semibold text-[var(--brand-dark)] hover:bg-white">
        {helpPrompt.linkLabel}
      </Link>
    </aside>
  );
}
