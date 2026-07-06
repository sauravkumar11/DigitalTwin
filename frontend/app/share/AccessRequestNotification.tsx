"use client";

interface Request {
  id: string;
  hospital: string;
  doctor: string;
  department: string;
  reason: string;
  requestedAt: string;
}

interface Props {
  requests: Request[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export default function AccessRequestNotification({
  requests,
  onApprove,
  onReject,
}: Props) {

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">

      <div className="flex items-center justify-between mb-6">

        <h2 className="text-xl font-bold text-white">

          🔔 Access Requests

        </h2>

        <span className="rounded-full bg-cyan-500 px-3 py-1 text-sm font-semibold text-slate-900">

          {requests.length}

        </span>

      </div>

      {requests.length === 0 && (

        <div className="rounded-xl bg-slate-800 p-8 text-center text-slate-400">

          No pending requests

        </div>

      )}

      {requests.map((r) => (

        <div
          key={r.id}
          className="mb-5 rounded-2xl border border-slate-700 bg-slate-800 p-5"
        >

          <div className="flex items-center justify-between">

            <div>

              <h3 className="font-semibold text-white">

                {r.hospital}

              </h3>

              <p className="text-sm text-slate-400">

                {r.doctor}

              </p>

            </div>

            <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-xs text-cyan-300">

              {r.department}

            </span>

          </div>

          <div className="mt-4">

            <p className="text-sm text-slate-300">

              {r.reason}

            </p>

          </div>

          <div className="mt-5 flex gap-3">

            <button
              onClick={() => onReject(r.id)}
              className="flex-1 rounded-xl border border-red-500 py-3 text-red-400"
            >
              Reject
            </button>

            <button
              onClick={() => onApprove(r.id)}
              className="flex-1 rounded-xl bg-cyan-500 py-3 font-semibold text-slate-900"
            >
              Approve
            </button>

          </div>

        </div>

      ))}

    </div>
  );
}