"use client";

import { Html, Line, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type ComponentRef } from "react";
import { Vector3 } from "three";
import { PlayerSilhouette } from "@/components/player-silhouette";
import { COURT, COURT_STYLE, TEAM_COLORS, ZONE_CENTERS } from "@/scene/court";
import { illegalEntityIds } from "@/scene/rotation";
import { sampleScene } from "@/scene/timeline";
import { useSceneStore, type CameraMode } from "@/store/scene-store";
import { POSITION_ABBR, type Entity, type SampledPose } from "@/types/scene";

const PRESETS: Record<Exclude<CameraMode, "orbit" | "player_pov">, { pos: [number, number, number]; target: [number, number, number] }> = {
  whiteboard: { pos: [0, 22, 0.04], target: [0, 0, 0] },
  broadcast: { pos: [0.4, 5.4, 13.6], target: [0, 1.1, 0] },
  endline: { pos: [16.5, 4.4, 0.2], target: [0, 1.15, 0] },
};

function CourtMarkings({ showZones }: { showZones: boolean }) {
  const halfL = COURT.length / 2;
  const halfW = COURT.width / 2;
  const grid: [number, number, number][][] = [];
  for (let x = -halfL; x <= halfL + 0.01; x += 1.5) {
    grid.push([
      [x, 0.015, -halfW],
      [x, 0.015, halfW],
    ]);
  }
  for (let z = -halfW; z <= halfW + 0.01; z += 1.5) {
    grid.push([
      [-halfL, 0.015, z],
      [halfL, 0.015, z],
    ]);
  }
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[40, 28]} />
        <meshStandardMaterial color={COURT_STYLE.background} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[COURT.length, COURT.width]} />
        <meshStandardMaterial color={COURT_STYLE.floor} />
      </mesh>
      {grid.map((pts, i) => (
        <Line key={i} points={pts} color={COURT_STYLE.line} lineWidth={1} transparent opacity={0.35} />
      ))}
      <Line
        points={[
          [-halfL, 0.03, -halfW],
          [halfL, 0.03, -halfW],
          [halfL, 0.03, halfW],
          [-halfL, 0.03, halfW],
          [-halfL, 0.03, -halfW],
        ]}
        color={COURT_STYLE.line}
        lineWidth={2}
      />
      <Line points={[[0, 0.04, -halfW], [0, 0.04, halfW]]} color="#e8eef6" lineWidth={2} />
      <Line
        points={[
          [-COURT.attackLine, 0.04, -halfW],
          [-COURT.attackLine, 0.04, halfW],
        ]}
        color={COURT_STYLE.line}
        lineWidth={1.4}
      />
      <Line
        points={[
          [COURT.attackLine, 0.04, -halfW],
          [COURT.attackLine, 0.04, halfW],
        ]}
        color={COURT_STYLE.line}
        lineWidth={1.4}
      />
      {showZones
        ? Object.entries(ZONE_CENTERS).map(([zone, pos]) => (
            <Html key={zone} position={[pos.x, 0.04, pos.z]} center>
              <span className="text-base font-bold text-sky-300/50">{zone}</span>
            </Html>
          ))
        : null}
    </group>
  );
}

function Antenna({ z }: { z: number }) {
  const top = COURT.netHeight;
  const segments = 8;
  const h = COURT.antennaHeight / segments;
  return (
    <group position={[0, top, z]}>
      {Array.from({ length: segments }).map((_, i) => (
        <mesh key={i} position={[0, h * i + h / 2, 0]}>
          <cylinderGeometry args={[0.025, 0.025, h, 8]} />
          <meshStandardMaterial color={i % 2 === 0 ? "#f4f4f5" : "#e11d48"} />
        </mesh>
      ))}
    </group>
  );
}

