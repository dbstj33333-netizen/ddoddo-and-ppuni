"use client";

// 선택된 동물의 5가지 상태 + 자연스러운 상태 문구
import { AFFECTION_LEVEL_NAMES, HOME_STAT_ORDER } from "@/lib/constants";
import { statPhrase } from "@/lib/status";
import type { Pet, StatKey } from "@/lib/types";
import StatusBar from "./StatusBar";

export default function PetStatusPanel({ pet }: { pet: Pet }) {
  // 헤드라인: 가장 낮은 관리 스탯 기준 문구 (모두 좋으면 칭찬)
  const care: StatKey[] = ["fullness", "happiness", "energy", "cleanliness"];
  let worst: StatKey = care[0];
  care.forEach((s) => {
    if ((pet[s] as number) < (pet[worst] as number)) worst = s;
  });
  const allGood = care.every((s) => (pet[s] as number) >= 80);
  const headline = allGood
    ? `${pet.name}의 상태가 아주 좋아요!`
    : statPhrase(worst, pet[worst] as number);

  return (
    <section
      className="rounded-3xl border border-cream-deep bg-card p-5 shadow-sm"
      aria-label={`${pet.name}의 상태`}
    >
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg text-cocoa">{pet.name}의 상태</h2>
          <p className="text-xs text-cocoa-soft">
            친밀도 Lv.{pet.affectionLevel} ·{" "}
            {AFFECTION_LEVEL_NAMES[pet.affectionLevel - 1]}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold text-white ${
            pet.id === "toto" ? "bg-toto" : "bg-ppuni"
          }`}
        >
          {pet.species === "dog" ? "🐶 강아지" : "🐱 고양이"}
        </span>
      </div>

      <p
        className="mb-4 rounded-2xl bg-cream px-3 py-2 text-sm font-medium text-cocoa"
        aria-live="polite"
      >
        {headline}
      </p>

      <div className="space-y-3">
        {HOME_STAT_ORDER.map((stat) => (
          <StatusBar key={stat} stat={stat} value={pet[stat] as number} compact />
        ))}
      </div>
    </section>
  );
}
