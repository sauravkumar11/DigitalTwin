"use client";

interface Props {
  patientId: string;
}

export default function DoctorSummary({ patientId }: Props) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-5">

          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500 text-2xl font-bold">

            P

          </div>

          <div>

            <h2 className="text-2xl font-bold">

              Patient #{patientId}

            </h2>

            <p className="text-slate-400">

              Digital Health Record

            </p>

          </div>

        </div>

        <div className="text-right">

          <div className="rounded-full bg-green-500/20 px-4 py-1 text-green-400">

            Stable

          </div>

          <p className="mt-3 text-sm text-slate-400">

            Health Score

          </p>

          <h2 className="text-3xl font-bold text-green-400">

            86%

          </h2>

        </div>

      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-5">

        <Info title="Age" value="24" />

        <Info title="Gender" value="Male" />

        <Info title="Blood" value="O+" />

        <Info title="Risk" value="Moderate" />

        <Info title="Visit" value="Today" />

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

      <p className="mt-2 font-semibold">

        {value}

      </p>

    </div>
  );
}