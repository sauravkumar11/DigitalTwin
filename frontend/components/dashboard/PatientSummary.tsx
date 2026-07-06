"use client";

interface PatientSummaryProps {
  name: string;
  patientId: string;
}
import SharePatientID from "./SharePatientID";
import { useState } from "react";
import DigitalHealthCardModal from "@/app/share/DigitalHealthCard";
import SharePatientModal from "@/app/share/SharePatientModal";
export default function PatientSummary({
  name,
  patientId,
}:
 PatientSummaryProps) {
  const [shareOpen,setShareOpen]=useState(false);
  return (<>
    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl backdrop-blur">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500 text-2xl font-bold text-white">
            {name.charAt(0).toUpperCase()}
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">{name}</h2>

           <div className="mt-2 flex flex-wrap items-center gap-3">

  <div className="rounded-lg bg-slate-800 px-4 py-2 font-mono text-sm">

    <span className="text-slate-400">Digital Health ID</span>

    <br />

    <span className="font-semibold text-cyan-400">
      {patientId}
    </span>

  </div>

  <button
    onClick={() => setShareOpen(true)}
    className="rounded-lg border border-cyan-500 px-4 py-2 text-sm transition hover:bg-cyan-500/20"
  >
    📱 Share ID
  </button>

</div>


          </div>
        </div>

        <div className="text-right">
          <div className="rounded-full bg-green-500/20 px-4 py-1 text-sm font-medium text-green-400">
            Healthy
          </div>

          <p className="mt-3 text-xs text-slate-500">
            Last Updated
          </p>

          <p className="text-white">
            Today
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-4">

        <Info title="Age" value="24 yrs" />

        <Info title="Gender" value="Male" />

        <Info title="Blood Group" value="O+" />

        <Info title="BMI" value="22.4" />

      </div>
        </div>
        <div className="flex justify-center mt-6">
      
  {/* <SharePatientID
    patientId={patientId}
    name={name}
    age={24}
    gender="Male"
    dob="30 Apr 2002"
    weight="72 Kg"
    bloodGroup="O+"
  /> */}
</div> 

<DigitalHealthCardModal
    open={shareOpen}
    onClose={() => setShareOpen(false)}
    patientId={patientId}
    name={name}
    age={24}
    gender="Male"
    dob="30 Apr 2002"
    weight="72 Kg"
    bloodGroup="O+"
/>
</>
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
      <p className="text-xs uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <p className="mt-2 text-lg font-semibold text-white">
        {value}
      </p>
    </div>
  );
}