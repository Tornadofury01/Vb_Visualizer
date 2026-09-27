"use client";

import { ACTION_POSES } from "@/scene/action-rig";
import type { ActionState } from "@/types/scene";

function Part({
  color,
  args,
  position,
  rotation,
}: {
  color: string;
  args: [number, number, number];
  position?: [number, number, number];
  rotation?: [number, number, number];
}) {
  return (
    <mesh position={position} rotation={rotation} castShadow>
      <capsuleGeometry args={[args[0], args[1], 4, 8]} />
      <meshStandardMaterial color={color} roughness={0.42} metalness={0.04} />
    </mesh>
  );
}

export function PlayerSilhouette({
  color,
  action = "ready",
  illegal = false,
}: {
  color: string;
  action?: ActionState;
  illegal?: boolean;
}) {
  const pose = ACTION_POSES[action] ?? ACTION_POSES.ready;
  const hip = 0.92 - pose.crouch * 0.35;

  return (
    <group>
      {illegal ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
          <ringGeometry args={[0.38, 0.48, 24]} />
          <meshBasicMaterial color="#ff2d2d" />
        </mesh>
      ) : null}
      <group position={[0, hip, 0]}>
        <mesh position={[0, 0.28 + pose.torsoTilt * 0.1, 0.02]} rotation={[pose.torsoTilt, 0, 0]} castShadow>
          <capsuleGeometry args={[0.17, 0.42, 4, 10]} />
          <meshStandardMaterial color={color} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.62, 0.04]} castShadow>
          <sphereGeometry args={[0.13, 12, 12]} />
          <meshStandardMaterial color={color} roughness={0.4} />
        </mesh>
        <group position={[-pose.armSpread, 0.46, 0]} rotation={pose.lArm}>
          <Part color={color} args={[0.055, 0.22, 0]} position={[0, -0.14, 0]} />
          <group position={[0, -0.28, 0]} rotation={[pose.lFore, 0, 0]}>
            <Part color={color} args={[0.048, 0.2, 0]} position={[0, -0.12, 0]} />
          </group>
        </group>
        <group position={[pose.armSpread, 0.46, 0]} rotation={pose.rArm}>
          <Part color={color} args={[0.055, 0.22, 0]} position={[0, -0.14, 0]} />
          <group position={[0, -0.28, 0]} rotation={[pose.rFore, 0, 0]}>
            <Part color={color} args={[0.048, 0.2, 0]} position={[0, -0.12, 0]} />
          </group>
        </group>
      </group>
      <group position={[-0.09, hip - 0.02, 0]} rotation={pose.lLeg}>
        <Part color={color} args={[0.07, 0.28, 0]} position={[0, -0.16, 0]} />
        <group position={[0, -0.34, 0]} rotation={[pose.lShin, 0, 0]}>
          <Part color={color} args={[0.055, 0.26, 0]} position={[0, -0.14, 0]} />
        </group>
      </group>
      <group position={[0.09, hip - 0.02, 0]} rotation={pose.rLeg}>
        <Part color={color} args={[0.07, 0.28, 0]} position={[0, -0.16, 0]} />
        <group position={[0, -0.34, 0]} rotation={[pose.rShin, 0, 0]}>
          <Part color={color} args={[0.055, 0.26, 0]} position={[0, -0.14, 0]} />
        </group>
      </group>
    </group>
  );
}
