import { createFileRoute, notFound } from "@tanstack/react-router";
import { Breadcrumbs, PageHeader, ScoreRing, SectionCard, StatCard, StatusBadge, EmptyState, LooseLink } from "@/components/platform/primitives";
import { getQuestion, questions } from "@/data/content";
import { getResort } from "@/data/resorts";

export const Route = createFileRoute("/aeo/questions/$questionId")({
  loader: ({ params }) => {
    const q = getQuestion(params.questionId);
    if (!q) throw notFound();
    return { questionId: q.id };
  },
  head: ({ loaderData }) => {
    const q = loaderData ? getQuestion(loaderData.questionId) : undefined;
    const title = q ? `${q.question} | Sterling Search Intelligence` : "Question unavailable | Sterling Search Intelligence";
    const description = q
      ? `Answer coverage, answer score and missing detail for “${q.question}”.`
      : "This traveller question could not be found.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        ...(q ? [] : [{ name: "robots", content: "noindex" }]),
      ],
    };
  },
  component: QuestionDetail,
  errorComponent: () => <EmptyState variant="error" title="We could not load this question" description="Please try again." />,
  notFoundComponent: () => (
    <EmptyState variant="empty" title="Question not found" description="This traveller question is no longer tracked." />
  ),
});

function QuestionDetail() {
  const { questionId } = Route.useLoaderData();
  const q = getQuestion(questionId)!;
  const resort = getResort(q.resortId);
  const related = questions.filter((x) => x.resortId === q.resortId && x.id !== q.id).slice(0, 6);

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Overview", to: "/" },
          { label: "AEO", to: "/aeo" },
          { label: "Questions", to: "/aeo/questions" },
          { label: q.cluster },
        ]}
      />
      <PageHeader eyebrow="Answer layer" title={q.question} subtitle={`${resort?.name ?? q.resort} · ${q.cluster} · ${q.intent} intent`} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Answer score" value={q.answerScore} suffix="/100" tone="aeo" />
        <StatCard label="Coverage" value={q.coverage} tone="aeo" />
        <StatCard label="Monthly searches" value={q.volume.toLocaleString()} tone="brand" />
        <StatCard label="Opportunity" value={q.opportunity} tone="brand" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <SectionCard title="Current answer" description="What Sterling content says today." className="xl:col-span-2">
          <p className="text-sm text-muted-foreground">{q.currentAnswer}</p>
          <div className="mt-5">
            <h3 className="text-sm font-semibold">What is missing</h3>
            <ul className="mt-2 grid gap-1.5 text-sm text-muted-foreground sm:grid-cols-2">
              {q.missing.map((m) => (
                <li key={m}>• {m}</li>
              ))}
            </ul>
          </div>
          <div className="mt-5">
            <h3 className="text-sm font-semibold">Recommended answer structure</h3>
            <ol className="mt-2 space-y-1.5 text-sm text-muted-foreground">
              {q.structure.map((s, i) => (
                <li key={s}>
                  {i + 1}. {s}
                </li>
              ))}
            </ol>
          </div>
        </SectionCard>
        <SectionCard title="Answer readiness">
          <div className="flex flex-col items-center gap-4">
            <ScoreRing value={q.answerScore} label="Answer score" tone="aeo" />
            <div className="flex flex-wrap justify-center gap-2">
              <StatusBadge value={q.coverage} />
              <StatusBadge value={q.opportunity} />
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Other questions for this resort" description="Related traveller questions in the same portfolio.">
        <ul className="divide-y divide-border">
          {related.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <LooseLink to="/aeo/questions/$questionId" params={{ questionId: r.id }} className="text-sm font-medium hover:text-primary">
                {r.question}
              </LooseLink>
              <StatusBadge value={r.coverage} />
            </li>
          ))}
        </ul>
      </SectionCard>
    </>
  );
}
