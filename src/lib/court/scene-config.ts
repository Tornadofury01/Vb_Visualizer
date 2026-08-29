import type { Vector3Tuple } from "three";

/**
 * Shared constants for the 3D court scene. Keeping the magic numbers here means
 * the camera framing and interaction limits stay consistent when the
 * placeholder box is swapped for the real court asset.
 *
 * Units are scene units; we treat 1 unit = 1 metre.
 */

/**
 * Size of the placeholder court stand-in ([width, height, depth]). Roughly
 * proportioned to a real indoor volleyball court (18 m long x 9 m wide) so the
 * camera doesn't need re-framing when the real asset lands.
 */
export const PLACEHOLDER_COURT_SIZE: Vector3Tuple = [18, 1, 9];

/** Initial camera position — an angled 3/4 view so rotation reads clearly. */
export const CAMERA_START_POSITION: Vector3Tuple = [20, 16, 24];

/** Vertical field of view for the scene camera, in degrees. */
export const CAMERA_FOV = 50;

/** Closest the orbit camera may dolly in, in scene units. */
export const MIN_ZOOM_DISTANCE = 8;

/** Furthest the orbit camera may dolly out, in scene units. */
export const MAX_ZOOM_DISTANCE = 80;
