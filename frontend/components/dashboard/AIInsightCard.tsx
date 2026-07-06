"use client";

interface Props {
  loading?: boolean;
}

export default function AIInsightCard({ loading }: Props) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
        <div className="h-6 w-40 animate-pulse rounded bg-slate-700" />
        <div className="mt-6 h-4 w-full animate-pulse rounded bg-slate-700" />
        <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-slate-700" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">

      <div className="flex items-center justify-between">

        <h2 className="text-lg font-semibold text-white">
          🤖 AI Health Summary
        </h2>

        <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-xs text-cyan-400">
          AI
        </span>

      </div>

      <div className="mt-6">

        <div className="mb-5 flex items-center justify-between">

          <span className="text-slate-400">
            Overall Health Score
          </span>

          <span className="text-3xl font-bold text-green-400">
            86%
          </span>

        </div>

        <div className="rounded-xl bg-slate-800/40 p-4">

          <p className="text-sm text-slate-300">

            ✔ Heart condition stable

          </p>

          <p className="mt-2 text-sm text-slate-300">

            ✔ Kidney function normal

          </p>

          <p className="mt-2 text-sm text-slate-300">

            ✔ Continue current medication

          </p>

          <p className="mt-2 text-sm text-slate-300">

            ✔ Next follow-up after 30 days

          </p>

        </div>

      </div>

    </div>
  );
}