function Net() {
  const halfW = COURT.width / 2;
  const top = COURT.netHeight;
  const height = 1;
  const mid = top - height / 2;
  return (
    <group>
      <mesh position={[0, mid, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[COURT.width + 0.15, height, 16, 8]} />
        <meshBasicMaterial color="#d7e1ea" wireframe transparent opacity={0.55} />
      </mesh>
      <mesh position={[0, top, 0]}>
        <boxGeometry args={[0.05, 0.04, COURT.width + 0.2]} />
        <meshStandardMaterial color="#f3f6fa" />
      </mesh>
      <mesh position={[0, top - height, 0]}>
        <boxGeometry args={[0.04, 0.03, COURT.width + 0.2]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
      {[-halfW, halfW].map((z) => (
        <group key={z}>
          <mesh position={[0, mid, z]}>
            <boxGeometry args={[0.06, height + 0.15, 0.06]} />
            <meshStandardMaterial color="#e5e7eb" />
          </mesh>
          <Antenna z={z} />
        </group>
      ))}
    </group>
  );
}

function Volleyball({ pose }: { pose: SampledPose }) {
  const y = Math.max(pose.y, COURT.ballRadius);
  return (
    <group position={[pose.x, y, pose.z]}>
      <mesh castShadow>
        <sphereGeometry args={[COURT.ballRadius, 32, 32]} />
        <meshStandardMaterial color="#f3efe4" roughness={0.35} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[COURT.ballRadius * 0.98, 0.008, 8, 32]} />
        <meshStandardMaterial color="#d13a3a" />
      </mesh>
      <mesh rotation={[0.4, 0.6, 0.2]}>
        <torusGeometry args={[COURT.ballRadius * 0.98, 0.007, 8, 32]} />
        <meshStandardMaterial color="#d13a3a" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -y + 0.02, 0]}>
        <circleGeometry args={[0.14, 16]} />
        <meshBasicMaterial color="#000" transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

function PlayerFigure({
  entity,
  pose,
  selected,
  illegal,
}: {
  entity: Entity;
  pose: SampledPose;
  selected: boolean;
  illegal: boolean;
}) {
  const color = TEAM_COLORS[entity.teamId] ?? "#64748b";
  const abbr = entity.position ? POSITION_ABBR[entity.position] : "";
  const facing = entity.teamId === "B" ? -Math.PI / 2 : Math.PI / 2;
  const shadow = 0.42 / (1 + pose.y * 0.4);
  return (
    <group position={[pose.x, 0, pose.z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
        <circleGeometry args={[shadow, 20]} />
        <meshBasicMaterial color="#000" transparent opacity={0.45} />
      </mesh>
      {selected ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[0.5, 0.58, 24]} />
          <meshBasicMaterial color="#d4f56a" />
        </mesh>
      ) : null}
      <group position={[0, pose.y, 0]} rotation={[0, facing, 0]}>
        <PlayerSilhouette
          color={color}
          action={pose.actionState ?? "ready"}
          illegal={illegal}
        />
      </group>
      <Html position={[0, 1.85 + pose.y, 0]} center distanceFactor={12}>
        <div className="whitespace-nowrap rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">
          {entity.jerseyNumber ?? ""} {abbr}
        </div>
      </Html>
    </group>
  );
}

function CameraRig() {
  const mode = useSceneStore((s) => s.cameraMode);
  const selectedId = useSceneStore((s) => s.selectedEntityId);
  const scene = useSceneStore((s) => s.scene);
  const playhead = useSceneStore((s) => s.playheadSeconds);
  const { camera } = useThree();
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const sampled = useMemo(
    () => (scene ? sampleScene(scene, playhead) : []),
    [scene, playhead],
  );

  useEffect(() => {
    if (mode === "orbit" || mode === "player_pov") return;
    const preset = PRESETS[mode];
    camera.position.set(...preset.pos);
    controls.current?.target.set(...preset.target);
    camera.lookAt(...preset.target);
    controls.current?.update();
  }, [camera, mode]);

  useFrame(() => {
    if (mode !== "player_pov" || !scene) return;
    const player =
      sampled.find((row) => row.entity.id === selectedId && row.entity.type === "player" && row.pose) ??
      sampled.find((row) => row.entity.type === "player" && row.pose);
    const ball = sampled.find((row) => row.entity.type === "ball" && row.pose);
    if (!player?.pose) return;
    const towardNet = player.entity.teamId === "B" ? 1 : -1;
    const desired = new Vector3(player.pose.x - towardNet * 1.15, 1.58 + player.pose.y, player.pose.z);
    camera.position.lerp(desired, 0.18);
    const look = ball?.pose
      ? new Vector3(ball.pose.x, ball.pose.y + 0.2, ball.pose.z)
      : new Vector3(player.pose.x + towardNet * 8, 1.4, player.pose.z);
    camera.lookAt(look);
    if (controls.current) {
      controls.current.target.copy(look);
      controls.current.enabled = false;
    }
  });

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enabled={mode !== "player_pov"}
      maxPolarAngle={Math.PI / 2.02}
      minDistance={4}
      maxDistance={36}
    />
  );
}

function SceneContent() {
  const scene = useSceneStore((s) => s.scene);
  const playhead = useSceneStore((s) => s.playheadSeconds);
  const selectedId = useSceneStore((s) => s.selectedEntityId);
  const showZones = useSceneStore((s) => s.showZones);
  const sampled = useMemo(
    () => (scene ? sampleScene(scene, playhead) : []),
    [scene, playhead],
  );
  const illegal = scene ? illegalEntityIds(scene) : new Set<string>();
  if (!scene) return null;
  const ball = sampled.find((s) => s.entity.type === "ball" && s.pose);
  return (
    <>
      <color attach="background" args={[COURT_STYLE.background]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[6, 14, 10]} intensity={1.25} color="#dbeafe" />
      <directionalLight position={[-8, 8, -6]} intensity={0.35} color="#93c5fd" />
      <CourtMarkings showZones={showZones} />
      <Net />
      {sampled.map(({ entity, pose }) =>
        entity.type === "player" && pose ? (
          <PlayerFigure
            key={entity.id}
            entity={entity}
            pose={pose}
            selected={entity.id === selectedId}
            illegal={illegal.has(entity.id)}
          />
        ) : null,
      )}
      {ball?.pose ? <Volleyball pose={ball.pose} /> : null}
      <CameraRig />
    </>
  );
}

export function Viewer3D() {
  return (
    <div className="h-full min-h-[280px] w-full" style={{ background: COURT_STYLE.background }}>
      <Canvas shadows camera={{ position: [0.4, 5.4, 13.6], fov: 36 }}>
        <SceneContent />
      </Canvas>
    </div>
  );
}
