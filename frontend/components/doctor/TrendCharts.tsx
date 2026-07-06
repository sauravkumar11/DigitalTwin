"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const data = [
  { day: "Mon", heart: 72, bp: 120 },
  { day: "Tue", heart: 74, bp: 122 },
  { day: "Wed", heart: 70, bp: 118 },
  { day: "Thu", heart: 76, bp: 124 },
  { day: "Fri", heart: 73, bp: 121 },
  { day: "Sat", heart: 75, bp: 119 },
  { day: "Sun", heart: 71, bp: 117 },
];

export default function TrendCharts() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">

      <Chart
        title="❤️ Heart Rate Trend"
        dataKey="heart"
      />

      <Chart
        title="🩸 Blood Pressure Trend"
        dataKey="bp"
      />

    </div>
  );
}

function Chart({
  title,
  dataKey,
}: {
  title: string;
  dataKey: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">

      <h2 className="mb-5 text-lg font-semibold">
        {title}
      </h2>

      <div className="h-72">

        <ResponsiveContainer width="100%" height="100%">

          <LineChart data={data}>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="day" />

            <Tooltip />

            <Line
              type="monotone"
              dataKey={dataKey}
              stroke="#06B6D4"
              strokeWidth={3}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
}