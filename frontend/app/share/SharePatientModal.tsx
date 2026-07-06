"use client";

import { useRef } from "react";
import html2canvas from "html2canvas";
import DigitalHealthCard from "./DigitalHealthCard";

interface Props {
  open: boolean;
  onClose: () => void;
  patientId: string;
  name: string;
  age: number;
  gender: string;
  dob: string;
  weight: string;
  bloodGroup: string;
}

export default function SharePatientModal({
  open,
  onClose,
  patientId,
  name,
  age,
  gender,
  dob,
  weight,
  bloodGroup,
}: Props) {
  const cardRef = useRef<HTMLDivElement>(null);

  if (!open) return null;

  async function copyID() {
    await navigator.clipboard.writeText(patientId);
    alert("Patient ID copied successfully.");
  }

  async function shareID() {
    if (navigator.share) {
      await navigator.share({
        title: "TwinCare AI",
        text: `Digital Health ID : ${patientId}`,
        url: `${window.location.origin}/share/${patientId}`,
      });
    } else {
      copyID();
    }
  }

  async function downloadCard() {
    if (!cardRef.current) return;
    const canvas = await html2canvas(cardRef.current, {
      scale: 3,
      backgroundColor: "#0f172a",
      useCORS: true,
    });
    const link = document.createElement("a");
    link.download = `TwinCare-${patientId}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-md">
      <div className="w-[900px] relative">
        {/* Cross icon in top-right */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-xl text-slate-400 hover:text-cyan-400"
          aria-label="Close"
        >
          ✕
        </button>

        <div ref={cardRef}>
          <DigitalHealthCard
            patientId={patientId}
            name={name}
            age={age}
            gender={gender}
            dob={dob}
            weight={weight}
            bloodGroup={bloodGroup}
          />
        </div>

        <div className="mt-6 flex gap-4">
          <button
            onClick={copyID}
            className="flex-1 rounded-xl border border-cyan-500 py-4 hover:bg-cyan-500/20"
          >
            📋 Copy ID
          </button>
          <button
            onClick={shareID}
            className="flex-1 rounded-xl bg-cyan-500 py-4 font-semibold text-slate-900"
          >
            📤 Share
          </button>
          <button
            onClick={downloadCard}
            className="flex-1 rounded-xl border border-cyan-500 py-4"
          >
            📥 Download
          </button>
        </div>
      </div>
    </div>
  );
}
