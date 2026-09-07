import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { LayoutGrid, Rows3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Breadcrumbs,
  PageHeader,
  ScoreBadge,
  SectionCard,
  StatusBadge,
  EmptyState,
} from "@/components/platform/primitives";
import { DataTable, type Column } from "@/components/platform/data-table";
import { FilterBar, FilterSelect, SearchBox } from "@/components/platform/filter-bar";
import { cities, regions, resortImages, resorts, states, type Resort } from "@/data/resorts";

export const Route = createFileRoute("/resorts/")({
  head: () => ({
    meta: [
      { title: "Resort Portfolio | Sterling Search Intelligence" },
      {
        name: "description",
        content: "Search and AI visibility across all Sterling Holidays resorts, filterable by region, state and score.",
      },
      { property: "og:title", content: "Resort Portfolio | Sterling Search Intelligence" },
      { property: "og:description", content: "Search and AI visibility across all Sterling Holidays resorts." },
    ],
  }),
  component: ResortPortfolio,
});

const scoreBands = ["80+", "65–79", "50–64", "Below 50"];
const inBand = (v: number, band: string) =>
  band === "all" ||
  (band === "80+" && v >= 80) ||
  (band === "65–79" && v >= 65 && v < 80) ||
  (band === "50–64" && v >= 50 && v < 65) ||
  (band === "Below 50" && v < 50);

