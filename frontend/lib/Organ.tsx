import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";
import type * as THREE from "three";

export default function Organ({
    model,
    position,
    scale,
    selected,
    onClick
}: {
    model: string;
    position: [number, number, number];
    scale: number;
    selected: boolean;
    onClick: () => void;
}) {

    const { scene } = useGLTF(model) as unknown as { scene: THREE.Group };

    useEffect(() => {

        scene.traverse((child: any) => {

            if (child.isMesh) {

                child.material = child.material.clone();

                child.material.emissive.set(
                    selected ? "#00ffff" : "#000000"
                );

                child.material.emissiveIntensity =
                    selected ? 2 : 0;

            }

        });

    }, [scene, selected]);
    

    return (

        <primitive
            object={scene}
            position={position}
            scale={scale}
            onPointerDown={onClick}
        />

    );

}