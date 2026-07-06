"use client";

interface Report {
  id: string;
  report_type: string;
  ai_summary: string;
  uploaded_at: string;
}

interface Props {
  reports: Report[];
}

export default function ReportsTimeline({ reports }: Props) {
  if (!reports.length) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 text-center text-slate-400">
        No reports uploaded yet.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
      <h2 className="mb-6 text-xl font-semibold text-white">
        📄 Medical Timeline
      </h2>

      <div className="space-y-6">
        {reports.map((report) => (
          <div
            key={report.id}
            className="relative rounded-xl border border-slate-800 bg-slate-800/40 p-5"
          >
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-semibold capitalize text-white">
                {report.report_type.replace("_", " ")}
              </h3>

              <span className="text-xs text-slate-400">
                {new Date(report.uploaded_at).toLocaleDateString()}
              </span>
            </div>

            <p className="text-sm text-slate-300">
              {report.ai_summary}
            </p>

            <div className="mt-4 flex gap-3">
              <button className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-600">
                View
              </button>

              <button className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">
                Download
              </button>

              <button className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">
                Share
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}