import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Breadcrumbs,
  PageHeader,
  SectionCard,
  StatCard,
  StatusBadge,
  LooseLink,
} from "@/components/platform/primitives";
import { DataTable, type Column } from "@/components/platform/data-table";
import { FilterBar, FilterSelect, SearchBox } from "@/components/platform/filter-bar";
import { faqClusters, questions, type Question } from "@/data/content";
import { resorts } from "@/data/resorts";
import { useApp } from "@/context/app-context";

export const Route = createFileRoute("/aeo/questions/")({
  head: () => ({
    meta: [
      { title: "Traveller Questions | Sterling Search Intelligence" },
      { name: "description", content: "Every traveller question tracked for Sterling resorts, with answer coverage, answer score and opportunity." },
      { property: "og:title", content: "Traveller Questions | Sterling Search Intelligence" },
      { property: "og:description", content: "Question coverage and answer quality across Sterling resorts." },
    ],
  }),
  component: QuestionsPage,
});

function QuestionsPage() {
  const { resortId, isAll } = useApp();
  const [search, setSearch] = useState("");
  const [resort, setResort] = useState("all");
  const [cluster, setCluster] = useState("all");
  const [coverage, setCoverage] = useState("all");
  const [selected, setSelected] = useState<Question | null>(null);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return questions.filter(
      (x) =>
        (isAll || x.resortId === resortId) &&
        (!q || x.question.toLowerCase().includes(q)) &&
        (resort === "all" || x.resort === resort) &&
        (cluster === "all" || x.cluster === cluster) &&
        (coverage === "all" || x.coverage === coverage),
    );
  }, [search, resort, cluster, coverage, resortId, isAll]);

  const columns: Column<Question>[] = [
    { key: "question", header: "Question", sortValue: (q) => q.question, render: (q) => <LooseLink to="/aeo/questions/$questionId" params={{ questionId: q.id }} className="font-medium hover:text-primary hover:underline" onClick={(e) => e.stopPropagation()}>{q.question}</LooseLink> },
    { key: "resort", header: "Resort", sortValue: (q) => q.resort, render: (q) => <span className="text-muted-foreground">{q.resort}</span> },
    { key: "cluster", header: "Cluster", sortValue: (q) => q.cluster, render: (q) => q.cluster },
    { key: "coverage", header: "Coverage", align: "center", sortValue: (q) => q.coverage, render: (q) => <StatusBadge value={q.coverage} /> },
    { key: "answerScore", header: "Answer score", align: "center", sortValue: (q) => q.answerScore, render: (q) => <span className="font-semibold tabular-nums">{q.answerScore}</span> },
    { key: "volume", header: "Monthly searches", align: "right", sortValue: (q) => q.volume, render: (q) => q.volume.toLocaleString() },
    { key: "opportunity", header: "Opportunity", sortValue: (q) => q.volume / (q.answerScore || 1), render: (q) => <StatusBadge value={q.opportunity} /> },
  ];

  return (
    <>
      <Breadcrumbs items={[{ label: "Overview", to: "/" }, { label: "AEO", to: "/aeo" }, { label: "Questions" }]} />
      <PageHeader
        eyebrow="Answer layer"
        title="Traveller Questions"
        subtitle="The questions travellers ask about Sterling destinations, and how well current content answers them."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Questions tracked" value={rows.length.toLocaleString()} tone="aeo" />
        <StatCard label="Strong coverage" value={rows.filter((q) => q.coverage === "Strong").length.toLocaleString()} tone="aeo" />
        <StatCard label="Partial coverage" value={rows.filter((q) => q.coverage === "Partial").length.toLocaleString()} tone="brand" />
        <StatCard label="Missing coverage" value={rows.filter((q) => q.coverage === "Missing").length.toLocaleString()} tone="brand" />
      </div>

      <SectionCard bodyClassName="p-4">
        <FilterBar>
          <SearchBox value={search} onChange={setSearch} placeholder="Search questions" />
          <FilterSelect value={resort} onChange={setResort} options={resorts.map((r) => r.shortName)} placeholder="Resorts" width="w-[170px]" />
          <FilterSelect value={cluster} onChange={setCluster} options={faqClusters} placeholder="Clusters" width="w-[180px]" />
          <FilterSelect value={coverage} onChange={setCoverage} options={["Strong", "Partial", "Missing"]} placeholder="Coverage" width="w-[150px]" />
        </FilterBar>
      </SectionCard>

      <SectionCard title={`${rows.length.toLocaleString()} questions`} description="Select a question to see the current answer and what is missing.">
        <DataTable
          rows={rows}
          columns={columns}
          getRowKey={(q) => q.id}
          onRowClick={setSelected}
          initialSort={{ key: "opportunity", dir: "desc" }}
          emptyTitle="No questions match your filters"
          emptyDescription="Clear a filter or widen your search."
        />
      </SectionCard>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          {selected ? (
            <>
              <SheetHeader>
                <SheetTitle className="pr-6 text-left">{selected.question}</SheetTitle>
                <SheetDescription className="text-left">
                  {selected.resort} · {selected.cluster} · {selected.volume.toLocaleString()} monthly searches
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-6 px-4 pb-8">
                <div className="flex flex-wrap gap-2">
                  <StatusBadge value={selected.coverage} />
                  <StatusBadge value={selected.opportunity} />
                  <StatusBadge value={selected.intent} />
                </div>
                <LooseLink
                  to="/aeo/questions/$questionId"
                  params={{ questionId: selected.id }}
                  className="inline-flex text-sm font-medium text-primary hover:underline"
                >
                  Open full question analysis →
                </LooseLink>

                <div>
                  <h3 className="text-sm font-semibold">Current answer</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{selected.currentAnswer}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold">What is missing</h3>
                  <ul className="mt-1.5 space-y-1.5 text-sm text-muted-foreground">
                    {selected.missing.map((m) => (
                      <li key={m}>• {m}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Recommended answer structure</h3>
                  <ol className="mt-1.5 space-y-1.5 text-sm text-muted-foreground">
                    {selected.structure.map((s, i) => (
                      <li key={s}>
                        {i + 1}. {s}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
}
