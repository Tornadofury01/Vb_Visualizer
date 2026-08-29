import { PLACEHOLDER_COURT_SIZE } from "@/lib/court/scene-config";

/**
 * Temporary stand-in for the volleyball court: a plain box centred on the
 * origin. Exists only so there is something to render and rotate while the
 * real court asset is built. Swapped out inside {@link CourtModel}.
 */
export function PlaceholderCourt() {
  return (
    <mesh>
      <boxGeometry args={PLACEHOLDER_COURT_SIZE} />
      <meshStandardMaterial color="#c8794b" />
    </mesh>
  );
}
