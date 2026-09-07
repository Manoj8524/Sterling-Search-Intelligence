import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Breadcrumbs, PageHeader, SectionCard, StatCard, StatusBadge, LooseLink } from "@/components/platform/primitives";
import { DataTable, type Column } from "@/components/platform/data-table";
import { FilterBar, FilterSelect, SearchBox } from "@/components/platform/filter-bar";
import { SimpleBarChart } from "@/components/platform/charts";
import { faqClusters, questions, type Question } from "@/data/content";
import { resorts } from "@/data/resorts";
import { useApp } from "@/context/app-context";

export const Route = createFileRoute("/aeo/answer-gaps")({
  head: () => ({
    meta: [
      { title: "Answer Gaps | Sterling Search Intelligence" },
      { name: "description", content: "Traveller questions Sterling content does not answer well, ranked by search demand and impact." },
      { property: "og:title", content: "Answer Gaps | Sterling Search Intelligence" },
      { property: "og:description", content: "Unanswered and partially answered traveller questions across Sterling resorts." },
    ],
  }),
  component: AnswerGaps,
});

function AnswerGaps() {
  const { resortId, isAll } = useApp();
  const [search, setSearch] = useState("");
  const [resort, setResort] = useState("all");
  const [cluster, setCluster] = useState("all");

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return questions.filter(
      (x) =>
        x.coverage !== "Strong" &&
        (isAll || x.resortId === resortId) &&
        (!q || x.question.toLowerCase().includes(q)) &&
        (resort === "all" || x.resort === resort) &&
        (cluster === "all" || x.cluster === cluster),
    );
  }, [search, resort, cluster, resortId, isAll]);

  const byCluster = useMemo(
    () =>
      faqClusters
        .map((c) => ({ cluster: c, gaps: rows.filter((r) => r.cluster === c).length }))
        .filter((c) => c.gaps > 0)
        .sort((a, b) => b.gaps - a.gaps)
        .slice(0, 8),
    [rows],
  );

  const columns: Column<Question>[] = [
    {
      key: "question",
      header: "Unanswered question",
      sortValue: (q) => q.question,
      render: (q) => (
        <LooseLink to="/aeo/questions/$questionId" params={{ questionId: q.id }} className="font-medium hover:text-primary">
          {q.question}
        </LooseLink>
      ),
    },
    { key: "resort", header: "Resort", sortValue: (q) => q.resort, render: (q) => <span className="text-muted-foreground">{q.resort}</span> },
    { key: "cluster", header: "Cluster", sortValue: (q) => q.cluster, render: (q) => q.cluster },
    { key: "coverage", header: "Coverage", align: "center", sortValue: (q) => q.coverage, render: (q) => <StatusBadge value={q.coverage} /> },
    { key: "answerScore", header: "Answer score", align: "center", sortValue: (q) => q.answerScore, render: (q) => <span className="tabular-nums">{q.answerScore}</span> },
    { key: "volume", header: "Monthly searches", align: "right", sortValue: (q) => q.volume, render: (q) => q.volume.toLocaleString() },
    { key: "missing", header: "Missing detail", sortValue: (q) => q.missing.length, render: (q) => `${q.missing.length} items` },
    { key: "opportunity", header: "Opportunity", sortValue: (q) => q.volume / (q.answerScore || 1), render: (q) => <StatusBadge value={q.opportunity} /> },
  ];

  return (
    <>
      <Breadcrumbs items={[{ label: "Overview", to: "/" }, { label: "AEO", to: "/aeo" }, { label: "Answer Gaps" }]} />
      <PageHeader
        eyebrow="Answer layer"
        title="Answer Gaps"
        subtitle="Questions where Sterling content is missing or incomplete, so answer engines source the answer elsewhere."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Open answer gaps" value={rows.length.toLocaleString()} tone="aeo" />
        <StatCard label="Missing entirely" value={rows.filter((r) => r.coverage === "Missing").length.toLocaleString()} tone="aeo" />
        <StatCard label="Partially answered" value={rows.filter((r) => r.coverage === "Partial").length.toLocaleString()} tone="brand" />
        <StatCard
          label="Search demand at stake"
          value={rows.reduce((s, r) => s + r.volume, 0).toLocaleString()}
          suffix="/ month"
          tone="brand"
        />
      </div>

      <SectionCard title="Gaps by question cluster" description="Where the largest clusters of unanswered questions sit.">
        <SimpleBarChart data={byCluster} xKey="cluster" barKey="gaps" horizontal colors={["var(--aeo)"]} height={300} />
      </SectionCard>

      <SectionCard bodyClassName="p-4">
        <FilterBar>
          <SearchBox value={search} onChange={setSearch} placeholder="Search unanswered questions" />
          <FilterSelect value={resort} onChange={setResort} options={resorts.map((r) => r.shortName)} placeholder="Resorts" width="w-[170px]" />
          <FilterSelect value={cluster} onChange={setCluster} options={faqClusters} placeholder="Clusters" width="w-[180px]" />
        </FilterBar>
      </SectionCard>

      <SectionCard title={`${rows.length.toLocaleString()} answer gaps`} description="Sorted by opportunity. Select a question for the full breakdown.">
        <DataTable
          rows={rows}
          columns={columns}
          getRowKey={(q) => q.id}
          initialSort={{ key: "opportunity", dir: "desc" }}
          emptyTitle="No answer gaps match your filters"
          emptyDescription="Clear a filter or widen your search."
        />
      </SectionCard>
    </>
  );
}
