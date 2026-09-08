import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, Building2, MessageCircleQuestion, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, ScoreBadge, SectionCard, StatCard, StatusBadge, ScoreRing } from "@/components/platform/primitives";
import { TrendChart, layerSeries } from "@/components/platform/charts";
import { DataTable, type Column } from "@/components/platform/data-table";
import { SearchBox } from "@/components/platform/filter-bar";
import { platformStats, visibilityTrend } from "@/data/platform";
import { resorts, type Resort } from "@/data/resorts";
import { useApp } from "@/context/app-context";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Search & AI Visibility Overview | Sterling Search Intelligence" },
      {
        name: "description",
        content:
          "Executive overview of how Sterling Holidays resorts perform across search, answer engines and generative AI.",
      },
      { property: "og:title", content: "Search & AI Visibility Overview | Sterling Search Intelligence" },
      {
        property: "og:description",
        content: "Monitor and improve how Sterling resorts appear across Search and AI.",
      },
    ],
  }),
  component: Overview,
});

const layerToggles = [
  { key: "seo", label: "SEO" },
  { key: "aeo", label: "AEO" },
  { key: "geo", label: "GEO" },
  { key: "overall", label: "Overall" },
];

const opportunities = [
  {
    priority: "High Priority",
    resort: "Sterling Munnar",
    resortId: "sterling-munnar",
    body: '“Best family resorts in Munnar” has strong search demand but Sterling Munnar is not appearing in the top results.',
    impact: "High",
    action:
      "Create stronger family-stay content, add a focused FAQ and structured answer, and support it with internal links.",
    layer: "SEO + AEO",
  },
  {
    priority: "High Priority",
    resort: "Sterling Ooty Elk Hill",
    resortId: "sterling-ooty-elk-hill",
    body: 'AI platforms frequently recommend competitors when travellers ask for “Best luxury resorts in Ooty”.',
    impact: "High",
    action: "Strengthen entity authority and publish citation-worthy destination content for Ooty.",
    layer: "GEO",
  },
  {
    priority: "Medium Priority",
    resort: "Sterling Wayanad",
    resortId: "sterling-wayanad",
    body: "17 traveller questions about activities and nearby attractions have no direct answer on Sterling pages.",
    impact: "Medium",
    action: "Add structured answers and expand the FAQ cluster for activities and nearby attractions.",
    layer: "AEO",
  },
];

const overviewColumns: Column<Resort>[] = [
  {
    key: "name",
    header: "Resort",
    sortValue: (r) => r.name,
    render: (r) => (
      <div>
        <Link
          to="/resorts/$resortId"
          params={{ resortId: r.id }}
          className="font-medium hover:text-primary hover:underline"
        >
          {r.name}
        </Link>
        <p className="text-xs text-muted-foreground">
          {r.city}, {r.state}
        </p>
      </div>
    ),
  },
  { key: "seo", header: "SEO", align: "center", sortValue: (r) => r.seo, render: (r) => <ScoreBadge value={r.seo} /> },
  { key: "aeo", header: "AEO", align: "center", sortValue: (r) => r.aeo, render: (r) => <ScoreBadge value={r.aeo} /> },
  { key: "geo", header: "GEO", align: "center", sortValue: (r) => r.geo, render: (r) => <ScoreBadge value={r.geo} /> },
  {
    key: "overall",
    header: "Overall",
    align: "center",
    sortValue: (r) => r.overall,
    render: (r) => <ScoreBadge value={r.overall} className="min-w-12 text-sm" />,
  },
  {
    key: "opportunities",
    header: "Opportunities",
    align: "right",
    sortValue: (r) => r.opportunities,
    render: (r) => <span className="font-medium tabular-nums">{r.opportunities}</span>,
  },
  {
    key: "open",
    header: "",
    align: "right",
    render: (r) => (
      <Button asChild variant="ghost" size="sm">
        <Link to="/resorts/$resortId" params={{ resortId: r.id }}>
          Open
        </Link>
      </Button>
    ),
  },
];

