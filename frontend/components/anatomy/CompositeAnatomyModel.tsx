"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { organs as ORGAN_CONFIGS } from "@/lib/organs";
import { bodyLayers } from "@/lib/bodyLayers";
import type { OrganKey } from "@/lib/organMeshMap";
import type { OrganMeshGroup } from "./AnatomyModel";
import BodyLayer from "./BodyLayer";

const ACCENT = "#3ddcff";

function isMesh(obj: THREE.Object3D): obj is THREE.Mesh {
  return (obj as THREE.Mesh).isMesh === true;
}

interface SlotProps {
  organKey: OrganKey;
  model: string;
  position: [number, number, number];
  targetRadius: number;
  scaleHint?: number;
  hovered: boolean;
  selected: boolean;
  onHover: (key: OrganKey | null) => void;
  onSelect: (key: OrganKey) => void;
  onDoubleSelect: (key: OrganKey) => void;
  onReady: (key: OrganKey, group: OrganMeshGroup) => void;
}

function OrganSlot({
  organKey,
  model,
  position,
  targetRadius,
  scaleHint,
  hovered,
  selected,
  onHover,
  onSelect,
  onDoubleSelect,
  onReady,
}: SlotProps) {
  const { scene } = useGLTF(model) as unknown as { scene: THREE.Group };

  // Clone the scene + every material (never mutate drei's cached GLTF),
  // normalize its size to this organ's real-world-proportional target
  // radius, and recenter it on its own bounding-sphere center so mismatched
  // export origins don't throw off rotation/scale.
  const built = useMemo(() => {
    const clone = scene.clone(true);
    const meshes: THREE.Mesh[] = [];
    clone.traverse((obj) => {
      if (isMesh(obj) && obj.material) {
        obj.material = Array.isArray(obj.material)
          ? obj.material.map((m) => m.clone())
          : (obj.material as THREE.Material).clone();
        obj.castShadow = true;
        obj.receiveShadow = true;
        meshes.push(obj);
      }
    });

    const box = new THREE.Box3().setFromObject(clone);
    const sphere = new THREE.Sphere();
    box.getBoundingSphere(sphere);

    const baseScale = sphere.radius > 0 ? targetRadius / sphere.radius : 1;
    const finalScale = baseScale * (scaleHint ?? 1);

    // T must be expressed in already-scaled units (T = -finalScale * center),
    // not the raw center, since position and scale compose independently
    // (matrix = R * S * p + T) rather than nested - using the raw center
    // here would offset the model by its ORIGINAL (pre-normalization)
    // magnitude instead of the tiny normalized one.
    clone.position.copy(sphere.center).multiplyScalar(-finalScale);
    clone.scale.setScalar(finalScale);

    const outlines = new Map<THREE.Mesh, THREE.Mesh>();
    meshes.forEach((mesh) => {
      const outline = new THREE.Mesh(
        mesh.geometry,
        new THREE.MeshBasicMaterial({
          color: ACCENT,
          side: THREE.BackSide,
          transparent: true,
          opacity: 0.85,
          depthWrite: false,
        })
      );
      outline.scale.setScalar(1.04);
      outline.visible = false;
      mesh.add(outline);
      outlines.set(mesh, outline);
    });

    return { clone, meshes, finalScale, outlines };
  }, [scene, targetRadius, scaleHint]);

  const baseEmissive = useRef(new Map<THREE.Mesh, { color: THREE.Color; intensity: number }>());
  useEffect(() => {
    built.meshes.forEach((mesh) => {
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (mat?.emissive && !baseEmissive.current.has(mesh)) {
        baseEmissive.current.set(mesh, { color: mat.emissive.clone(), intensity: mat.emissiveIntensity ?? 0 });
      }
    });
  }, [built]);

  // Report this organ's bounds to the parent exactly once, so it can
  // compute an overall auto-fit and let camera "focus organ" work.
  const reportedRef = useRef(false);
  useEffect(() => {
    if (reportedRef.current) return;
    reportedRef.current = true;
    onReady(organKey, {
      key: organKey,
      meshes: built.meshes,
      center: new THREE.Vector3(...position),
      radius: targetRadius * (scaleHint ?? 1) * 1.5,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [built]);

  // Selected organ gets a strong accent highlight + outline; hovered gets a
  // faint neutral (non-risk-colored) glow as an interaction affordance;
  // otherwise the organ keeps its ORIGINAL material untouched - no
  // permanent health-status tinting at rest.
  useEffect(() => {
    built.meshes.forEach((mesh) => {
      const mat = mesh.material as THREE.MeshStandardMaterial;
      const outline = built.outlines.get(mesh);
      if (outline) outline.visible = selected;
      if (!mat?.emissive) return;

      if (selected) {
        mat.emissive.set(ACCENT);
        mat.emissiveIntensity = 1.0;
      } else if (hovered) {
        mat.emissive.set(ACCENT);
        mat.emissiveIntensity = 0.3;
      } else {
        const base = baseEmissive.current.get(mesh);
        if (base) {
          mat.emissive.copy(base.color);
          mat.emissiveIntensity = base.intensity;
        }
      }
    });
  }, [built, hovered, selected]);

  // Gentle pulse while selected; settles back to normal scale otherwise.
  useFrame(({ clock }) => {
    const pulse = selected ? 1 + Math.sin(clock.elapsedTime * 3.2) * 0.03 : 1;
    built.clone.scale.setScalar(built.finalScale * pulse);
  });

  return (
    <group
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(organKey);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onHover(null);
        document.body.style.cursor = "default";
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(organKey);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onDoubleSelect(organKey);
      }}
    >
      <primitive object={built.clone} />
    </group>
  );
}

export interface CompositeSceneInfo {
  center: THREE.Vector3;
  radius: number;
  organGroups: Map<OrganKey, OrganMeshGroup>;
}

interface Props {
  hoveredOrgan: OrganKey | null;
  selectedOrgan: OrganKey | null;
  riskByOrgan: Record<string, string | undefined>;
  onHoverOrgan: (organ: OrganKey | null) => void;
  onSelectOrgan: (organ: OrganKey) => void;
  onDoubleSelectOrgan: (organ: OrganKey) => void;
  onSceneReady: (info: CompositeSceneInfo) => void;
}

// riskByOrgan is intentionally unused for material tinting (that caused
// every organ to read as permanently green when marked "healthy"); it's
// kept in the prop signature for callers/legends that still key off it
// elsewhere, and to avoid a churny signature change across DigitalTwin.tsx.
export default function CompositeAnatomyModel({
  hoveredOrgan,
  selectedOrgan,
  onHoverOrgan,
  onSelectOrgan,
  onDoubleSelectOrgan,
  onSceneReady,
}: Props) {
  const visibleOrgans = useMemo(() => ORGAN_CONFIGS.filter((cfg) => cfg.visible !== false), []);

  const readyMap = useRef(new Map<OrganKey, OrganMeshGroup>());
  const reportedOnce = useRef(false);

  function handleSlotReady(key: OrganKey, group: OrganMeshGroup) {
    readyMap.current.set(key, group);
    if (!reportedOnce.current && readyMap.current.size === visibleOrgans.length) {
      reportedOnce.current = true;
      const box = new THREE.Box3();
      readyMap.current.forEach((g) => {
        box.expandByPoint(g.center.clone().addScalar(g.radius));
        box.expandByPoint(g.center.clone().addScalar(-g.radius));
      });
      const sphere = new THREE.Sphere();
      box.getBoundingSphere(sphere);
      onSceneReady({
        center: sphere.center,
        radius: Math.max(sphere.radius, 1.0),
        organGroups: new Map(readyMap.current),
      });
    }
  }

  return (
    <>
      {bodyLayers.map((layer) => (
        <BodyLayer key={layer.id} config={layer} />
      ))}
      {visibleOrgans.map((cfg) => (
        <OrganSlot
          key={cfg.id}
          organKey={cfg.id}
          model={cfg.model}
          position={cfg.position}
          targetRadius={cfg.targetRadius}
          scaleHint={cfg.scale}
          hovered={hoveredOrgan === cfg.id}
          selected={selectedOrgan === cfg.id}
          onHover={onHoverOrgan}
          onSelect={onSelectOrgan}
          onDoubleSelect={onDoubleSelectOrgan}
          onReady={handleSlotReady}
        />
      ))}
    </>
  );
}
