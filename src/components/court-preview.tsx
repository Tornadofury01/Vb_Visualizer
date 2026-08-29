import type { SceneGraph, ScenePlayer } from "@/types/domain";

const ZONE_POS: Record<number, { x: number; y: number }> = {
  4: { x: 15, y: 112 },
  3: { x: 45, y: 112 },
  2: { x: 75, y: 112 },
  5: { x: 15, y: 158 },
  6: { x: 45, y: 158 },
  1: { x: 75, y: 158 },
};

function playerPoint(player: ScenePlayer) {
  if (player.courtZone && ZONE_POS[player.courtZone]) {
    const base = ZONE_POS[player.courtZone];
    return player.teamSide === "defense"
      ? { x: 90 - base.x, y: 180 - base.y }
      : base;
  }
  return {
    x: 45 + player.start.x * 4,
    y: player.teamSide === "defense" ? 45 + player.start.z * 4 : 135 + player.start.z * 4,
  };
}

export function CourtPreview({
  scene,
  showZones,
}: {
  scene: SceneGraph;
  showZones: boolean;
}) {
  return (
    <svg viewBox="0 0 90 180" className="h-full w-full max-h-[640px] rounded-xl bg-[#2f6b45] shadow-inner">
      <rect x="1.5" y="1.5" width="87" height="177" fill="none" stroke="white" strokeWidth="1.2" />
      <line x1="1.5" y1="90" x2="88.5" y2="90" stroke="#f4f4f5" strokeWidth="2.4" />
      {scene.court.showAttackLine && (
        <>
          <line x1="1.5" y1="60" x2="88.5" y2="60" stroke="white" strokeWidth="0.8" strokeDasharray="3 2" />
          <line x1="1.5" y1="120" x2="88.5" y2="120" stroke="white" strokeWidth="0.8" strokeDasharray="3 2" />
        </>
      )}
      {scene.court.showAntennas && (
        <>
          <line x1="1.5" y1="84" x2="1.5" y2="96" stroke="#facc15" strokeWidth="2" />
          <line x1="88.5" y1="84" x2="88.5" y2="96" stroke="#facc15" strokeWidth="2" />
        </>
      )}
      {showZones &&
        [4, 3, 2, 5, 6, 1].map((zone) => {
          const p = ZONE_POS[zone];
          return (
            <text
              key={zone}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              fill="rgba(255,255,255,0.35)"
              fontSize="10"
              fontWeight="700"
            >
              {zone}
            </text>
          );
        })}
      {scene.paths
        .filter((path) => path.points.length > 1)
        .map((path) => {
          const d = path.points
            .map((pt, i) => {
              const x = 45 + pt.x * 4;
              const y = 90 + pt.z * 4;
              return `${i === 0 ? "M" : "L"} ${x} ${y}`;
            })
            .join(" ");
          return (
            <path
              key={path.id}
              d={d}
              fill="none"
              stroke={path.kind === "ball" ? "#fde047" : path.color ?? "#93c5fd"}
              strokeWidth="1.2"
              strokeDasharray={path.kind === "drawing" ? "2 2" : undefined}
            />
          );
        })}
      {scene.players.map((player) => {
        const p = playerPoint(player);
        const fill = player.teamSide === "offense" ? "#2563eb" : "#dc2626";
        return (
          <g key={player.id} transform={`translate(${p.x}, ${p.y})`}>
            <circle r="5.5" fill={fill} stroke="white" strokeWidth="0.8" />
            <text y="1.6" textAnchor="middle" fill="white" fontSize="5" fontWeight="700">
              {player.jerseyNumber ?? player.role.slice(0, 1)}
            </text>
            <text y="11" textAnchor="middle" fill="white" fontSize="3.6">
              {player.label ?? player.role}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
