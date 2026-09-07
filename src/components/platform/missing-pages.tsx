import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Breadcrumbs,
  EmptyState,
  LayerPill,
  PageHeader,
  PriorityBadge,
  ScoreBadge,
  SectionCard,
  StatCard,
  StatusBadge,
} from "@/components/platform/primitives";
import { DataTable, type Column } from "@/components/platform/data-table";
import { FilterBar, FilterSelect, SearchBox } from "@/components/platform/filter-bar";
import { GroupedBarChart, MetricBar, SimpleBarChart, TrendChart } from "@/components/platform/charts";
import {
  aiQueries,
  citationGaps,
  competitorRows,
  faqClusters,
  getAiQuery,
  getCitationGap,
  getPage,
  getRecommendation,
  getReport,
  getSeoIssue,
  keywords,
  recommendations,
  reports,
  resortPages,
  seoIssues,
  seoOpportunities,
  questions,
  type AiQuery,
  type CitationGap,
  type CompetitorRow,
  type Keyword,
  type Recommendation,
  type Report,
  type ResortPage,
  type SeoIssue,
  type SeoOpportunity,
  type Question,
} from "@/data/content";
import { resorts, type Resort } from "@/data/resorts";
import { activity, aiVisibilityTrend, geoComparison, platformStats, visibilityTrend } from "@/data/platform";
import { useApp, useResortFilter } from "@/context/app-context";

const pageCrumb = (section: string, label: string) => [
  { label: "Overview", to: "/" },
  { label: section, to: `/${section.toLowerCase()}` },
  { label },
];

function ListToolbar({ search, setSearch, children, placeholder = "Search" }: { search: string; setSearch: (value: string) => void; children?: React.ReactNode; placeholder?: string }) {
  return <SectionCard bodyClassName="p-4"><FilterBar><SearchBox value={search} onChange={setSearch} placeholder={placeholder} />{children}</FilterBar></SectionCard>;
}