function ResortPortfolio() {
  const [view, setView] = useState<"grid" | "table">("grid");
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("all");
  const [state, setState] = useState("all");
  const [city, setCity] = useState("all");
  const [seoBand, setSeoBand] = useState("all");
  const [aeoBand, setAeoBand] = useState("all");
  const [geoBand, setGeoBand] = useState("all");
  const [status, setStatus] = useState("all");

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return resorts.filter(
      (r) =>
        (!q || r.name.toLowerCase().includes(q) || r.city.toLowerCase().includes(q)) &&
        (region === "all" || r.region === region) &&
        (state === "all" || r.state === state) &&
        (city === "all" || r.city === city) &&
        inBand(r.seo, seoBand) &&
        inBand(r.aeo, aeoBand) &&
        inBand(r.geo, geoBand) &&
        (status === "all" || r.status === status),
    );
  }, [search, region, state, city, seoBand, aeoBand, geoBand, status]);

  const columns: Column<Resort>[] = [
    {
      key: "name",
      header: "Resort",
      sortValue: (r) => r.name,
      render: (r) => (
        <div>
          <p className="font-medium">{r.name}</p>
          <p className="text-xs text-muted-foreground">
            {r.city}, {r.state} · {r.region}
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
      key: "kw",
      header: "Ranking keywords",
      align: "right",
      sortValue: (r) => r.rankingKeywords,
      render: (r) => <span className="tabular-nums">{r.rankingKeywords.toLocaleString()}</span>,
    },
    {
      key: "status",
      header: "Status",
      sortValue: (r) => r.status,
      render: (r) => <StatusBadge value={r.status} />,
    },
    {
      key: "open",
      header: "",
      align: "right",
      render: (r) => (
        <Button asChild size="sm" variant="ghost">
          <Link to="/resorts/$resortId" params={{ resortId: r.id }}>
            Open
          </Link>
        </Button>
      ),
    },
  ];

  return (
    <>
      <Breadcrumbs items={[{ label: "Overview", to: "/" }, { label: "Resorts" }]} />
      <PageHeader
        eyebrow="Portfolio"
        title="Resort Portfolio"
        subtitle="Search and AI visibility across all Sterling Holidays resorts."
        actions={
          <div className="flex rounded-lg border border-border bg-card p-0.5">
            <button
              type="button"
              onClick={() => setView("grid")}
              aria-label="Grid view"
              className={
                view === "grid"
                  ? "rounded-md bg-primary px-2.5 py-1.5 text-primary-foreground"
                  : "rounded-md px-2.5 py-1.5 text-muted-foreground"
              }
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setView("table")}
              aria-label="Table view"
              className={
                view === "table"
                  ? "rounded-md bg-primary px-2.5 py-1.5 text-primary-foreground"
                  : "rounded-md px-2.5 py-1.5 text-muted-foreground"
              }
            >
              <Rows3 className="size-4" />
            </button>
          </div>
        }
      />

      <SectionCard bodyClassName="p-4">
        <FilterBar>
          <SearchBox value={search} onChange={setSearch} placeholder="Search resorts or destinations" />
          <FilterSelect value={region} onChange={setRegion} options={regions} placeholder="Regions" width="w-[130px]" />
          <FilterSelect value={state} onChange={setState} options={states} placeholder="States" width="w-[150px]" />
          <FilterSelect value={city} onChange={setCity} options={cities} placeholder="Cities" width="w-[140px]" />
          <FilterSelect value={seoBand} onChange={setSeoBand} options={scoreBands} placeholder="SEO score" allLabel="Any SEO score" width="w-[136px]" />
          <FilterSelect value={aeoBand} onChange={setAeoBand} options={scoreBands} placeholder="AEO score" allLabel="Any AEO score" width="w-[136px]" />
          <FilterSelect value={geoBand} onChange={setGeoBand} options={scoreBands} placeholder="GEO score" allLabel="Any GEO score" width="w-[136px]" />
          <FilterSelect
            value={status}
            onChange={setStatus}
            options={["Optimized", "Improving", "Needs Attention", "At Risk"]}
            placeholder="Status"
            allLabel="Any status"
            width="w-[150px]"
          />
        </FilterBar>
        <p className="mt-3 text-xs text-muted-foreground">
          Showing {rows.length} of {resorts.length} monitored resort profiles (75 resorts in the full portfolio).
        </p>
      </SectionCard>

      {rows.length === 0 ? (
        <SectionCard>
          <EmptyState
            variant="no-results"
            title="No resorts match your filters"
            description="Try widening the score bands or clearing the region filter."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setRegion("all");
                  setState("all");
                  setCity("all");
                  setSeoBand("all");
                  setAeoBand("all");
                  setGeoBand("all");
                  setStatus("all");
                }}
              >
                Clear filters
              </Button>
            }
          />
        </SectionCard>
      ) : view === "table" ? (
        <SectionCard>
          <DataTable rows={rows} columns={columns} getRowKey={(r) => r.id} initialSort={{ key: "overall", dir: "desc" }} />
        </SectionCard>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((r) => (
            <article key={r.id} className="surface-card group overflow-hidden">
              <div className="relative h-40 overflow-hidden">
                <img
                  src={resortImages[r.image]}
                  alt={`${r.name} in ${r.city}`}
                  loading="lazy"
                  width={1280}
                  height={800}
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute top-3 right-3">
                  <StatusBadge value={r.status} className="bg-card/90 backdrop-blur" />
                </span>
              </div>
              <div className="p-5">
                <h3 className="text-base font-semibold">{r.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {r.city}, {r.state}
                </p>
                <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                  {(["seo", "aeo", "geo", "overall"] as const).map((k) => (
                    <div key={k} className="rounded-lg bg-muted/60 py-2">
                      <p className="text-[10px] font-bold tracking-wide text-muted-foreground uppercase">{k}</p>
                      <p className="mt-0.5 text-lg font-bold tabular-nums">{r[k]}</p>
                    </div>
                  ))}
                </div>
                <dl className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <div>
                    <dt>Ranking keywords</dt>
                    <dd className="text-sm font-semibold text-foreground tabular-nums">
                      {r.rankingKeywords.toLocaleString()}
                    </dd>
                  </div>
                  <div className="text-right">
                    <dt>AI visibility</dt>
                    <dd className="text-sm font-semibold text-foreground tabular-nums">{r.geo}/100</dd>
                  </div>
                </dl>
                <Button asChild className="mt-4 w-full" size="sm">
                  <Link to="/resorts/$resortId" params={{ resortId: r.id }}>
                    Open resort
                  </Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
