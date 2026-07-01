// localStorage 안전 읽기/쓰기. 손상/형식 불일치 시 초기값으로 복구.

import { STORAGE_KEY } from "./constants";
import { createInitialState } from "./constants";
import type { GameState, Pet, PetId } from "./types";

function isNumber(v: unknown): v is number {
  return typeof v === "number" && !Number.isNaN(v);
}

function coercePet(id: PetId, raw: unknown, fallback: Pet): Pet {
  if (!raw || typeof raw !== "object") return { ...fallback };
  const r = raw as Record<string, unknown>;
  const num = (k: keyof Pet, min = 0, max = 100): number => {
    const v = r[k];
    return isNumber(v) ? Math.min(max, Math.max(min, v)) : (fallback[k] as number);
  };
  return {
    id,
    name: typeof r.name === "string" && r.name.trim() ? r.name : fallback.name,
    species: fallback.species,
    fullness: num("fullness"),
    happiness: num("happiness"),
    energy: num("energy"),
    cleanliness: num("cleanliness"),
    affection: num("affection"),
    affectionLevel: isNumber(r.affectionLevel)
      ? Math.min(5, Math.max(1, r.affectionLevel))
      : fallback.affectionLevel,
    isSleeping: typeof r.isSleeping === "boolean" ? r.isSleeping : false,
    sleepStartedAt:
      typeof r.sleepStartedAt === "string" ? r.sleepStartedAt : null,
    lastUpdatedAt:
      typeof r.lastUpdatedAt === "string"
        ? r.lastUpdatedAt
        : new Date().toISOString(),
    totalPetCount: isNumber(r.totalPetCount) ? r.totalPetCount : 0,
    totalMealCount: isNumber(r.totalMealCount) ? r.totalMealCount : 0,
    totalSnackCount: isNumber(r.totalSnackCount) ? r.totalSnackCount : 0,
    totalActivityMinutes: isNumber(r.totalActivityMinutes)
      ? r.totalActivityMinutes
      : 0,
  };
}

// 저장된 값이 있으면 초기값과 병합하여 누락 필드를 안전하게 채운다.
export function loadState(): GameState {
  const base = createInitialState();
  if (typeof window === "undefined") return base;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return base;
    const p = parsed as Partial<GameState>;

    const petsRaw = (p.pets ?? {}) as Record<string, unknown>;
    const pets = {
      toto: coercePet("toto", petsRaw.toto, base.pets.toto),
      ppuni: coercePet("ppuni", petsRaw.ppuni, base.pets.ppuni),
    };

    const logs = Array.isArray(p.logs)
      ? (p.logs.filter(
          (l) =>
            l &&
            typeof l === "object" &&
            typeof (l as Record<string, unknown>).id === "string"
        ) as GameState["logs"]).slice(0, 200)
      : [];

    return {
      version: STATE_VERSION_SAFE(p.version, base.version),
      pets,
      logs,
      inventory: {
        snacks: isNumber(p.inventory?.snacks)
          ? Math.max(0, p.inventory!.snacks)
          : base.inventory.snacks,
        coins: isNumber(p.inventory?.coins)
          ? Math.max(0, p.inventory!.coins)
          : base.inventory.coins,
      },
      settings: {
        bgm: bool(p.settings?.bgm, base.settings.bgm),
        sfx: bool(p.settings?.sfx, base.settings.sfx),
        vibration: bool(p.settings?.vibration, base.settings.vibration),
        notifications: bool(
          p.settings?.notifications,
          base.settings.notifications
        ),
      },
      streak: {
        count: isNumber(p.streak?.count) ? Math.max(0, p.streak!.count) : 0,
        lastCheckIn:
          typeof p.streak?.lastCheckIn === "string"
            ? p.streak!.lastCheckIn
            : null,
        claimedMilestones: Array.isArray(p.streak?.claimedMilestones)
          ? p.streak!.claimedMilestones.filter(isNumber)
          : [],
      },
      onboarded: bool(p.onboarded, false),
      selectedPetId:
        p.selectedPetId === "ppuni" || p.selectedPetId === "toto"
          ? p.selectedPetId
          : "toto",
    };
  } catch {
    // JSON 파싱 실패 등 손상 시 초기값으로 안전 복구
    return base;
  }
}

function STATE_VERSION_SAFE(v: unknown, fallback: number): number {
  return isNumber(v) ? v : fallback;
}
function bool(v: unknown, fallback: boolean): boolean {
  return typeof v === "boolean" ? v : fallback;
}

export function saveState(state: GameState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // 저장 공간 부족 등은 조용히 무시 (앱은 계속 동작)
  }
}

export function clearState(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* noop */
  }
}
