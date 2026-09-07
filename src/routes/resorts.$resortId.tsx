import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowUpRight, CheckCircle2, ExternalLink, RefreshCw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Breadcrumbs,
  EmptyState,
  LayerPill,
  ScoreBadge,
  ScoreRing,
  SectionCard,
  StatusBadge,
} from "@/components/platform/primitives";
import { MetricBar, SimpleBarChart, TrendChart, layerSeries } from "@/components/platform/charts";
import { DataTable, type Column } from "@/components/platform/data-table";
import { getResort, resortImages } from "@/data/resorts";
import { visibilityTrend } from "@/data/platform";
import {
  aiQueries,
  citationGaps,
  keywords,
  questions,
  recommendations,
  resortPages,
  type Keyword,
  type Question,
  type ResortPage,
} from "@/data/content";

export const Route = createFileRoute("/resorts/$resortId")({
  loader: ({ params }) => {
    const resort = getResort(params.resortId);
    if (!resort) throw notFound();
    return { resort };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Resort not found | Sterling Search Intelligence" }, { name: "robots", content: "noindex" }] };
    }
    const t = `${loaderData.resort.name} — Search & AI Visibility`;
    const d = `SEO, AEO and GEO performance for ${loaderData.resort.name} in ${loaderData.resort.city}, ${loaderData.resort.state}.`;
    return {
      meta: [
        { title: `${t} | Sterling Search Intelligence` },
        { name: "description", content: d },
        { property: "og:title", content: t },
        { property: "og:description", content: d },
      ],
    };
  },
  component: ResortDetail,
});

const working = [
  "Strong organic visibility for destination resort searches",
  "Good local SEO signals and consistent listing data",
  "Strong resort schema on the overview page",
  "Good branded search visibility",
];

const attention = [
  "Weak coverage for family-oriented questions",
  "Competitors have more FAQ content",
  "AI platforms cite third-party travel websites more frequently",
  "Several pages lack structured answers",
];

