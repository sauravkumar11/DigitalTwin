"use client";

import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { TARGET_BODY_HEIGHT, type BodyLayerConfig } from "@/lib/bodyLayers";

function isMesh(obj: THREE.Object3D): obj is THREE.Mesh {
  return (obj as THREE.Mesh).isMesh === true;
}

/**
 * Purely visual context layer (skeleton or musculature). Preserves each
 * mesh's original material (only cloning it so opacity/transparent can be
 * set without mutating drei's cached GLTF) - no emissive tinting, no
 * click/hover handlers, since these aren't individually selectable organs.
 */
export default function BodyLayer({ config }: { config: BodyLayerConfig }) {
  const { scene } = useGLTF(config.model) as unknown as { scene: THREE.Group };

  const prepared = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((obj) => {
      if (isMesh(obj) && obj.material) {
        const mat = Array.isArray(obj.material)
          ? obj.material.map((m) => m.clone())
          : (obj.material as THREE.Material).clone();
        const materials = Array.isArray(mat) ? mat : [mat];
        materials.forEach((m) => {
          m.transparent = true;
          m.opacity = config.opacity;
          m.depthWrite = false;
        });
        obj.material = mat;
      }
    });

    // Normalize by overall HEIGHT (not a small per-part radius, since this
    // represents the whole body) and recenter on x/z, anchoring vertically
    // so the box's own vertical center lines up with the shared body
    // origin used by lib/organs.ts.
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    const height = Math.max(size.y, 0.001);
    const scaleFactor = TARGET_BODY_HEIGHT / height;

    // T must be expressed in already-scaled units (T = -scaleFactor * center),
    // not the raw center, since position and scale apply independently
    // (matrix = R * S * p + T) rather than nested.
    clone.position.copy(center).multiplyScalar(-scaleFactor);
    clone.scale.setScalar(scaleFactor);

    return clone;
  }, [scene, config.opacity]);

  return <primitive object={prepared} renderOrder={-1} />;
}
