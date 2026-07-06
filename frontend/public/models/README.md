# Anatomy model

Place your real anatomical model here as:

```
frontend/public/models/human-body.glb
```

The viewer (`components/DigitalTwin.tsx`) loads this exact path automatically
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
