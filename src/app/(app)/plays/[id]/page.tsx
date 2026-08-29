import { PlayEditor } from "./play-editor";

export default async function PlayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PlayEditor playId={id} />;
}
