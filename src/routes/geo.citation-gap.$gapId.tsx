import { createFileRoute, notFound } from "@tanstack/react-router";
import { GeoCitationGapDetailPage } from "@/components/platform/missing-pages";
import { getCitationGap } from "@/data/content";

export const Route = createFileRoute("/geo/citation-gap/$gapId")({
  loader: ({ params }) => {
    const gap = getCitationGap(params.gapId);
    if (!gap) throw notFound();
    return { gapId: gap.id };
  },
  head: ({ loaderData }) => {
    const gap = loaderData ? getCitationGap(loaderData.gapId) : undefined;
    const title = gap ? `${gap.topic} | Sterling Search Intelligence` : "Citation gap not found | Sterling Search Intelligence";
    const description = gap
      ? `Citation gap detail for ${gap.topic} where ${gap.competitor} is cited ahead of Sterling.`
      : "This citation gap could not be found.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: function GeoCitationGapRoute() {
    const { gapId } = Route.useParams();
    return <GeoCitationGapDetailPage gapId={gapId} />;
  },
});
