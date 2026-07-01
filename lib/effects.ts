// 산책/놀이 보상 계산 (컨텍스트와 미리보기 UI가 공유)
import type { StatChanges } from "./types";

export const ACTIVITY_PER_MIN: Record<
  "walk" | "play",
  { happiness: number; affection: number; energy: number; cleanliness: number }
> = {
  walk: { happiness: 5, affection: 2, energy: -3, cleanliness: -1.5 },
  play: { happiness: 4, affection: 2, energy: -2, cleanliness: -0.3 },
};

export function activityChanges(
  type: "walk" | "play",
  minutes: number
): StatChanges {
  const per = ACTIVITY_PER_MIN[type];
  const min = Math.max(1, minutes);
  return {
    happiness: Math.round(per.happiness * min),
    affection: Math.round(per.affection * min),
    energy: Math.round(per.energy * min),
    cleanliness: Math.round(per.cleanliness * min),
  };
}

export function activityCoins(minutes: number): number {
  return Math.max(1, minutes) * 3;
}
