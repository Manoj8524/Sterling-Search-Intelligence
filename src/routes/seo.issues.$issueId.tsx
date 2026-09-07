import { createFileRoute, notFound } from "@tanstack/react-router";
import { SeoIssueDetailPage } from "@/components/platform/missing-pages";
import { getSeoIssue } from "@/data/content";

export const Route = createFileRoute("/seo/issues/$issueId")({
  loader: ({ params }) => {
    const issue = getSeoIssue(params.issueId);
    if (!issue) throw notFound();
    return { issueId: issue.id };
  },
  head: ({ loaderData }) => {
    const issue = loaderData ? getSeoIssue(loaderData.issueId) : undefined;
    const title = issue ? `${issue.issue} | Sterling Search Intelligence` : "Issue not found | Sterling Search Intelligence";
    const description = issue ? `Details and fix guidance for ${issue.issue} affecting ${issue.pages} pages.` : "This SEO issue could not be found.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: function SeoIssueRoute() {
    const { issueId } = Route.useParams();
    return <SeoIssueDetailPage issueId={issueId} />;
  },
});
