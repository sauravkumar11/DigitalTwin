/**
 * Mesh-name -> organ-key mapping layer.
 *
 * Real anatomical GLB exports (Z-Anatomy, BodyParts3D, BioDigital-style
 * assets, Sketchfab anatomy packs, etc.) all use their own mesh naming
 * conventions - "Heart_low", "H_heart.001", "Liver_R_Lobe", "Kidney_L" and
 * so on. Rather than hardcoding one convention, every mesh name coming out
 * of the loaded GLTF is normalized and matched against a keyword table
 * below. This means dropping in a different anatomical model later only
 * requires editing this file - never the viewer, the camera logic, or the
 * app's existing onSelectOrgan() callback contract.
 *
 * KNOWN_ORGANS mirrors backend/app/services/organ_mapping.py ORGANS -
 * these are the only keys the existing API/insight panel understands, so
 * only meshes resolving to one of these will trigger onSelectOrgan().
 * EXTRA organs (spleen, bladder, colon, skeleton, skin, ...) are still
 * hoverable/selectable/focusable in the viewer for visual completeness,
 * but do not call back into the app until the backend supports them.
 */

export const KNOWN_ORGANS = [
  "brain",
  "heart",
  "lungs",
  "liver",
  "kidneys",
  "pancreas",
  "stomach",
  "blood_vessels",
] as const;

export type KnownOrgan = (typeof KNOWN_ORGANS)[number];

export const EXTRA_ORGANS = [
  "spleen",
  "bladder",
  "colon",
  "skeleton",
  "skin",
] as const;

export type ExtraOrgan = (typeof EXTRA_ORGANS)[number];

export type OrganKey = KnownOrgan | ExtraOrgan;

export const ORGAN_LABELS: Record<OrganKey, string> = {
  brain: "Brain",
  heart: "Heart",
  lungs: "Lungs",
  liver: "Liver",
  kidneys: "Kidneys",
  pancreas: "Pancreas",
  stomach: "Stomach",
  blood_vessels: "Blood Vessels",
  spleen: "Spleen",
  bladder: "Bladder",
  colon: "Colon",
  skeleton: "Skeleton",
  skin: "Skin",
};

// Keyword synonyms matched as substrings against a normalized mesh name.
// Add more synonyms here as needed for a specific model's naming scheme.
const ORGAN_KEYWORDS: Record<OrganKey, string[]> = {
  brain: ["brain", "cerebrum", "cerebellum", "brainstem"],
  heart: ["heart", "cardiac", "myocard", "atrium", "ventricle"],
  lungs: ["lung", "pulmo", "bronch", "trachea", "alveol"],
  liver: ["liver", "hepatic"],
  kidneys: ["kidney", "renal", "nephro", "ureter"],
  pancreas: ["pancrea"],
  stomach: ["stomach", "gastric"],
  blood_vessels: [
    "vessel",
    "artery",
    "arteries",
    "vein",
    "aorta",
    "vascular",
    "circulat",
    "capillary",
  ],
  spleen: ["spleen", "splenic"],
  bladder: ["bladder", "urinary"],
  colon: ["colon", "intestine", "bowel", "rectum"],
  skeleton: ["skeleton", "bone", "skull", "spine", "vertebra", "rib", "femur", "pelvis_bone"],
  skin: ["skin", "epidermis", "dermis", "integument", "body_surface"],
};

/** Strip common GLTF export suffixes/prefixes (LOD, mesh copies, mirrored parts). */
function normalize(name: string): string {
  return name
    .toLowerCase()
    .replace(/\.\d+$/, "") // Object.001
    .replace(/_lod\d+$/, "") // _LOD0
    .replace(/[_\-\s]+/g, " ")
    .trim();
}

/**
 * Resolve a raw mesh.name from the loaded GLTF into a canonical organ key,
 * or null if the mesh isn't an organ we recognize (connective tissue,
 * scene root, armature nodes, etc).
 */
export function resolveOrganKey(meshName: string | undefined | null): OrganKey | null {
  if (!meshName) return null;
  const normalized = normalize(meshName);
  for (const organ of [...KNOWN_ORGANS, ...EXTRA_ORGANS] as OrganKey[]) {
    const keywords = ORGAN_KEYWORDS[organ];
    if (keywords.some((kw) => normalized.includes(kw))) {
      return organ;
    }
  }
  return null;
}

export function isKnownOrgan(organ: string | null): organ is KnownOrgan {
  return !!organ && (KNOWN_ORGANS as readonly string[]).includes(organ);
}
