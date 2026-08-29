import { PlaceholderCourt } from "./PlaceholderCourt";

export interface CourtModelProps {
  /**
   * Optional path to a court asset (e.g. a `.glb` under `/public`). When the
   * real asset exists, load it here — `useGLTF(src)` for a model, or a texture
   * on a plane — and render it in place of {@link PlaceholderCourt}. The rest of
   * the scene (camera, orbit controls, lighting) does not need to change.
   */
  src?: string;
}

/**
 * The single swap point for the court's visual representation.
 *
 * TODO: replace `<PlaceholderCourt />` with the real court asset once it lands.
 */
export function CourtModel({ src }: CourtModelProps) {
  void src; // reserved for the real asset; unused while the placeholder stands in
  return <PlaceholderCourt />;
}
