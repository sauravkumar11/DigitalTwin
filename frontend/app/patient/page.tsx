"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  getOrganOverview,
  getOrganInsight,
  getMedications,
  getReports,
  uploadMeal,
  api,
  type OrganOverview,
  type OrganInsight,
} from "@/lib/api";
import {
  getPendingRequests,
  approveRequest as approveAccessRequest,
  rejectRequest as rejectAccessRequest,
  type AccessRequest,
} from "@/lib/api";
import PatientSummary from "@/components/dashboard/PatientSummary";
import VitalsGrid from "@/components/dashboard/VitalsGrid";
import AIInsightCard from "@/components/dashboard/AIInsightCard";
import MedicationPreview from "@/components/dashboard/MedicationPreview";
import AlertsCard from "@/components/dashboard/AlertsCard";
import ReportsTimeline from "@/components/dashboard/ReportsTimeline";
// import AccessRequestNotification from "@/app/share/AccessRequestNotification";
import PendingRequests from "@/components/patient/PendingRequests";


const DigitalTwin = dynamic(() => import("@/components/DigitalTwin"), { ssr: false });

type Tab = "twin" | "medications" | "reports" | "diet";

export default function PatientDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("twin");
  const [patientId, setPatientId] = useState<string | null>(null);
  const [name, setName] = useState("");

  const [organs, setOrgans] = useState<OrganOverview[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [insight, setInsight] = useState<OrganInsight | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);

  const [medications, setMedications] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [uploadMsg, setUploadMsg] = useState("");
const [requests, setRequests] = useState<AccessRequest[]>([]);

async function approveRequest(id: string) {
  await approveAccessRequest(id);
  loadRequests();
}

async function rejectRequest(id: string) {
  await rejectAccessRequest(id);
  loadRequests();
}

  useEffect(() => {
    const token = localStorage.getItem("twincare_token");
    if (!token) {
      router.push("/");
      return;
    }
    setName(localStorage.getItem("twincare_name") || "");
    // /patients/me returns the patient record for the logged-in user
    api.get("/patients/me").then((res) => {
      setPatientId(res.data.id);
      getOrganOverview(res.data.id).then(setOrgans);
    });
  }, []);

  useEffect(() => {
    if (!patientId) return;
    if (tab === "medications" && medications.length === 0) getMedications(patientId).then(setMedications);
    if (tab === "reports" && reports.length === 0) getReports(patientId).then(setReports);
  }, [tab, patientId]);

  useEffect(() => {
  if (!patientId) return;

  loadRequests();
}, [patientId]);

async function loadRequests() {
  const data = await getPendingRequests(patientId!);
  setRequests(data);
}

  async function handleSelectOrgan(organ: string) {
    if (!patientId) return;
    setSelected(organ);
    setInsightLoading(true);
    try {
      const data = await getOrganInsight(patientId, organ);
      setInsight(data);
    } finally {
      setInsightLoading(false);
    }
  }

  async function handleMealUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadMsg("Analyzing meal with AI...");
    try {
      const result = await uploadMeal(file);
      setUploadMsg(`Logged: ${result.food_items} (~${result.calories} kcal)`);
    } catch {
      setUploadMsg("Upload failed. Please try again.");
    }
  }

  function logout() {
    localStorage.clear();
    router.push("/");
  }

  return (
    <main className="mx-auto px-6 py-8">
      <header className="mb-8 flex items-center justify-between">
        {/* <div>
          <h1 className="text-2xl font-bold">
            Twin<span className="text-twin-accent">Care</span> AI  My Health
          </h1>
          <p className="text-sm text-slate-400">
            Welcome, {name}. This is a read-only view — your doctor manages diagnoses and prescriptions.
          </p>
        </div> */}
        <div>
           <h1 className="text-2xl font-bold">
            Twin<span className="text-twin-accent">Care </span> 
    — Welcome back, {name} 👋

          </h1>


  <p className="text-sm text-slate-400">
    Your Digital Health Twin is monitoring your health in real time.
  </p>
</div>
        <button onClick={logout} className="rounded-lg border border-white/10 px-4 py-2 text-sm hover:bg-white/5">
          Log out
        </button>
      </header>
      <div className="mt-6">



</div>

{patientId && (
  <>
    <PatientSummary
      name={name}
      patientId={patientId}
    />

{/* <AccessRequestNotification
    requests={requests}
    onApprove={approveRequest}
    onReject={rejectRequest}
/> */}

<PendingRequests patientId={patientId} />
    <div className="mt-6">
      <VitalsGrid />
    </div>
  </>
)}
      <nav className="mb-6 flex gap-2 pt-4">
        {(["twin", "medications", "reports", "diet"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-2 text-sm capitalize ${
              tab === t ? "bg-twin-accent text-slate-900" : "border border-white/10 hover:bg-white/5"
            }`}
          >
{
  {
    twin: "🫀 Digital Twin",
    medications: "💊 Medications",
    reports: "📄 Reports",
    diet: "🥗 Diet AI",
  }[t]
}          </button>
        ))}
      </nav>

      {tab === "twin" && (<>
       <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">

    <div className="glass-card p-2">

        <DigitalTwin
            organs={organs}
            selectedOrgan={selected}
            onSelectOrgan={handleSelectOrgan}
            onDeselect={() => {
              setSelected(null);
              setInsight(null);
            }}
        />

    </div>

    <div className="space-y-6">

        <AIInsightCard
            selected={selected}
            insight={insight}
            loading={insightLoading}
        />

        <MedicationPreview/>

        <AlertsCard/>

    </div>

</div>

      </>)}

      {tab === "medications" && (
        <div className="glass-card divide-y divide-white/5">
          {medications.map((m) => (
            <div key={m.id} className="p-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{m.name}</h4>
                <span className="text-xs text-slate-400">{m.dose} · {m.frequency}</span>
              </div>
              <p className="mt-1 text-sm text-slate-300">{m.purpose}</p>
            </div>
          ))}
          {medications.length === 0 && <p className="p-6 text-center text-sm text-slate-400">No medications recorded.</p>}
        </div>
      )}

    {tab === "reports" && (
    <ReportsTimeline reports={reports} />
)}

      {tab === "diet" && (
        <div className="glass-card space-y-4 p-6">
          <label className="block cursor-pointer rounded-xl border border-dashed border-white/20 p-6 text-center text-sm text-slate-300 hover:bg-white/5">
            Upload a photo of your meal — AI will estimate calories & macros
            <input type="file" accept="image/*" className="hidden" onChange={handleMealUpload} />
          </label>
          {uploadMsg && <p className="text-sm text-twin-accent">{uploadMsg}</p>}
        </div>
      )}
    </main>
  );
}
