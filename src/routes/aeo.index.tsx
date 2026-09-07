import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Breadcrumbs, PageHeader, ScoreRing, SectionCard, StatCard, StatusBadge } from "@/components/platform/primitives";
import { MetricBar, SimpleBarChart, TrendChart } from "@/components/platform/charts";
import { questions, faqClusters } from "@/data/content";
import { platformStats, visibilityTrend } from "@/data/platform";
import { useApp } from "@/context/app-context";
import { LooseLink } from "@/components/platform/primitives";

export const Route = createFileRoute("/aeo/")({
  head: () => ({
    meta: [
      { title: "AEO Overview | Sterling Search Intelligence" },
      { name: "description", content: "Answer readiness across Sterling resorts: question coverage, answer quality and unanswered traveller questions." },
      { property: "og:title", content: "AEO Overview | Sterling Search Intelligence" },
      { property: "og:description", content: "Answer engine readiness for the Sterling resort portfolio." },
    ],
  }),
  component: AeoOverview,
});

function AeoOverview() {
  const { resortId, isAll, resortName } = useApp();

  const rows = useMemo(() => questions.filter((q) => isAll || q.resortId === resortId), [resortId, isAll]);

  const coverage = useMemo(() => {
    const strong = rows.filter((q) => q.coverage === "Strong").length;
    const partial = rows.filter((q) => q.coverage === "Partial").length;
    const missing = rows.filter((q) => q.coverage === "Missing").length;
    const avg = rows.length ? Math.round(rows.reduce((s, q) => s + q.answerScore, 0) / rows.length) : 0;
    return { strong, partial, missing, avg };
  }, [rows]);

  const clusterData = useMemo(
    () =>
      faqClusters
        .map((c) => {
          const set = rows.filter((q) => q.cluster === c);
          return {
            cluster: c,
            score: set.length ? Math.round(set.reduce((s, q) => s + q.answerScore, 0) / set.length) : 0,
          };
        })
        .filter((c) => c.score > 0)
        .sort((a, b) => a.score - b.score),
    [rows],
  );

  const topGaps = useMemo(
    () => [...rows].sort((a, b) => a.answerScore - b.answerScore).slice(0, 6),
    [rows],
  );

  return (
    <>
      <Breadcrumbs items={[{ label: "Overview", to: "/" }, { label: "AEO" }]} />
      <PageHeader
        eyebrow="Answer layer"
        title="AEO Overview"
        subtitle={`How well ${resortName} content answers the questions travellers actually ask answer engines.`}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Answer readiness" value={platformStats.aeo} suffix="/100" tone="aeo" delta="+14 this quarter" />
        <StatCard label="Questions tracked" value={rows.length.toLocaleString()} tone="aeo" />
        <StatCard label="Strong answers" value={coverage.strong.toLocaleString()} tone="aeo" />
        <StatCard label="Partial answers" value={coverage.partial.toLocaleString()} tone="brand" />
        <StatCard label="Missing answers" value={coverage.missing.toLocaleString()} tone="brand" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <SectionCard title="Answer readiness trend" description="12-week movement across all three layers." className="xl:col-span-2">
          <TrendChart data={visibilityTrend} series={[{ key: "aeo", label: "AEO", color: "var(--aeo)" }, { key: "seo", label: "SEO", color: "var(--seo)" }]} />
        </SectionCard>
        <SectionCard title="Average answer score" description="Across all tracked questions.">
          <div className="flex flex-col items-center gap-4 py-2">
            <ScoreRing value={coverage.avg} label="Answer score" tone="aeo" />
            <div className="w-full space-y-3">
              <MetricBar label="Direct answers present" value={72} />
              <MetricBar label="FAQ schema coverage" value={63} />
              <MetricBar label="Extractable formatting" value={58} />
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard title="Weakest question clusters" description="Lowest average answer score first.">
          <SimpleBarChart data={clusterData.slice(0, 8)} xKey="cluster" barKey="score" horizontal colors={["var(--aeo)"]} height={320} />
        </SectionCard>
        <SectionCard
          title="Biggest answer gaps"
          description="Highest-value questions with the weakest answers."
          action={
            <LooseLink to="/aeo/answer-gaps" className="text-sm font-medium text-primary hover:underline">
              View all gaps
            </LooseLink>
          }
        >
          <ul className="divide-y divide-border">
            {topGaps.map((q) => (
              <li key={q.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div>
                  <LooseLink to="/aeo/questions/$questionId" params={{ questionId: q.id }} className="text-sm font-medium hover:text-primary hover:underline">
                    {q.question}
                  </LooseLink>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {q.resort} · {q.cluster} · {q.volume.toLocaleString()} monthly searches
                  </p>
                </div>
                <StatusBadge value={q.coverage} />
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </>
  );
}
