"use client";

import { OrganInsight } from "@/lib/api";

interface Props {
  insight: OrganInsight | null;
  loading: boolean;
}

export default function ClinicalAI({ insight, loading }: Props) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
        Loading AI Summary...
      </div>
    );
  }

  if (!insight) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
        <h2 className="text-lg font-semibold">
          🤖 AI Clinical Summary
        </h2>

        <p className="mt-4 text-slate-400">
          Select an organ to view AI insights.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">

      <h2 className="mb-4 text-lg font-semibold">
        🤖 AI Clinical Summary
      </h2>

      <p className="text-slate-300">
        {insight.ai_summary}
      </p>

      <div className="mt-5">

        <p className="font-medium">
          Suggested Follow-up
        </p>

        <p className="text-slate-400">
          {insight.suggested_followup}
        </p>

      </div>

      <div className="mt-5">

        <p className="font-medium">
          Confidence
        </p>

        <p className="text-cyan-400">
          {insight.confidence}%
        </p>

      </div>

    </div>
  );
}