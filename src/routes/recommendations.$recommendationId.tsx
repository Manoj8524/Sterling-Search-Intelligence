import { createFileRoute, notFound } from "@tanstack/react-router";
import { RecommendationDetailPage } from "@/components/platform/missing-pages";
import { getRecommendation } from "@/data/content";

export const Route = createFileRoute("/recommendations/$recommendationId")({
  loader: ({ params }) => {
    const recommendation = getRecommendation(params.recommendationId);
    if (!recommendation) throw notFound();
    return { recommendationId: recommendation.id };
  },
  head: ({ loaderData }) => {
    const recommendation = loaderData ? getRecommendation(loaderData.recommendationId) : undefined;
    const title = recommendation
      ? `${recommendation.title} | Sterling Search Intelligence`
      : "Recommendation not found | Sterling Search Intelligence";
    const description = recommendation
      ? `Recommendation detail for ${recommendation.title} — ${recommendation.resort}.`
      : "This recommendation could not be found.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: function RecommendationRoute() {
    const { recommendationId } = Route.useParams();
    return <RecommendationDetailPage recommendationId={recommendationId} />;
  },
});
