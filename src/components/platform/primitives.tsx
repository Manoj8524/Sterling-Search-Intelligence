import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, SearchX, TriangleAlert, Inbox } from "lucide-react";
import type { ComponentType, MouseEvent, ReactNode } from "react";

/** Link with loosened typing, for generic nav data (breadcrumbs, cards). */
export const LooseLink = Link as unknown as ComponentType<{
  to: string;
  params?: Record<string, string> | undefined;
  className?: string | undefined;
  children?: ReactNode;
  onClick?: ((event: MouseEvent<HTMLAnchorElement>) => void) | undefined;
}>;


/* ------------------------------------------------------------------ scores */

export const scoreTone = (v: number) =>
  v >= 80 ? "success" : v >= 65 ? "primary" : v >= 50 ? "warning" : "destructive";

const toneClasses: Record<string, string> = {
  success: "bg-success/12 text-success border-success/25",
  primary: "bg-primary/10 text-primary border-primary/25",
  warning: "bg-warning/18 text-warning-foreground border-warning/40",
  destructive: "bg-destructive/10 text-destructive border-destructive/25",
};

export function ScoreBadge({ value, className }: { value: number; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex min-w-11 items-center justify-center rounded-md border px-2 py-0.5 text-xs font-semibold tabular-nums",
        toneClasses[scoreTone(value)],
        className,
      )}
    >
      {value}
    </span>
  );
}

const levelClasses: Record<string, string> = {
  "Very High": "bg-destructive/10 text-destructive border-destructive/25",
  High: "bg-warning/18 text-warning-foreground border-warning/40",
  Medium: "bg-primary/10 text-primary border-primary/25",
  Low: "bg-muted text-muted-foreground border-border",
  Critical: "bg-destructive/12 text-destructive border-destructive/30",
  Strong: "bg-success/12 text-success border-success/25",
  Partial: "bg-warning/18 text-warning-foreground border-warning/40",
  Missing: "bg-destructive/10 text-destructive border-destructive/25",
  None: "bg-destructive/10 text-destructive border-destructive/25",
  Moderate: "bg-primary/10 text-primary border-primary/25",
  Weak: "bg-warning/18 text-warning-foreground border-warning/40",
  Optimized: "bg-success/12 text-success border-success/25",
  Improving: "bg-primary/10 text-primary border-primary/25",
  "Needs Attention": "bg-warning/18 text-warning-foreground border-warning/40",
  "At Risk": "bg-destructive/10 text-destructive border-destructive/25",
  Open: "bg-primary/10 text-primary border-primary/25",
  "In Progress": "bg-warning/18 text-warning-foreground border-warning/40",
  Completed: "bg-success/12 text-success border-success/25",
  Yes: "bg-success/12 text-success border-success/25",
  No: "bg-destructive/10 text-destructive border-destructive/25",
};

export function StatusBadge({ value, className }: { value: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        levelClasses[value] ?? "bg-muted text-muted-foreground border-border",
        className,
      )}
    >
      {value}
    </span>
  );
}

const priorityClasses: Record<string, string> = {
  P1: "bg-destructive text-destructive-foreground border-transparent",
  P2: "bg-warning text-warning-foreground border-transparent",
  P3: "bg-secondary text-secondary-foreground border-border",
};

export function PriorityBadge({ value }: { value: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-bold tracking-wide",
        priorityClasses[value] ?? "bg-muted text-muted-foreground",
      )}
    >
      {value}
    </span>
  );
}

export function ScoreRing({
  value,
  label,
  size = 132,
  tone = "primary",
}: {
  value: number;
  label?: string;
  size?: number;
  tone?: "primary" | "seo" | "aeo" | "geo";
}) {
  const r = size / 2 - 9;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - value / 100);
  const strokeVar = { primary: "var(--primary)", seo: "var(--seo)", aeo: "var(--aeo)", geo: "var(--geo)" }[tone];
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--muted)" strokeWidth={9} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={strokeVar}
          strokeWidth={9}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 700ms ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold tabular-nums">{value}</span>
        {label ? (
          <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">{label}</span>
        ) : (
          <span className="text-[11px] text-muted-foreground">/ 100</span>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------- cards */

export function StatCard({
  label,
  value,
  suffix,
  delta,
  tone,
  icon,
  className,
}: {
  label: string;
  value: string | number;
  suffix?: string;
  delta?: string;
  tone?: "seo" | "aeo" | "geo" | "brand";
  icon?: ReactNode;
  className?: string;
}) {
  const bar = {
    seo: "bg-seo",
    aeo: "bg-aeo",
    geo: "bg-geo",
    brand: "bg-primary",
  }[tone ?? "brand"];
  return (
    <div className={cn("surface-card relative overflow-hidden p-5", className)}>
      <span className={cn("absolute inset-x-0 top-0 h-1", bar)} />
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{label}</p>
        {icon ? <span className="text-muted-foreground">{icon}</span> : null}
      </div>
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-3xl font-bold tabular-nums">{value}</span>
        {suffix ? <span className="text-sm text-muted-foreground">{suffix}</span> : null}
      </div>
      {delta ? <p className="mt-1.5 text-xs font-medium text-success">{delta}</p> : null}
    </div>
  );
}

export function SectionCard({
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("surface-card", className)}>
      {title ? (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <h2 className="text-base font-semibold">{title}</h2>
            {description ? <p className="mt-0.5 text-sm text-muted-foreground">{description}</p> : null}
          </div>
          {action}
        </header>
      ) : null}
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

/* ------------------------------------------------------------------ header */

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow ? (
          <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">{eyebrow}</p>
        ) : null}
        <h1 className="mt-1 text-2xl font-bold tracking-tight lg:text-[28px]">{title}</h1>
        {subtitle ? <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function Breadcrumbs({ items }: { items: { label: string; to?: string; params?: Record<string, string> }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
      {items.map((item, i) => (
        <span key={item.label} className="flex items-center gap-1">
          {i > 0 ? <ChevronRight className="size-3" aria-hidden /> : null}
          {item.to ? (
            <LooseLink to={item.to} params={item.params} className="transition-colors hover:text-primary">
              {item.label}
            </LooseLink>
          ) : (
            <span className="font-medium text-foreground">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

/* --------------------------------------------------------------- states */

export function EmptyState({
  title,
  description,
  variant = "empty",
  action,
}: {
  title: string;
  description?: string;
  variant?: "empty" | "no-results" | "error";
  action?: ReactNode;
}) {
  const Icon = variant === "no-results" ? SearchX : variant === "error" ? TriangleAlert : Inbox;
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
      <span
        className={cn(
          "flex size-11 items-center justify-center rounded-full",
          variant === "error" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground",
        )}
      >
        <Icon className="size-5" aria-hidden />
      </span>
      <p className="text-sm font-semibold">{title}</p>
      {description ? <p className="max-w-sm text-sm text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

export function LoadingSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}

export function LayerPill({ layer }: { layer: "SEO" | "AEO" | "GEO" }) {
  const map = {
    SEO: "bg-seo/12 text-seo border-seo/25",
    AEO: "bg-aeo/12 text-aeo border-aeo/25",
    GEO: "bg-geo/12 text-geo border-geo/25",
  };
  return (
    <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-bold", map[layer])}>
      {layer}
    </span>
  );
}
