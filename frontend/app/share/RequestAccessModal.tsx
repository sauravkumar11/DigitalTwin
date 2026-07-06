"use client";

import { useState } from "react";
import { createAccessRequest } from "@/lib/api";
interface Props {
  open: boolean;
  onClose: () => void;
  patientId: string;
}

export default function RequestAccessModal({
  open,
  onClose,
  patientId,
}: Props) {

  const [phone, setPhone] = useState("");
  const [doctorName, setDoctorName] = useState("");
const [hospital, setHospital] = useState("");
const [department, setDepartment] = useState("");
const [reason, setReason] = useState("");

  if (!open) return null;

async function handleSubmit() {

  if (!hospital || !doctorName || !department || !reason) {
    alert("Please fill all fields.");
    return;
  }

  try {

    await createAccessRequest({
      patient_id: patientId,
      hospital,
      doctor_name: doctorName,
      department,
      reason,
    });

    alert("Access request sent successfully.");

    onClose();

  } catch (error: any) {

    console.error(error);

    alert(
      error?.response?.data?.detail ??
      "Unable to send request."
    );
  }

}

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md">

      <div className="w-full max-w-xl rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl">

        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-800 p-6">

          <div>

            <h2 className="text-2xl font-bold text-white">

              🏥 Request Medical Record Access

            </h2>

            <p className="mt-1 text-sm text-slate-400">

              Patient ID

              <span className="ml-2 font-mono text-cyan-400">

                {patientId}

              </span>

            </p>

          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-slate-800"
          >
            ✕
          </button>

        </div>

        {/* Form */}
{/* Form */}

<div className="space-y-5 p-6">

  <Input
    label="Hospital Name"
    value={hospital}
    onChange={setHospital}
    placeholder="Apollo Hospital"
  />

  <Input
    label="Doctor Name"
    value={doctorName}
    onChange={setDoctorName}
    placeholder="Dr. Amit Sharma"
  />

  <Input
    label="Department"
    value={department}
    onChange={setDepartment}
    placeholder="Cardiology"
  />

  <div>
    <label className="mb-2 block text-sm text-slate-300">
      Reason
    </label>

    <textarea
      value={reason}
      onChange={(e) => setReason(e.target.value)}
      placeholder="Reason for requesting access..."
      rows={4}
      className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-500"
    />
  </div>

</div>

{/* Footer */}

<div className="flex justify-end gap-4 border-t border-slate-800 p-6">

  <button
    onClick={onClose}
    className="rounded-xl border border-slate-700 px-6 py-3"
  >
    Cancel
  </button>

  <button
    onClick={handleSubmit}
    className="rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-900 hover:bg-cyan-400"
  >
    Send Request
  </button>

</div>

      </div>

    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div>

      <label className="mb-2 block text-sm text-slate-300">

        {label}

      </label>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-500"
      />

    </div>
  );
}