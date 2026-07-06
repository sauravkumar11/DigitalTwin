"use client";

interface Props {
  timeline: any[];
}

export default function MedicalTimeline({
  timeline,
}: Props) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">

      <h2 className="mb-6 text-xl font-semibold">

        📅 Medical Timeline

      </h2>

      <div className="space-y-5">

        {timeline.length === 0 && (

          <p className="text-slate-400">

            No timeline available.

          </p>

        )}

        {timeline.map((item: any) => (

          <div
            key={item.id}
            className="rounded-xl bg-slate-800/40 p-4"
          >

            <div className="flex justify-between">

              <h3 className="font-semibold">

                {item.title}

              </h3>

              <span className="text-xs text-slate-500">

                {item.event_date}

              </span>

            </div>

            <p className="mt-2 text-sm text-slate-300">

              {item.description}

            </p>

          </div>

        ))}

      </div>

    </div>
  );
}