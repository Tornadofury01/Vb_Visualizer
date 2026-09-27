/**
 * v1 uses scripted keyframes. Swap this module for @react-three/rapier
 * without changing Scene or the renderers.
 */
export type BallArcInput = {
  from: { x: number; y: number; z: number };
  to: { x: number; y: number; z: number };
  durationSeconds: number;
  t: number;
};

export function scriptedBallLerp(input: BallArcInput) {
  const u = Math.min(1, Math.max(0, input.t / Math.max(input.durationSeconds, 0.001)));
  const lift = Math.sin(u * Math.PI) * 0.35;
  return {
    x: input.from.x + (input.to.x - input.from.x) * u,
    y: input.from.y + (input.to.y - input.from.y) * u + lift,
    z: input.from.z + (input.to.z - input.from.z) * u,
  };
}

export function physicsBallArc(_input: BallArcInput): never {
  throw new Error("Rapier ball physics is stubbed for v1");
}
