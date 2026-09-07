import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Breadcrumbs, PageHeader, SectionCard, StatCard, StatusBadge } from "@/components/platform/primitives";
import { DataTable, type Column } from "@/components/platform/data-table";
import { FilterBar, FilterSelect, SearchBox } from "@/components/platform/filter-bar";
import { keywords, type Keyword } from "@/data/content";
import { resorts } from "@/data/resorts";
import { useApp } from "@/context/app-context";

export const Route = createFileRoute("/seo/keywords")({
  head: () => ({
    meta: [
      { title: "Keyword Intelligence | Sterling Search Intelligence" },
      { name: "description", content: "Track ranking keywords, search demand and ranking opportunities for every Sterling resort." },
      { property: "og:title", content: "Keyword Intelligence | Sterling Search Intelligence" },
      { property: "og:description", content: "Ranking keywords and opportunities across the Sterling resort portfolio." },
    ],
  }),
  component: KeywordIntelligence,
});

const positionBands = ["Top 3", "4–10", "11–20", "21+"];
const inBand = (p: number, b: string) =>
  b === "all" ||
  (b === "Top 3" && p <= 3) ||
  (b === "4–10" && p > 3 && p <= 10) ||
  (b === "11–20" && p > 10 && p <= 20) ||
  (b === "21+" && p > 20);

function Delta({ k }: { k: Keyword }) {
  const diff = k.previousPosition - k.position;
  if (diff === 0) return <span className="inline-flex items-center gap-1 text-muted-foreground"><Minus className="size-3" />0</span>;
  return diff > 0 ? (
    <span className="inline-flex items-center gap-1 font-medium text-success"><ArrowUp className="size-3" />{diff}</span>
  ) : (
    <span className="inline-flex items-center gap-1 font-medium text-destructive"><ArrowDown className="size-3" />{Math.abs(diff)}</span>
  );
}

