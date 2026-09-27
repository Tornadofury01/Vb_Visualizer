"use client";

import { api } from "@/lib/api";
import type { PlayDetail } from "@/types/domain";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Scene } from "@/types/scene";

export function usePlayQuery(playId: string) {
  return useQuery({
    queryKey: ["play", playId],
    queryFn: () => api<{ play: PlayDetail }>(`/api/plays/${playId}`),
  });
}

export function useSaveScene(playId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (scene: Scene) =>
      api(`/api/plays/${playId}`, {
        method: "PATCH",
        body: JSON.stringify({ scene }),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["play", playId] });
    },
  });
}
