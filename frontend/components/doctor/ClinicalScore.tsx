"use client";

import { OrganOverview } from "@/lib/api";

interface Props {
  organs: OrganOverview[];
}

export default function ClinicalScore({ organs }: Props) {

  let score = 100;

  organs.forEach((o) => {

    if (o.risk_level === "monitor") {

      score -= 10;

    }

    if (o.risk_level === "critical") {

      score -= 25;

    }

  });

  score = Math.max(score, 0);

  return (

    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">

      <h2 className="text-lg font-semibold">

        📊 Health Score

      </h2>

      <h1 className="mt-6 text-5xl font-bold text-cyan-400">

        {score}%

      </h1>

      <div className="mt-6 h-3 rounded-full bg-slate-700">

        <div

          className="h-3 rounded-full bg-cyan-500"

          style={{
            width: `${score}%`,
          }}

        />

      </div>

    </div>

  );

}