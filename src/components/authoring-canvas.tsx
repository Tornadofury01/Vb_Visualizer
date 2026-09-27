"use client";

import { COURT, COURT_STYLE, TEAM_COLORS, ZONE_CENTERS } from "@/scene/court";
import { illegalEntityIds } from "@/scene/rotation";
import { snapPoint } from "@/scene/snap";
import { entityPathPoints, sampleScene } from "@/scene/timeline";
import { useSceneStore } from "@/store/scene-store";
import { POSITION_ABBR } from "@/types/scene";
import { useEffect, useRef, useState, type RefObject } from "react";
import { Circle, Group, Layer, Line, Rect, Stage, Text } from "react-konva";

const PAD = 28;

function useSize(ref: RefObject<HTMLDivElement | null>) {
  const [size, setSize] = useState({ w: 640, h: 360 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return size;
}

export function AuthoringCanvas() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const { w, h } = useSize(wrapRef);
  const scene = useSceneStore((s) => s.scene);
  const playhead = useSceneStore((s) => s.playheadSeconds);
  const selectedId = useSceneStore((s) => s.selectedEntityId);
  const showZones = useSceneStore((s) => s.showZones);
  const placing = useSceneStore((s) => s.placing);
  const snapMode = useSceneStore((s) => s.snapMode);
  const selectEntity = useSceneStore((s) => s.selectEntity);
  const moveEntityAtPlayhead = useSceneStore((s) => s.moveEntityAtPlayhead);
  const setPendingDrop = useSceneStore((s) => s.setPendingDrop);

  const scale = Math.min((w - PAD * 2) / COURT.length, (h - PAD * 2) / COURT.width);
  const ox = (w - COURT.length * scale) / 2;
  const oy = (h - COURT.width * scale) / 2;
  const toPx = (x: number, z: number) => ({
    x: ox + (x + COURT.length / 2) * scale,
    y: oy + (z + COURT.width / 2) * scale,
  });
  const toM = (px: number, py: number) => ({
    x: (px - ox) / scale - COURT.length / 2,
    z: (py - oy) / scale - COURT.width / 2,
  });

  if (!scene) {
    return (
      <div ref={wrapRef} className="flex h-full items-center justify-center text-sm text-zinc-400">
        No scene loaded
      </div>
    );
  }

  const sampled = sampleScene(scene, playhead);
  const illegal = illegalEntityIds(scene);
  const court = { x: ox, y: oy, w: COURT.length * scale, h: COURT.width * scale };

  return (
    <div ref={wrapRef} className="h-full min-h-[280px] w-full" style={{ background: COURT_STYLE.background }}>
      <Stage
        width={w}
        height={h}
        style={{ cursor: placing ? "crosshair" : "default" }}
        onClick={(e) => {
          if (!placing) return;
          const stage = e.target.getStage();
          const pointer = stage?.getPointerPosition();
          if (!pointer) return;
          const meters = toM(pointer.x, pointer.y);
          setPendingDrop(snapPoint(meters.x, meters.z, snapMode));
        }}
      >
        <Layer>
          <Rect {...court} fill={COURT_STYLE.floor} />
          <Rect {...court} stroke={COURT_STYLE.line} strokeWidth={2} listening={false} />
          <Line
            points={[toPx(0, -COURT.width / 2).x, court.y, toPx(0, COURT.width / 2).x, court.y + court.h]}
            stroke="#e8eef6"
            strokeWidth={2}
          />
          <Line
            points={[
              toPx(-COURT.attackLine, -COURT.width / 2).x,
              court.y,
              toPx(-COURT.attackLine, COURT.width / 2).x,
              court.y + court.h,
            ]}
            stroke={COURT_STYLE.line}
            strokeWidth={1}
          />
          <Line
            points={[
              toPx(COURT.attackLine, -COURT.width / 2).x,
              court.y,
              toPx(COURT.attackLine, COURT.width / 2).x,
              court.y + court.h,
            ]}
            stroke={COURT_STYLE.line}
            strokeWidth={1}
          />
          {[-COURT.width / 2, COURT.width / 2].map((z) => {
            const p = toPx(0, z);
            return (
              <Line key={z} points={[p.x - 7, p.y, p.x + 7, p.y]} stroke="#e11d48" strokeWidth={5} />
            );
          })}
          {showZones &&
            Object.entries(ZONE_CENTERS).map(([zone, pos]) => {
              const p = toPx(pos.x, pos.z);
              return (
                <Text
                  key={zone}
                  x={p.x - 6}
                  y={p.y - 8}
                  text={zone}
                  fill="rgba(125,211,252,0.45)"
                  fontStyle="bold"
                />
              );
            })}
          {scene.entities.map((entity) => {
            const pts = entityPathPoints(entity, scene.contactEvents).flatMap((p) => {
              const c = toPx(p.x, p.z);
              return [c.x, c.y];
            });
            if (pts.length < 4) return null;
            return (
              <Line
                key={`${entity.id}-path`}
                points={pts}
                stroke={entity.type === "ball" ? "#f4efe4" : TEAM_COLORS[entity.teamId] ?? "#93c5fd"}
                strokeWidth={1.5}
                dash={[6, 4]}
                listening={false}
              />
            );
          })}
          {sampled.map(({ entity, pose }) => {
            if (!pose) return null;
            const p = toPx(pose.x, pose.z);
            const isBall = entity.type === "ball";
            const fill = isBall ? "#f3efe4" : TEAM_COLORS[entity.teamId] ?? "#64748b";
            const r = isBall ? 7 : 13;
            const abbr = entity.position ? POSITION_ABBR[entity.position] : "";
            const bad = illegal.has(entity.id);
            return (
              <Group
                key={entity.id}
                x={p.x}
                y={p.y}
                draggable={!placing}
                onClick={(e) => {
                  e.cancelBubble = true;
                  if (!placing) selectEntity(entity.id);
                }}
                onTap={(e) => {
                  e.cancelBubble = true;
                  if (!placing) selectEntity(entity.id);
                }}
                onDragEnd={(e) => {
                  const meters = toM(e.target.x(), e.target.y());
                  moveEntityAtPlayhead(entity.id, meters.x, meters.z);
                }}
              >
                <Circle
                  radius={r}
                  fill={fill}
                  stroke={bad ? "#ff2d2d" : selectedId === entity.id ? "#d4f56a" : "white"}
                  strokeWidth={bad ? 4 : selectedId === entity.id ? 3 : 1}
                />
                <Text
                  y={-5}
                  width={40}
                  offsetX={20}
                  align="center"
                  text={isBall ? "●" : entity.jerseyNumber ?? abbr}
                  fontSize={10}
                  fill={isBall ? "#1c1917" : "white"}
                  listening={false}
                />
                {!isBall ? (
                  <Text
                    y={14}
                    width={48}
                    offsetX={24}
                    align="center"
                    text={abbr}
                    fontSize={9}
                    fill="white"
                    listening={false}
                  />
                ) : null}
              </Group>
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
}
