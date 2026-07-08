"use client";

import type { OrganInsight } from "@/lib/api";
import { ORGAN_LABELS, type OrganKey } from "@/lib/organMeshMap";

interface Props {
  /** Currently selected organ id, or null when nothing is selected. */
  selected?: string | null;
  /** Fetched insight for the selected organ, or null while none is selected/loaded. */
  insight?: OrganInsight | null;
  loading?: boolean;
}

const RISK_STYLE: Record<string, string> = {
  healthy: "text-emerald-400",
  monitor: "text-amber-400",
  critical: "text-red-400",
};

export default function AIInsightCard({ selected, insight, loading }: Props) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
        <div className="h-6 w-40 animate-pulse rounded bg-slate-700" />
        <div className="mt-6 h-4 w-full animate-pulse rounded bg-slate-700" />
        <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-slate-700" />
      </div>
    );
  }

  // Nothing selected yet, or no data for the current selection: fall back
  // to the original generic summary card instead of showing an empty panel.
  if (!selected || !insight) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">🤖 AI Health Summary</h2>
          <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-xs text-cyan-400">AI</span>
        </div>
        <p className="mt-6 text-sm text-slate-400">
          Select an organ on the Digital Twin to see its AI-generated health insight here.
        </p>
      </div>
    );
  }

  const label = ORGAN_LABELS[selected as OrganKey] ?? selected;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">🤖 AI Health Summary — {label}</h2>
        <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-xs text-cyan-400">AI</span>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <span className="text-slate-400">Health Score</span>
        <span className={`text-3xl font-bold ${RISK_STYLE[insight.risk_level] ?? "text-cyan-400"}`}>
          {insight.health_score}
        </span>
      </div>

      <div className="mt-4 rounded-xl bg-slate-800/40 p-4">
        <p className="text-sm text-slate-300">{insight.ai_summary}</p>
      </div>

      {insight.suggested_followup && (
        <div className="mt-4">
          <p className="text-sm font-medium text-slate-200">Suggested Follow-up</p>
          <p className="mt-1 text-sm text-slate-400">{insight.suggested_followup}</p>
        </div>
      )}

      {insight.current_conditions?.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium text-slate-200">Current Conditions</p>
          <ul className="mt-1 space-y-1 text-sm text-slate-400">
            {insight.current_conditions.map((c) => (
              <li key={c}>• {c}</li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-4 text-xs text-slate-500">Confidence: {insight.confidence}%</p>
    </div>
  );
}
