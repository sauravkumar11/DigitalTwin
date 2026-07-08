"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  getOrganOverview,
  getOrganInsight,
  getMedications,
  getReports,
  getTimeline,
  getDietTrends,
  uploadReport,
  type OrganOverview,
  type OrganInsight,
} from "@/lib/api";
import DoctorSummary from "@/components/doctor/DoctorSummary";
import QuickStats from "@/components/doctor/QuickStats";
import ClinicalAI from "@/components/doctor/ClinicalAI";
import ClinicalAlerts from "@/components/doctor/ClinicalAlerts";
import ClinicalScore from "@/components/doctor/ClinicalScore";
import TrendCharts from "@/components/doctor/TrendCharts";
import MedicalTimeline from "@/components/doctor/MedicalTimeline";

const DigitalTwin = dynamic(() => import("@/components/DigitalTwin"), { ssr: false });

type Tab = "twin" | "medications" | "reports" | "timeline" | "diet";

export default function PatientDetailPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("twin");

  const [organs, setOrgans] = useState<OrganOverview[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [insight, setInsight] = useState<OrganInsight | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);

  const [medications, setMedications] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [dietTrends, setDietTrends] = useState<any[]>([]);

  useEffect(() => {
    if (!localStorage.getItem("twincare_token")) {
      router.push("/");
      return;
    }
    getOrganOverview(patientId).then(setOrgans);
  }, [patientId]);

  useEffect(() => {
    if (tab === "medications" && medications.length === 0) getMedications(patientId).then(setMedications);
    if (tab === "reports" && reports.length === 0) getReports(patientId).then(setReports);
    if (tab === "timeline" && timeline.length === 0) getTimeline(patientId).then(setTimeline);
    if (tab === "diet" && dietTrends.length === 0) getDietTrends(patientId).then(setDietTrends);
  }, [tab, patientId]);

  async function handleSelectOrgan(organ: string) {
    setSelected(organ);
    setInsightLoading(true);
    try {
      const data = await getOrganInsight(patientId, organ);
      setInsight(data);
    } finally {
      setInsightLoading(false);
    }
  }

  async function handleUploadReport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadReport(patientId, "blood_report", file);
    getReports(patientId).then(setReports);
    getOrganOverview(patientId).then(setOrgans);
  }

  return (
    <main className="mx-auto px-6 py-8">
      <button onClick={() => router.push("/doctor")} className="mb-4 text-sm text-slate-400 hover:text-white">
        ← Back to patient list
      </button>
      <DoctorSummary patientId={patientId} />

      <div className="mt-6">

        <QuickStats />

      </div>
      <nav className="mb-6 flex gap-2 pt-6">
        {(["twin", "medications", "reports", "timeline", "diet"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-2 text-sm capitalize ${tab === t ? "bg-twin-accent text-slate-900" : "border border-white/10 hover:bg-white/5"
              }`}
          >
            {t === "twin" ? "Digital Twin" : t}
          </button>
        ))}
      </nav>

      {tab === "twin" && (
        <><div className="grid gap-6 lg:grid-cols-[2fr_1fr]">

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

            <ClinicalAI
              insight={insight}
              loading={insightLoading}
            />

            <ClinicalAlerts
              organs={organs}
            />

            <ClinicalScore
              organs={organs}
            />

          </div>

        </div>
          <div className="mt-6">

            <TrendCharts />

          </div>

          <div className="mt-6">

            <MedicalTimeline

              timeline={timeline}

            />

          </div></>
      )}

      {tab === "medications" && (
        <div className="glass-card divide-y divide-white/5">
          {medications.map((m) => (
            <div key={m.id} className="p-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{m.name}</h4>
                <span className="text-xs text-slate-400">{m.dose} · {m.frequency}</span>
              </div>
              <p className="mt-1 text-sm text-slate-300">{m.purpose}</p>
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                <span>Side effects: {m.side_effects}</span>
                <span>Organs: {m.organs_affected}</span>
              </div>
            </div>
          ))}
          {medications.length === 0 && <p className="p-6 text-center text-sm text-slate-400">No medications recorded.</p>}
        </div>
      )}

      {tab === "reports" && (
        <div className="space-y-4">
          <label className="glass-card block cursor-pointer p-4 text-center text-sm text-slate-300 hover:bg-white/5">
            Upload a PDF or image report (blood report, prescription, imaging)
            <input type="file" accept=".pdf,image/*" className="hidden" onChange={handleUploadReport} />
          </label>
          <div className="glass-card divide-y divide-white/5">
            {reports.map((r) => (
              <div key={r.id} className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">{r.report_type.replace("_", " ")}</span>
                  <span className="text-xs text-slate-500">{new Date(r.uploaded_at).toLocaleString()}</span>
                </div>
                <p className="mt-1 text-sm text-slate-300">{r.ai_summary}</p>
              </div>
            ))}
            {reports.length === 0 && <p className="p-6 text-center text-sm text-slate-400">No reports uploaded yet.</p>}
          </div>
        </div>
      )}

      {tab === "timeline" && (
        <div className="glass-card p-6">
          <ol className="relative space-y-6 border-l border-white/10 pl-6">
            {timeline.map((t) => (
              <li key={t.id}>
                <div className="absolute -left-[7px] mt-1 h-3 w-3 rounded-full bg-twin-accent" />
                <p className="text-xs text-slate-500">{t.event_date}</p>
                <p className="font-medium">{t.title}</p>
                <p className="text-sm text-slate-400">{t.description}</p>
              </li>
            ))}
            {timeline.length === 0 && <p className="text-sm text-slate-400">No timeline events yet.</p>}
          </ol>
        </div>
      )}

      {tab === "diet" && (
        <div className="glass-card divide-y divide-white/5">
          {dietTrends.map((d) => (
            <div key={d.date} className="flex items-center justify-between p-4 text-sm">
              <span>{d.date}</span>
              <span>{d.calories} kcal</span>
              <span className={d.compliance ? "text-twin-healthy" : "text-twin-monitor"}>
                {d.compliance ? "Compliant" : "Review"}
              </span>
            </div>
          ))}
          {dietTrends.length === 0 && <p className="p-6 text-center text-sm text-slate-400">No diet logs yet.</p>}
        </div>
      )}
    </main>
  );
}
