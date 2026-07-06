"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// Typed as `any` deliberately: drei's OrbitControls ref type comes from the
// three-stdlib implementation it wraps internally, and re-declaring a
// narrower structural type here can conflict with drei's own ref typing.
// Only `.target` and `.update()` are read/called below.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OrbitControlsImpl = any;

export interface CameraRigHandle {
  /** Smoothly (or instantly on first call) fly the camera to frame a point. */
  flyTo: (center: THREE.Vector3, radius: number, opts?: { instant?: boolean; distanceScale?: number }) => void;
  /** Zoom in/out around the current look-at target by a multiplicative factor (<1 zooms in). */
  dolly: (factor: number) => void;
}

const DAMP_LAMBDA = 4.2;

/**
 * Lives inside <Canvas>. Owns the OrbitControls instance and animates
 * camera.position / controls.target toward a requested focus point every
 * frame using exponential damping (THREE.MathUtils.damp) - this is what
 * gives "fly to organ" its cinematic ease-out feel instead of snapping.
 */
const CameraRig = forwardRef<CameraRigHandle, { minDistance?: number; maxDistance?: number }>(
  ({ minDistance = 0.35, maxDistance = 8 }, ref) => {
    const { camera } = useThree();
    const controlsRef = useRef<OrbitControlsImpl>(null);

    const targetPos = useRef(new THREE.Vector3());
    const targetLookAt = useRef(new THREE.Vector3());
    const animating = useRef(false);
    const lastDirection = useRef(new THREE.Vector3(0.9, 0.5, 1.4).normalize());

    useImperativeHandle(ref, () => ({
      flyTo(center, radius, opts) {
        const distance = Math.max(radius * (opts?.distanceScale ?? 2.4), minDistance * 1.2);
        const controls = controlsRef.current;
        const currentTarget = controls ? controls.target : new THREE.Vector3();
        const direction = camera.position.clone().sub(currentTarget);
        if (direction.lengthSq() < 1e-6) direction.copy(lastDirection.current);
        direction.normalize();
        lastDirection.current.copy(direction);

        targetLookAt.current.copy(center);
        targetPos.current.copy(center).addScaledVector(direction, distance);

        if (opts?.instant) {
          camera.position.copy(targetPos.current);
          controls?.target.copy(targetLookAt.current);
          controls?.update();
          animating.current = false;
        } else {
          animating.current = true;
        }
      },
      dolly(factor) {
        const controls = controlsRef.current;
        if (!controls) return;
        const dir = camera.position.clone().sub(controls.target);
        const newLen = THREE.MathUtils.clamp(dir.length() * factor, minDistance, maxDistance);
        dir.setLength(newLen);
        targetPos.current.copy(controls.target).add(dir);
        targetLookAt.current.copy(controls.target);
        animating.current = true;
      },
    }));

    useFrame((_, delta) => {
      const controls = controlsRef.current;
      if (!animating.current || !controls) return;

      camera.position.x = THREE.MathUtils.damp(camera.position.x, targetPos.current.x, DAMP_LAMBDA, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, targetPos.current.y, DAMP_LAMBDA, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, targetPos.current.z, DAMP_LAMBDA, delta);

      controls.target.x = THREE.MathUtils.damp(controls.target.x, targetLookAt.current.x, DAMP_LAMBDA, delta);
      controls.target.y = THREE.MathUtils.damp(controls.target.y, targetLookAt.current.y, DAMP_LAMBDA, delta);
      controls.target.z = THREE.MathUtils.damp(controls.target.z, targetLookAt.current.z, DAMP_LAMBDA, delta);

      controls.update();

      if (
        camera.position.distanceToSquared(targetPos.current) < 1e-5 &&
        controls.target.distanceToSquared(targetLookAt.current) < 1e-5
      ) {
        animating.current = false;
      }
    });

    return (
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.08}
        minDistance={minDistance}
        maxDistance={maxDistance}
        maxPolarAngle={Math.PI * 0.92}
        enablePan
        panSpeed={0.6}
        rotateSpeed={0.7}
        zoomSpeed={0.8}
        touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }}
      />
    );
  }
);

CameraRig.displayName = "CameraRig";
export default CameraRig;
