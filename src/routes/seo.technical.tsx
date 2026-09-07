import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Breadcrumbs, PageHeader, SectionCard, StatCard, StatusBadge } from "@/components/platform/primitives";
import { DataTable, type Column } from "@/components/platform/data-table";
import { FilterBar, FilterSelect, SearchBox } from "@/components/platform/filter-bar";
import { seoIssues, type SeoIssue } from "@/data/content";

export const Route = createFileRoute("/seo/technical")({
  head: () => ({
    meta: [
      { title: "Technical SEO Audit | Sterling Search Intelligence" },
      { name: "description", content: "Crawl results, technical issues and prioritised fixes across 1,284 Sterling resort pages." },
      { property: "og:title", content: "Technical SEO Audit | Sterling Search Intelligence" },
      { property: "og:description", content: "Technical health of Sterling resort website content." },
    ],
  }),
  component: TechnicalSeo,
});

const categories = [...new Set(seoIssues.map((i) => i.category))];

function TechnicalSeo() {
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("all");
  const [category, setCategory] = useState("all");
  const [selected, setSelected] = useState<SeoIssue | null>(null);
  const [resolved, setResolved] = useState<string[]>([]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return seoIssues.filter(
      (i) =>
        (!q || i.issue.toLowerCase().includes(q)) &&
        (severity === "all" || i.severity === severity) &&
        (category === "all" || i.category === category),
    );
  }, [search, severity, category]);

  const counts = {
    Critical: seoIssues.filter((i) => i.severity === "Critical").reduce((a, i) => a + i.pages, 0),
    High: seoIssues.filter((i) => i.severity === "High").reduce((a, i) => a + i.pages, 0),
    Medium: seoIssues.filter((i) => i.severity === "Medium").reduce((a, i) => a + i.pages, 0),
    Low: seoIssues.filter((i) => i.severity === "Low").reduce((a, i) => a + i.pages, 0),
  };

  const columns: Column<SeoIssue>[] = [
    {
      key: "issue",
      header: "Issue",
      sortValue: (i) => i.issue,
      render: (i) => (
        <div>
          <p className="font-medium">{i.issue}</p>
          <p className="text-xs text-muted-foreground">{i.category}</p>
        </div>
      ),
    },
    { key: "pages", header: "Pages", align: "center", sortValue: (i) => i.pages, render: (i) => i.pages },
    { key: "severity", header: "Severity", sortValue: (i) => i.severity, render: (i) => <StatusBadge value={i.severity} /> },
    { key: "impact", header: "Impact", sortValue: (i) => i.impact, render: (i) => <StatusBadge value={i.impact} /> },
    {
      key: "action",
      header: "Action",
      align: "right",
      render: (i) =>
        resolved.includes(i.id) ? (
          <StatusBadge value="Completed" />
        ) : (
          <Button size="sm" variant="outline" onClick={() => setSelected(i)}>
            Fix
          </Button>
        ),
    },
  ];

  return (
    <>
      <Breadcrumbs items={[{ label: "Overview", to: "/" }, { label: "SEO", to: "/seo" }, { label: "Technical SEO" }]} />
      <PageHeader
        eyebrow="Search layer"
        title="Technical SEO"
        subtitle="1,284 pages crawled across the Sterling resort portfolio."
        actions={<Button size="sm" onClick={() => toast.success("Re-crawl queued (demo)")}>Run crawl</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Critical issues" value={12} tone="brand" />
        <StatCard label="High issues" value={38} tone="brand" />
        <StatCard label="Medium issues" value={86} tone="brand" />
        <StatCard label="Low issues" value={48} tone="brand" />
      </div>

      <SectionCard title="Affected pages by severity">
        <div className="grid gap-4 sm:grid-cols-4">
          {Object.entries(counts).map(([k, v]) => (
            <div key={k} className="rounded-xl border border-border p-4">
              <StatusBadge value={k} />
              <p className="mt-2 text-2xl font-bold tabular-nums">{v}</p>
              <p className="text-xs text-muted-foreground">pages affected</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard bodyClassName="p-4">
        <FilterBar>
          <SearchBox value={search} onChange={setSearch} placeholder="Search issues" />
          <FilterSelect value={severity} onChange={setSeverity} options={["Critical", "High", "Medium", "Low"]} placeholder="Severities" width="w-[150px]" />
          <FilterSelect value={category} onChange={setCategory} options={categories} placeholder="Categories" width="w-[170px]" />
        </FilterBar>
      </SectionCard>

      <SectionCard title="Issue register" description="Click Fix to review the recommended remediation.">
        <DataTable
          rows={rows}
          columns={columns}
          getRowKey={(i) => i.id}
          initialSort={{ key: "pages", dir: "desc" }}
          emptyTitle="No issues match your filters"
        />
      </SectionCard>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          {selected ? (
            <>
              <SheetHeader>
                <SheetTitle>{selected.issue}</SheetTitle>
                <SheetDescription>
                  {selected.category} · {selected.pages} pages · {selected.severity} severity
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-6 px-4 pb-8">
                <div>
                  <h3 className="text-sm font-semibold">What this means</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{selected.explanation}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Affected pages</h3>
                  <ul className="mt-2 space-y-1 rounded-lg border border-border p-3 text-xs break-all text-muted-foreground">
                    {selected.affected.map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Recommended fix</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{selected.fix}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Suggested implementation</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{selected.implementation}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => {
                      setResolved((r) => [...r, selected.id]);
                      setSelected(null);
                      toast.success(`“${selected.issue}” marked as resolved`);
                    }}
                  >
                    Mark as resolved
                  </Button>
                  <Button variant="outline" onClick={() => setSelected(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
}
