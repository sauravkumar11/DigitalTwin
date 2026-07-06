"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getPatients, type PatientListItem } from "@/lib/api";
import PatientCard from "@/components/doctor/PatientCard";


export default function DoctorDashboard() {
  const router = useRouter();
  const [patients, setPatients] = useState<PatientListItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");

useEffect(() => {
  if (!localStorage.getItem("twincare_token")) {
    router.push("/");
    return;
  }

  setName(localStorage.getItem("twincare_name") || "");
}, []);

useEffect(() => {
  const timer = setTimeout(() => {
    load(search);
  }, 300);

  return () => clearTimeout(timer);
}, [search]);

  async function load(q?: string) {
    setLoading(true);
    try {
      const data = await getPatients(q);
      setPatients(data);
    } finally {
      setLoading(false);
    }
  }

  const totalPatients = patients.length;
  const totalAlerts = patients.reduce((sum, p) => sum + p.alert_count, 0);
  const recentReports = patients.filter((p) => p.last_report_date).length;

  function logout() {
    localStorage.clear();
    router.push("/");
  }

  return (
    <main className="mx-auto px-6 py-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Twin<span className="text-twin-accent">Care</span> AI — Doctor Dashboard
          </h1>
          <p className="text-sm text-slate-400">Welcome back, {name}</p>
        </div>
        <button onClick={logout} className="rounded-lg border border-white/10 px-4 py-2 text-sm hover:bg-white/5">
          Log out
        </button>
      </header>

<section className="mb-8 grid gap-5 md:grid-cols-3">        
<StatCard
    icon="👨‍⚕️"
    label="Total Patients"
    value={totalPatients}
/>

<StatCard
    icon="📄"
    label="Recent Reports"
    value={recentReports}
/>

<StatCard
    icon="🚨"
    label="Active Alerts"
    value={totalAlerts}
    accent="critical"
/>
      </section>
<div className="mb-8 rounded-3xl border border-slate-800 bg-slate-900/80 p-8">

    <div className="flex items-center justify-between">

        <div>

            <h2 className="text-2xl font-bold">

                Today's Overview

            </h2>

            <p className="text-slate-400">

                Hospital Analytics

            </p>

        </div>

        <div className="text-right">

            <p className="text-5xl font-bold text-cyan-400">

                {patients.length}

            </p>

            <p className="text-slate-400">

                Active Patients

            </p>

        </div>

    </div>

</div>
    <div className="relative mb-8">

  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl text-slate-400">
    🔍
  </span>

  <input
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    placeholder="Search patient by name..."
    className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 py-4 pl-14 pr-6 text-white outline-none transition-all duration-300 placeholder:text-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
  />

</div>

     <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

    {loading && (
        <p className="text-slate-400">
            Loading Patients...
        </p>
    )}

    {!loading &&
        patients.map((patient) => (
            <PatientCard
                key={patient.id}
                patient={patient}
            />
        ))}

    {!loading &&
        patients.length === 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-10 text-center">

                No Patients Found

            </div>
        )}

</div>
    </main>
  );
}

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number;
  icon: string;
  accent?: "critical";
}) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 transition-all hover:border-cyan-500">

      <div className="flex items-center justify-between">

        <span className="text-4xl">
          {icon}
        </span>

        <span
          className={`text-4xl font-bold ${
            accent === "critical"
              ? "text-red-400"
              : "text-cyan-400"
          }`}
        >
          {value}
        </span>

      </div>

      <p className="mt-6 text-slate-400">
        {label}
      </p>

    </div>
  );
}
