"use client";

// 게임 전역 상태 + 모든 돌봄 액션. 단일 소스(state)에서 관리하고
// localStorage 에 저장한다. UI 컴포넌트는 이 컨텍스트를 구독한다.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  DAILY_SNACK_SOFT_LIMIT,
  FOODS,
  FULLNESS_REFUSE_THRESHOLD,
  PET_COOLDOWN_MS,
  PET_REACTIONS,
  PET_SOFT_LIMIT,
  PET_SOFT_WINDOW_MS,
  SNACKS,
  STREAK_MILESTONES,
  createInitialState,
} from "@/lib/constants";
import { activityChanges, activityCoins } from "@/lib/effects";
import { clearState, loadState, saveState } from "@/lib/storage";
import {
  affectionLevel,
  applyElapsed,
  clamp,
} from "@/lib/status";
import type {
  ActivityLog,
  ActivityType,
  GameState,
  Pet,
  PetId,
  Settings,
  StatChanges,
  StatKey,
} from "@/lib/types";
import { dateKey, isYesterday, randomItem, uid } from "@/lib/utils";

export type ToastTone = "info" | "success" | "warn";
export type ToastItem = {
  id: string;
  message: string;
  emoji?: string;
  tone: ToastTone;
};

export type ActionResult = {
  ok: boolean;
  message?: string;
};

export type ActivityResult = {
  minutes: number;
  changes: StatChanges;
  coins: number;
  foundSnack: boolean;
};

export type TodayStats = {
  meals: number;
  snacks: number;
  pets: number;
  activityMinutes: number;
  sleepMinutes: number;
};

type GameContextValue = {
  ready: boolean;
  state: GameState;
  selectedPet: Pet;
  otherPet: Pet;
  pets: Pet[];
  toasts: ToastItem[];
  pushToast: (message: string, tone?: ToastTone, emoji?: string) => void;
  dismissToast: (id: string) => void;
  selectPet: (id: PetId) => void;
  strokePet: (petId: PetId) => void;
  feed: (petId: PetId, foodId: string) => ActionResult;
  giveSnack: (petId: PetId, snackId: string) => ActionResult;
  startSleep: (petId: PetId) => ActionResult;
  wake: (petId: PetId) => void;
  completeActivity: (
    petId: PetId,
    type: "walk" | "play",
    minutes: number
  ) => ActivityResult;
  wash: (petId: PetId) => ActionResult;
  takePhoto: (petId: PetId) => ActionResult;
  renamePet: (petId: PetId, name: string) => void;
  setSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  resetGame: () => void;
  finishOnboarding: () => void;
  todayStats: TodayStats;
  vibrate: (pattern?: number | number[]) => void;
  playSfx: (kind?: SfxKind) => void;
};

const GameContext = createContext<GameContextValue | null>(null);

type SfxKind = "tap" | "happy" | "eat" | "reward" | "error";

function applyChanges(pet: Pet, changes: StatChanges): Pet {
  const next: Pet = { ...pet };
  (Object.keys(changes) as StatKey[]).forEach((k) => {
    const delta = changes[k] ?? 0;
    next[k] = clamp((pet[k] as number) + delta);
  });
  next.affectionLevel = affectionLevel(next.affection);
  return next;
}

