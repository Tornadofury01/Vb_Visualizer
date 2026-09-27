import { PlayStudio } from "@/components/play-studio";

export function PlayEditor({ playId }: { playId: string }) {
  return <PlayStudio playId={playId} />;
}
