"use client";

import { useEffect, useState } from "react";
import {
  getPendingRequests,
  PendingRequest,
} from "@/lib/api";

interface Props {
  patientId: string;
}

export default function PendingRequests({ patientId }: Props) {
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    try {
      const data = await getPendingRequests(patientId);
      setRequests(data);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return null;

  if (requests.length === 0) return null;

  return (
    <div className="mt-8 rounded-3xl border border-yellow-500/30 bg-yellow-500/5 p-6">

      <div className="mb-6 flex items-center gap-3">
        <span className="text-3xl">🔔</span>

        <div>
          <h2 className="text-xl font-bold text-white">
            Pending Access Requests
          </h2>

          <p className="text-sm text-slate-400">
            Doctors requesting access to your medical records
          </p>
        </div>
      </div>

      <div className="space-y-5">

        {requests.map((r) => (

          <div
            key={r.id}
            className="rounded-2xl border border-slate-700 bg-slate-900 p-5"
          >

            <div className="flex justify-between">

              <div>

                <h3 className="text-lg font-semibold text-white">
                  {r.doctor_name}
                </h3>

                <p className="text-cyan-400">
                  {r.hospital}
                </p>

                <p className="text-sm text-slate-400">
                  {r.department}
                </p>

              </div>

              <div className="rounded-full bg-yellow-500/20 px-3 py-1 text-sm text-yellow-300">
                Pending
              </div>

            </div>

            <div className="mt-4 rounded-xl bg-slate-800 p-4">

              <p className="text-sm text-slate-400">
                Reason
              </p>

              <p className="mt-2 text-white">
                {r.reason}
              </p>

            </div>

            <p className="mt-3 text-xs text-slate-500">
              Requested at {new Date(r.requested_at).toLocaleString()}
            </p>

            <div className="mt-5 flex gap-3">

              <button
                className="flex-1 rounded-xl bg-green-500 py-3 font-semibold text-white hover:bg-green-600"
              >
                Approve
              </button>

              <button
                className="flex-1 rounded-xl bg-red-500 py-3 font-semibold text-white hover:bg-red-600"
              >
                Reject
              </button>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}