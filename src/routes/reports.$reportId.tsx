import { createFileRoute, notFound } from "@tanstack/react-router";
import { ReportDetailPage } from "@/components/platform/missing-pages";
import { getReport } from "@/data/content";

export const Route = createFileRoute("/reports/$reportId")({
  loader: ({ params }) => {
    const report = getReport(params.reportId);
    if (!report) throw notFound();
    return { reportId: report.id };
  },
  head: ({ loaderData }) => {
    const report = loaderData ? getReport(loaderData.reportId) : undefined;
    const title = report ? `${report.title} | Sterling Search Intelligence` : "Report not found | Sterling Search Intelligence";
    const description = report ? `Report detail for ${report.title} covering ${report.resortsCovered} resorts.` : "This report could not be found.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: function ReportRoute() {
    const { reportId } = Route.useParams();
    return <ReportDetailPage reportId={reportId} />;
  },
});
