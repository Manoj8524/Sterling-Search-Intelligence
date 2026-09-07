import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  Building2,
  FileBarChart,
  FileText,
  Gauge,
  Lightbulb,
  Search,
  Settings,
  Sparkles,
  MessageCircleQuestion,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  to: string;
}

interface NavGroup {
  label: string;
  icon: typeof Gauge;
  to?: string;
  layer?: "SEO" | "AEO" | "GEO";
  items?: NavItem[];
}

export const navGroups: NavGroup[] = [
  { label: "Overview", icon: Gauge, to: "/" },
  { label: "Resorts", icon: Building2, to: "/resorts" },
  { label: "Website Content", icon: FileText, to: "/pages" },
  {
    label: "SEO",
    icon: Search,
    layer: "SEO",
    items: [
      { label: "SEO Overview", to: "/seo" },
      { label: "Technical SEO", to: "/seo/technical" },
      { label: "Keywords", to: "/seo/keywords" },
      { label: "Rankings", to: "/seo/rankings" },
      { label: "Competitors", to: "/seo/competitors" },
      { label: "SEO Opportunities", to: "/seo/opportunities" },
      { label: "SEO Issues", to: "/seo/issues" },
    ],
  },
  {
    label: "AEO",
    icon: MessageCircleQuestion,
    layer: "AEO",
    items: [
      { label: "AEO Overview", to: "/aeo" },
      { label: "Questions", to: "/aeo/questions" },
      { label: "Answer Opportunities", to: "/aeo/answer-opportunities" },
      { label: "FAQ Coverage", to: "/aeo/faq-coverage" },
      { label: "Answer Gaps", to: "/aeo/answer-gaps" },
      { label: "Structured Answers", to: "/aeo/structured-answers" },
    ],
  },
  {
    label: "GEO",
    icon: Sparkles,
    layer: "GEO",
    items: [
      { label: "GEO Overview", to: "/geo" },
      { label: "AI Visibility", to: "/geo/ai-visibility" },
      { label: "AI Queries", to: "/geo/ai-queries" },
      { label: "AI Mentions", to: "/geo/ai-mentions" },
      { label: "Citation Gap", to: "/geo/citation-gap" },
      { label: "Entity Authority", to: "/geo/entity-authority" },
      { label: "Content Authority", to: "/geo/content-authority" },
    ],
  },
  { label: "Recommendations", icon: Lightbulb, to: "/recommendations" },
  { label: "Reports", icon: FileBarChart, to: "/reports" },
  { label: "Optimization Activity", icon: Activity, to: "/activity" },
  { label: "Settings", icon: Settings, to: "/settings" },
];

const layerDot = {
  SEO: "bg-seo",
  AEO: "bg-aeo",
  GEO: "bg-geo",
};

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname === to);

  return (
    <aside className="relative z-20 flex h-full w-[264px] shrink-0 flex-col bg-sidebar text-sidebar-foreground select-none">
      <Link to="/" onClick={onNavigate} className="flex items-center gap-3 px-5 py-5 transition-opacity hover:opacity-90">
        <span className="flex size-9 items-center justify-center rounded-xl gradient-brand text-primary-foreground shadow-sm">
          <BarChart3 className="size-5" />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-bold text-sidebar-accent-foreground">Sterling</p>
          <p className="text-[11px] tracking-wide text-sidebar-foreground/70">Search Intelligence</p>
        </div>
      </Link>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-6">
        {navGroups.map((group) => {
          const Icon = group.icon;
          if (group.to) {
            return (
              <Link
                key={group.label}
                to={group.to}
                onClick={onNavigate}
                preload="intent"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 cursor-pointer select-none active:scale-[0.98]",
                  isActive(group.to)
                    ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-xs"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon className="size-4 shrink-0" />
                {group.label}
              </Link>
            );
          }
          const groupActive = group.items?.some((i) => pathname.startsWith(i.to.split("/").slice(0, 2).join("/")));
          return (
            <div key={group.label} className="pt-3">
              <div className="flex items-center gap-2 px-3 pb-1.5">
                <span className={cn("size-1.5 rounded-full", layerDot[group.layer!])} />
                <span
                  className={cn(
                    "text-[11px] font-bold tracking-[0.16em] uppercase",
                    groupActive ? "text-sidebar-accent-foreground" : "text-sidebar-foreground/60",
                  )}
                >
                  {group.label}
                </span>
              </div>
              <div className="space-y-0.5">
                {group.items!.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={onNavigate}
                    preload="intent"
                    className={cn(
                      "flex items-center gap-3 rounded-lg py-1.5 pr-3 pl-8 text-sm transition-all duration-150 cursor-pointer select-none active:scale-[0.98]",
                      isActive(item.to)
                        ? "bg-sidebar-primary font-semibold text-sidebar-primary-foreground shadow-xs"
                        : "text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border px-5 py-4">
        <p className="text-[11px] leading-relaxed text-sidebar-foreground/60">
          Sterling Search Intelligence v1.0
        </p>
      </div>
    </aside>
  );
}
