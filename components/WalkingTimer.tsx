"use client";

// 산책(또또)/놀이(쁘니) 활동 화면. 시간 선택 → 타이머 → 결과.
import { useEffect, useRef, useState } from "react";
import type { ActivityResult } from "@/context/GameContext";
import { ACTIVITY_DURATIONS, STAT_META } from "@/lib/constants";
import { activityChanges, activityCoins } from "@/lib/effects";
import type { Pet, StatChanges, StatKey } from "@/lib/types";
import { formatDuration } from "@/lib/utils";
import PetCharacter from "./PetCharacter";

type Phase = "select" | "running" | "done";

export default function WalkingTimer({
  pet,
  type,
  onComplete,
  onClose,
}: {
  pet: Pet;
  type: "walk" | "play";
  onComplete: (minutes: number) => ActivityResult;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("select");
  const [minutes, setMinutes] = useState(1);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [result, setResult] = useState<ActivityResult | null>(null);
  const finishedRef = useRef(false);

  const isWalk = type === "walk";
  const title = isWalk ? `${pet.name} 산책` : `${pet.name}와 놀기`;
  const preview = activityChanges(type, minutes);
  const previewCoins = activityCoins(minutes);

  // 타이머
  useEffect(() => {
    if (phase !== "running") return;
    if (secondsLeft <= 0) {
      if (!finishedRef.current) {
        finishedRef.current = true;
        setResult(onComplete(minutes));
        setPhase("done");
      }
      return;
    }
    const id = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [phase, secondsLeft, minutes, onComplete]);

  const start = () => {
    finishedRef.current = false;
    setSecondsLeft(minutes * 60);
    setPhase("running");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-5">
      <div className="absolute inset-0 bg-cocoa/40 animate-fade-in" aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-card shadow-2xl animate-slide-up"
      >
        {/* 배경 장면 */}
        <div
          className={`relative h-44 bg-gradient-to-b ${
            isWalk ? "from-sage/40 to-butter-soft" : "from-toto-soft to-butter-soft"
          }`}
        >
          <div className="absolute left-4 top-3 text-2xl" aria-hidden>
            {isWalk ? "🌳" : "🪟"}
          </div>
          <div className="absolute right-4 top-3 text-2xl" aria-hidden>
            {isWalk ? "☁️" : "🧸"}
          </div>
          <div
            className={`absolute bottom-2 left-1/2 -translate-x-1/2 ${
              phase === "running" ? "animate-bob" : ""
            }`}
          >
            <PetCharacter
              pet={pet}
              state={isWalk ? "walking" : "playing"}
              size="md"
            />
          </div>
        </div>

        <div className="p-5">
          <h2 className="font-display text-xl text-cocoa">{title}</h2>

          {phase === "select" && (
            <div className="mt-3">
              <p className="text-sm text-cocoa-soft">
                {isWalk
                  ? "또또와 함께 가볍게 걸어요."
                  : "쁘니와 창가 구경하며 놀아요."}
              </p>
              <p className="mt-3 mb-2 text-sm font-bold text-cocoa">
                활동 시간 선택
              </p>
              <div className="flex gap-2">
                {ACTIVITY_DURATIONS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMinutes(m)}
                    className={`no-tap-highlight flex-1 rounded-2xl py-3 text-sm font-bold transition active:scale-95 ${
                      minutes === m
                        ? "bg-sage-deep text-white"
                        : "bg-cream-deep text-cocoa-soft"
                    }`}
                  >
                    {m}분
                  </button>
                ))}
              </div>

              <RewardPreview changes={preview} coins={previewCoins} />

              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="no-tap-highlight flex-1 rounded-2xl bg-cream-deep py-3 text-sm font-bold text-cocoa-soft transition active:scale-95"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={start}
                  className="no-tap-highlight flex-[2] rounded-2xl bg-sage-deep py-3 text-sm font-bold text-white transition active:scale-95"
                >
                  {isWalk ? "산책 시작" : "놀이 시작"}
                </button>
              </div>
            </div>
          )}

          {phase === "running" && (
            <div className="mt-3 text-center">
              <p className="text-sm text-cocoa-soft">
                {isWalk ? "즐겁게 산책하는 중…" : "신나게 노는 중…"}
              </p>
              <p
                className="my-3 font-display text-5xl tabular-nums text-cocoa"
                aria-live="polite"
              >
                {formatClock(secondsLeft)}
              </p>
              <RewardPreview changes={preview} coins={previewCoins} label="완료 시 보상" />
              <button
                type="button"
                onClick={onClose}
                className="no-tap-highlight mt-4 w-full rounded-2xl bg-apricot/30 py-3 text-sm font-bold text-cocoa transition active:scale-95"
              >
                중단하기
              </button>
              <p className="mt-2 text-xs text-cocoa-faint">
                중단하면 보상을 받지 못해요.
              </p>
            </div>
          )}

          {phase === "done" && result && (
            <div className="mt-3 text-center">
              <p className="text-4xl">🎉</p>
              <p className="mt-2 text-sm font-bold text-cocoa">
                {formatDuration(result.minutes * 60)} 활동 완료!
              </p>
              <div className="mt-3 space-y-1 rounded-2xl bg-cream px-4 py-3 text-left text-sm">
                {(Object.keys(result.changes) as StatKey[]).map((k) => (
                  <ChangeRow key={k} stat={k} value={result.changes[k] ?? 0} />
                ))}
                <div className="flex items-center justify-between">
                  <span className="text-cocoa-soft">🪙 코인</span>
                  <span className="font-bold text-cocoa">+{result.coins}</span>
                </div>
              </div>
              {result.foundSnack && (
                <p className="mt-3 rounded-2xl bg-butter/50 px-3 py-2 text-sm font-medium text-cocoa">
                  🍪 산책 중에 간식을 발견했어요! (+1)
                </p>
              )}
              <button
                type="button"
                onClick={onClose}
                className="no-tap-highlight mt-4 w-full rounded-2xl bg-sage-deep py-3 text-sm font-bold text-white transition active:scale-95"
              >
                돌아가기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatClock(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function RewardPreview({
  changes,
  coins,
  label = "예상 보상",
}: {
  changes: StatChanges;
  coins: number;
  label?: string;
}) {
  const keys = Object.keys(changes) as StatKey[];
  return (
    <div className="mt-3 rounded-2xl bg-cream px-4 py-3 text-left">
      <p className="mb-1 text-xs font-bold text-cocoa-soft">{label}</p>
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
        {keys.map((k) => (
          <span key={k} className="text-cocoa">
            {STAT_META[k].label}{" "}
            <b className={((changes[k] ?? 0) >= 0 ? "text-sage-deep" : "text-apricot-deep")}>
              {(changes[k] ?? 0) >= 0 ? "+" : ""}
              {changes[k]}
            </b>
          </span>
        ))}
        <span className="text-cocoa">
          코인 <b className="text-sage-deep">+{coins}</b>
        </span>
      </div>
    </div>
  );
}

function ChangeRow({ stat, value }: { stat: StatKey; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-cocoa-soft">
        {STAT_META[stat].emoji} {STAT_META[stat].label}
      </span>
      <span
        className={`font-bold ${value >= 0 ? "text-sage-deep" : "text-apricot-deep"}`}
      >
        {value >= 0 ? "+" : ""}
        {value}
      </span>
    </div>
  );
}
