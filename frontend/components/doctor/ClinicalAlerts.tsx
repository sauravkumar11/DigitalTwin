"use client";

import { OrganOverview } from "@/lib/api";

interface Props {
  organs: OrganOverview[];
}

export default function ClinicalAlerts({ organs }: Props) {

  const healthy = organs.filter(
    o => o.risk_level === "healthy"
  ).length;

  const warning = organs.filter(
    o => o.risk_level === "monitor"
  ).length;

  const critical = organs.filter(
    o => o.risk_level === "critical"
  ).length;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">

      <h2 className="mb-5 text-lg font-semibold">
        🚨 Clinical Alerts
      </h2>

      <Alert
        color="green"
        label="Healthy"
        value={healthy}
      />

      <Alert
        color="yellow"
        label="Monitor"
        value={warning}
      />

      <Alert
        color="red"
        label="Critical"
        value={critical}
      />

    </div>
  );
}

function Alert({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: number;
}) {

  const map: any = {
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500",
  };

  return (
    <div className="mb-4 flex items-center justify-between">

      <div className="flex items-center gap-3">

        <div className={`h-3 w-3 rounded-full ${map[color]}`} />

        <span>{label}</span>

      </div>

      <span className="font-bold">
        {value}
      </span>

    </div>
  );
}