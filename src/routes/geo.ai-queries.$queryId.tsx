import { createFileRoute, notFound } from "@tanstack/react-router";
import { GeoAiQueryDetailPage } from "@/components/platform/missing-pages";
import { getAiQuery } from "@/data/content";

export const Route = createFileRoute("/geo/ai-queries/$queryId")({
  loader: ({ params }) => {
    const query = getAiQuery(params.queryId);
    if (!query) throw notFound();
    return { queryId: query.id };
  },
  head: ({ loaderData }) => {
    const query = loaderData ? getAiQuery(loaderData.queryId) : undefined;
    const title = query ? `${query.query} | Sterling Search Intelligence` : "AI query not found | Sterling Search Intelligence";
    const description = query
      ? `AI visibility analysis for "${query.query}" and Sterling ${query.resort}.`
      : "This AI query could not be found.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: function GeoAiQueryRoute() {
    const { queryId } = Route.useParams();
    return <GeoAiQueryDetailPage queryId={queryId} />;
  },
});
