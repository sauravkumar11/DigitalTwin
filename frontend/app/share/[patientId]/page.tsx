"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  getPublicPatient,
  type PublicPatientProfile,
} from "@/lib/api";
import RequestAccessModal from "@/app/share/RequestAccessModal";

export default function SharePage() {
  const { patientId } = useParams<{ patientId: string }>();

  const [patient, setPatient] = useState<PublicPatientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [openRequest, setOpenRequest] = useState(false);

  useEffect(() => {
    getPublicPatient(patientId)
      .then(setPatient)
      .finally(() => setLoading(false));
  }, [patientId]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Loading...
      </main>
    );
  }

  if (!patient) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-red-400">
        Invalid Patient ID
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-slate-950 flex items-center justify-center p-8">

        <div className="w-full max-w-3xl rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">

          <div className="bg-gradient-to-r from-cyan-500 to-sky-600 p-8 text-white">

            <div className="flex items-center justify-between">

              <div>

                <h1 className="text-4xl font-bold">
                  🧬 TwinCare AI
                </h1>

                <p className="mt-2 text-cyan-100">
                  Verified Digital Health Identity
                </p>

              </div>

              <div className="rounded-full bg-green-500/20 px-5 py-2 text-green-300 font-semibold">
                ✔ Verified
              </div>

            </div>

          </div>

          <div className="p-8">

            <div className="mb-8 rounded-2xl bg-cyan-500/10 p-6 text-center">

              <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-cyan-500 text-4xl font-bold text-white">
                {patient.full_name.charAt(0)}
              </div>

              <h2 className="text-3xl font-bold text-white">
                {patient.full_name}
              </h2>

              <p className="mt-2 text-cyan-300">
                Verified Digital Identity
              </p>

            </div>

            <div className="grid grid-cols-2 gap-5">

              <Field title="Patient ID" value={patient.id} />
              <Field title="Age" value={`${patient.age} Years`} />
              <Field title="Gender" value={patient.sex} />
              <Field title="Blood Group" value={patient.blood_group} />
              <Field title="DOB" value={patient.date_of_birth} />
              <Field title="Weight" value={`${patient.weight} Kg`} />

            </div>

            <div className="mt-8 rounded-2xl bg-amber-500/10 p-5 border border-amber-500/20">

              <h3 className="font-semibold text-amber-300">
                🔒 Medical Records Protected
              </h3>

              <p className="mt-2 text-sm text-slate-300">
                Only the patient's digital identity is public.
                Medical records, prescriptions and reports require
                patient approval.
              </p>

            </div>

            <button
              onClick={() => setOpenRequest(true)}
              className="mt-8 w-full rounded-2xl bg-cyan-500 py-4 text-lg font-semibold text-slate-900 hover:bg-cyan-400 transition"
            >
              Request Medical Record Access
            </button>

          </div>

        </div>

      </main>

      <RequestAccessModal
        open={openRequest}
        onClose={() => setOpenRequest(false)}
        patientId={patient.id}
      />

    </>
  );
}

function Field({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-800 p-5">

      <p className="text-xs uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <p className="mt-2 text-lg font-semibold text-white">
        {value}
      </p>

    </div>
  );
}