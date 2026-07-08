# Anatomy model

> **Current status:** `human-body.glb` in this folder is a single fused,
> unnamed mesh (verified by inspecting its glTF JSON directly) - it has no
> separable organs to click. The viewer currently uses the **composite
> loader** instead (`components/anatomy/CompositeAnatomyModel.tsx`), which
> assembles the body from the separate per-organ files already here
> (`heart.glb`, `brain.glb`, `lungs.glb`, `liver.glb`, `kidney.glb`,
> `stomach.glb`, `pancreas.glb`), configured in `lib/organs.ts`. See "Adding
> an organ" below. Everything past this note describes the *original,
> still-available* single-file pipeline (`components/anatomy/AnatomyModel.tsx`)
> for if/when a real separable whole-body model replaces `human-body.glb`.

## Adding an organ (composite loader, currently active)

1. Drop the GLB in this folder.
2. Add an entry to `frontend/lib/organs.ts`: `{ id, model, position, scale? }`.
   - `id` must be one of `KNOWN_ORGANS` in `frontend/lib/organMeshMap.ts`
     (add it there too if it's a new organ the backend doesn't track yet).
   - `position` is hand-placed in shared scene units (roughly a 1.7-unit-tall
     body centered near the origin) - nudge until it lines up visually.
   - Size is auto-normalized to a common bounding-sphere radius, so you
     don't need to guess a real-world scale; `scale` is just a fine-tune
     multiplier on top of that (defaults to 1).
3. That's it - the composite loader picks up every entry in `organs.ts`
   automatically (preload, click, hover, outline, camera focus all included).

## Switching back to a single unified model

Place your real anatomical model here as:

```
frontend/public/models/human-body.glb
```

The original single-file viewer (`components/anatomy/AnatomyModel.tsx`)
loads this exact path automatically
with `useGLTF` - no code changes are required once the file exists.

## Sourcing a real model

Good open/licensable sources with separate, named organ meshes:

- **Z-Anatomy** (Blender project, CC BY-SA) - export the organs you need to
  glTF/GLB from Blender's `File > Export > glTF 2.0`.
- **BodyParts3D** (from the Database Center for Life Science, Japan) - ships
  as OBJ/other formats; convert to GLB with Blender.
- A licensed anatomy pack from Sketchfab (check the license allows your use
  case) that already ships as GLB with separate organ meshes.

## What the app expects

- **One GLB file**, all organs as separate mesh nodes in the same scene
  (not merged into a single mesh) - the app needs to raycast/select each
  organ independently.
- **Mesh names** don't need to match exactly - `frontend/lib/organMeshMap.ts`
  does keyword matching (e.g. any mesh name containing "heart", "cardiac",
  "ventricle" resolves to the `heart` organ key). If your model uses very

  different naming, add the extra keywords to that file - it's the only
  place that needs to change.
- Reasonable poly count for real-time rendering (a full BioDigital-style
  whole-body model with LODs is ideal; if you only have a subset of organs,
  that's fine too - unmapped/missing organs are simply not shown).

## Optimizing before dropping it in

If the exported GLB is large, run it through
[`gltf-transform`](https://gltf-transform.dev/) or
[`gltfjsx`](https://github.com/pmndrs/gltfjsx) tooling (Draco/Meshopt
compression, texture resizing) before committing it - keeps first load fast.
