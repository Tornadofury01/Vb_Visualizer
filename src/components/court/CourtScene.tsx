"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

import {
  CAMERA_FOV,
  CAMERA_START_POSITION,
  MAX_ZOOM_DISTANCE,
  MIN_ZOOM_DISTANCE,
} from "@/lib/court/scene-config";
import { CourtModel } from "./CourtModel";
import styles from "./CourtScene.module.css";

/**
 * The 3D viewport: one canvas with basic lighting, orbit controls (drag to
 * rotate, wheel to zoom), and the court. Everything Three.js-specific lives at
 * or below this component so pages and layout stay framework-agnostic.
 */
export default function CourtScene() {
  return (
    <div className={styles.viewport}>
      <Canvas camera={{ position: CAMERA_START_POSITION, fov: CAMERA_FOV }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 20, 10]} intensity={1.2} />

        <CourtModel />

        <OrbitControls
          enablePan={false}
          minDistance={MIN_ZOOM_DISTANCE}
          maxDistance={MAX_ZOOM_DISTANCE}
        />
      </Canvas>
    </div>
  );
}
