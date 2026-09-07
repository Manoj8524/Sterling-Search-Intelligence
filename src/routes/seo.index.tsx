import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Breadcrumbs, PageHeader, SectionCard, StatCard } from "@/components/platform/primitives";
import { LinesChart, MetricBar, SimpleBarChart } from "@/components/platform/charts";
import { keywordRankingTrend, positionDistribution, seoHealthBreakdown } from "@/data/platform";

export const Route = createFileRoute("/seo/")({
  head: () => ({
    meta: [
      { title: "SEO Intelligence | Sterling Search Intelligence" },
      { name: "description", content: "Improve organic visibility for Sterling Holidays resorts across traditional search." },
      { property: "og:title", content: "SEO Intelligence | Sterling Search Intelligence" },
      { property: "og:description", content: "Organic search health, rankings and opportunities for Sterling resorts." },
    ],
  }),
  component: SeoOverview,
});

function SeoOverview() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Overview", to: "/" }, { label: "SEO" }]} />
      <PageHeader
        eyebrow="Search layer"
        title="SEO Intelligence"
        subtitle="Improve organic visibility for Sterling resorts."
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link to="/seo/technical">Technical audit</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/seo/opportunities">View opportunities</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="SEO Health" value={81} suffix="/ 100" delta="+10 vs 12 weeks ago" tone="seo" />
        <StatCard label="Keywords" value="18,420" tone="seo" />
        <StatCard label="Top 3 Rankings" value="1,248" delta="+238" tone="seo" />
        <StatCard label="Top 10 Rankings" value="3,824" delta="+704" tone="seo" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Ranking Opportunities" value={642} tone="brand" />
        <StatCard label="Technical Issues" value={184} tone="brand" />
        <StatCard label="Organic Visibility" value="+18%" delta="Quarter on quarter" tone="brand" />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <SectionCard title="Keyword Ranking Trend" description="Keywords in the top 3, top 10 and top 20 positions.">
          <LinesChart
            data={keywordRankingTrend}
            series={[
              { key: "top3", label: "Top 3", color: "var(--chart-1)" },
              { key: "top10", label: "Top 10", color: "var(--chart-2)" },
              { key: "top20", label: "Top 20", color: "var(--chart-4)" },
            ]}
          />
        </SectionCard>
        <SectionCard title="Position Distribution" description="Where tracked keywords currently rank.">
          <SimpleBarChart
            data={positionDistribution}
            xKey="bucket"
            barKey="keywords"
            colors={["var(--chart-5)", "var(--chart-1)", "var(--chart-2)", "var(--chart-4)", "var(--muted-foreground)"]}
          />
        </SectionCard>
      </div>

      <SectionCard title="SEO Health Breakdown" description="Component scores contributing to overall SEO health.">
        <div className="grid gap-5 md:grid-cols-2">
          {seoHealthBreakdown.map((h) => (
            <MetricBar key={h.area} label={h.area} value={h.score} />
          ))}
        </div>
      </SectionCard>
    </>
  );
}
