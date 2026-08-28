import type { HTMLAttributes } from "react";

export type StatusSeverity = "neutral" | "success" | "info" | "warning" | "danger";

const severityStyles: Record<StatusSeverity, string> = {
  neutral: "bg-slate-100 text-slate-700",
  success: "bg-emerald-100 text-emerald-800",
  info: "bg-sky-100 text-sky-800",
  warning: "bg-amber-100 text-amber-900",
  danger: "bg-rose-100 text-rose-800",
};

type StatusBadgeProps = HTMLAttributes<HTMLSpanElement> & { severity?: StatusSeverity };

export function StatusBadge({ severity = "neutral", className = "", children, ...props }: StatusBadgeProps) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${severityStyles[severity]} ${className}`.trim()} {...props}>{children}</span>;
}
