"use client";

import { Suspense, useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Html, useGLTF, useProgress } from "@react-three/drei";
import type * as THREE from "three";
import type { OrganOverview } from "@/lib/api";
import { ORGAN_LABELS, isKnownOrgan, type OrganKey } from "@/lib/organMeshMap";
import AnatomyModel, { type OrganMeshGroup } from "./anatomy/AnatomyModel";
import CameraRig, { type CameraRigHandle } from "./anatomy/CameraRig";
import { AnatomyErrorBoundary } from "./anatomy/AnatomyErrorBoundary";

/**
 * Drop a real anatomical GLB (Z-Anatomy export, BodyParts3D, a licensed
 * Sketchfab anatomy pack, etc.) at this exact path and the viewer below
 * loads it automatically - no code changes required. See
 * frontend/public/models/README.md for naming/export guidance.
 */
const MODEL_URL = "/models/human-body.glb";

try {
  useGLTF.preload(MODEL_URL);
} catch {
  // Preload is a best-effort perf optimization; a missing file here is
  // handled properly later by AnatomyErrorBoundary when the model mounts.
}

const RISK_LEGEND: Array<{ color: string; label: string }> = [
  { color: "#22c55e", label: "Healthy" },
  { color: "#eab308", label: "Monitor" },
  { color: "#ef4444", label: "Critical" },
];

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2 rounded-xl bg-black/70 px-4 py-3 text-xs text-white backdrop-blur">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-white/20 border-t-twin-accent" />
        <span>Loading anatomy model… {Math.round(progress)}%</span>
      </div>
    </Html>
  );
}

function ModelMissingFallback() {
  return (
    <Html center>
      <div className="max-w-[240px] rounded-xl border border-white/10 bg-black/75 p-4 text-center text-xs text-slate-200 backdrop-blur">
        <p className="mb-1.5 font-semibold text-twin-accent">Anatomy model not loaded</p>
        <p className="text-slate-300">
          Add a GLB file at{" "}
          <code className="rounded bg-white/10 px-1 py-0.5 text-[11px]">public/models/human-body.glb</code> to
          enable the 3D viewer. No other changes are needed - it loads automatically.
        </p>
      </div>
    </Html>
  );
}

function ToolbarButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-black/50 text-slate-200 backdrop-blur transition hover:border-twin-accent/50 hover:text-twin-accent active:scale-95"
    >
      {children}
    </button>
  );
}

interface SceneInfo {
  center: THREE.Vector3;
  radius: number;
  organGroups: Map<OrganKey, OrganMeshGroup>;
}

export default function DigitalTwin({
  sex = "male",
  organs,
  selectedOrgan,
  onSelectOrgan,
}: {
  sex?: string;
  organs: OrganOverview[];
  selectedOrgan: string | null;
  onSelectOrgan: (organ: string) => void;
}) {
  const [hoveredOrgan, setHoveredOrgan] = useState<OrganKey | null>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const cameraApiRef = useRef<CameraRigHandle>(null);
  const sceneInfoRef = useRef<SceneInfo | null>(null);

  const riskByOrgan = useMemo(() => {
    const map: Record<string, string | undefined> = {};
    organs.forEach((o) => {
      map[o.organ] = o.risk_level;
    });
    return map;
  }, [organs]);

  const focusOrgan = useCallback((key: OrganKey, distanceScale: number) => {
    const group = sceneInfoRef.current?.organGroups.get(key);
    if (group) {
      cameraApiRef.current?.flyTo(group.center, group.radius, { distanceScale });
    }
  }, []);

  const handleSelectOrgan = useCallback(
    (key: OrganKey) => {
      if (isKnownOrgan(key)) onSelectOrgan(key);
      focusOrgan(key, 2.6);
    },
    [onSelectOrgan, focusOrgan]
  );

  const handleDoubleSelectOrgan = useCallback(
    (key: OrganKey) => {
      if (isKnownOrgan(key)) onSelectOrgan(key);
      focusOrgan(key, 1.35);
    },
    [onSelectOrgan, focusOrgan]
  );

  const handleSceneReady = useCallback((info: SceneInfo) => {
    sceneInfoRef.current = info;
    setModelLoaded(true);
    // Auto Fit: snap-frame the whole body the instant the model loads.
    cameraApiRef.current?.flyTo(info.center, info.radius, { instant: true, distanceScale: 2.5 });
  }, []);

  const handleReset = useCallback(() => {
    const info = sceneInfoRef.current;
    if (info) cameraApiRef.current?.flyTo(info.center, info.radius, { distanceScale: 2.5 });
  }, []);

  return (
    <div className="relative h-[520px] w-full overflow-hidden rounded-2xl bg-gradient-to-b from-twin-panel to-black/40">
      <Canvas shadows dpr={[1, 2]} camera={{ position: [1.8, 1.5, 3.2], fov: 42 }}>
        <ambientLight intensity={0.55} />
        <directionalLight position={[3, 5, 2]} intensity={1.15} castShadow />
        <directionalLight position={[-3, 1.5, -2]} intensity={0.3} />
        <AnatomyErrorBoundary fallback={<ModelMissingFallback />}>
          <Suspense fallback={<Loader />}>
            <AnatomyModel
              url={MODEL_URL}
              hoveredOrgan={hoveredOrgan}
              selectedOrgan={selectedOrgan as OrganKey | null}
              riskByOrgan={riskByOrgan}
              onHoverOrgan={setHoveredOrgan}
              onSelectOrgan={handleSelectOrgan}
              onDoubleSelectOrgan={handleDoubleSelectOrgan}
              onSceneReady={handleSceneReady}
            />
            <ContactShadows position={[0, -1.2, 0]} opacity={0.35} blur={2.4} far={3} />
          </Suspense>
        </AnatomyErrorBoundary>
        <CameraRig ref={cameraApiRef} />
      </Canvas>

      {/* Hovered organ label */}
      {hoveredOrgan && (
        <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur">
          {ORGAN_LABELS[hoveredOrgan]}
        </div>
      )}

      {/* Camera toolbar */}
      {modelLoaded && (
        <div className="absolute right-3 top-3 flex flex-col gap-1.5">
          <ToolbarButton label="Zoom in" onClick={() => cameraApiRef.current?.dolly(0.8)}>
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3M11 8v6M8 11h6" strokeLinecap="round" />
            </svg>
          </ToolbarButton>
          <ToolbarButton label="Zoom out" onClick={() => cameraApiRef.current?.dolly(1.25)}>
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3M8 11h6" strokeLinecap="round" />
            </svg>
          </ToolbarButton>
          <ToolbarButton label="Reset camera" onClick={handleReset}>
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4v5h5M20 20v-5h-5" strokeLinecap="round" strokeLinejoin="round" />
              <path
                d="M4.5 15a8 8 0 1 0 1.9-8.4L4 9M20 9l-1.5 1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </ToolbarButton>
        </div>
      )}

      <div className="pointer-events-none absolute bottom-3 left-3 flex gap-3 text-xs">
        {RISK_LEGEND.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 text-white">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
            {item.label}
          </div>
        ))}
      </div>

      {/* sex is accepted for API compatibility / future male-female model
          variants; the current single canonical model path is unisex. */}
      <span className="sr-only">{sex}</span>
    </div>
  );
}
