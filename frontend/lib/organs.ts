import type { KnownOrgan } from "./organMeshMap";

export interface OrganConfig {
  /** Must match a key from KNOWN_ORGANS in organMeshMap.ts (and the backend's organ_mapping.py). */
  id: KnownOrgan;
  /** Path under /public - see /public/models/README.md for the full asset list. */
  model: string;
  /**
   * Anatomical position in a shared body-space coordinate system: origin
   * (0,0,0) sits at hip/pelvis height, y increases upward, matching where
   * the skeleton/muscle layers (lib/bodyLayers.ts) are also centered. A
   * ~1.7-unit-tall adult body spans roughly y: -0.9 (feet) to +0.85 (head top).
   */
  position: [number, number, number];
  /**
   * Target bounding-sphere radius this organ is normalized to (each source
   * GLB has its own unrelated native scale, so every organ is auto-fit to
   * this size rather than trusting the file's original units). Rough
   * real-world proportions, not to exact medical scale.
   */
  targetRadius: number;
  /** Fine-tune multiplier on top of the automatic normalization. Defaults to 1. */
  scale?: number;
  /** Whether this organ renders by default. Defaults to true. */
  visible?: boolean;
}

export const organs: OrganConfig[] = [
  {
    id: "brain",
    model: "/models/brain.glb",
    position: [0, 0.74, -0.05],
    targetRadius: 0.2,
  },
  {
    id: "heart",
    model: "/models/heart.glb",
    position: [0.1, 0.45, -0.01],
    targetRadius: 0.1,
  },
  {
    id: "lungs",
    model: "/models/lungs.glb", 
    position: [0, 0.45, -0.08],
    targetRadius: 0.25,
  },
  {
    id: "liver",
    model: "/models/liver.glb",
    position: [-0.06, 0.30, 0.04],
    targetRadius: 0.11,
  },
  {
    id: "stomach",
    model: "/models/stomach.glb",
    position: [0, 0.18, 0.06],
    targetRadius: 0.14,
  },
  {
    id: "kidneys",
    model: "/models/kidney.glb",
    position: [0, 0.2, 0],
    targetRadius: 0.36,
  },
  {
    id: "pancreas",
    model: "/models/pancreas.glb",
    position: [-0.09, 0.25, 0.07],
    targetRadius: 0.06,
    // Initial layout only surfaces brain/heart/lungs/stomach/kidneys/liver;
    // pancreas is positioned correctly but hidden until explicitly enabled.
    // visible: false,
  },
];
