import { redirect } from "next/navigation";

/**
 * The visualizer is the whole app for now. Keep `/visualizer` as its own route
 * so future pages (play library, settings) have somewhere to live.
 */
export default function Home() {
  redirect("/visualizer");
}
