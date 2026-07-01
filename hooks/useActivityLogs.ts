"use client";

// 활동 로그/오늘의 기록 조회 훅
import { useMemo } from "react";
import { useGame } from "@/context/GameContext";
import type { ActivityLog, PetId } from "@/lib/types";

export function useActivityLogs(petId?: PetId): {
  logs: ActivityLog[];
  todayStats: ReturnType<typeof useGame>["todayStats"];
} {
  const { state, todayStats } = useGame();
  const logs = useMemo(
    () => (petId ? state.logs.filter((l) => l.petId === petId) : state.logs),
    [state.logs, petId]
  );
  return { logs, todayStats };
}
