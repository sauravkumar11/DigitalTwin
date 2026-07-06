"use client";

import VitalCard from "./VitalCard";

export default function VitalsGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

      <VitalCard
        title="Heart Rate"
        value="72 BPM"
        status="Normal"
        color="#22C55E"
        icon="❤️"
      />

      <VitalCard
        title="Blood Pressure"
        value="120 / 80"
        status="Stable"
        color="#3B82F6"
        icon="🩸"
      />

      <VitalCard
        title="SpO₂"
        value="98%"
        status="Excellent"
        color="#06B6D4"
        icon="🫁"
      />

      <VitalCard
        title="BMI"
        value="22.4"
        status="Healthy"
        color="#A855F7"
        icon="⚖️"
      />

    </div>
  );
}