function ResortDetail() {
  const { resort } = Route.useLoaderData();
  const [tab, setTab] = useState("overview");

  const rKeywords = keywords.filter((k) => k.resortId === resort.id);
  const rQuestions = questions.filter((q) => q.resortId === resort.id);
  const rAi = aiQueries.filter((a) => a.resortId === resort.id);
  const rPages = resortPages.filter((p) => p.resortId === resort.id);
  const rRecs = recommendations.filter((r) => r.resortId === resort.id);
  const rGaps = citationGaps.filter((c) => c.resortId === resort.id);

  const trend = visibilityTrend.map((w) => ({
    week: w.week,
    seo: Math.min(99, w.seo + (resort.seo - 81)),
    aeo: Math.min(99, w.aeo + (resort.aeo - 68)),
    geo: Math.min(99, w.geo + (resort.geo - 59)),
    overall: Math.min(99, w.overall + (resort.overall - 74)),
  }));

  const keywordCols: Column<Keyword>[] = [
    { key: "keyword", header: "Keyword", sortValue: (k) => k.keyword, render: (k) => <span className="font-medium">{k.keyword}</span> },
    { key: "position", header: "Position", align: "center", sortValue: (k) => k.position, render: (k) => k.position },
    { key: "volume", header: "Volume", align: "right", sortValue: (k) => k.volume, render: (k) => k.volume.toLocaleString() },
    { key: "difficulty", header: "Difficulty", align: "center", sortValue: (k) => k.difficulty, render: (k) => k.difficulty },
    { key: "intent", header: "Intent", sortValue: (k) => k.intent, render: (k) => k.intent },
    { key: "opp", header: "Opportunity", sortValue: (k) => k.opportunity, render: (k) => <StatusBadge value={k.opportunity} /> },
  ];

  const questionCols: Column<Question>[] = [
    { key: "q", header: "Question", sortValue: (q) => q.question, render: (q) => (
      <Link to="/aeo/questions/$questionId" params={{ questionId: q.id }} className="font-medium hover:text-primary hover:underline">
        {q.question}
      </Link>
    ) },
    { key: "cluster", header: "Cluster", sortValue: (q) => q.cluster, render: (q) => q.cluster },
    { key: "coverage", header: "Coverage", sortValue: (q) => q.coverage, render: (q) => <StatusBadge value={q.coverage} /> },
    { key: "score", header: "Answer score", align: "center", sortValue: (q) => q.answerScore, render: (q) => <ScoreBadge value={q.answerScore} /> },
    { key: "opp", header: "Opportunity", sortValue: (q) => q.opportunity, render: (q) => <StatusBadge value={q.opportunity} /> },
  ];

  const pageCols: Column<ResortPage>[] = [
    { key: "name", header: "Page", sortValue: (p) => p.name, render: (p) => (
      <Link to="/pages/$pageId" params={{ pageId: p.id }} className="font-medium hover:text-primary hover:underline">
        {p.name}
      </Link>
    ) },
    { key: "seo", header: "SEO", align: "center", sortValue: (p) => p.seo, render: (p) => <ScoreBadge value={p.seo} /> },
    { key: "aeo", header: "AEO", align: "center", sortValue: (p) => p.aeo, render: (p) => <ScoreBadge value={p.aeo} /> },
    { key: "geo", header: "GEO", align: "center", sortValue: (p) => p.geo, render: (p) => <ScoreBadge value={p.geo} /> },
    { key: "overall", header: "Overall", align: "center", sortValue: (p) => p.overall, render: (p) => <ScoreBadge value={p.overall} /> },
    { key: "issues", header: "Issues", align: "right", sortValue: (p) => p.issues, render: (p) => p.issues },
  ];

  return (
    <>
      <Breadcrumbs
        items={[{ label: "Overview", to: "/" }, { label: "Resorts", to: "/resorts" }, { label: resort.name }]}
      />

      <section className="surface-card overflow-hidden">
        <div className="grid lg:grid-cols-[minmax(0,340px)_1fr]">
          <img
            src={resortImages[resort.image]}
            alt={`${resort.name}, ${resort.city}`}
            width={1280}
            height={800}
            className="h-56 w-full object-cover lg:h-full"
          />
          <div className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <StatusBadge value={resort.status} />
                <h1 className="mt-2 text-2xl font-bold lg:text-3xl">{resort.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {resort.city}, {resort.state} · {resort.region} region
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <RefreshCw className="size-3.5" /> Last crawl {resort.lastCrawl}
                  </span>
                  <a
                    href={resort.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 hover:text-primary"
                  >
                    <ExternalLink className="size-3.5" /> {resort.url.replace("https://", "")}
                  </a>
                </div>
              </div>
              <Button asChild>
                <Link to="/recommendations">
                  View recommendations <ArrowUpRight className="size-4" />
                </Link>
              </Button>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-8">
              <ScoreRing value={resort.overall} label="Overall" />
              <div className="grid flex-1 gap-4 sm:grid-cols-3">
                {([
                  ["SEO", resort.seo, "seo"],
                  ["AEO", resort.aeo, "aeo"],
                  ["GEO", resort.geo, "geo"],
                ] as const).map(([label, value, tone]) => (
                  <div key={label} className="rounded-xl border border-border bg-muted/40 p-4">
                    <LayerPill layer={label} />
                    <p className="mt-2 text-2xl font-bold tabular-nums">{value}</p>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: `var(--${tone})` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-card p-1">
          {["overview", "seo", "aeo", "geo", "keywords", "questions", "ai-visibility", "recommendations", "pages"].map(
            (t) => (
              <TabsTrigger key={t} value={t} className="capitalize">
                {t.replace("-", " ")}
              </TabsTrigger>
            ),
          )}
        </TabsList>

        <TabsContent value="overview" className="mt-5 space-y-5">
          <SectionCard title="Search & AI Visibility" description="Unified score across all three layers.">
            <div className="grid gap-8 lg:grid-cols-[auto_1fr]">
              <div className="flex flex-col items-center gap-3">
                <ScoreRing value={resort.overall} size={160} />
                <p className="text-xs text-muted-foreground">SEO 40% · AEO 30% · GEO 30%</p>
              </div>
              <div className="space-y-4">
                <MetricBar label="SEO — organic search visibility" value={resort.seo} />
                <MetricBar label="AEO — answer readiness" value={resort.aeo} />
                <MetricBar label="GEO — AI visibility" value={resort.geo} />
                <p className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
                  {resort.shortName} has {resort.seo >= 80 ? "strong" : "developing"} organic search visibility and{" "}
                  {resort.aeo >= 75 ? "good" : "partial"} answer coverage, but has clear opportunities to increase AI
                  citations and third-party authority.
                </p>
              </div>
            </div>
          </SectionCard>

          <div className="grid gap-5 lg:grid-cols-2">
            <SectionCard title="What is working">
              <ul className="space-y-3">
                {working.map((w) => (
                  <li key={w} className="flex gap-2.5 text-sm">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                    {w}
                  </li>
                ))}
              </ul>
            </SectionCard>
            <SectionCard title="What needs attention">
              <ul className="space-y-3">
                {attention.map((w) => (
                  <li key={w} className="flex gap-2.5 text-sm">
                    <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" />
                    {w}
                  </li>
                ))}
              </ul>
            </SectionCard>
          </div>

          <SectionCard title="Visibility trend" description="Last 12 weeks.">
            <TrendChart data={trend} series={layerSeries} domain={[20, 100]} />
          </SectionCard>
        </TabsContent>

        <TabsContent value="seo" className="mt-5 space-y-5">
          <div className="grid gap-4 sm:grid-cols-4">
            {[
              ["SEO score", resort.seo],
              ["Ranking keywords", resort.rankingKeywords],
              ["Target keywords", resort.targetKeywords],
              ["Open issues", resort.seoIssues],
            ].map(([l, v]) => (
              <div key={l as string} className="surface-card p-5">
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{l}</p>
                <p className="mt-2 text-2xl font-bold tabular-nums">{Number(v).toLocaleString()}</p>
              </div>
            ))}
          </div>
          <SectionCard title="Top keyword positions">
            <DataTable rows={rKeywords} columns={keywordCols} getRowKey={(k) => k.id} initialSort={{ key: "volume", dir: "desc" }} />
          </SectionCard>
        </TabsContent>

        <TabsContent value="aeo" className="mt-5 space-y-5">
          <div className="grid gap-4 sm:grid-cols-4">
            {[
              ["AEO score", resort.aeo],
              ["Questions tracked", resort.questions],
              ["Answer gaps", resort.aeoGaps],
              ["FAQ coverage", `${resort.faqCoverage}%`],
            ].map(([l, v]) => (
              <div key={l as string} className="surface-card p-5">
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{l}</p>
                <p className="mt-2 text-2xl font-bold tabular-nums">{v}</p>
              </div>
            ))}
          </div>
          <SectionCard title="Question coverage">
            <DataTable rows={rQuestions} columns={questionCols} getRowKey={(q) => q.id} initialSort={{ key: "score", dir: "asc" }} />
          </SectionCard>
        </TabsContent>

        <TabsContent value="geo" className="mt-5 space-y-5">
          <div className="grid gap-4 sm:grid-cols-4">
            {[
              ["GEO score", resort.geo],
              ["AI mentions", resort.aiMentions],
              ["AI citations", resort.aiCitations],
              ["Entity authority", resort.entityAuthority],
            ].map(([l, v]) => (
              <div key={l as string} className="surface-card p-5">
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{l}</p>
                <p className="mt-2 text-2xl font-bold tabular-nums">{v}</p>
              </div>
            ))}
          </div>
          <SectionCard title="Citation gaps" description="Topics where competitors are cited and Sterling is not.">
            {rGaps.length === 0 ? (
              <EmptyState title="No citation gaps recorded for this resort." />
            ) : (
              <ul className="divide-y divide-border">
                {rGaps.map((g) => (
                  <li key={g.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div>
                      <p className="text-sm font-medium">{g.topic}</p>
                      <p className="text-xs text-muted-foreground">
                        {g.competitor} cited via {g.source}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge value={g.sterlingCited ? "Yes" : "No"} />
                      <StatusBadge value={g.opportunity} />
                      <Button asChild size="sm" variant="outline">
                        <Link to="/geo/citation-gap">Review</Link>
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </TabsContent>

        <TabsContent value="keywords" className="mt-5">
          <SectionCard title="Keywords" description={`${rKeywords.length} tracked keywords for ${resort.shortName}.`}>
            <DataTable rows={rKeywords} columns={keywordCols} getRowKey={(k) => k.id} initialSort={{ key: "position", dir: "asc" }} />
          </SectionCard>
        </TabsContent>

        <TabsContent value="questions" className="mt-5">
          <SectionCard title="Questions" description="Traveller questions tracked for this resort.">
            <DataTable rows={rQuestions} columns={questionCols} getRowKey={(q) => q.id} />
          </SectionCard>
        </TabsContent>

        <TabsContent value="ai-visibility" className="mt-5">
          <SectionCard title="AI visibility" description="Monitored AI queries mentioning this destination.">
            {rAi.length === 0 ? (
              <EmptyState title="No AI queries found for this resort." description="Monitoring begins at the next crawl cycle." />
            ) : (
              <ul className="divide-y divide-border">
                {rAi.map((a) => (
                  <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <Link
                        to="/geo/ai-queries/$queryId"
                        params={{ queryId: a.id }}
                        className="text-sm font-medium hover:text-primary hover:underline"
                      >
                        {a.query}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {a.platform} · {a.competitors.join(", ")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge value={a.sterlingMentioned ? "Yes" : "No"} />
                      <StatusBadge value={a.visibility} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </TabsContent>

        <TabsContent value="recommendations" className="mt-5">
          <SectionCard title="Recommendations" description="Unified actions covering SEO, AEO and GEO.">
            {rRecs.length === 0 ? (
              <EmptyState title="No open recommendations for this resort." description="New recommendations appear after each analysis cycle." />
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {rRecs.map((r) => (
                  <article key={r.id} className="rounded-xl border border-border p-5">
                    <div className="flex items-center justify-between gap-2">
                      <StatusBadge value={r.priority === "P1" ? "Very High" : r.priority === "P2" ? "High" : "Medium"} />
                      <StatusBadge value={r.status} />
                    </div>
                    <h3 className="mt-3 text-sm font-semibold">{r.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{r.reason}</p>
                    <Button asChild size="sm" variant="outline" className="mt-4">
                      <Link to="/recommendations/$recommendationId" params={{ recommendationId: r.id }}>
                        View opportunity
                      </Link>
                    </Button>
                  </article>
                ))}
              </div>
            )}
          </SectionCard>
        </TabsContent>

        <TabsContent value="pages" className="mt-5 space-y-5">
          <SectionCard title="Pages inventory" description="Website pages scored across all three layers.">
            <DataTable rows={rPages} columns={pageCols} getRowKey={(p) => p.id} initialSort={{ key: "overall", dir: "desc" }} />
          </SectionCard>
          <SectionCard title="Page scores">
            <SimpleBarChart data={rPages.map((p) => ({ name: p.name, overall: p.overall }))} xKey="name" barKey="overall" horizontal height={300} colors={["var(--chart-1)"]} />
          </SectionCard>
        </TabsContent>
      </Tabs>
    </>
  );
}
