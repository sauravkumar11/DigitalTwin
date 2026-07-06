"use client";

interface VitalCardProps {
  title: string;
  value: string;
  status: string;
  color: string;
  icon: string;
}

export default function VitalCard({
  title,
  value,
  status,
  color,
  icon,
}: VitalCardProps) {
  return (
    <div className="group rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500">

      <div className="flex items-center justify-between">

        <span className="text-3xl">
          {icon}
        </span>

        <span
          className="rounded-full px-3 py-1 text-xs font-semibold"
          style={{
            background: `${color}20`,
            color,
          }}
        >
          {status}
        </span>

      </div>

      <h3 className="mt-5 text-sm text-slate-400">
        {title}
      </h3>

      <p className="mt-2 text-3xl font-bold text-white">
        {value}
      </p>
    </div>
  );
}