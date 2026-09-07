import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageDetailPage } from "@/components/platform/missing-pages";
import { getPage } from "@/data/content";

export const Route = createFileRoute("/pages/$pageId")({
  loader: ({ params }) => {
    const page = getPage(params.pageId);
    if (!page) throw notFound();
    return { pageId: page.id };
  },
  head: ({ loaderData }) => {
    const page = loaderData ? getPage(loaderData.pageId) : undefined;
    const title = page ? `${page.name} | Sterling Search Intelligence` : "Page analysis not found | Sterling Search Intelligence";
    const description = page ? `Page-level SEO, AEO and GEO analysis for ${page.name}.` : "This page analysis could not be found.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: function PageRoute() {
    const { pageId } = Route.useParams();
    return <PageDetailPage pageId={pageId} />;
  },
});