function KeywordIntelligence() {
  const { resortId, isAll } = useApp();
  const [search, setSearch] = useState("");
  const [resort, setResort] = useState("all");
  const [intent, setIntent] = useState("all");
  const [band, setBand] = useState("all");
  const [selected, setSelected] = useState<Keyword | null>(null);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return keywords.filter(
      (k) =>
        (isAll || k.resortId === resortId) &&
        (!q || k.keyword.toLowerCase().includes(q)) &&
        (resort === "all" || k.resort === resort) &&
        (intent === "all" || k.intent === intent) &&
        inBand(k.position, band),
    );
  }, [search, resort, intent, band, resortId, isAll]);

  const columns: Column<Keyword>[] = [
    { key: "keyword", header: "Keyword", sortValue: (k) => k.keyword, render: (k) => <span className="font-medium">{k.keyword}</span> },
    { key: "resort", header: "Resort", sortValue: (k) => k.resort, render: (k) => <span className="text-muted-foreground">{k.resort}</span> },
    { key: "position", header: "Position", align: "center", sortValue: (k) => k.position, render: (k) => <span className="font-semibold tabular-nums">{k.position}</span> },
    { key: "change", header: "Change", align: "center", sortValue: (k) => k.previousPosition - k.position, render: (k) => <Delta k={k} /> },
    { key: "volume", header: "Volume", align: "right", sortValue: (k) => k.volume, render: (k) => k.volume.toLocaleString() },
    { key: "difficulty", header: "Difficulty", align: "center", sortValue: (k) => k.difficulty, render: (k) => k.difficulty },
    { key: "intent", header: "Intent", sortValue: (k) => k.intent, render: (k) => k.intent },
    { key: "opportunity", header: "Opportunity", sortValue: (k) => k.volume / k.position, render: (k) => <StatusBadge value={k.opportunity} /> },
  ];

  return (
    <>
      <Breadcrumbs items={[{ label: "Overview", to: "/" }, { label: "SEO", to: "/seo" }, { label: "Keywords" }]} />
      <PageHeader
        eyebrow="Search layer"
        title="Keyword Intelligence"
        subtitle="Every keyword Sterling resorts target, with demand, difficulty and ranking opportunity."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Keywords" value="18,420" tone="seo" />
        <StatCard label="Top 10" value="3,824" tone="seo" />
        <StatCard label="Opportunities" value={642} tone="brand" />
        <StatCard label="Declining" value={318} tone="brand" />
        <StatCard label="New opportunities" value={284} tone="brand" />
      </div>

      <SectionCard bodyClassName="p-4">
        <FilterBar>
          <SearchBox value={search} onChange={setSearch} placeholder="Search keywords" />
          <FilterSelect value={resort} onChange={setResort} options={resorts.map((r) => r.shortName)} placeholder="Resorts" width="w-[170px]" />
          <FilterSelect value={intent} onChange={setIntent} options={["Commercial", "Informational", "Local", "Navigational", "Transactional"]} placeholder="Intents" width="w-[160px]" />
          <FilterSelect value={band} onChange={setBand} options={positionBands} placeholder="Positions" allLabel="Any position" width="w-[150px]" />
        </FilterBar>
      </SectionCard>

      <SectionCard title={`${rows.length.toLocaleString()} keywords`} description="Select a keyword to review its opportunity.">
        <DataTable
          rows={rows}
          columns={columns}
          getRowKey={(k) => k.id}
          onRowClick={setSelected}
          initialSort={{ key: "opportunity", dir: "desc" }}
          emptyTitle="No keyword opportunities match your filters"
          emptyDescription="Clear a filter or widen the position range."
        />
      </SectionCard>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {selected ? (
            <>
              <SheetHeader>
                <SheetTitle>{selected.keyword}</SheetTitle>
                <SheetDescription>
                  {selected.resort} · {selected.intent} intent · {selected.volume.toLocaleString()} monthly searches
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-6 px-4 pb-8">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    ["Position", selected.position],
                    ["Difficulty", selected.difficulty],
                    ["Volume", selected.volume.toLocaleString()],
                  ].map(([l, v]) => (
                    <div key={l as string} className="rounded-lg border border-border p-3 text-center">
                      <p className="text-[11px] tracking-wide text-muted-foreground uppercase">{l}</p>
                      <p className="mt-1 text-lg font-bold tabular-nums">{v}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <h3 className="text-sm font-semibold">Competitors ranking higher</h3>
                  <ul className="mt-2 divide-y divide-border rounded-lg border border-border">
                    {[
                      ["Club Mahindra", 2],
                      ["Tripadvisor", 4],
                      ["MakeMyTrip", 6],
                      ["Taj Holidays", 9],
                    ]
                      .filter(([, p]) => (p as number) < selected.position)
                      .map(([name, pos]) => (
                        <li key={name as string} className="flex items-center justify-between px-3 py-2 text-sm">
                          <span>{name}</span>
                          <span className="font-semibold tabular-nums">Position {pos}</span>
                        </li>
                      ))}
                    <li className="flex items-center justify-between bg-primary/5 px-3 py-2 text-sm font-medium">
                      <span>Sterling {selected.resort}</span>
                      <span className="tabular-nums">Position {selected.position}</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-semibold">Why competitors win</h3>
                  <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                    <li>More comprehensive destination content</li>
                    <li>Better FAQ coverage and structured answers</li>
                    <li>More local information and distances</li>
                    <li>Stronger backlink profile and third-party references</li>
                  </ul>
                </div>

                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Recommended action
                  </p>
                  <p className="mt-1 text-sm">
                    Expand the {selected.resort} page with a dedicated section for this query, add FAQ schema, and link
                    from the destination hub. Then re-measure after the next crawl.
                  </p>
                </div>

                <Button className="w-full" onClick={() => setSelected(null)}>
                  Close
                </Button>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
}
