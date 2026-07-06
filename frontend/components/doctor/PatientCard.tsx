"use client";

import { PatientListItem } from "@/lib/api";
import { useRouter } from "next/navigation";

interface Props {
  patient: PatientListItem;
}

export default function PatientCard({ patient }: Props) {
  const router = useRouter();

  const risk =
    patient.alert_count >= 3
      ? "Critical"
      : patient.alert_count > 0
      ? "Monitor"
      : "Healthy";

  const riskColor =
    risk === "Critical"
      ? "bg-red-500/20 text-red-400"
      : risk === "Monitor"
      ? "bg-yellow-500/20 text-yellow-400"
      : "bg-green-500/20 text-green-400";

  return (
    <div
      onClick={() => router.push(`/doctor/${patient.id}`)}
      className="cursor-pointer rounded-3xl border border-slate-800 bg-slate-900/80 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500 hover:shadow-2xl"
    >
      <div className="flex items-center justify-between">

        <div className="flex items-center gap-4">

          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500 text-xl font-bold">
            {patient.full_name.charAt(0)}
          </div>

          <div>

            <h2 className="text-lg font-semibold text-white">
              {patient.full_name}
            </h2>

            <p className="text-sm text-slate-400">
              Digital ID
            </p>

            <p className="font-mono text-cyan-400">
              {patient.id}
            </p>

          </div>

        </div>

        <span className={`rounded-full px-4 py-2 text-xs font-semibold ${riskColor}`}>
          {risk}
        </span>

      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">

        <Info
          title="Gender"
          value={patient.sex}
        />

        <Info
          title="DOB"
          value={patient.date_of_birth || "--"}
        />

        <Info
          title="Alerts"
          value={String(patient.alert_count)}
        />

      </div>

      <div className="mt-5 flex items-center justify-between">

        <p className="text-sm text-slate-400">
          Last Report
        </p>

        <span className="text-sm text-white">
          {patient.last_report_date
            ? new Date(patient.last_report_date).toLocaleDateString()
            : "--"}
        </span>

      </div>

    </div>
  );
}

function Info({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-800/40 p-4">

      <p className="text-xs text-slate-400">
        {title}
      </p>

      <p className="mt-2 font-medium text-white">
        {value}
      </p>

    </div>
  );
}