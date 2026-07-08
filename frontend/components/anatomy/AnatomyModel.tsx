"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { type OrganKey, resolveOrganKey } from "@/lib/organMeshMap";

const RISK_COLOR: Record<string, string> = {
  healthy: "#22c55e",
  monitor: "#eab308",
  critical: "#ef4444",
};
const ACCENT = "#3ddcff";

export interface OrganMeshGroup {
  key: OrganKey;
  meshes: THREE.Mesh[];
  center: THREE.Vector3;
  radius: number;
}

interface SceneReadyInfo {
  center: THREE.Vector3;
  radius: number;
  organGroups: Map<OrganKey, OrganMeshGroup>;
}

interface Props {
  url: string;
  hoveredOrgan: OrganKey | null;
  selectedOrgan: OrganKey | null;
  riskByOrgan: Record<string, string | undefined>;
  onHoverOrgan: (organ: OrganKey | null) => void;
  onSelectOrgan: (organ: OrganKey) => void;
  onDoubleSelectOrgan: (organ: OrganKey) => void;
  onSceneReady: (info: SceneReadyInfo) => void;
}

function isMesh(obj: THREE.Object3D): obj is THREE.Mesh {
  return (obj as THREE.Mesh).isMesh === true;
}

export default function AnatomyModel({
  url,
  hoveredOrgan,
  selectedOrgan,
  riskByOrgan,
  onHoverOrgan,
  onSelectOrgan,
  onDoubleSelectOrgan,
  onSceneReady,
}: Props) {
  const { scene } = useGLTF(url) as unknown as { scene: THREE.Group };

  // Clone the whole hierarchy + every material so this instance never
  // mutates the GLTF that drei caches for preloading/reuse.
  const cloned = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((obj) => {
      if (isMesh(obj) && obj.material) {
        obj.material = Array.isArray(obj.material)
          ? obj.material.map((m) => m.clone())
          : (obj.material as THREE.Material).clone();
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
    return clone;
  }, [scene]);

  // Group meshes by resolved organ key, compute a focus point/radius per
  // organ, and attach a hidden inverted-hull outline child to every organ
  // mesh (toggled visible only for the selected organ).
  const { groups, outlineByMesh } = useMemo(() => {
    const groupMap = new Map<OrganKey, OrganMeshGroup>();
    const outlines = new Map<THREE.Mesh, THREE.Mesh>();

    cloned.traverse((obj) => {
      if (!isMesh(obj)) return;
      const key = resolveOrganKey(obj.name);
      if (!key) return;

      if (!groupMap.has(key)) {
        groupMap.set(key, { key, meshes: [], center: new THREE.Vector3(), radius: 0.2 });
      }
      groupMap.get(key)!.meshes.push(obj);

      const outline = new THREE.Mesh(
        obj.geometry,
        new THREE.MeshBasicMaterial({
          color: ACCENT,
          side: THREE.BackSide,
          transparent: true,
          opacity: 0.85,
          depthWrite: false,
        })
      );
      outline.scale.setScalar(1.035);
      outline.visible = false;
      obj.add(outline);
      outlines.set(obj, outline);
    });

    groupMap.forEach((group) => {
      const box = new THREE.Box3();
      group.meshes.forEach((m) => box.expandByObject(m));
      const sphere = new THREE.Sphere();
      box.getBoundingSphere(sphere);
      group.center.copy(sphere.center);
      group.radius = Math.max(sphere.radius, 0.08);
    });

    return { groups: groupMap, outlineByMesh: outlines };
  }, [cloned]);

  // Remember each mesh's original emissive so hover/risk tinting can be
  // reverted cleanly when the pointer moves away or selection changes.
  const baseEmissive = useRef(new Map<THREE.Mesh, { color: THREE.Color; intensity: number }>());
  useEffect(() => {
    groups.forEach((group) => {
      group.meshes.forEach((mesh) => {
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (mat?.emissive && !baseEmissive.current.has(mesh)) {
          baseEmissive.current.set(mesh, {
            color: mat.emissive.clone(),
            intensity: mat.emissiveIntensity ?? 0,
          });
        }
      });
    });
  }, [groups]);

  // Report scene + organ bounds to the parent viewer exactly once, so it
  // can auto-fit the camera and later request focus on a specific organ.
  const reportedRef = useRef(false);
  useEffect(() => {
    if (reportedRef.current) return;
    reportedRef.current = true;
    const box = new THREE.Box3().setFromObject(cloned);
    const sphere = new THREE.Sphere();
    box.getBoundingSphere(sphere);
    onSceneReady({ center: sphere.center, radius: Math.max(sphere.radius, 1), organGroups: groups });
  }, [cloned, groups, onSceneReady]);

  // Drive emissive color/intensity from hover state, selection state, and
  // the organ's clinical risk level (so a "critical" organ reads red even
  // at rest, matching the existing risk-color legend).
  useEffect(() => {
    groups.forEach((group, key) => {
      const isSelected = selectedOrgan === key;
      const isHovered = hoveredOrgan === key;
      const risk = riskByOrgan[key];
      const riskColor = risk ? RISK_COLOR[risk] : null;

      group.meshes.forEach((mesh) => {
        const mat = mesh.material as THREE.MeshStandardMaterial;
        const outline = outlineByMesh.get(mesh);
        if (outline) outline.visible = isSelected;
        if (!mat?.emissive) return;

        if (isSelected) {
          mat.emissive.set(ACCENT);
          mat.emissiveIntensity = 1.0;
        } else if (isHovered) {
          mat.emissive.set(riskColor ?? ACCENT);
          mat.emissiveIntensity = 0.65;
        } else if (riskColor) {
          mat.emissive.set(riskColor);
          mat.emissiveIntensity = 0.2;
        } else {
          const base = baseEmissive.current.get(mesh);
          if (base) {
            mat.emissive.copy(base.color);
            mat.emissiveIntensity = base.intensity;
          }
        }
      });
    });
  }, [groups, outlineByMesh, hoveredOrgan, selectedOrgan, riskByOrgan]);

  // Gentle pulse on the selected organ; reset scale cleanly on deselect.
  const prevSelected = useRef<OrganKey | null>(null);
  useFrame(({ clock }) => {
    if (prevSelected.current && prevSelected.current !== selectedOrgan) {
      groups.get(prevSelected.current)?.meshes.forEach((m) => m.scale.setScalar(1));
    }
    if (selectedOrgan) {
      const group = groups.get(selectedOrgan);
      if (group) {
        const pulse = 1 + Math.sin(clock.elapsedTime * 3.2) * 0.018;
        group.meshes.forEach((m) => m.scale.setScalar(pulse));
      }
    }
    prevSelected.current = selectedOrgan;
  });

  return (
    <group
      onPointerMove={(e) => {
        e.stopPropagation();
        const key = resolveOrganKey((e.object as THREE.Mesh).name);
        onHoverOrgan(key);
        document.body.style.cursor = key ? "pointer" : "default";
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onHoverOrgan(null);
        document.body.style.cursor = "default";
      }}
      onClick={(e) => {
        e.stopPropagation();
        const key = resolveOrganKey((e.object as THREE.Mesh).name);
        if (key) onSelectOrgan(key);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        const key = resolveOrganKey((e.object as THREE.Mesh).name);
        if (key) onDoubleSelectOrgan(key);
      }}
    >
      <primitive object={cloned} />
    </group>
  );
}

