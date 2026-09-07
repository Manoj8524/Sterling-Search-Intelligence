import { useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
  Breadcrumbs,
  PageHeader,
  ScoreBadge,
  SectionCard,
  StatCard,
} from "@/components/platform/primitives";
import { DataTable, type Column } from "@/components/platform/data-table";
import { FilterBar, FilterSelect, SearchBox } from "@/components/platform/filter-bar";
import { resortPages, type ResortPage } from "@/data/content";
import { useResortFilter } from "@/context/app-context";

const title = "Website Content | Sterling Search Intelligence";
const description =
  "Page-by-page SEO, AEO and GEO scoring for every Sterling Holidays resort page.";

export const Route = createFileRoute("/pages/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContentLibraryPage,
});

function ContentLibraryPage() {
  const rows = useResortFilter(resortPages);
  const [search, setSearch] = useState("");
  const [pageType, setPageType] = useState("all");

  const filtered = rows.filter(
    (p) =>
      (!search || `${p.name} ${p.path}`.toLowerCase().includes(search.toLowerCase())) &&
      (pageType === "all" || p.name === pageType),
  );
  const pageTypes = Array.from(new Set(resortPages.map((p) => p.name)));
  const avg = (key: "seo" | "aeo" | "geo") =>
    rows.length ? Math.round(rows.reduce((sum, p) => sum + p[key], 0) / rows.length) : 0;

  const columns: Column<ResortPage>[] = [
    {
      key: "name",
      header: "Page",
      sortValue: (r) => r.name,
      render: (r) => (
        <div>
          <Link
            to="/pages/$pageId"
            params={{ pageId: r.id }}
            className="font-medium hover:text-primary hover:underline"
          >
            {r.name}
          </Link>
          <p className="break-all text-xs text-muted-foreground">{r.path}</p>
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
      render: (r) => <ScoreBadge value={r.overall} />,
    },
    { key: "issues", header: "Issues", align: "right", sortValue: (r) => r.issues, render: (r) => r.issues },
  ];

  return (
    <>
      <Breadcrumbs items={[{ label: "Overview", to: "/" }, { label: "Website Content" }]} />
      <PageHeader
        eyebrow="Content layer"
        title="Website Content"
        subtitle="Every Sterling resort page scored across search, answer and generative visibility."
      />
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Pages analysed" value={rows.length.toLocaleString()} tone="brand" />
        <StatCard label="Average SEO" value={avg("seo")} tone="seo" />
        <StatCard label="Average AEO" value={avg("aeo")} tone="brand" />
        <StatCard label="Average GEO" value={avg("geo")} tone="brand" />
      </div>
      <SectionCard bodyClassName="p-4">
        <FilterBar>
          <SearchBox value={search} onChange={setSearch} placeholder="Search pages or URLs" />
          <FilterSelect value={pageType} onChange={setPageType} options={pageTypes} placeholder="Page type" />
        </FilterBar>
      </SectionCard>
      <SectionCard
        title={`${filtered.length.toLocaleString()} pages`}
        description="Open any page to see its detailed content analysis and recommended fixes."
      >
        <DataTable
          rows={filtered}
          columns={columns}
          getRowKey={(r) => r.id}
          initialSort={{ key: "overall", dir: "asc" }}
        />
      </SectionCard>
    </>
  );
}
