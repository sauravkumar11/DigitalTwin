export interface BodyLayerConfig {
  id: "skeleton" | "muscles";
  model: string;
  /** Rendered translucent so the organs read as sitting inside the body, not stacked on top of it. */
  opacity: number;
}

/**
 * Same body-space convention as lib/organs.ts: origin at hip height, y up,
 * target ~1.7 units tall. Unlike organs, these are normalized by overall
 * bounding-box HEIGHT (not a small per-part radius), since they're meant to
 * represent the whole body, not one part of it.
 */
export const TARGET_BODY_HEIGHT = 1.7;

export const bodyLayers: BodyLayerConfig[] = [
  { id: "skeleton", model: "/models/humain_skeleton.glb", opacity: 0.3 },
  { id: "muscles", model: "/models/male_base_muscular_anatomy.glb", opacity: 0.18 },
];
