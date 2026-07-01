"use client";

// 선택된 동물의 5가지 상태 (컴팩트 2열) + 한 줄 상태 문구
import { AFFECTION_LEVEL_NAMES } from "@/lib/constants";
import { statPhrase } from "@/lib/status";
import type { Pet, StatKey } from "@/lib/types";
import StatusBar from "./StatusBar";

export default function PetStatusPanel({ pet }: { pet: Pet }) {
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
      className="rounded-3xl border border-cream-deep bg-card p-3.5 shadow-sm"
      aria-label={`${pet.name}의 상태`}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="font-display text-base text-cocoa">
          {pet.name}의 상태
        </h2>
        <span className="truncate text-xs text-cocoa-soft">
          Lv.{pet.affectionLevel} · {AFFECTION_LEVEL_NAMES[pet.affectionLevel - 1]}
        </span>
      </div>

      <p
        className="mb-2.5 rounded-xl bg-cream px-3 py-1.5 text-xs font-medium text-cocoa"
        aria-live="polite"
      >
        {headline}
      </p>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        <StatusBar stat="fullness" value={pet.fullness} compact />
        <StatusBar stat="happiness" value={pet.happiness} compact />
        <StatusBar stat="energy" value={pet.energy} compact />
        <StatusBar stat="cleanliness" value={pet.cleanliness} compact />
        <div className="col-span-2">
          <StatusBar stat="affection" value={pet.affection} compact />
        </div>
      </div>
    </section>
  );
}