function Overview() {
  const { isAll, resortId, resortName } = useApp();
  const [active, setActive] = useState<string[]>(["seo", "aeo", "geo", "overall"]);
  const [search, setSearch] = useState("");

  const series = layerSeries.filter((s) => active.includes(s.key));

  const rows = useMemo(() => {
    const base = isAll ? resorts : resorts.filter((r) => r.id === resortId);
    const q = search.trim().toLowerCase();
    return q ? base.filter((r) => r.name.toLowerCase().includes(q) || r.city.toLowerCase().includes(q)) : base;
  }, [isAll, resortId, search]);

  return (
    <>
      <section className="relative overflow-hidden rounded-2xl gradient-navy px-6 py-8 text-navy-foreground lg:px-10 lg:py-10">
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.18em] text-navy-foreground/70 uppercase">
              SEO • AEO • GEO for Sterling Holidays
            </p>
            <h1 className="mt-2 text-3xl font-bold lg:text-4xl">Sterling Search Intelligence</h1>
            <p className="mt-2 text-sm text-navy-foreground/80 lg:text-base">
              Monitor and improve how Sterling resorts appear across Search and AI.
              {!isAll && <span className="font-medium"> Currently filtered to {resortName}.</span>}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button asChild variant="secondary" size="sm">
                <Link to="/recommendations">
                  View recommendations <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="text-navy-foreground hover:bg-white/10">
                <Link to="/resorts">Browse resort portfolio</Link>
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-6 rounded-2xl bg-white/8 px-6 py-4 backdrop-blur-sm">
            <ScoreRing value={platformStats.overall} label="Overall" size={116} />
            <div className="space-y-2 text-sm">
              <p className="flex items-center justify-between gap-6">
                <span className="text-navy-foreground/70">SEO</span>
                <span className="font-semibold">{platformStats.seo}</span>
              </p>
              <p className="flex items-center justify-between gap-6">
                <span className="text-navy-foreground/70">AEO</span>
                <span className="font-semibold">{platformStats.aeo}</span>
              </p>
              <p className="flex items-center justify-between gap-6">
                <span className="text-navy-foreground/70">GEO</span>
                <span className="font-semibold">{platformStats.geo}</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Overall Search Visibility" value={platformStats.overall} suffix="/ 100" delta="+16 vs 12 weeks ago" tone="brand" />
        <StatCard label="SEO Health" value={platformStats.seo} suffix="/ 100" delta="+10" tone="seo" icon={<Search className="size-4" />} />
        <StatCard label="AEO Readiness" value={platformStats.aeo} suffix="/ 100" delta="+14" tone="aeo" icon={<MessageCircleQuestion className="size-4" />} />
        <StatCard label="GEO Visibility" value={platformStats.geo} suffix="/ 100" delta="+17" tone="geo" icon={<Sparkles className="size-4" />} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Resorts Monitored" value={platformStats.resorts} tone="brand" icon={<Building2 className="size-4" />} />
        <StatCard label="Keywords Tracked" value={platformStats.keywords.toLocaleString()} tone="seo" />
        <StatCard label="Questions Tracked" value={platformStats.questions.toLocaleString()} tone="aeo" />
        <StatCard label="AI Queries Monitored" value={platformStats.aiQueries.toLocaleString()} tone="geo" />
      </div>

      <SectionCard
        title="Search Visibility Trend"
        description="Last 12 weeks across all three visibility layers."
        action={
          <div className="flex flex-wrap gap-1.5">
            {layerToggles.map((t) => {
              const on = active.includes(t.key);
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() =>
                    setActive((a) => (a.includes(t.key) ? a.filter((x) => x !== t.key) : [...a, t.key]))
                  }
                  className={
                    on
                      ? "rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground"
                      : "rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-accent"
                  }
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        }
      >
        {series.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            Select at least one layer to display the trend.
          </p>
        ) : (
          <TrendChart data={visibilityTrend} series={series} domain={[30, 100]} height={320} />
        )}
      </SectionCard>

      <SectionCard
        title="Resort Performance"
        description="Search and AI visibility by resort."
        action={<SearchBox value={search} onChange={setSearch} placeholder="Search resorts" className="w-56 flex-none" />}
      >
        <DataTable
          rows={rows}
          columns={overviewColumns}
          getRowKey={(r) => r.id}
          initialSort={{ key: "overall", dir: "desc" }}
          emptyTitle="No resorts match your search"
          emptyDescription="Try a different resort name or destination."
        />
      </SectionCard>

      <SectionCard title="Top Opportunities" description="Where focused work will move visibility fastest.">
        <div className="grid gap-4 lg:grid-cols-3">
          {opportunities.map((o) => (
            <article key={o.resort + o.layer} className="flex flex-col rounded-xl border border-border bg-muted/30 p-5">
              <div className="flex items-center justify-between gap-2">
                <StatusBadge value={o.priority.startsWith("High") ? "Very High" : "Medium"} />
                <span className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">{o.layer}</span>
              </div>
              <h3 className="mt-3 text-sm font-semibold">{o.resort}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{o.body}</p>
              <p className="mt-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Recommended action
              </p>
              <p className="mt-1 text-sm">{o.action}</p>
              <Button asChild variant="outline" size="sm" className="mt-4 self-start">
                <Link to="/resorts/$resortId" params={{ resortId: o.resortId }}>
                  View opportunity <ArrowRight className="size-4" />
                </Link>
              </Button>
            </article>
          ))}
        </div>
      </SectionCard>
    </>
  );
}
