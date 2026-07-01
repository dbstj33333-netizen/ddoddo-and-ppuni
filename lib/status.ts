// 상태값 유틸: 클램프, 시간 경과 반영, 라벨/색상/문구, 친밀도 레벨

import {
  AFFECTION_LEVEL_STEP,
  DECAY_PER_MIN,
  SLEEP_ENERGY_RECOVERY_PER_MIN,
  SLEEP_FULLNESS_DECAY_PER_MIN,
  STAT_FLOORS,
} from "./constants";
import type { Pet, StatKey } from "./types";

// 항상 0~100 사이로 제한
export function clamp(v: number, min = 0, max = 100): number {
  if (Number.isNaN(v)) return min;
  return Math.min(max, Math.max(min, v));
}

// 하한선(floor)을 존중하는 감소: 이미 floor 아래면 그대로 둠
function decayWithFloor(current: number, amount: number, floor: number): number {
  const next = current - amount;
  if (current <= floor) return current; // 이미 하한 이하면 더 내리지 않음
  return Math.max(floor, next);
}

// 마지막 갱신 시각과 현재 시각을 비교해 상태를 갱신한 새 Pet 반환
export function applyElapsed(pet: Pet, nowMs: number): Pet {
  const last = new Date(pet.lastUpdatedAt).getTime();
  const elapsedMin = (nowMs - last) / 60000;
  if (!Number.isFinite(elapsedMin) || elapsedMin <= 0) {
    return { ...pet, lastUpdatedAt: new Date(nowMs).toISOString() };
  }

  let { fullness, happiness, energy, cleanliness } = pet;

  if (pet.isSleeping) {
    energy = clamp(energy + elapsedMin * SLEEP_ENERGY_RECOVERY_PER_MIN);
    fullness = decayWithFloor(
      fullness,
      elapsedMin * SLEEP_FULLNESS_DECAY_PER_MIN,
      STAT_FLOORS.fullness
    );
  } else {
    fullness = decayWithFloor(
      fullness,
      elapsedMin * DECAY_PER_MIN.fullness,
      STAT_FLOORS.fullness
    );
    happiness = decayWithFloor(
      happiness,
      elapsedMin * DECAY_PER_MIN.happiness,
      STAT_FLOORS.happiness
    );
    energy = decayWithFloor(
      energy,
      elapsedMin * DECAY_PER_MIN.energy,
      STAT_FLOORS.energy
    );
    cleanliness = decayWithFloor(
      cleanliness,
      elapsedMin * DECAY_PER_MIN.cleanliness,
      STAT_FLOORS.cleanliness
    );
  }

  return {
    ...pet,
    fullness: Math.round(fullness),
    happiness: Math.round(happiness),
    energy: Math.round(energy),
    cleanliness: Math.round(cleanliness),
    lastUpdatedAt: new Date(nowMs).toISOString(),
  };
}

// 수면이 완료(체력 100 도달)되었는지
export function isSleepComplete(pet: Pet): boolean {
  return pet.isSleeping && pet.energy >= 100;
}

// 상태 등급
export type StatGrade = "great" | "good" | "warn" | "low";

export function gradeOf(value: number): StatGrade {
  if (value >= 80) return "great";
  if (value >= 50) return "good";
  if (value >= 20) return "warn";
  return "low";
}

export const GRADE_LABEL: Record<StatGrade, string> = {
  great: "매우 좋음",
  good: "보통",
  warn: "관리 필요",
  low: "매우 부족",
};

// 등급별 색상 (진행 바 채움색)
export const GRADE_COLOR: Record<StatGrade, string> = {
  great: "#8FCB9B",
  good: "#F3C969",
  warn: "#F4A988",
  low: "#E88B7D",
};

// 자연스러운 상태 문구 (스탯 + 값 기준)
export function statPhrase(stat: StatKey, value: number): string {
  const g = gradeOf(value);
  const table: Record<StatKey, Record<StatGrade, string>> = {
    fullness: {
      great: "배가 든든해 보여요.",
      good: "적당히 배가 불러요.",
      warn: "조금 배가 고픈 것 같아요.",
      low: "배에서 꼬르륵 소리가 나는 것 같아요.",
    },
    happiness: {
      great: "아주 신이 났어요!",
      good: "기분이 나쁘지 않아요.",
      warn: "조금 심심한 것 같아요.",
      low: "같이 놀아주면 기분이 좋아질 거예요.",
    },
    energy: {
      great: "기운이 넘쳐요!",
      good: "컨디션이 괜찮아요.",
      warn: "조금 피곤해 보여요.",
      low: "피곤해서 쉬고 싶어 해요.",
    },
    cleanliness: {
      great: "깨끗하고 보송보송해요.",
      good: "아직 깔끔한 편이에요.",
      warn: "슬슬 씻을 때가 됐어요.",
      low: "씻겨주면 더 상쾌해질 것 같아요.",
    },
    affection: {
      great: "당신을 아주 좋아해요!",
      good: "점점 친해지고 있어요.",
      warn: "조금 더 함께 시간을 보내볼까요?",
      low: "아직 서로 알아가는 중이에요.",
    },
  };
  return table[stat][g];
}

// 친밀도 레벨 (1~5)
export function affectionLevel(affection: number): number {
  return Math.min(5, Math.floor(clamp(affection) / AFFECTION_LEVEL_STEP) + 1);
}

// 다음 레벨까지 남은 수치 (최고 레벨이면 0)
export function affectionToNext(affection: number): number {
  const lvl = affectionLevel(affection);
  if (lvl >= 5) return 0;
  return lvl * AFFECTION_LEVEL_STEP - clamp(affection);
}

// 현재 레벨 구간 내 진행률 0~1
export function affectionProgress(affection: number): number {
  const lvl = affectionLevel(affection);
  if (lvl >= 5) return 1;
  const start = (lvl - 1) * AFFECTION_LEVEL_STEP;
  return (clamp(affection) - start) / AFFECTION_LEVEL_STEP;
}

// 시간대 인사말
export function greeting(date = new Date()): string {
  const h = date.getHours();
  if (h >= 5 && h < 11) return "좋은 아침이에요!";
  if (h >= 11 && h < 18) return "오늘도 또또와 쁘니를 돌봐주세요.";
  return "또또와 쁘니가 편안한 밤을 보내고 있어요.";
}

// 시간대 구분 (배경 연출용)
export function timeOfDay(date = new Date()): "morning" | "day" | "night" {
  const h = date.getHours();
  if (h >= 5 && h < 11) return "morning";
  if (h >= 11 && h < 18) return "day";
  return "night";
}