function DetailSheet({ open, onClose, title, subtitle, children }: { open: boolean; onClose: () => void; title: string; subtitle?: string | undefined; children: React.ReactNode }) {
  return (
    <Sheet open={open} onOpenChange={(o: boolean) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="pr-6 text-left">{title}</SheetTitle>
          {subtitle ? <SheetDescription className="text-left">{subtitle}</SheetDescription> : null}
        </SheetHeader>
        <div className="space-y-6 px-4 pb-10">{children}</div>
      </SheetContent>
    </Sheet>
  );
}

function ActionList({ items }: { items: string[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold">Recommended actions</h3>
      <ol className="mt-2 space-y-1.5 text-sm text-muted-foreground">
        {items.map((a, i) => (
          <li key={a}>{i + 1}. {a}</li>
        ))}
      </ol>
    </div>
  );
}

export function SeoRankingsPage() {
  const rows = useResortFilter(keywords);
  const [search, setSearch] = useState("");
  const [intent, setIntent] = useState("all");
  const [selected, setSelected] = useState<Keyword | null>(null);
  const filtered = rows.filter((k) => (!search || k.keyword.toLowerCase().includes(search.toLowerCase())) && (intent === "all" || k.intent === intent));
  const columns: Column<Keyword>[] = [
    { key: "keyword", header: "Keyword", sortValue: (r) => r.keyword, render: (r) => <button type="button" className="text-left font-medium hover:text-primary hover:underline">{r.keyword}</button> },
    { key: "resort", header: "Resort", sortValue: (r) => r.resort, render: (r) => <Link to="/resorts/$resortId" params={{ resortId: r.resortId }} onClick={(e) => e.stopPropagation()} className="text-muted-foreground hover:text-primary hover:underline">{r.resort}</Link> },
    { key: "position", header: "Position", align: "center", sortValue: (r) => r.position, render: (r) => <ScoreBadge value={Math.max(0, 101 - r.position * 4)} /> },
    { key: "change", header: "Change", align: "center", sortValue: (r) => r.previousPosition - r.position, render: (r) => <span className={r.position <= r.previousPosition ? "font-semibold text-success" : "font-semibold text-destructive"}>{r.position <= r.previousPosition ? "↑" : "↓"} {Math.abs(r.previousPosition - r.position)}</span> },
    { key: "volume", header: "Searches", align: "right", sortValue: (r) => r.volume, render: (r) => r.volume.toLocaleString() },
    { key: "intent", header: "Intent", sortValue: (r) => r.intent, render: (r) => r.intent },
  ];
  return <><Breadcrumbs items={pageCrumb("SEO", "Rankings")} /><PageHeader eyebrow="Search layer" title="Keyword Rankings" subtitle="Track Sterling resort visibility across priority organic searches." /><div className="grid gap-4 sm:grid-cols-3"><StatCard label="Tracked keywords" value={rows.length.toLocaleString()} tone="seo" /><StatCard label="Top 10 rankings" value={rows.filter((k) => k.position <= 10).length.toLocaleString()} tone="seo" /><StatCard label="Ranking improvements" value={rows.filter((k) => k.position <= k.previousPosition).length.toLocaleString()} tone="brand" /></div><ListToolbar search={search} setSearch={setSearch} placeholder="Search keywords"><FilterSelect value={intent} onChange={setIntent} options={["Commercial", "Informational", "Local", "Navigational", "Transactional"]} placeholder="Intent" /></ListToolbar><SectionCard title={`${filtered.length.toLocaleString()} ranking records`} description="Select a keyword to see the ranking history and what to do next."><DataTable rows={filtered} columns={columns} getRowKey={(r) => r.id} onRowClick={setSelected} initialSort={{ key: "position", dir: "asc" }} /></SectionCard>
    <DetailSheet open={!!selected} onClose={() => setSelected(null)} title={selected?.keyword ?? ""} subtitle={selected ? `${selected.resort} · ${selected.volume.toLocaleString()} monthly searches · ${selected.intent} intent` : undefined}>
      {selected ? (
        <>
          <div className="flex flex-wrap gap-2"><StatusBadge value={selected.opportunity} /><StatusBadge value={selected.intent} /></div>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Position" value={`#${selected.position}`} tone="seo" />
            <StatCard label="Previous" value={`#${selected.previousPosition}`} tone="brand" />
            <StatCard label="Difficulty" value={selected.difficulty} suffix="/100" tone="brand" />
          </div>
          <div><h3 className="text-sm font-semibold">Ranking page</h3><p className="mt-1.5 break-all text-sm text-muted-foreground">{selected.url}</p></div>
          <ActionList items={[
            `Expand the ranking page with a section that directly answers “${selected.keyword}”.`,
            selected.position > 10 ? "Add internal links from the destination hub and three related resort pages." : "Protect the position with fresh availability, pricing and review content.",
            "Add FAQ and offer schema so the page can win richer results.",
            "Re-check the position after two weeks and log the movement in Reports.",
          ]} />
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm"><Link to="/resorts/$resortId" params={{ resortId: selected.resortId }}>Open resort</Link></Button>
            <Button asChild size="sm" variant="outline"><Link to="/seo/opportunities">See related opportunities</Link></Button>
          </div>
        </>
      ) : null}
    </DetailSheet></>;
}

export function SeoCompetitorsPage() {
  const rows = useResortFilter(competitorRows);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<CompetitorRow | null>(null);
  const filtered = rows.filter((r) => !search || r.keyword.toLowerCase().includes(search.toLowerCase()));
  const columns: Column<CompetitorRow>[] = [
    { key: "keyword", header: "Keyword", sortValue: (r) => r.keyword, render: (r) => <button type="button" className="text-left font-medium hover:text-primary hover:underline">{r.keyword}</button> },
    { key: "sterling", header: "Sterling", align: "center", sortValue: (r) => r.sterling, render: (r) => <ScoreBadge value={Math.max(0, 101 - r.sterling * 4)} /> },
    { key: "competitors", header: "Best competitor", sortValue: (r) => r.competitors[0]?.position ?? 99, render: (r) => <span>{r.competitors[0]?.name} <span className="text-muted-foreground">#{r.competitors[0]?.position}</span></span> },
    { key: "featuredSnippet", header: "Featured result", sortValue: (r) => r.featuredSnippet, render: (r) => r.featuredSnippet },
    { key: "contentDepth", header: "Content depth", align: "right", sortValue: (r) => r.contentDepth, render: (r) => `${r.contentDepth}/100` },
    { key: "domainAuthority", header: "Authority", align: "right", sortValue: (r) => r.domainAuthority, render: (r) => `${r.domainAuthority}/100` },
  ];
  return <><Breadcrumbs items={pageCrumb("SEO", "Competitors")} /><PageHeader eyebrow="Search layer" title="Competitor Intelligence" subtitle="See where competing resort brands win the searches Sterling wants." /><div className="grid gap-4 sm:grid-cols-3"><StatCard label="Keywords compared" value={filtered.length} tone="seo" /><StatCard label="Featured result share" value="24%" tone="brand" /><StatCard label="Competitor gaps" value="386" tone="brand" /></div><ListToolbar search={search} setSearch={setSearch} placeholder="Search competitor keywords" /><SectionCard title="SERP comparison" description="Select a keyword to compare the full result page and see how to close the gap."><DataTable rows={filtered} columns={columns} getRowKey={(r) => `${r.resortId}-${r.keyword}`} onRowClick={setSelected} initialSort={{ key: "sterling", dir: "asc" }} /></SectionCard>
    <DetailSheet open={!!selected} onClose={() => setSelected(null)} title={selected?.keyword ?? ""} subtitle={selected ? `Sterling ranks #${selected.sterling} · ${selected.paa} people-also-ask questions` : undefined}>
      {selected ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="SERP visibility" value={selected.serpVisibility} suffix="%" tone="seo" />
            <StatCard label="Content depth" value={selected.contentDepth} suffix="/100" tone="brand" />
            <StatCard label="Local pack" value={selected.localPack ? "Present" : "Absent"} tone="brand" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Who ranks above Sterling</h3>
            <ul className="mt-2 divide-y divide-border">
              {selected.competitors.map((c) => (
                <li key={c.name} className="flex items-center justify-between py-2 text-sm"><span>{c.name}</span><span className={c.position < selected.sterling ? "font-semibold text-destructive" : "font-semibold text-success"}>#{c.position}</span></li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-muted-foreground">Featured result held by: <span className="font-medium text-foreground">{selected.featuredSnippet}</span></p>
          </div>
          <ActionList items={[
            `Match the depth of the leading page — target ${Math.min(100, selected.contentDepth + 20)}/100 with rooms, rates, activities and traveller tips.`,
            `Answer the ${selected.paa} people-also-ask questions on the page with short, marked-up answers.`,
            selected.localPack ? "Keep the local listing complete so Sterling stays in the map pack." : "Complete the local business listing to enter the map pack.",
            "Earn two destination-relevant links to close the authority gap.",
          ]} />
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm"><Link to="/resorts/$resortId" params={{ resortId: selected.resortId }}>Open resort</Link></Button>
            <Button asChild size="sm" variant="outline"><Link to="/seo/rankings">View ranking detail</Link></Button>
          </div>
        </>
      ) : null}
    </DetailSheet></>;
}

export function SeoOpportunitiesPage() {
  const rows = useResortFilter(seoOpportunities);
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("all");
  const [selected, setSelected] = useState<SeoOpportunity | null>(null);
  const filtered = rows.filter((r) => (!search || `${r.keyword} ${r.resort}`.toLowerCase().includes(search.toLowerCase())) && (priority === "all" || r.priority === priority));
  const columns: Column<SeoOpportunity>[] = [
    { key: "keyword", header: "Opportunity", sortValue: (r) => r.keyword, render: (r) => <div><button type="button" className="text-left font-medium hover:text-primary hover:underline">{r.keyword}</button><p className="text-xs text-muted-foreground">{r.resort} · {r.category}</p></div> },
    { key: "currentPosition", header: "Current", align: "center", sortValue: (r) => r.currentPosition, render: (r) => `#${r.currentPosition}` },
    { key: "potentialPosition", header: "Potential", align: "center", sortValue: (r) => r.potentialPosition, render: (r) => <span className="font-semibold text-success">#{r.potentialPosition}</span> },
    { key: "estimatedOpportunity", header: "Estimated upside", sortValue: (r) => r.estimatedOpportunity, render: (r) => r.estimatedOpportunity },
    { key: "priority", header: "Priority", align: "center", sortValue: (r) => r.priority, render: (r) => <PriorityBadge value={r.priority} /> },
    { key: "action", header: "Next step", sortValue: (r) => r.action, render: (r) => <span className="text-muted-foreground">{r.action}</span> },
  ];
  return <><Breadcrumbs items={pageCrumb("SEO", "Opportunities")} /><PageHeader eyebrow="Search layer" title="SEO Opportunities" subtitle="Prioritised actions that can move high-value Sterling pages into stronger positions." /><div className="grid gap-4 sm:grid-cols-3"><StatCard label="Open opportunities" value={rows.length} tone="seo" /><StatCard label="P1 opportunities" value={rows.filter((r) => r.priority === "P1").length} tone="brand" /><StatCard label="Estimated monthly upside" value="186K" suffix="visits" tone="brand" /></div><ListToolbar search={search} setSearch={setSearch} placeholder="Search opportunities"><FilterSelect value={priority} onChange={setPriority} options={["P1", "P2", "P3"]} placeholder="Priority" /></ListToolbar><SectionCard title={`${filtered.length} opportunities`} description="Select an opportunity to see the full action plan."><DataTable rows={filtered} columns={columns} getRowKey={(r) => r.id} onRowClick={setSelected} initialSort={{ key: "priority", dir: "asc" }} /></SectionCard>
    <DetailSheet open={!!selected} onClose={() => setSelected(null)} title={selected?.keyword ?? ""} subtitle={selected ? `${selected.resort} · ${selected.category} · ${selected.estimatedOpportunity}` : undefined}>
      {selected ? (
        <>
          <div className="flex flex-wrap gap-2"><PriorityBadge value={selected.priority} /></div>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Current" value={`#${selected.currentPosition}`} tone="brand" />
            <StatCard label="Potential" value={`#${selected.potentialPosition}`} tone="seo" />
            <StatCard label="Upside" value={selected.estimatedOpportunity} tone="brand" />
          </div>
          <div><h3 className="text-sm font-semibold">Why this matters</h3><p className="mt-1.5 text-sm text-muted-foreground">Moving “{selected.keyword}” from #{selected.currentPosition} to #{selected.potentialPosition} for {selected.resort} is worth roughly {selected.estimatedOpportunity} in additional demand.</p></div>
          <ActionList items={[
            selected.action,
            `Refresh the ${selected.resort} page so the ${selected.category.toLowerCase()} work is visible to travellers, not just crawlers.`,
            "Add supporting internal links from the destination hub page.",
            "Track the move in the next monthly report.",
          ]} />
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm"><Link to="/resorts/$resortId" params={{ resortId: selected.resortId }}>Open resort</Link></Button>
            <Button asChild size="sm" variant="outline"><Link to="/recommendations">See recommendations</Link></Button>
          </div>
        </>
      ) : null}
    </DetailSheet></>;
}


export function SeoIssuesPage() {
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("all");
  const filtered = seoIssues.filter((r) => (!search || r.issue.toLowerCase().includes(search.toLowerCase())) && (severity === "all" || r.severity === severity));
  const columns: Column<SeoIssue>[] = [
    { key: "issue", header: "Issue", sortValue: (r) => r.issue, render: (r) => <Link to="/seo/issues/$issueId" params={{ issueId: r.id }} className="font-medium hover:text-primary hover:underline">{r.issue}</Link> },
    { key: "category", header: "Category", sortValue: (r) => r.category, render: (r) => r.category },
    { key: "pages", header: "Affected pages", align: "right", sortValue: (r) => r.pages, render: (r) => r.pages },
    { key: "severity", header: "Severity", align: "center", sortValue: (r) => r.severity, render: (r) => <StatusBadge value={r.severity} /> },
    { key: "impact", header: "Impact", align: "center", sortValue: (r) => r.impact, render: (r) => <StatusBadge value={r.impact} /> },
  ];
  return <><Breadcrumbs items={pageCrumb("SEO", "Issues")} /><PageHeader eyebrow="Search layer" title="SEO Issues" subtitle="Technical and on-page issues detected across the Sterling resort portfolio." /><div className="grid gap-4 sm:grid-cols-3"><StatCard label="Open issue types" value={seoIssues.length} tone="seo" /><StatCard label="Affected pages" value="642" tone="brand" /><StatCard label="Critical issues" value={seoIssues.filter((r) => r.severity === "Critical").length} tone="brand" /></div><ListToolbar search={search} setSearch={setSearch} placeholder="Search issues"><FilterSelect value={severity} onChange={setSeverity} options={["Critical", "High", "Medium", "Low"]} placeholder="Severity" /></ListToolbar><SectionCard title={`${filtered.length} issue types`} description="Open an issue to see the fix and affected URLs."><DataTable rows={filtered} columns={columns} getRowKey={(r) => r.id} initialSort={{ key: "pages", dir: "desc" }} /></SectionCard></>;
}

export function SeoIssueDetailPage({ issueId }: { issueId: string }) {
  const issue = getSeoIssue(issueId);
  if (!issue) return <EmptyState title="Issue not found" />;
  return <><Breadcrumbs items={[{ label: "Overview", to: "/" }, { label: "SEO", to: "/seo" }, { label: "Issues", to: "/seo/issues" }, { label: issue.issue }]} /><PageHeader eyebrow="Issue detail" title={issue.issue} subtitle={`${issue.category} · ${issue.pages} affected pages`} actions={<StatusBadge value={issue.severity} />} /><div className="grid gap-4 sm:grid-cols-3"><StatCard label="Affected pages" value={issue.pages} tone="seo" /><StatCard label="Severity" value={issue.severity} tone="brand" /><StatCard label="Impact" value={issue.impact} tone="brand" /></div><div className="grid gap-4 xl:grid-cols-2"><SectionCard title="What the issue means"><p className="text-sm leading-7 text-muted-foreground">{issue.explanation}</p></SectionCard><SectionCard title="Recommended fix"><p className="text-sm leading-7 text-muted-foreground">{issue.fix}</p><p className="mt-4 rounded-lg bg-muted p-4 text-sm font-medium">Implementation: {issue.implementation}</p></SectionCard></div><SectionCard title="Affected page patterns"><ul className="space-y-2">{issue.affected.map((ex) => <li key={ex} className="break-all text-sm text-primary hover:underline">{ex}</li>)}</ul></SectionCard></>;
}

export function AeoAnswerOpportunitiesPage() {
  const all = useResortFilter(questions).filter((q) => q.coverage !== "Strong");
  const [selected, setSelected] = useState<Question | null>(null);
  const tiers = ["Very High", "High", "Medium", "Low"];
  const ranked = [...all].sort((a, b) => b.volume / (b.answerScore || 1) - a.volume / (a.answerScore || 1));
  return <><Breadcrumbs items={pageCrumb("AEO", "Answer Opportunities")} /><PageHeader eyebrow="Answer layer" title="Answer Opportunities" subtitle="Ranked answer plays: the questions worth writing next, grouped by expected impact." /><div className="grid gap-4 sm:grid-cols-3"><StatCard label="Open opportunities" value={all.length} tone="aeo" /><StatCard label="Very high impact" value={all.filter((r) => r.opportunity === "Very High").length} tone="brand" /><StatCard label="Monthly question demand" value={all.reduce((s, r) => s + r.volume, 0).toLocaleString()} tone="aeo" /></div>
    {tiers.map((tier) => {
      const set = ranked.filter((q) => q.opportunity === tier);
      if (!set.length) return null;
      return <SectionCard key={tier} title={`${tier} impact`} description={`${set.length} question${set.length === 1 ? "" : "s"} · ${set.reduce((s, q) => s + q.volume, 0).toLocaleString()} monthly searches at stake`}>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{set.slice(0, 9).map((q) => (
          <button key={q.id} type="button" onClick={() => setSelected(q)} className="rounded-lg border border-border p-4 text-left transition hover:border-primary hover:shadow-sm">
            <div className="flex items-start justify-between gap-3"><p className="text-sm font-medium leading-6">{q.question}</p><ScoreBadge value={q.answerScore} /></div>
            <p className="mt-2 text-xs text-muted-foreground">{q.resort} · {q.cluster}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2"><StatusBadge value={q.coverage} /><span className="text-xs text-muted-foreground">{q.volume.toLocaleString()} searches / month</span></div>
            <p className="mt-3 text-xs font-medium text-primary">{q.missing.length} missing detail{q.missing.length === 1 ? "" : "s"} → view action plan</p>
          </button>
        ))}</div>
      </SectionCard>;
    })}
    {all.length === 0 ? <EmptyState title="No open answer opportunities" description="Every tracked question for this selection already has strong coverage." /> : null}
    <DetailSheet open={!!selected} onClose={() => setSelected(null)} title={selected?.question ?? ""} subtitle={selected ? `${selected.resort} · ${selected.cluster} · ${selected.volume.toLocaleString()} monthly searches` : undefined}>
      {selected ? (
        <>
          <div className="flex flex-wrap gap-2"><StatusBadge value={selected.coverage} /><StatusBadge value={selected.opportunity} /><StatusBadge value={selected.intent} /></div>
          <div className="grid gap-4 sm:grid-cols-2"><StatCard label="Answer score" value={selected.answerScore} suffix="/100" tone="aeo" /><StatCard label="Missing details" value={selected.missing.length} tone="brand" /></div>
          <div><h3 className="text-sm font-semibold">What Sterling says today</h3><p className="mt-1.5 text-sm leading-7 text-muted-foreground">{selected.currentAnswer}</p></div>
          <div><h3 className="text-sm font-semibold">Missing from the answer</h3><ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">{selected.missing.map((m) => <li key={m}>· {m}</li>)}</ul></div>
          <ActionList items={[
            `Add a short, direct answer to “${selected.question}” at the top of the ${selected.cluster.toLowerCase()} section.`,
            `Cover the missing details: ${selected.missing.slice(0, 3).join(", ")}.`,
            "Mark the answer up with FAQPage schema so engines can quote it.",
            "Re-run the answer check in two weeks and log the score change in Reports.",
          ]} />
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm"><Link to="/aeo/questions/$questionId" params={{ questionId: selected.id }}>Open full question analysis</Link></Button>
            <Button asChild size="sm" variant="outline"><Link to="/resorts/$resortId" params={{ resortId: selected.resortId }}>Open resort</Link></Button>
          </div>
        </>
      ) : null}
    </DetailSheet></>;
}

export function AeoFaqCoveragePage() {
  const rows = useResortFilter(questions);
  const [selected, setSelected] = useState<string | null>(null);
  const clusters = faqClusters.map((cluster) => { const set = rows.filter((q) => q.cluster === cluster); return { cluster, questions: set.length, score: set.length ? Math.round(set.reduce((s, q) => s + q.answerScore, 0) / set.length) : 0, strong: set.filter((q) => q.coverage === "Strong").length }; }).filter((r) => r.questions);
  const clusterQuestions = selected ? rows.filter((q) => q.cluster === selected) : [];
  const selectedRow = clusters.find((c) => c.cluster === selected);
  return <><Breadcrumbs items={pageCrumb("AEO", "FAQ Coverage")} /><PageHeader eyebrow="Answer layer" title="FAQ Coverage" subtitle="Coverage by traveller question cluster across the active resort portfolio." /><div className="grid gap-4 sm:grid-cols-3"><StatCard label="Average answer score" value={rows.length ? Math.round(rows.reduce((s, q) => s + q.answerScore, 0) / rows.length) : 0} suffix="/100" tone="aeo" /><StatCard label="Question clusters" value={clusters.length} tone="aeo" /><StatCard label="Strong coverage" value={`${Math.round((rows.filter((q) => q.coverage === "Strong").length / Math.max(1, rows.length)) * 100)}%`} tone="brand" /></div><SectionCard title="Coverage by cluster" description="The weakest clusters are the clearest opportunities for structured FAQ content."><SimpleBarChart data={[...clusters].sort((a, b) => a.score - b.score)} xKey="cluster" barKey="score" horizontal colors={["var(--aeo)"]} height={360} /></SectionCard><SectionCard title="Cluster detail" description="Select a cluster to see its questions and the FAQ work required."><div className="grid gap-3 md:grid-cols-2">{clusters.map((r) => <button key={r.cluster} type="button" onClick={() => setSelected(r.cluster)} className="rounded-lg border border-border p-4 text-left transition hover:border-primary hover:shadow-sm"><div className="flex items-center justify-between"><p className="font-medium">{r.cluster}</p><ScoreBadge value={r.score} /></div><p className="mt-1 text-xs text-muted-foreground">{r.questions} questions · {r.strong} with strong coverage</p><MetricBar label="Strong coverage" value={Math.round((r.strong / r.questions) * 100)} /></button>)}</div></SectionCard>
    <DetailSheet open={!!selected} onClose={() => setSelected(null)} title={selected ?? ""} subtitle={selectedRow ? `${selectedRow.questions} questions · average answer score ${selectedRow.score}/100` : undefined}>
      {selectedRow ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3"><StatCard label="Questions" value={selectedRow.questions} tone="aeo" /><StatCard label="Strong" value={selectedRow.strong} tone="aeo" /><StatCard label="Needs work" value={selectedRow.questions - selectedRow.strong} tone="brand" /></div>
          <div><h3 className="text-sm font-semibold">Questions in this cluster</h3><ul className="mt-2 divide-y divide-border">{clusterQuestions.slice(0, 12).map((q) => <li key={q.id} className="flex items-center justify-between gap-3 py-2.5"><Link to="/aeo/questions/$questionId" params={{ questionId: q.id }} className="text-sm hover:text-primary hover:underline">{q.question}</Link><StatusBadge value={q.coverage} /></li>)}</ul></div>
          <ActionList items={[
            `Publish one shared FAQ block for ${selectedRow.cluster.toLowerCase()} and reuse it across resort pages.`,
            `Fix the ${selectedRow.questions - selectedRow.strong} weak answers in this cluster first.`,
            "Add FAQPage schema to every page carrying the block.",
            "Review the cluster score again after the next crawl.",
          ]} />
          <Button asChild size="sm" variant="outline"><Link to="/aeo/answer-gaps">See all answer gaps</Link></Button>
        </>
      ) : null}
    </DetailSheet></>;
}

export function AeoStructuredAnswersPage() {
  const rows = useResortFilter(resortPages);
  const [selected, setSelected] = useState<ResortPage | null>(null);
  const columns: Column<ResortPage>[] = [
    { key: "name", header: "Page", sortValue: (r) => r.name, render: (r) => <button type="button" className="text-left font-medium hover:text-primary hover:underline">{r.name}</button> },
    { key: "path", header: "Path", sortValue: (r) => r.path, render: (r) => <span className="text-xs text-muted-foreground">{r.path}</span> },
    { key: "seo", header: "SEO", align: "center", sortValue: (r) => r.seo, render: (r) => <ScoreBadge value={r.seo} /> },
    { key: "aeo", header: "AEO", align: "center", sortValue: (r) => r.aeo, render: (r) => <ScoreBadge value={r.aeo} /> },
    { key: "structuredAnswerScore", header: "Structured answer", align: "center", sortValue: (r) => r.structuredAnswerScore, render: (r) => <ScoreBadge value={r.structuredAnswerScore} /> },
    { key: "issues", header: "Open issues", align: "right", sortValue: (r) => r.issues, render: (r) => r.issues },
  ];
  return <><Breadcrumbs items={pageCrumb("AEO", "Structured Answers")} /><PageHeader eyebrow="Answer layer" title="Structured Answers" subtitle="Audit the page-level answer blocks that help engines extract and reuse Sterling content." /><div className="grid gap-4 sm:grid-cols-3"><StatCard label="Pages assessed" value={rows.length} tone="aeo" /><StatCard label="Average structure score" value={rows.length ? Math.round(rows.reduce((s, r) => s + r.structuredAnswerScore, 0) / rows.length) : 0} suffix="/100" tone="aeo" /><StatCard label="Pages needing work" value={rows.filter((r) => r.structuredAnswerScore < 65).length} tone="brand" /></div><SectionCard title="Page-level answer readiness" description="Select a page to review its answer blocks and schema checklist."><DataTable rows={rows} columns={columns} getRowKey={(r) => r.id} onRowClick={setSelected} initialSort={{ key: "structuredAnswerScore", dir: "asc" }} /></SectionCard>
    <DetailSheet open={!!selected} onClose={() => setSelected(null)} title={selected?.name ?? ""} subtitle={selected ? `${selected.path} · structured answer score ${selected.structuredAnswerScore}/100` : undefined}>
      {selected ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3"><StatCard label="SEO" value={selected.seo} suffix="/100" tone="seo" /><StatCard label="AEO" value={selected.aeo} suffix="/100" tone="aeo" /><StatCard label="GEO" value={selected.geo} suffix="/100" tone="geo" /></div>
          <div><h3 className="text-sm font-semibold">Answer block checklist</h3><div className="mt-3 space-y-4">
            <MetricBar label="Direct answer paragraph" value={Math.min(100, selected.structuredAnswerScore + 8)} />
            <MetricBar label="FAQ block present" value={selected.aeo} />
            <MetricBar label="Schema markup" value={Math.max(20, selected.structuredAnswerScore - 12)} />
            <MetricBar label="Scannable headings and lists" value={Math.min(100, selected.seo - 5)} />
          </div></div>
          <ActionList items={[
            selected.structuredAnswerScore < 65 ? "Add a 40-60 word direct answer under the main heading." : "Keep the direct answer block current with this season's details.",
            "Convert long paragraphs into labelled lists engines can lift.",
            "Add FAQPage and Hotel schema, then validate the markup.",
            `Resolve the ${selected.issues} open issue${selected.issues === 1 ? "" : "s"} on this page.`,
          ]} />
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm"><Link to="/pages/$pageId" params={{ pageId: selected.id }}>Open page analysis</Link></Button>
            <Button asChild size="sm" variant="outline"><Link to="/resorts/$resortId" params={{ resortId: selected.resortId }}>Open resort</Link></Button>
          </div>
        </>
      ) : null}
    </DetailSheet></>;
}


export function GeoOverviewPage() {
  const rows = useResortFilter(aiQueries);
  return <><Breadcrumbs items={pageCrumb("GEO", "Overview")} /><PageHeader eyebrow="Generative layer" title="GEO Overview" subtitle="Measure how often AI platforms mention, recommend and cite Sterling resorts." /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="AI visibility" value={platformStats.geo} suffix="/100" tone="geo" delta="+17 this quarter" /><StatCard label="AI queries tracked" value={rows.length.toLocaleString()} tone="geo" /><StatCard label="Sterling mentions" value={rows.filter((r) => r.sterlingMentioned).length.toLocaleString()} tone="geo" /><StatCard label="Citation share" value={`${platformStats.citationShare}%`} tone="brand" /></div><div className="grid gap-4 xl:grid-cols-2"><SectionCard title="AI visibility trend" description="Sterling versus major hospitality competitors."><TrendChart data={aiVisibilityTrend} series={[{ key: "sterling", label: "Sterling", color: "var(--geo)" }, { key: "clubMahindra", label: "Club Mahindra", color: "var(--chart-2)" }, { key: "taj", label: "Taj", color: "var(--chart-4)" }]} /></SectionCard><SectionCard title="GEO health signals"><div className="space-y-5"><MetricBar label="AI visibility" value={platformStats.geo} /><MetricBar label="Entity authority" value={72} /><MetricBar label="Content authority" value={64} /><MetricBar label="Citation share" value={platformStats.citationShare} max={50} /></div></SectionCard></div><SectionCard title="Queries where Sterling is missing" description="Open a query to see the captured AI response and cited sources." action={<Link to="/geo/ai-queries" className="text-sm font-medium text-primary hover:underline">View all queries</Link>}><ul className="divide-y divide-border">{rows.filter((r) => !r.sterlingMentioned).slice(0, 6).map((r) => <li key={r.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"><div><Link to="/geo/ai-queries/$queryId" params={{ queryId: r.id }} className="text-sm font-medium hover:text-primary hover:underline">{r.query}</Link><p className="mt-0.5 text-xs text-muted-foreground">{r.platform} · {r.resort}</p></div><StatusBadge value={r.visibility} /></li>)}</ul></SectionCard><SectionCard title="Competitive GEO comparison"><div className="overflow-x-auto"><table className="w-full min-w-[650px] text-sm"><thead><tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">{Object.keys(geoComparison[0] ?? {}).map((key) => <th key={key} className="px-3 py-3">{key.replace(/([A-Z])/g, " $1")}</th>)}</tr></thead><tbody>{geoComparison.map((row) => <tr key={row.metric} className="border-b border-border last:border-0">{Object.values(row).map((value, i) => <td key={`${row.metric}-${i}`} className="px-3 py-3">{value}</td>)}</tr>)}</tbody></table></div></SectionCard></>;
}

type PlatformRow = { platform: AiQuery["platform"]; tracked: number; mentions: number; citations: number; visibility: number; topPositions: number };

export function GeoAiVisibilityPage() {
  const rows = useResortFilter(aiQueries);
  const [selected, setSelected] = useState<PlatformRow | null>(null);
  const platformRows: PlatformRow[] = (["ChatGPT", "Google AI", "Gemini", "Perplexity", "Copilot"] as AiQuery["platform"][]).map((platform) => {
    const scoped = rows.filter((r) => r.platform === platform);
    const mentions = scoped.filter((r) => r.sterlingMentioned).length;
    const citations = scoped.filter((r) => r.sterlingCitationPosition !== null).length;
    return {
      platform,
      tracked: scoped.length,
      mentions,
      citations,
      visibility: scoped.length ? Math.round((mentions / scoped.length) * 100) : 0,
      topPositions: scoped.filter((r) => (r.recommendationPosition ?? 99) <= 3).length,
    };
  });
  const overall = platformRows.reduce((s, r) => s + r.visibility, 0) / Math.max(1, platformRows.length);
  const weakest = [...platformRows].sort((a, b) => a.visibility - b.visibility)[0];
  const columns: Column<PlatformRow>[] = [
    { key: "platform", header: "AI platform", sortValue: (r) => r.platform, render: (r) => <button type="button" className="text-left font-medium hover:text-primary hover:underline">{r.platform}</button> },
    { key: "tracked", header: "Queries tracked", align: "right", sortValue: (r) => r.tracked, render: (r) => r.tracked },
    { key: "mentions", header: "Sterling mentioned", align: "right", sortValue: (r) => r.mentions, render: (r) => r.mentions },
    { key: "citations", header: "Sterling cited", align: "right", sortValue: (r) => r.citations, render: (r) => r.citations },
    { key: "topPositions", header: "Top 3 recommendations", align: "right", sortValue: (r) => r.topPositions, render: (r) => r.topPositions },
    { key: "visibility", header: "Visibility", align: "center", sortValue: (r) => r.visibility, render: (r) => <ScoreBadge value={r.visibility} /> },
  ];
  const selectedQueries = selected ? rows.filter((r) => r.platform === selected.platform) : [];
  return <><Breadcrumbs items={pageCrumb("GEO", "AI Visibility")} /><PageHeader eyebrow="Generative layer" title="AI Visibility" subtitle="Compare Sterling's share of recommendations across tracked answer engines." />
    <div className="grid gap-4 sm:grid-cols-3"><StatCard label="Sterling visibility" value={Math.round(overall)} suffix="/100" tone="geo" /><StatCard label="Leading competitor" value={72} suffix="/100" tone="brand" /><StatCard label="Weakest platform" value={weakest?.platform ?? "—"} tone="brand" /></div>
    <SectionCard title="Visibility trend" description="12-week AI visibility movement by competitor."><TrendChart data={aiVisibilityTrend} series={[{ key: "sterling", label: "Sterling", color: "var(--geo)" }, { key: "clubMahindra", label: "Club Mahindra", color: "var(--chart-2)" }, { key: "taj", label: "Taj Holidays", color: "var(--chart-4)" }, { key: "airbnb", label: "Airbnb", color: "var(--chart-5)" }]} /></SectionCard>
    <SectionCard title="Visibility by AI platform" description="Select a platform to see which monitored queries drive or block visibility."><DataTable rows={platformRows} columns={columns} getRowKey={(r) => r.platform} onRowClick={setSelected} initialSort={{ key: "visibility", dir: "asc" }} /></SectionCard>
    <SectionCard title="Competitive signal comparison"><div className="grid gap-5 md:grid-cols-2">{geoComparison.map((row) => <MetricBar key={row.metric} label={row.metric} value={Number(row.sterling)} max={row.metric === "AI Mentions" ? 3200 : row.metric === "Citation Share" ? 50 : 100} />)}</div></SectionCard>
    <DetailSheet open={!!selected} onClose={() => setSelected(null)} title={selected ? `${selected.platform} visibility` : ""} subtitle={selected ? `${selected.mentions} of ${selected.tracked} monitored queries mention Sterling` : undefined}>
      {selected ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3"><StatCard label="Visibility" value={selected.visibility} suffix="/100" tone="geo" /><StatCard label="Citations" value={selected.citations} tone="geo" /><StatCard label="Top 3 spots" value={selected.topPositions} tone="brand" /></div>
          <div>
            <h3 className="text-sm font-semibold">Queries where Sterling is missing</h3>
            <ul className="mt-2 space-y-2 text-sm">
              {selectedQueries.filter((q) => !q.sterlingMentioned).slice(0, 6).map((q) => <li key={q.id}><Link to="/geo/ai-queries/$queryId" params={{ queryId: q.id }} className="hover:text-primary hover:underline">{q.query}</Link><span className="ml-2 text-xs text-muted-foreground">{q.resort}</span></li>)}
              {selectedQueries.every((q) => q.sterlingMentioned) ? <li className="text-muted-foreground">Sterling appears in every monitored query on this platform.</li> : null}
            </ul>
          </div>
          <ActionList items={[
            `Publish comparison-style destination content for the ${selected.platform} prompts where Sterling is absent.`,
            "Add structured facility, pricing band and review data so answers can be extracted and attributed.",
            "Strengthen third-party listings (Tripadvisor, MakeMyTrip) that this platform cites most often.",
            "Re-run the monitored prompt set in two weeks and log the change in Reports.",
          ]} />
          <div className="flex flex-wrap gap-2"><Button asChild size="sm"><Link to="/geo/ai-queries">Review all AI queries</Link></Button><Button asChild size="sm" variant="outline"><Link to="/recommendations">Open recommendations</Link></Button></div>
        </>
      ) : null}
    </DetailSheet></>;
}

export function GeoAiQueriesPage() {
  const rows = useResortFilter(aiQueries);
  const [search, setSearch] = useState("");
  const [visibility, setVisibility] = useState("all");
  const [platform, setPlatform] = useState("all");
  const [selected, setSelected] = useState<AiQuery | null>(null);
  const filtered = rows.filter((r) => (!search || r.query.toLowerCase().includes(search.toLowerCase())) && (visibility === "all" || r.visibility === visibility) && (platform === "all" || r.platform === platform));
  const columns: Column<AiQuery>[] = [
    { key: "query", header: "AI query", sortValue: (r) => r.query, render: (r) => <Link to="/geo/ai-queries/$queryId" params={{ queryId: r.id }} onClick={(e) => e.stopPropagation()} className="font-medium hover:text-primary hover:underline">{r.query}</Link> },
    { key: "platform", header: "Platform", sortValue: (r) => r.platform, render: (r) => r.platform },
    { key: "resort", header: "Resort", sortValue: (r) => r.resort, render: (r) => <Link to="/resorts/$resortId" params={{ resortId: r.resortId }} onClick={(e) => e.stopPropagation()} className="text-muted-foreground hover:text-primary hover:underline">{r.resort}</Link> },
    { key: "visibility", header: "Visibility", align: "center", sortValue: (r) => r.visibility, render: (r) => <StatusBadge value={r.visibility} /> },
    { key: "recommendationPosition", header: "Position", align: "center", sortValue: (r) => r.recommendationPosition ?? 99, render: (r) => r.recommendationPosition ? `#${r.recommendationPosition}` : "—" },
    { key: "sterlingCitationPosition", header: "Citation", align: "center", sortValue: (r) => r.sterlingCitationPosition ?? 99, render: (r) => r.sterlingCitationPosition ? `#${r.sterlingCitationPosition}` : "—" },
  ];
  return <><Breadcrumbs items={pageCrumb("GEO", "AI Queries")} /><PageHeader eyebrow="Generative layer" title="AI Queries" subtitle="Inspect the prompts used to monitor Sterling recommendations and citations." /><div className="grid gap-4 sm:grid-cols-3"><StatCard label="Queries tracked" value={rows.length} tone="geo" /><StatCard label="Sterling mentioned" value={rows.filter((r) => r.sterlingMentioned).length} tone="geo" /><StatCard label="No visibility" value={rows.filter((r) => r.visibility === "None").length} tone="brand" /></div><ListToolbar search={search} setSearch={setSearch} placeholder="Search AI queries"><FilterSelect value={visibility} onChange={setVisibility} options={["Strong", "Moderate", "Weak", "None"]} placeholder="Visibility" /><FilterSelect value={platform} onChange={setPlatform} options={["ChatGPT", "Google AI", "Gemini", "Perplexity", "Copilot"]} placeholder="Platform" /></ListToolbar><SectionCard title={`${filtered.length} AI query checks`} description="Select a row for the captured answer, or open the full analysis."><DataTable rows={filtered} columns={columns} getRowKey={(r) => r.id} onRowClick={setSelected} initialSort={{ key: "visibility", dir: "asc" }} /></SectionCard>
    <DetailSheet open={!!selected} onClose={() => setSelected(null)} title={selected?.query ?? ""} subtitle={selected ? `${selected.platform} · ${selected.resort}` : undefined}>
      {selected ? (
        <>
          <div className="flex flex-wrap gap-2"><StatusBadge value={selected.visibility} /><StatusBadge value={selected.sterlingMentioned ? "Mentioned" : "Not mentioned"} /><StatusBadge value={selected.opportunity} /></div>
          <div><h3 className="text-sm font-semibold">Captured AI answer</h3><p className="mt-1.5 text-sm leading-7 text-muted-foreground">{selected.response}</p></div>
          <div><h3 className="text-sm font-semibold">Competitors named</h3><div className="mt-2 flex flex-wrap gap-2">{selected.competitors.map((c) => <StatusBadge key={c} value={c} />)}</div></div>
          <div><h3 className="text-sm font-semibold">Cited sources</h3><ul className="mt-2 space-y-2 text-sm">{selected.citations.map((c) => <li key={c.source} className="flex items-center justify-between border-b border-border pb-2 last:border-0"><span>{c.source}</span><StatusBadge value={c.sterling ? "Sterling" : "Third party"} /></li>)}</ul></div>
          <ActionList items={[
            selected.sterlingMentioned ? `Defend the position by refreshing ${selected.resort} facts, offers and reviews.` : `Publish an answer-shaped section on the ${selected.resort} page that directly resolves “${selected.query}”.`,
            "Add FAQ and hotel schema so the answer engine can attribute Sterling as a source.",
            "Pitch or update the third-party sources this answer cites most.",
            "Recheck the prompt after two weeks and track movement in Reports.",
          ]} />
          <div className="flex flex-wrap gap-2"><Button asChild size="sm"><Link to="/geo/ai-queries/$queryId" params={{ queryId: selected.id }}>Open full query analysis</Link></Button><Button asChild size="sm" variant="outline"><Link to="/resorts/$resortId" params={{ resortId: selected.resortId }}>Open resort</Link></Button></div>
        </>
      ) : null}
    </DetailSheet></>;
}

export function GeoAiQueryDetailPage({ queryId }: { queryId: string }) {
  const query = getAiQuery(queryId);
  if (!query) return <EmptyState title="AI query not found" description="This monitored query is no longer in the mock dataset." />;
  const related = aiQueries.filter((q) => q.resortId === query.resortId && q.id !== query.id).slice(0, 5);
  return <><Breadcrumbs items={[{ label: "Overview", to: "/" }, { label: "GEO", to: "/geo" }, { label: "AI Queries", to: "/geo/ai-queries" }, { label: query.query }]} /><PageHeader eyebrow="AI response detail" title={query.query} subtitle={`${query.platform} · ${query.resort}`} actions={<StatusBadge value={query.visibility} />} /><div className="grid gap-4 sm:grid-cols-3"><StatCard label="Sterling mentioned" value={query.sterlingMentioned ? "Yes" : "No"} tone="geo" /><StatCard label="Recommendation position" value={query.recommendationPosition ? `#${query.recommendationPosition}` : "Not ranked"} tone="geo" /><StatCard label="Citation position" value={query.sterlingCitationPosition ? `#${query.sterlingCitationPosition}` : "Not cited"} tone="brand" /></div><div className="grid gap-4 xl:grid-cols-2"><SectionCard title="Observed AI response" description="Mock response captured for this monitored query."><p className="text-sm leading-7 text-muted-foreground">{query.response}</p></SectionCard><SectionCard title="Competitive context"><div className="space-y-4"><div><p className="text-xs font-semibold uppercase text-muted-foreground">Competitors mentioned</p><div className="mt-2 flex flex-wrap gap-2">{query.competitors.map((item) => <StatusBadge key={item} value={item} />)}</div></div><div><p className="text-xs font-semibold uppercase text-muted-foreground">Cited sources</p><ul className="mt-2 space-y-2 text-sm">{query.citations.map((citation) => <li key={citation.source} className="flex items-center justify-between border-b border-border pb-2 last:border-0"><span>{citation.source}</span><StatusBadge value={citation.sterling ? "Yes" : "No"} /></li>)}</ul></div></div></SectionCard></div>
    <div className="grid gap-4 xl:grid-cols-2">
      <SectionCard title="What to do next"><ActionList items={[
        query.sterlingMentioned ? `Keep ${query.resort} content fresh so the recommendation holds through seasonal answer refreshes.` : `Add a concise, factual answer block for “${query.query}” on the ${query.resort} page.`,
        "Publish supporting destination content with comparison tables and pricing bands.",
        "Add FAQ, hotel and review schema to make the answer machine-readable.",
        `Improve presence on ${query.citations[0]?.source ?? "cited third-party sources"} so the engine has a citable source.`,
      ]} /><div className="mt-4 flex flex-wrap gap-2"><Button asChild size="sm"><Link to="/resorts/$resortId" params={{ resortId: query.resortId }}>Open resort</Link></Button><Button asChild size="sm" variant="outline"><Link to="/recommendations">Open recommendations</Link></Button><Button asChild size="sm" variant="outline"><Link to="/geo/citation-gap">Review citation gaps</Link></Button></div></SectionCard>
      <SectionCard title={`Other monitored queries for ${query.resort}`}>{related.length ? <ul className="divide-y divide-border">{related.map((q) => <li key={q.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"><Link to="/geo/ai-queries/$queryId" params={{ queryId: q.id }} className="text-sm font-medium hover:text-primary hover:underline">{q.query}</Link><StatusBadge value={q.visibility} /></li>)}</ul> : <EmptyState title="No related queries" description="This resort has a single monitored prompt." />}</SectionCard>
    </div></>;
}

export function GeoAiMentionsPage() {
  const scoped = useResortFilter(aiQueries);
  const rows = scoped.filter((r) => r.sterlingMentioned);
  const [selected, setSelected] = useState<AiQuery | null>(null);
  const counts = ["ChatGPT", "Google AI", "Gemini", "Perplexity", "Copilot"].map((platform) => ({ platform, mentions: rows.filter((r) => r.platform === platform).length }));
  return <><Breadcrumbs items={pageCrumb("GEO", "AI Mentions")} /><PageHeader eyebrow="Generative layer" title="AI Mentions" subtitle="Where Sterling appears in monitored AI answers, by platform and resort." /><div className="grid gap-4 sm:grid-cols-3"><StatCard label="Total mentions" value={rows.length} tone="geo" /><StatCard label="Mention rate" value={`${Math.round((rows.length / Math.max(1, scoped.length)) * 100)}%`} tone="geo" /><StatCard label="Platforms monitored" value={5} tone="brand" /></div><SectionCard title="Mentions by AI platform"><SimpleBarChart data={counts} xKey="platform" barKey="mentions" colors={["var(--geo)"]} /></SectionCard><SectionCard title="Mention records" description="Select a mention to see how Sterling was described and how to defend it."><DataTable rows={rows} columns={[{ key: "query", header: "Query", sortValue: (r) => r.query, render: (r) => <Link to="/geo/ai-queries/$queryId" params={{ queryId: r.id }} onClick={(e) => e.stopPropagation()} className="font-medium hover:text-primary hover:underline">{r.query}</Link> }, { key: "platform", header: "Platform", sortValue: (r) => r.platform, render: (r) => r.platform }, { key: "resort", header: "Resort", sortValue: (r) => r.resort, render: (r) => r.resort }, { key: "position", header: "Recommendation", align: "right", sortValue: (r) => r.recommendationPosition ?? 99, render: (r) => r.recommendationPosition ? `#${r.recommendationPosition}` : "—" }]} getRowKey={(r) => r.id} onRowClick={setSelected} /></SectionCard>
    <DetailSheet open={!!selected} onClose={() => setSelected(null)} title={selected?.query ?? ""} subtitle={selected ? `${selected.platform} · recommended ${selected.recommendationPosition ? `#${selected.recommendationPosition}` : "without a position"}` : undefined}>
      {selected ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2"><StatCard label="Citation position" value={selected.sterlingCitationPosition ? `#${selected.sterlingCitationPosition}` : "Not cited"} tone="geo" /><StatCard label="Opportunity" value={selected.opportunity} tone="brand" /></div>
          <div><h3 className="text-sm font-semibold">How Sterling was described</h3><p className="mt-1.5 text-sm leading-7 text-muted-foreground">{selected.response}</p></div>
          <ActionList items={[
            selected.sterlingCitationPosition ? "Keep the cited page updated monthly so the citation is not replaced." : "Add a citable source page (facts, pricing bands, FAQs) for this answer.",
            "Add fresh guest reviews and photos to reinforce the recommendation.",
            "Track whether competitors overtake this position week over week.",
          ]} />
          <div className="flex flex-wrap gap-2"><Button asChild size="sm"><Link to="/geo/ai-queries/$queryId" params={{ queryId: selected.id }}>Open full query analysis</Link></Button><Button asChild size="sm" variant="outline"><Link to="/resorts/$resortId" params={{ resortId: selected.resortId }}>Open resort</Link></Button></div>
        </>
      ) : null}
    </DetailSheet></>;
}

export function GeoCitationGapPage() {
  const rows = useResortFilter(citationGaps);
  const [search, setSearch] = useState("");
  const [opportunity, setOpportunity] = useState("all");
  const [selected, setSelected] = useState<CitationGap | null>(null);
  const filtered = rows.filter((r) => (!search || `${r.topic} ${r.competitor}`.toLowerCase().includes(search.toLowerCase())) && (opportunity === "all" || r.opportunity === opportunity));
  const columns: Column<CitationGap>[] = [
    { key: "topic", header: "Topic", sortValue: (r) => r.topic, render: (r) => <Link to="/geo/citation-gap/$gapId" params={{ gapId: r.id }} onClick={(e) => e.stopPropagation()} className="font-medium hover:text-primary hover:underline">{r.topic}</Link> },
    { key: "competitor", header: "Cited competitor", sortValue: (r) => r.competitor, render: (r) => r.competitor },
    { key: "source", header: "Source", sortValue: (r) => r.source, render: (r) => r.source },
    { key: "sterlingCited", header: "Sterling cited", align: "center", sortValue: (r) => r.sterlingCited ? 1 : 0, render: (r) => <StatusBadge value={r.sterlingCited ? "Yes" : "No"} /> },
    { key: "opportunity", header: "Opportunity", align: "center", sortValue: (r) => r.opportunity, render: (r) => <StatusBadge value={r.opportunity} /> },
  ];
  return <><Breadcrumbs items={pageCrumb("GEO", "Citation Gap")} /><PageHeader eyebrow="Generative layer" title="Citation Gap" subtitle="Find the topics where competitors are cited and Sterling content is not." /><div className="grid gap-4 sm:grid-cols-3"><StatCard label="Citation gaps" value={rows.filter((r) => !r.sterlingCited).length} tone="geo" /><StatCard label="High opportunity" value={rows.filter((r) => r.opportunity === "High" || r.opportunity === "Very High").length} tone="brand" /><StatCard label="Citation share" value={`${platformStats.citationShare}%`} tone="geo" /></div><ListToolbar search={search} setSearch={setSearch} placeholder="Search topics or competitors"><FilterSelect value={opportunity} onChange={setOpportunity} options={["Very High", "High", "Medium", "Low"]} placeholder="Opportunity" /></ListToolbar><SectionCard title={`${filtered.length} citation records`} description="Select a topic to see why the competitor wins the citation."><DataTable rows={filtered} columns={columns} getRowKey={(r) => r.id} onRowClick={setSelected} initialSort={{ key: "opportunity", dir: "desc" }} /></SectionCard>
    <DetailSheet open={!!selected} onClose={() => setSelected(null)} title={selected?.topic ?? ""} subtitle={selected ? `${selected.competitor} cited via ${selected.source}` : undefined}>
      {selected ? (
        <>
          <div className="flex flex-wrap gap-2"><StatusBadge value={selected.opportunity} /><StatusBadge value={selected.sterlingCited ? "Sterling cited" : "Sterling not cited"} /></div>
          <div><h3 className="text-sm font-semibold">Why the competitor is cited</h3><p className="mt-1.5 text-sm leading-7 text-muted-foreground">{selected.whyCompetitorCited}</p></div>
          <div><h3 className="text-sm font-semibold">Sterling gap</h3><p className="mt-1.5 text-sm leading-7 text-muted-foreground">{selected.sterlingGap}</p></div>
          <ActionList items={[selected.action, "Add structured comparison tables and FAQ schema to the new content.", "Update the third-party listing that this answer cites.", "Recheck the citation after the next monitoring cycle."]} />
          <div className="flex flex-wrap gap-2"><Button asChild size="sm"><Link to="/geo/citation-gap/$gapId" params={{ gapId: selected.id }}>Open full gap analysis</Link></Button><Button asChild size="sm" variant="outline"><Link to="/resorts/$resortId" params={{ resortId: selected.resortId }}>Open resort</Link></Button></div>
        </>
      ) : null}
    </DetailSheet></>;
}

export function GeoCitationGapDetailPage({ gapId }: { gapId: string }) {
  const gap = getCitationGap(gapId);
  if (!gap) return <EmptyState title="Citation gap not found" />;
  const related = citationGaps.filter((c) => c.resortId === gap.resortId && c.id !== gap.id);
  return <><Breadcrumbs items={[{ label: "Overview", to: "/" }, { label: "GEO", to: "/geo" }, { label: "Citation Gap", to: "/geo/citation-gap" }, { label: gap.topic }]} /><PageHeader eyebrow="Citation gap detail" title={gap.topic} subtitle={`${gap.competitor} · ${gap.source}`} actions={<StatusBadge value={gap.opportunity} />} /><div className="grid gap-4 xl:grid-cols-2"><SectionCard title="Why the competitor is cited"><p className="text-sm leading-7 text-muted-foreground">{gap.whyCompetitorCited}</p></SectionCard><SectionCard title="Sterling gap"><p className="text-sm leading-7 text-muted-foreground">{gap.sterlingGap}</p></SectionCard></div><SectionCard title="Observed AI response"><p className="text-sm leading-7 text-muted-foreground">{gap.aiResponse}</p></SectionCard>
    <div className="grid gap-4 xl:grid-cols-2">
      <SectionCard title="Recommended action plan"><ActionList items={[gap.action, "Add comparison tables, pricing bands and FAQ schema to the new content.", `Refresh the ${gap.source} listing so facts match the Sterling website.`, "Re-run the monitored prompt after two weeks and log the outcome in Reports."]} /><div className="mt-4 flex flex-wrap gap-2"><Button asChild size="sm"><Link to="/resorts/$resortId" params={{ resortId: gap.resortId }}>Open resort</Link></Button><Button asChild size="sm" variant="outline"><Link to="/recommendations">Open recommendations</Link></Button></div></SectionCard>
      <SectionCard title="Other citation gaps for this resort">{related.length ? <ul className="divide-y divide-border">{related.map((c) => <li key={c.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"><Link to="/geo/citation-gap/$gapId" params={{ gapId: c.id }} className="text-sm font-medium hover:text-primary hover:underline">{c.topic}</Link><StatusBadge value={c.opportunity} /></li>)}</ul> : <EmptyState title="No other gaps" description="This resort has no further citation gaps in the dataset." />}</SectionCard>
    </div></>;
}

function AuthorityTable({ title, subtitle, field }: { title: string; subtitle: string; field: "entityAuthority" | "contentAuthority" }) {
  const { isAll, resortId } = useApp();
  const rows = isAll ? resorts : resorts.filter((r) => r.id === resortId);
  const [selected, setSelected] = useState<Resort | null>(null);
  const isEntity = field === "entityAuthority";
  return <><Breadcrumbs items={pageCrumb("GEO", title)} /><PageHeader eyebrow="Generative layer" title={title} subtitle={subtitle} /><div className="grid gap-4 sm:grid-cols-3"><StatCard label="Portfolio average" value={Math.round(rows.reduce((s, r) => s + r[field], 0) / Math.max(1, rows.length))} suffix="/100" tone="geo" /><StatCard label="Strong resorts" value={rows.filter((r) => r[field] >= 75).length} tone="geo" /><StatCard label="Needs investment" value={rows.filter((r) => r[field] < 60).length} tone="brand" /></div><SectionCard title="Resort authority scores" description="Select a resort to see what is holding the score back."><div className="space-y-5">{[...rows].sort((a, b) => a[field] - b[field]).map((r) => <button type="button" key={r.id} onClick={() => setSelected(r)} className="w-full rounded-lg p-1 text-left transition-colors hover:bg-muted/60"><div className="mb-1 flex items-center justify-between text-sm"><span className="font-medium">{r.name}</span><span className="font-semibold tabular-nums">{r[field]}</span></div><MetricBar label="" value={r[field]} /></button>)}</div></SectionCard>
    <DetailSheet open={!!selected} onClose={() => setSelected(null)} title={selected ? `${selected.name} · ${title}` : ""} subtitle={selected ? `${selected.city}, ${selected.state} · ${selected.status}` : undefined}>
      {selected ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3"><StatCard label={title} value={selected[field]} suffix="/100" tone="geo" /><StatCard label="GEO score" value={selected.geo} suffix="/100" tone="geo" /><StatCard label="AI mentions" value={selected.aiMentions} tone="brand" /></div>
          <div className="space-y-4"><MetricBar label="Entity authority" value={selected.entityAuthority} /><MetricBar label="Content authority" value={selected.contentAuthority} /><MetricBar label="FAQ coverage" value={selected.faqCoverage} /></div>
          <ActionList items={isEntity ? [
            "Publish complete, consistent name, address, contact and amenity data on the resort page.",
            "Add hotel, organisation and geo schema so the property is machine-identifiable.",
            "Align listings across Google Business Profile, Tripadvisor and MakeMyTrip.",
            `Reduce the ${selected.geoGaps} open GEO gaps recorded for this resort.`,
          ] : [
            "Publish destination guides, itineraries and seasonal content around the resort.",
            "Add comparison tables, pricing bands and detailed facility descriptions.",
            "Expand FAQ coverage beyond the current level so answers are extractable.",
            "Refresh top pages quarterly to keep the content citable.",
          ]} />
          <div className="flex flex-wrap gap-2"><Button asChild size="sm"><Link to="/resorts/$resortId" params={{ resortId: selected.id }}>Open resort</Link></Button><Button asChild size="sm" variant="outline"><Link to="/geo/citation-gap">Review citation gaps</Link></Button></div>
        </>
      ) : null}
    </DetailSheet></>;
}
export function GeoEntityAuthorityPage() { return <AuthorityTable title="Entity Authority" subtitle="How clearly AI systems recognise Sterling resorts as authoritative entities." field="entityAuthority" />; }
export function GeoContentAuthorityPage() { return <AuthorityTable title="Content Authority" subtitle="How much useful, trustworthy and citable destination content Sterling provides." field="contentAuthority" />; }

export function RecommendationsPage() {
  const rows = useResortFilter(recommendations);
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("all");
  const filtered = rows.filter((r) => (!search || `${r.title} ${r.resort}`.toLowerCase().includes(search.toLowerCase())) && (priority === "all" || r.priority === priority));
  const columns: Column<Recommendation>[] = [
    { key: "title", header: "Recommendation", sortValue: (r) => r.title, render: (r) => <div><Link to="/recommendations/$recommendationId" params={{ recommendationId: r.id }} className="font-medium hover:text-primary hover:underline">{r.title}</Link><p className="text-xs text-muted-foreground">{r.resort} · {r.category}</p></div> },
    { key: "priority", header: "Priority", align: "center", sortValue: (r) => r.priority, render: (r) => <PriorityBadge value={r.priority} /> },
    { key: "estimatedImpact", header: "Estimated impact", sortValue: (r) => r.estimatedImpact, render: (r) => r.estimatedImpact },
    { key: "status", header: "Status", align: "center", sortValue: (r) => r.status, render: (r) => <StatusBadge value={r.status} /> },
  ];
  return <><Breadcrumbs items={[{ label: "Overview", to: "/" }, { label: "Recommendations" }]} /><PageHeader eyebrow="Unified action layer" title="Recommendations" subtitle="Cross-layer actions that connect search demand, answer gaps and AI visibility." /><div className="grid gap-4 sm:grid-cols-3"><StatCard label="Recommendations" value={rows.length} tone="brand" /><StatCard label="P1 actions" value={rows.filter((r) => r.priority === "P1").length} tone="brand" /><StatCard label="In progress" value={rows.filter((r) => r.status === "In Progress").length} tone="brand" /></div><ListToolbar search={search} setSearch={setSearch} placeholder="Search recommendations"><FilterSelect value={priority} onChange={setPriority} options={["P1", "P2", "P3"]} placeholder="Priority" /></ListToolbar><SectionCard title={`${filtered.length} unified recommendations`}><DataTable rows={filtered} columns={columns} getRowKey={(r) => r.id} initialSort={{ key: "priority", dir: "asc" }} /></SectionCard></>;
}

export function RecommendationDetailPage({ recommendationId }: { recommendationId: string }) {
  const recommendation = getRecommendation(recommendationId);
  if (!recommendation) return <EmptyState title="Recommendation not found" />;
  return <><Breadcrumbs items={[{ label: "Overview", to: "/" }, { label: "Recommendations", to: "/recommendations" }, { label: recommendation.title }]} /><PageHeader eyebrow="Recommendation detail" title={recommendation.title} subtitle={`${recommendation.resort} · ${recommendation.category}`} actions={<><PriorityBadge value={recommendation.priority} /><StatusBadge value={recommendation.status} /></>} /><div className="grid gap-4 sm:grid-cols-3"><StatCard label="SEO impact" value={recommendation.seoImpact} tone="seo" /><StatCard label="AEO impact" value={recommendation.aeoImpact} tone="aeo" /><StatCard label="GEO impact" value={recommendation.geoImpact} tone="geo" /></div><div className="grid gap-4 xl:grid-cols-2"><SectionCard title="Why this matters"><p className="text-sm leading-7 text-muted-foreground">{recommendation.reason}</p><p className="mt-4 rounded-lg bg-muted p-4 text-sm font-medium">Expected outcome: {recommendation.estimatedImpact}</p></SectionCard><SectionCard title="Evidence"><div className="grid gap-3 sm:grid-cols-2">{recommendation.evidence.map((item) => <div key={item.label} className="rounded-lg border border-border p-3"><p className="text-xs text-muted-foreground">{item.label}</p><p className="mt-1 text-lg font-semibold">{item.value}</p></div>)}</div></SectionCard></div><SectionCard title="Recommended actions"><ol className="space-y-3">{recommendation.actions.map((action, i) => <li key={action} className="flex items-center gap-3 text-sm"><span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{i + 1}</span>{action}</li>)}</ol></SectionCard></>;
}

export function ReportsPage() {
  const rows = reports;
  const columns: Column<Report>[] = [
    { key: "title", header: "Report", sortValue: (r) => r.title, render: (r) => <div><Link to="/reports/$reportId" params={{ reportId: r.id }} className="font-medium hover:text-primary hover:underline">{r.title}</Link><p className="text-xs text-muted-foreground">{r.type}</p></div> },
    { key: "date", header: "Generated", sortValue: (r) => r.date, render: (r) => r.date },
    { key: "resortsCovered", header: "Resorts", align: "right", sortValue: (r) => r.resortsCovered, render: (r) => r.resortsCovered },
    { key: "score", header: "Score", align: "center", sortValue: (r) => r.score, render: (r) => <ScoreBadge value={r.score} /> },
    { key: "open", header: "", align: "right", render: (r) => <Button asChild variant="ghost" size="sm"><Link to="/reports/$reportId" params={{ reportId: r.id }}>Open</Link></Button> },
  ];
  return <><Breadcrumbs items={[{ label: "Overview", to: "/" }, { label: "Reports" }]} /><PageHeader eyebrow="Reporting" title="Reports" subtitle="Executive-ready views of Sterling search, answer and AI visibility performance." actions={<Button variant="outline" size="sm">Export report</Button>} /><div className="grid gap-4 sm:grid-cols-3"><StatCard label="Reports available" value={rows.length} tone="brand" /><StatCard label="Latest overall score" value={74} suffix="/100" tone="brand" /><StatCard label="Reporting period" value="12 weeks" tone="brand" /></div><SectionCard title="Saved reports" description="Open a report for findings, summary and follow-up priorities."><DataTable rows={rows} columns={columns} getRowKey={(r) => r.id} initialSort={{ key: "date", dir: "desc" }} /></SectionCard></>;
}

export function ReportDetailPage({ reportId }: { reportId: string }) {
  const report = getReport(reportId);
  if (!report) return <EmptyState title="Report not found" />;
  return <><Breadcrumbs items={[{ label: "Overview", to: "/" }, { label: "Reports", to: "/reports" }, { label: report.title }]} /><PageHeader eyebrow={`${report.type} report`} title={report.title} subtitle={`Generated ${report.date} · ${report.resortsCovered} resorts covered`} actions={<Button variant="outline" size="sm">Export report</Button>} /><div className="grid gap-4 sm:grid-cols-3"><StatCard label="Report score" value={report.score} suffix="/100" tone="brand" /><StatCard label="Resorts covered" value={report.resortsCovered} tone="brand" /><StatCard label="Open findings" value={report.findings.length} tone="brand" /></div><SectionCard title="Executive summary"><p className="max-w-4xl text-sm leading-7 text-muted-foreground">{report.summary}</p></SectionCard><SectionCard title="Key findings"><ul className="space-y-3">{report.findings.map((finding) => <li key={finding} className="flex gap-3 text-sm"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />{finding}</li>)}</ul></SectionCard></>;
}

export function ActivityPage() {
  return <><Breadcrumbs items={[{ label: "Overview", to: "/" }, { label: "Optimization Activity" }]} /><PageHeader eyebrow="Operations" title="Optimization Activity" subtitle="Recent monitoring events, detected gaps and recommendation changes." /><div className="grid gap-4 sm:grid-cols-3"><StatCard label="Events this period" value={activity.length} tone="brand" /><StatCard label="SEO events" value={activity.filter((a) => a.type === "SEO").length} tone="seo" /><StatCard label="AI visibility events" value={activity.filter((a) => a.type === "GEO").length} tone="geo" /></div><SectionCard title="Recent activity"><div className="divide-y divide-border">{activity.map((item) => <div key={item.id} className="flex flex-wrap items-start justify-between gap-3 py-4 first:pt-0 last:pb-0"><div className="flex items-start gap-3"><LayerPill layer={item.type === "Recommendation" ? "SEO" : item.type as "SEO" | "AEO" | "GEO"} /><p className="text-sm">{item.text}</p></div><span className="text-xs text-muted-foreground">{item.time}</span></div>)}</div></SectionCard></>;
}

export function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  return <><Breadcrumbs items={[{ label: "Overview", to: "/" }, { label: "Settings" }]} /><PageHeader eyebrow="Workspace" title="Settings" subtitle="Configure how this Sterling demo workspace presents monitoring updates." /><SectionCard title="Workspace preferences" description="These controls are local to the demo environment."><div className="divide-y divide-border"><div className="flex items-center justify-between gap-4 py-4 first:pt-0"><div><p className="text-sm font-medium">Monitoring notifications</p><p className="mt-1 text-sm text-muted-foreground">Show alerts when significant SEO, AEO or GEO changes are detected.</p></div><Switch checked={notifications} onCheckedChange={setNotifications} /></div><div className="flex items-center justify-between gap-4 py-4 last:pb-0"><div><p className="text-sm font-medium">Weekly executive digest</p><p className="mt-1 text-sm text-muted-foreground">Include the latest portfolio score and open opportunities in the digest.</p></div><Switch checked={weeklyDigest} onCheckedChange={setWeeklyDigest} /></div></div></SectionCard><SectionCard title="Demo data"><div className="grid gap-4 sm:grid-cols-3"><div><p className="text-xs text-muted-foreground">Data source</p><p className="mt-1 font-medium">Mock data only</p></div><div><p className="text-xs text-muted-foreground">Resorts monitored</p><p className="mt-1 font-medium">{resorts.length}</p></div><div><p className="text-xs text-muted-foreground">Last refresh</p><p className="mt-1 font-medium">Today, 09:00</p></div></div></SectionCard></>;
}

export function PageDetailPage({ pageId }: { pageId: string }) {
  const page = getPage(pageId);
  const resort = page ? resorts.find((r) => r.id === page.resortId) : undefined;
  if (!page || !resort) return <EmptyState title="Page analysis not found" />;
  return <><Breadcrumbs items={[{ label: "Overview", to: "/" }, { label: "Resorts", to: "/resorts" }, { label: resort.shortName, to: "/resorts/$resortId", params: { resortId: resort.id } }, { label: page.name }]} /><PageHeader eyebrow="Page analysis" title={page.name} subtitle={`${resort.name} · ${page.path}`} actions={<StatusBadge value={page.issues ? "Needs Attention" : "Optimized"} />} /><div className="grid gap-4 sm:grid-cols-4"><StatCard label="Overall" value={page.overall} suffix="/100" tone="brand" /><StatCard label="SEO" value={page.seo} suffix="/100" tone="seo" /><StatCard label="AEO" value={page.aeo} suffix="/100" tone="aeo" /><StatCard label="GEO" value={page.geo} suffix="/100" tone="geo" /></div><div className="grid gap-4 xl:grid-cols-2"><SectionCard title="Layer health"><div className="space-y-5"><MetricBar label="SEO health" value={page.seo} /><MetricBar label="Answer readiness" value={page.aeo} /><MetricBar label="AI visibility" value={page.geo} /><MetricBar label="Structured answer score" value={page.structuredAnswerScore} /></div></SectionCard><SectionCard title="Open page issues"><div className="flex items-center gap-4"><span className="text-5xl font-bold tabular-nums">{page.issues}</span><div><p className="font-medium">Issues detected</p><p className="mt-1 text-sm text-muted-foreground">Review the page against the shared resort template and resolve the highest-impact findings first.</p></div></div></SectionCard></div><SectionCard title="Page URL"><a href={page.path} target="_blank" rel="noreferrer" className="break-all text-sm text-primary hover:underline">{page.path}</a></SectionCard></>;
}