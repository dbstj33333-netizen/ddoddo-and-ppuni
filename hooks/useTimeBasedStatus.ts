"use client";

// 시간대 기반 인사말/배경. 1분마다 갱신되어 시간대가 바뀌면 반영된다.
// (동물 상태의 실제 시간 감소 처리는 GameContext 의 틱에서 수행)
import { useEffect, useState } from "react";
import { greeting, timeOfDay } from "@/lib/status";

export function useTimeBasedStatus(): {
  greeting: string;
  timeOfDay: "morning" | "day" | "night";
} {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60000);
    const onVisible = () => {
      if (document.visibilityState === "visible") setNow(new Date());
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return { greeting: greeting(now), timeOfDay: timeOfDay(now) };
}