function makeLog(
  petId: PetId,
  type: ActivityType,
  message: string,
  changes: StatChanges,
  durationMin?: number
): ActivityLog {
  return {
    id: uid(),
    petId,
    type,
    message,
    createdAt: new Date().toISOString(),
    changes,
    durationMin,
  };
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState>(() => createInitialState());
  const [ready, setReady] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const stateRef = useRef(state);
  stateRef.current = state;

  // 쓰다듬기 쿨다운/연타 추적
  const lastStrokeRef = useRef(0);
  const strokeTimesRef = useRef<number[]>([]);
  // 오디오 컨텍스트 (효과음)
  const audioRef = useRef<AudioContext | null>(null);

  // ── 저장 & 커밋 ──────────────────────────────────────────
  const commit = useCallback((next: GameState) => {
    stateRef.current = next;
    setState(next);
    saveState(next);
  }, []);

  // ── 토스트 ──────────────────────────────────────────────
  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback(
    (message: string, tone: ToastTone = "info", emoji?: string) => {
      const id = uid();
      setToasts((prev) => [...prev.slice(-2), { id, message, tone, emoji }]);
      window.setTimeout(() => dismissToast(id), 2600);
    },
    [dismissToast]
  );

  // ── 효과음 & 진동 ───────────────────────────────────────
  const playSfx = useCallback((kind: SfxKind = "tap") => {
    const s = stateRef.current;
    if (!s.settings.sfx) return;
    try {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctor) return;
      if (!audioRef.current) audioRef.current = new Ctor();
      const ctx = audioRef.current;
      if (ctx.state === "suspended") void ctx.resume();
      const freqMap: Record<SfxKind, number[]> = {
        tap: [440],
        happy: [523, 660],
        eat: [330, 392],
        reward: [523, 660, 784],
        error: [220, 180],
      };
      const notes = freqMap[kind];
      notes.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = f;
        const t0 = ctx.currentTime + i * 0.09;
        gain.gain.setValueAtTime(0.0001, t0);
        gain.gain.exponentialRampToValueAtTime(0.08, t0 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.16);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t0);
        osc.stop(t0 + 0.18);
      });
    } catch {
      /* 오디오 미지원 환경은 조용히 무시 */
    }
  }, []);

  const vibrate = useCallback((pattern: number | number[] = 12) => {
    const s = stateRef.current;
    if (!s.settings.vibration) return;
    try {
      navigator.vibrate?.(pattern);
    } catch {
      /* noop */
    }
  }, []);

  // ── 하이드레이트 (localStorage 로드 + 경과시간 반영) ─────
  useEffect(() => {
    const loaded = loadState();
    const now = Date.now();
    const pets = {
      toto: applyElapsed(loaded.pets.toto, now),
      ppuni: applyElapsed(loaded.pets.ppuni, now),
    };
    const next: GameState = { ...loaded, pets };
    commit(next);
    setReady(true);
  }, [commit]);

  // ── 출석 체크 (돌봄 액션 시 호출) ───────────────────────
  const registerAttendance = useCallback((base: GameState): GameState => {
    const today = dateKey();
    const streak = base.streak;
    if (streak.lastCheckIn === today) return base;

    let count: number;
    let claimed = streak.claimedMilestones;
    if (streak.lastCheckIn && isYesterday(streak.lastCheckIn, today)) {
      count = streak.count + 1;
    } else {
      count = 1;
      claimed = []; // 연속이 끊기면 마일스톤 초기화
    }

    let inventory = base.inventory;
    const milestone = STREAK_MILESTONES.find(
      (m) => m.days === count && !claimed.includes(m.days)
    );
    if (milestone) {
      inventory = {
        snacks: inventory.snacks + milestone.snacks,
        coins: inventory.coins + milestone.coins,
      };
      claimed = [...claimed, milestone.days];
      // 토스트는 커밋 이후 별도로 알림
      window.setTimeout(
        () =>
          pushToast(
            `${count}일 연속 돌봄! 간식 ${milestone.snacks}개와 코인 ${milestone.coins}개를 받았어요.`,
            "success",
            "🎁"
          ),
        350
      );
    }

    return {
      ...base,
      inventory,
      streak: { count, lastCheckIn: today, claimedMilestones: claimed },
    };
  }, [pushToast]);

  // 잠들어 있는지 확인 후 안내
  const blockIfSleeping = useCallback(
    (pet: Pet): boolean => {
      if (pet.isSleeping) {
        pushToast(
          `${pet.name}은(는) 지금 자고 있어요. 먼저 깨워주세요.`,
          "warn",
          "😴"
        );
        return true;
      }
      return false;
    },
    [pushToast]
  );

  // 레벨업 감지 & 알림
  const notifyLevelUp = useCallback(
    (before: Pet, after: Pet) => {
      if (after.affectionLevel > before.affectionLevel) {
        window.setTimeout(() => {
          pushToast(
            `${after.name}와(과) 더 친해졌어요! 친밀도 Lv.${after.affectionLevel}`,
            "success",
            "💗"
          );
          playSfx("reward");
        }, 200);
      }
    },
    [pushToast, playSfx]
  );

  // ── 액션들 ──────────────────────────────────────────────
  const selectPet = useCallback(
    (id: PetId) => {
      const s = stateRef.current;
      if (s.selectedPetId === id) return;
      commit({ ...s, selectedPetId: id });
      vibrate(8);
    },
    [commit, vibrate]
  );

  const strokePet = useCallback(
    (petId: PetId) => {
      const s = stateRef.current;
      const pet = s.pets[petId];
      if (pet.isSleeping) return; // 자는 중엔 조용히 무시
      const now = Date.now();
      if (now - lastStrokeRef.current < PET_COOLDOWN_MS) return;
      lastStrokeRef.current = now;

      // 최근 연타 횟수 계산
      strokeTimesRef.current = strokeTimesRef.current
        .filter((t) => now - t < PET_SOFT_WINDOW_MS)
        .concat(now);
      const tooMuch = strokeTimesRef.current.length > PET_SOFT_LIMIT;

      const changes: StatChanges = tooMuch
        ? { happiness: 1, affection: 1 }
        : { happiness: 3, affection: 2 };

      const before = pet;
      const after: Pet = {
        ...applyChanges(pet, changes),
        totalPetCount: pet.totalPetCount + 1,
      };
      const reaction = tooMuch
        ? "(살짝 부끄러워하는 중…)"
        : randomItem(PET_REACTIONS[petId]);
      const log = makeLog(
        petId,
        "pet",
        `${after.name}를 쓰다듬었어요. ${reaction}`,
        changes
      );
      const next = registerAttendance({
        ...s,
        pets: { ...s.pets, [petId]: after },
        logs: [log, ...s.logs].slice(0, 200),
      });
      commit(next);
      notifyLevelUp(before, after);
      if (!tooMuch) {
        vibrate(10);
        playSfx("happy");
      }
    },
    [commit, notifyLevelUp, playSfx, registerAttendance, vibrate]
  );

  const feed = useCallback(
    (petId: PetId, foodId: string): ActionResult => {
      const s = stateRef.current;
      const pet = s.pets[petId];
      if (blockIfSleeping(pet)) return { ok: false };
      const food = FOODS.find((f) => f.id === foodId);
      if (!food) return { ok: false };
      if (pet.fullness >= FULLNESS_REFUSE_THRESHOLD) {
        pushToast(`${pet.name}은(는) 지금 배가 너무 불러요.`, "warn", "🥴");
        return { ok: false, message: "지금은 배가 너무 불러요." };
      }
      const changes: StatChanges = {
        fullness: food.fullness,
        energy: food.energy,
      };
      const before = pet;
      const after: Pet = {
        ...applyChanges(pet, changes),
        totalMealCount: pet.totalMealCount + 1,
      };
      const eatMsg =
        pet.species === "dog"
          ? `${after.name}가 맛있게 밥을 먹고 있어요.`
          : `${after.name}는 천천히 밥을 먹는 중이에요.`;
      const log = makeLog(petId, "meal", eatMsg, changes);
      const next = registerAttendance({
        ...s,
        pets: { ...s.pets, [petId]: after },
        logs: [log, ...s.logs].slice(0, 200),
      });
      commit(next);
      notifyLevelUp(before, after);
      pushToast(eatMsg, "success", food.emoji);
      vibrate(14);
      playSfx("eat");
      return { ok: true };
    },
    [blockIfSleeping, commit, notifyLevelUp, playSfx, pushToast, registerAttendance, vibrate]
  );

  const giveSnack = useCallback(
    (petId: PetId, snackId: string): ActionResult => {
      const s = stateRef.current;
      const pet = s.pets[petId];
      if (blockIfSleeping(pet)) return { ok: false };
      const snack = SNACKS.find((sn) => sn.id === snackId);
      if (!snack) return { ok: false };

      // 동물별 적합성 확인
      if (!snack.for.includes(pet.species)) {
        const msg =
          pet.species === "dog"
            ? `이 간식은 ${pet.name}가 먹을 수 없어요.`
            : `${pet.name}에게는 다른 간식을 골라주세요.`;
        pushToast(msg, "warn", "🙅");
        playSfx("error");
        return { ok: false, message: msg };
      }
      if (s.inventory.snacks <= 0) {
        pushToast(
          "보유한 간식이 없어요. 산책이나 놀이로 모아보세요!",
          "warn",
          "📭"
        );
        return { ok: false, message: "간식이 부족해요." };
      }

      // 하루 간식 과다 여부
      const today = dateKey();
      const todaySnacks = s.logs.filter(
        (l) =>
          l.petId === petId &&
          l.type === "snack" &&
          dateKey(l.createdAt) === today
      ).length;
      const overLimit = todaySnacks >= DAILY_SNACK_SOFT_LIMIT;

      const changes: StatChanges = overLimit
        ? { happiness: 3, affection: 2, fullness: 8 }
        : { happiness: 9, affection: 4, fullness: 10 };

      const before = pet;
      const after: Pet = {
        ...applyChanges(pet, changes),
        totalSnackCount: pet.totalSnackCount + 1,
      };
      const msg = `${after.name}에게 ${snack.name}을(를) 줬어요.`;
      const log = makeLog(petId, "snack", msg, changes);
      const next = registerAttendance({
        ...s,
        pets: { ...s.pets, [petId]: after },
        inventory: { ...s.inventory, snacks: s.inventory.snacks - 1 },
        logs: [log, ...s.logs].slice(0, 200),
      });
      commit(next);
      notifyLevelUp(before, after);
      if (overLimit) {
        pushToast("간식은 오늘 충분히 먹었어요.", "warn", snack.emoji);
      } else {
        pushToast(msg, "success", snack.emoji);
      }
      vibrate(12);
      playSfx("happy");
      return { ok: true };
    },
    [blockIfSleeping, commit, notifyLevelUp, playSfx, pushToast, registerAttendance, vibrate]
  );

  const startSleep = useCallback(
    (petId: PetId): ActionResult => {
      const s = stateRef.current;
      const pet = s.pets[petId];
      if (pet.isSleeping) return { ok: false };
      const after: Pet = {
        ...pet,
        isSleeping: true,
        sleepStartedAt: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString(),
      };
      commit({ ...s, pets: { ...s.pets, [petId]: after } });
      pushToast(`${pet.name}가 잠들었어요. 푹 쉬고 나면 체력이 회복돼요.`, "info", "🌙");
      vibrate(10);
      return { ok: true };
    },
    [commit, pushToast, vibrate]
  );

  const wake = useCallback(
    (petId: PetId) => {
      const s = stateRef.current;
      const pet = applyElapsed(s.pets[petId], Date.now());
      if (!pet.isSleeping) {
        commit({ ...s, pets: { ...s.pets, [petId]: pet } });
        return;
      }
      const sleptMin = pet.sleepStartedAt
        ? Math.round(
            (Date.now() - new Date(pet.sleepStartedAt).getTime()) / 60000
          )
        : 0;
      const after: Pet = {
        ...pet,
        isSleeping: false,
        sleepStartedAt: null,
      };
      const log = makeLog(
        petId,
        "sleep",
        `${after.name}가 ${sleptMin}분 동안 잘 쉬었어요.`,
        { energy: 0 },
        sleptMin
      );
      const next = registerAttendance({
        ...s,
        pets: { ...s.pets, [petId]: after },
        logs: [log, ...s.logs].slice(0, 200),
      });
      commit(next);
      pushToast(`${after.name}가 개운하게 일어났어요!`, "success", "☀️");
      vibrate(10);
    },
    [commit, pushToast, registerAttendance, vibrate]
  );

  const completeActivity = useCallback(
    (petId: PetId, type: "walk" | "play", minutes: number): ActivityResult => {
      const s = stateRef.current;
      const pet = s.pets[petId];
      const min = Math.max(1, minutes);

      const changes: StatChanges = activityChanges(type, min);
      const coins = activityCoins(min);
      const foundSnack = Math.random() < 0.4;

      const before = pet;
      const after: Pet = {
        ...applyChanges(pet, changes),
        totalActivityMinutes: pet.totalActivityMinutes + min,
      };
      const label =
        type === "walk"
          ? `${after.name}와 ${min}분 동안 산책했어요.`
          : `${after.name}와 ${min}분 동안 놀았어요.`;
      const log = makeLog(petId, type, label, changes, min);
      const next = registerAttendance({
        ...s,
        pets: { ...s.pets, [petId]: after },
        inventory: {
          snacks: s.inventory.snacks + (foundSnack ? 1 : 0),
          coins: s.inventory.coins + coins,
        },
        logs: [log, ...s.logs].slice(0, 200),
      });
      commit(next);
      notifyLevelUp(before, after);
      playSfx("reward");
      vibrate([12, 40, 12]);
      return { minutes: min, changes, coins, foundSnack };
    },
    [commit, notifyLevelUp, playSfx, registerAttendance, vibrate]
  );

  const wash = useCallback(
    (petId: PetId): ActionResult => {
      const s = stateRef.current;
      const pet = s.pets[petId];
      if (blockIfSleeping(pet)) return { ok: false };
      const changes: StatChanges = { cleanliness: 30, happiness: 3 };
      const before = pet;
      const after = applyChanges(pet, changes);
      const log = makeLog(
        petId,
        "wash",
        `${after.name}를 깨끗하게 씻겨줬어요.`,
        changes
      );
      const next = registerAttendance({
        ...s,
        pets: { ...s.pets, [petId]: after },
        logs: [log, ...s.logs].slice(0, 200),
      });
      commit(next);
      notifyLevelUp(before, after);
      pushToast(`${after.name}가 보송보송해졌어요!`, "success", "🫧");
      vibrate(12);
      playSfx("happy");
      return { ok: true };
    },
    [blockIfSleeping, commit, notifyLevelUp, playSfx, pushToast, registerAttendance, vibrate]
  );

  const takePhoto = useCallback(
    (petId: PetId): ActionResult => {
      const s = stateRef.current;
      const pet = s.pets[petId];
      if (blockIfSleeping(pet)) return { ok: false };
      const changes: StatChanges = { happiness: 5 };
      const after = applyChanges(pet, changes);
      const log = makeLog(
        petId,
        "photo",
        `${after.name}의 귀여운 순간을 사진으로 남겼어요.`,
        changes
      );
      const next = registerAttendance({
        ...s,
        pets: { ...s.pets, [petId]: after },
        logs: [log, ...s.logs].slice(0, 200),
      });
      commit(next);
      pushToast("찰칵! 멋진 사진이 나왔어요.", "success", "📸");
      vibrate(10);
      playSfx("tap");
      return { ok: true };
    },
    [blockIfSleeping, commit, playSfx, pushToast, registerAttendance, vibrate]
  );

  const renamePet = useCallback(
    (petId: PetId, name: string) => {
      const s = stateRef.current;
      const trimmed = name.trim().slice(0, 12) || s.pets[petId].name;
      commit({
        ...s,
        pets: { ...s.pets, [petId]: { ...s.pets[petId], name: trimmed } },
      });
      pushToast("이름을 변경했어요.", "success", "✏️");
    },
    [commit, pushToast]
  );

  const setSetting = useCallback(
    <K extends keyof Settings>(key: K, value: Settings[K]) => {
      const s = stateRef.current;
      commit({ ...s, settings: { ...s.settings, [key]: value } });
    },
    [commit]
  );

  const resetGame = useCallback(() => {
    clearState();
    const fresh = createInitialState();
    fresh.onboarded = true; // 초기화 후엔 온보딩 재노출 안 함
    commit(fresh);
    pushToast("모든 데이터를 초기화했어요.", "info", "🔄");
  }, [commit, pushToast]);

  const finishOnboarding = useCallback(() => {
    const s = stateRef.current;
    commit({ ...s, onboarded: true });
  }, [commit]);

  // ── 시간 경과 틱 (수면 자동완료 포함) ───────────────────
  useEffect(() => {
    if (!ready) return;
    const tick = () => {
      const s = stateRef.current;
      const now = Date.now();
      let changed = false;
      const petsNext = { ...s.pets };
      (Object.keys(petsNext) as PetId[]).forEach((id) => {
        const updated = applyElapsed(petsNext[id], now);
        // 수면 자동 완료 (체력 100 도달)
        if (updated.isSleeping && updated.energy >= 100) {
          const sleptMin = updated.sleepStartedAt
            ? Math.round(
                (now - new Date(updated.sleepStartedAt).getTime()) / 60000
              )
            : 0;
          petsNext[id] = {
            ...updated,
            isSleeping: false,
            sleepStartedAt: null,
          };
          window.setTimeout(
            () =>
              pushToast(
                `${updated.name}가 체력을 모두 회복했어요!`,
                "success",
                "🌤️"
              ),
            0
          );
          void sleptMin;
          changed = true;
        } else if (
          updated.fullness !== petsNext[id].fullness ||
          updated.happiness !== petsNext[id].happiness ||
          updated.energy !== petsNext[id].energy ||
          updated.cleanliness !== petsNext[id].cleanliness ||
          updated.lastUpdatedAt !== petsNext[id].lastUpdatedAt
        ) {
          petsNext[id] = updated;
          changed = true;
        }
      });
      if (changed) commit({ ...s, pets: petsNext });
    };
    const interval = window.setInterval(tick, 15000);
    const onVisible = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [ready, commit, pushToast]);

  // ── 오늘의 기록 집계 ────────────────────────────────────
  const todayStats = useMemo<TodayStats>(() => {
    const today = dateKey();
    const todays = state.logs.filter((l) => dateKey(l.createdAt) === today);
    return {
      meals: todays.filter((l) => l.type === "meal").length,
      snacks: todays.filter((l) => l.type === "snack").length,
      pets: todays.filter((l) => l.type === "pet").length,
      activityMinutes: todays
        .filter((l) => l.type === "walk" || l.type === "play")
        .reduce((a, l) => a + (l.durationMin ?? 0), 0),
      sleepMinutes: todays
        .filter((l) => l.type === "sleep")
        .reduce((a, l) => a + (l.durationMin ?? 0), 0),
    };
  }, [state.logs]);

  const value = useMemo<GameContextValue>(
    () => ({
      ready,
      state,
      selectedPet: state.pets[state.selectedPetId],
      otherPet:
        state.pets[state.selectedPetId === "toto" ? "ppuni" : "toto"],
      pets: [state.pets.toto, state.pets.ppuni],
      toasts,
      pushToast,
      dismissToast,
      selectPet,
      strokePet,
      feed,
      giveSnack,
      startSleep,
      wake,
      completeActivity,
      wash,
      takePhoto,
      renamePet,
      setSetting,
      resetGame,
      finishOnboarding,
      todayStats,
      vibrate,
      playSfx,
    }),
    [
      ready,
      state,
      toasts,
      pushToast,
      dismissToast,
      selectPet,
      strokePet,
      feed,
      giveSnack,
      startSleep,
      wake,
      completeActivity,
      wash,
      takePhoto,
      renamePet,
      setSetting,
      resetGame,
      finishOnboarding,
      todayStats,
      vibrate,
      playSfx,
    ]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
