"use client";

import type { OrganInsight } from "@/lib/api";
import clsx from "clsx";

const RISK_BADGE: Record<string, string> = {
  healthy: "badge-healthy",
  monitor: "badge-monitor",
  critical: "badge-critical",
};

export default function OrganPanel({ insight, loading }: { insight: OrganInsight | null; loading: boolean }) {
  if (loading) {
    return (
      <div className="glass-card p-6 animate-pulse">
        <div className="h-5 w-40 rounded bg-white/10" />
        <div className="mt-4 h-3 w-full rounded bg-white/10" />
        <div className="mt-2 h-3 w-5/6 rounded bg-white/10" />
      </div>
    );
  }

  if (!insight) {
    return (
      <div className="glass-card p-6 text-sm text-slate-400">
        Click an organ on the digital twin to view its AI-generated health insight.
      </div>
    );
  }

  return (
    <div className="glass-card space-y-5 p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold capitalize">{insight.organ.replace("_", " ")}</h3>
        <span className={clsx("rounded-full px-3 py-1 text-xs font-medium", RISK_BADGE[insight.risk_level])}>
          {insight.risk_level.toUpperCase()}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 shrink-0">
          <svg viewBox="0 0 36 36" className="h-16 w-16 -rotate-90">
            <path
              className="stroke-white/10"
              strokeWidth="3"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="stroke-twin-accent"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              strokeDasharray={`${insight.health_score}, 100`}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold">
            {insight.health_score}
          </div>
        </div>
        <div className="text-sm text-slate-300">
          <p>Confidence: {(insight.confidence * 100).toFixed(0)}%</p>
          <p className="capitalize">Trend: {insight.trend}</p>
          <p className="text-xs text-slate-500">Updated {new Date(insight.updated_at).toLocaleString()}</p>
        </div>
      </div>

      <Section title="AI Summary" text={insight.ai_summary} />
      <Section title="Suggested Follow-up" text={insight.suggested_followup} />

      {insight.current_conditions.length > 0 && (
        <ListSection title="Current Conditions" items={insight.current_conditions} />
      )}

      {insight.past_diagnoses.length > 0 && (
        <div>
          <p className="mb-1 text-xs uppercase tracking-wide text-slate-400">Past Diagnoses</p>
          <ul className="space-y-1 text-sm">
            {insight.past_diagnoses.map((d: any) => (
              <li key={d.id} className="flex justify-between rounded-lg bg-white/5 px-3 py-1.5">
                <span>{d.name}</span>
                <span className="text-slate-400">{d.diagnosed_date}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {insight.relevant_medications.length > 0 && (
        <div>
          <p className="mb-1 text-xs uppercase tracking-wide text-slate-400">Relevant Medications</p>
          <ul className="space-y-1 text-sm">
            {insight.relevant_medications.map((m: any) => (
              <li key={m.id} className="rounded-lg bg-white/5 px-3 py-1.5">
                <span className="font-medium">{m.name}</span> — {m.dose}, {m.frequency}
              </li>
            ))}
          </ul>
        </div>
      )}

      {insight.lab_results.length > 0 && (
        <div>
          <p className="mb-1 text-xs uppercase tracking-wide text-slate-400">Lab Results</p>
          <ul className="space-y-1 text-sm">
            {insight.lab_results.map((l: any) => (
              <li
                key={l.id}
                className={clsx(
                  "flex justify-between rounded-lg px-3 py-1.5",
                  l.flagged ? "bg-twin-critical/10 text-twin-critical" : "bg-white/5"
                )}
              >
                <span>{l.test_name}</span>
                <span>
                  {l.value} {l.unit}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Section({ title, text }: { title: string; text: string }) {
  if (!text) return null;
  return (
    <div>
      <p className="mb-1 text-xs uppercase tracking-wide text-slate-400">{title}</p>
      <p className="text-sm leading-relaxed text-slate-200">{text}</p>
    </div>
  );
}

function ListSection({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="mb-1 text-xs uppercase tracking-wide text-slate-400">{title}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((i) => (
          <span key={i} className="rounded-full bg-white/10 px-2.5 py-1 text-xs">
            {i}
          </span>
        ))}
      </div>
    </div>
  );
}
