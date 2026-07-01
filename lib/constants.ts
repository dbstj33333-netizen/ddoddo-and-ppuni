// 게임 밸런스 상수, 초기 데이터, 콘텐츠 목록

import type { GameState, Pet, PetId, Species, StatKey } from "./types";

export const STORAGE_KEY = "ddoddo-ppuni-state";
export const STATE_VERSION = 1;

// 상태 감소/회복 속도 (분당)
export const DECAY_PER_MIN = {
  fullness: 0.13,
  happiness: 0.07,
  energy: 0.08,
  cleanliness: 0.09,
};

// 수면 중 회복/감소 (분당)
export const SLEEP_ENERGY_RECOVERY_PER_MIN = 1.0;
export const SLEEP_FULLNESS_DECAY_PER_MIN = 0.05;

// 오랜만에 접속해도 너무 낮아지지 않도록 하는 하한선
export const STAT_FLOORS = {
  fullness: 15,
  happiness: 20,
  energy: 5,
  cleanliness: 20,
};

// 쓰다듬기 쿨다운 (ms) — 너무 연속으로 하면 반응이 줄어듦
export const PET_COOLDOWN_MS = 900;
export const PET_SOFT_LIMIT = 8; // 짧은 시간 안에 이 횟수 넘으면 효과 감소
export const PET_SOFT_WINDOW_MS = 12000;

// 하루 간식 제한 (초과 시 효과 감소)
export const DAILY_SNACK_SOFT_LIMIT = 3;

// 밥을 거부하는 포만감 기준
export const FULLNESS_REFUSE_THRESHOLD = 90;

// 연속 돌봄 보상 마일스톤
export const STREAK_MILESTONES: { days: number; snacks: number; coins: number }[] =
  [
    { days: 3, snacks: 2, coins: 20 },
    { days: 7, snacks: 4, coins: 50 },
    { days: 14, snacks: 8, coins: 120 },
  ];

// 친밀도 레벨 (0~100 을 5단계로)
export const AFFECTION_LEVEL_NAMES = [
  "처음 만난 사이",
  "조금 친해진 사이",
  "편안한 친구",
  "가장 좋아하는 사람",
  "평생 가족",
];
export const AFFECTION_LEVEL_STEP = 20; // 레벨당 필요 수치

export type SnackDef = {
  id: string;
  name: string;
  emoji: string;
  for: Species[];
};

export const SNACKS: SnackDef[] = [
  { id: "dog_cookie", name: "강아지 쿠키", emoji: "🍪", for: ["dog"] },
  { id: "churu", name: "고양이 츄르", emoji: "🐟", for: ["cat"] },
  { id: "milk", name: "우유", emoji: "🥛", for: ["dog", "cat"] },
  { id: "fish_snack", name: "생선 간식", emoji: "🐠", for: ["cat"] },
  { id: "cake", name: "작은 케이크", emoji: "🍰", for: ["dog"] },
];

export type FoodDef = {
  id: string;
  name: string;
  emoji: string;
  fullness: number;
  energy: number;
};

export const FOODS: FoodDef[] = [
  { id: "basic", name: "기본 사료", emoji: "🍚", fullness: 30, energy: 5 },
  { id: "hearty", name: "든든한 사료", emoji: "🍲", fullness: 40, energy: 8 },
];

// 활동 시간 선택지 (테스트가 쉽도록 짧게)
export const ACTIVITY_DURATIONS = [1, 3, 5];

// 상태 표시 메타 (아이콘/라벨)
export const STAT_META: Record<
  StatKey,
  { label: string; emoji: string; color: string }
> = {
  fullness: { label: "포만감", emoji: "🍚", color: "#F4A988" },
  happiness: { label: "행복도", emoji: "💛", color: "#F3C969" },
  energy: { label: "체력", emoji: "⚡", color: "#8FB9DE" },
  cleanliness: { label: "청결도", emoji: "🫧", color: "#A8D8B9" },
  affection: { label: "친밀도", emoji: "💗", color: "#E79CB3" },
};

export const HOME_STAT_ORDER: StatKey[] = [
  "fullness",
  "happiness",
  "energy",
  "cleanliness",
  "affection",
];

// 홈 화면 랜덤 말풍선
export const RANDOM_SPEECH: Record<PetId, string[]> = {
  toto: [
    "나랑 놀아줘!",
    "산책 가고 싶어!",
    "쓰다듬어 주면 기분이 좋아져!",
    "배가 조금 고픈 것 같아.",
  ],
  ppuni: [
    "간식은 아직이야?",
    "조금만 만져도 괜찮아.",
    "졸려서 눈이 감겨.",
    "쁘니는 지금 기분이 좋아.",
  ],
};

// 쓰다듬기 반응 문구
export const PET_REACTIONS: Record<PetId, string[]> = {
  toto: ["좋아!", "조금 더 해줘!", "헤헤, 기분 최고!"],
  ppuni: ["이번만 특별히 허락할게.", "나쁘지 않네.", "고롱고롱…"],
};

const now = () => new Date().toISOString();

function makePet(
  id: PetId,
  name: string,
  species: Species,
  init: { fullness: number; happiness: number; energy: number; cleanliness: number; affection: number }
): Pet {
  return {
    id,
    name,
    species,
    ...init,
    affectionLevel: Math.min(
      5,
      Math.floor(init.affection / AFFECTION_LEVEL_STEP) + 1
    ),
    isSleeping: false,
    sleepStartedAt: null,
    lastUpdatedAt: now(),
    totalPetCount: 0,
    totalMealCount: 0,
    totalSnackCount: 0,
    totalActivityMinutes: 0,
  };
}

export const DEFAULT_NAMES: Record<PetId, string> = {
  toto: "또또",
  ppuni: "쁘니",
};

export function createInitialState(): GameState {
  return {
    version: STATE_VERSION,
    pets: {
      toto: makePet("toto", DEFAULT_NAMES.toto, "dog", {
        fullness: 70,
        happiness: 75,
        energy: 80,
        cleanliness: 85,
        affection: 10,
      }),
      ppuni: makePet("ppuni", DEFAULT_NAMES.ppuni, "cat", {
        fullness: 65,
        happiness: 70,
        energy: 85,
        cleanliness: 90,
        affection: 10,
      }),
    },
    logs: [],
    inventory: { snacks: 5, coins: 0 },
    settings: { bgm: false, sfx: true, vibration: true, notifications: true },
    streak: { count: 0, lastCheckIn: null, claimedMilestones: [] },
    onboarded: false,
    selectedPetId: "toto",
  };
}

// 배포 하위 경로 접두사 (GitHub Pages 등). 로컬은 빈 문자열.
export const ASSET_PREFIX = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// public 자산 경로에 배포 접두사를 붙인다.
export function assetPath(path: string): string {
  return `${ASSET_PREFIX}${path}`;
}

// 캐릭터 이미지 경로 (상태별). 파일만 교체하면 됨.
export type PetImageState =
  | "default"
  | "happy"
  | "eating"
  | "sleeping"
  | "walking"
  | "playing"
  | "bad";

export function petImagePath(id: PetId, state: PetImageState): string {
  return `${ASSET_PREFIX}/images/pets/${id}-${state}.png`;
}
