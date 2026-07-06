import axios from "axios";

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("twincare_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---------- Types ----------
export interface AuthResponse {
  access_token: string;
  role: "doctor" | "patient";
  user_id: string;
  full_name: string;
}

export interface PatientListItem {
  id: string;
  full_name: string;
  sex: string;
  date_of_birth: string | null;
  last_report_date: string | null;
  alert_count: number;
}

export interface OrganOverview {
  organ: string;
  health_score: number;
  risk_level: "healthy" | "monitor" | "critical";
  trend: string;
}

export interface OrganInsight extends OrganOverview {
  confidence: number;
  ai_summary: string;
  suggested_followup: string;
  current_conditions: string[];
  past_diagnoses: any[];
  relevant_medications: any[];
  lab_results: any[];
  timeline: any[];
  updated_at: string;
}

export interface AccessRequest {
  id: string;
  hospital: string;
  doctor_name: string;
  department: string;
  reason: string;
  status: string;
}

export interface PendingRequest {
  id: string;
  doctor_name: string;
  hospital: string;
  department: string;
 reason: string;
  status: string;
  requested_at: string;
}
// ---------- Calls ----------
export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post("/auth/login", { email, password });
  return data;
}

export async function getPatients(search?: string): Promise<PatientListItem[]> {
  const { data } = await api.get("/patients", { params: { search } });
  return data;
}

export async function getOrganOverview(patientId: string): Promise<OrganOverview[]> {
  const { data } = await api.get(`/organs/${patientId}/overview`);
  return data;
}

export async function getOrganInsight(patientId: string, organ: string): Promise<OrganInsight> {
  const { data } = await api.get(`/organs/${patientId}/${organ}`);
  return data;
}

export async function getMedications(patientId: string) {
  const { data } = await api.get(`/medications/${patientId}`);
  return data;
}

export async function getReports(patientId: string) {
  const { data } = await api.get(`/reports/${patientId}`);
  return data;
}

export async function getTimeline(patientId: string) {
  const { data } = await api.get(`/timeline/${patientId}`);
  return data;
}

export async function getDietTrends(patientId: string) {
  const { data } = await api.get(`/diet/${patientId}/trends`);
  return data;
}

export async function uploadMeal(file: File) {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post("/diet/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function uploadReport(patientId: string, reportType: string, file: File) {
  const form = new FormData();
  form.append("patient_id", patientId);
  form.append("report_type", reportType);
  form.append("file", file);
  const { data } = await api.post("/reports", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export interface PublicPatientProfile {
  id: string;
  full_name: string;
  age: number;
  sex: string;
  date_of_birth: string;
  blood_group: string;
  weight: number;
}

export async function getPublicPatient(patientId: string): Promise<PublicPatientProfile> {
  const { data } = await api.get(`/share/${patientId}`);
  return data;
}


export async function createAccessRequest(data: {
  patient_id: string;
  hospital: string;
  doctor_name: string;
  department: string;
  reason: string;
}) {
  const res = await api.post("/access/request", data);
  return res.data;
}

export async function getPendingRequests(patientId: string) {
  const { data } = await api.get(`/access/pending/${patientId}`);
  return data as PendingRequest[];
}

export async function approveRequest(requestId: string) {
  const { data } = await api.post(`/access/${requestId}/approve`);
  return data;
}

export async function rejectRequest(requestId: string) {
  const { data } = await api.post(`/access/${requestId}/reject`);
  return data;
}
