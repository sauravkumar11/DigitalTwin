// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { login } from "@/lib/api";

// export default function LoginPage() {
//   const router = useRouter();
//   const [email, setEmail] = useState("doctor@twincare.ai");
//   const [password, setPassword] = useState("doctor123");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   async function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     setError("");
//     setLoading(true);
//     try {
//       const res = await login(email, password);
//       localStorage.setItem("twincare_token", res.access_token);
//       localStorage.setItem("twincare_role", res.role);
//       localStorage.setItem("twincare_user_id", res.user_id);
//       localStorage.setItem("twincare_name", res.full_name);
//       router.push(res.role === "doctor" ? "/doctor" : "/patient");
//     } catch (err: any) {
//       setError(err?.response?.data?.detail || "Login failed");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <main className="flex min-h-screen items-center justify-center px-4">
//       <div className="glass-card w-full max-w-md p-8">
//         <h1 className="mb-1 text-2xl font-bold">
//           Twin<span className="text-twin-accent">Care</span> AI
//         </h1>
//         <p className="mb-6 text-sm text-slate-400">AI-powered Digital Patient Twin platform</p>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="mb-1 block text-xs uppercase tracking-wide text-slate-400">Email</label>
//             <input
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none focus:border-twin-accent"
//               required
//             />
//           </div>
//           <div>
//             <label className="mb-1 block text-xs uppercase tracking-wide text-slate-400">Password</label>
//             <input
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none focus:border-twin-accent"
//               required
//             />
//           </div>
//           {error && <p className="text-sm text-twin-critical">{error}</p>}
//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full rounded-lg bg-twin-accent py-2 font-medium text-slate-900 transition hover:opacity-90 disabled:opacity-50"
//           >
//             {loading ? "Signing in..." : "Sign in"}
//           </button>
//         </form>

//         <div className="mt-6 space-y-1 text-xs text-slate-500">
//           <p>Demo doctor: doctor@twincare.ai / doctor123</p>
//           <p>Demo patient: patient@twincare.ai / patient123</p>
//         </div>
//       </div>
//     </main>
//   );
// }




"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";

const STATS = [
  {
    icon: "🧬",
    value: "12",
    label: "Organs Analyzed",
  },
  {
    icon: "📄",
    value: "50+",
    label: "Medical Reports",
  },
  {
    icon: "⚡",
    value: "99.2%",
    label: "AI Accuracy",
  },
];

const INSIGHT_LINES = [
  "Interactive 3D Human Anatomy",
  "AI-powered Organ Health Analysis",
  "Medical Reports & OCR Processing",
  "Medication & Treatment Tracking",
  "Doctor Dashboard with Risk Alerts",
  "End-to-End Encryption",
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("doctor@twincare.ai");
  const [password, setPassword] = useState("doctor123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setBooting(false), 1200);
    return () => window.clearTimeout(timer);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await login(email, password);
      localStorage.setItem("twincare_token", res.access_token);
      localStorage.setItem("twincare_role", res.role);
      localStorage.setItem("twincare_user_id", res.user_id);
      localStorage.setItem("twincare_name", res.full_name);
      router.push(res.role === "doctor" ? "/doctor" : "/patient");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  if (booting) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto mb-7 flex h-28 w-28 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] shadow-2xl shadow-cyan-950/40">
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-twin-accent/25">
              <div className="absolute inset-2 rounded-full border border-white/10" />
              <div className="absolute inset-0 animate-spin rounded-full border border-transparent border-t-twin-accent/80 border-r-twin-accent/20" />
              <div className="h-9 w-9 rounded-full bg-twin-accent/10 shadow-[0_0_34px_rgba(61,220,255,0.32)]" />
              <div className="absolute h-12 w-px bg-gradient-to-b from-transparent via-twin-accent/60 to-transparent" />
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold">
              Twin<span className="text-twin-accent">Care</span> AI
            </h1>
            <p className="mt-2 text-sm text-slate-400">Initializing digital twin workspace</p>
          </div>

          <div className="mt-7 h-1 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-full origin-left animate-[loadingBar_1.25s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-transparent via-twin-accent to-transparent shadow-[0_0_18px_rgba(61,220,255,0.6)]" />
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs uppercase tracking-[0.22em] text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-twin-healthy" />
            Secure session
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-8 lg:px-10">
      <div className="grid w-full max-w-7xl items-center gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="flex min-h-[620px] flex-col justify-center rounded-2xl border border-white/10 bg-white/[0.025] p-8 lg:p-10">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-twin-accent">
            Smarter Healthcare Through
          </p>
          <h1 className="max-w-xl text-4xl font-bold leading-tight md:text-5xl">
            Twin<span className="text-twin-accent">Care</span> AI
          </h1>
         {/* <h2 className="mt-4 text-3xl font-bold leading-tight">
  Smarter Healthcare Through
  <span className="text-twin-accent"> AI Digital Twins</span>
</h2> */}

<p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
  TwinCare AI bridges patients and healthcare professionals through
  interactive 3D anatomy, AI-powered clinical insights, and centralized
  medical records—making healthcare more connected, visual, and proactive.
</p>

         <div className="mt-10 grid max-w-3xl grid-cols-1 gap-5 sm:grid-cols-3">
  {STATS.map((stat) => (
    <div
      key={stat.label}
      className="rounded-xl border border-white/10 bg-white/5 p-2 px-5 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500 hover:shadow-xl hover:shadow-cyan-500/10"
    >
      <div className="flex items-center justify-between">

        <span className="text-2xl">
          {stat.icon}
        </span>

        <span className="text-2xl font-bold text-cyan-400">
          {stat.value}
        </span>

      </div>

      <p className="mt-2 text-sm font-medium text-slate-300">
        {stat.label}
      </p>

    </div>
  ))}
</div>

         <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
  {INSIGHT_LINES.map((line) => (
    <div
      key={line}
      className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-2 text-sm text-slate-300"
    >
      <span className="h-2 w-2 rounded-full bg-twin-accent shadow-[0_0_16px_rgba(61,220,255,0.8)]" />
      <span>{line}</span>
    </div>
  ))}
</div>
        </section>

        <section className="glass-card shadow-2xl shadow-cyan-900/30 backdrop-blur-xl w-full p-8 lg:p-10">
          <h2 className="mb-1 text-2xl font-bold">Sign in</h2>
          <p className="mb-6 text-sm text-slate-400">Access your TwinCare AI dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-slate-400">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none transition focus:border-twin-accent"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-slate-400">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none transition focus:border-twin-accent"
                required
              />
            </div>
            {error && <p className="text-sm text-twin-critical">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-twin-accent py-2 font-medium text-slate-900 transition hover:opacity-90 disabled:opacity-50"
            >
              {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900/30 border-t-slate-900" />}
              {loading ? "Signing in..." : "🩺 Access Clinical Workspace"}
            </button>
          </form>

          <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-4 text-xs text-slate-400">
            <p className="font-medium text-slate-300">Demo accounts</p>
            <p className="mt-2">Doctor: doctor@twincare.ai / doctor123</p>
            <p>Patient: patient@twincare.ai / patient123</p>
          </div>
        </section>
      </div>
    </main>
  );
}
