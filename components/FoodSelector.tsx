"use client";

// 밥그릇 선택 (바텀시트 내부 콘텐츠)
import { FOODS, FULLNESS_REFUSE_THRESHOLD } from "@/lib/constants";
import type { Pet } from "@/lib/types";

export default function FoodSelector({
  pet,
  onPick,
}: {
  pet: Pet;
  onPick: (foodId: string) => void;
}) {
  const tooFull = pet.fullness >= FULLNESS_REFUSE_THRESHOLD;

  return (
    <div>
      {tooFull && (
        <p className="mb-3 rounded-2xl bg-apricot/20 px-3 py-2 text-sm text-cocoa">
          지금은 배가 너무 불러서 밥을 먹지 않아요.
        </p>
      )}
      <div className="grid grid-cols-2 gap-3">
        {FOODS.map((food) => (
          <button
            key={food.id}
            type="button"
            onClick={() => onPick(food.id)}
            disabled={tooFull}
            className="no-tap-highlight flex flex-col items-center gap-1 rounded-2xl border border-cream-deep bg-cream px-3 py-4 transition active:scale-95 disabled:opacity-40"
          >
            <span className="text-3xl">{food.emoji}</span>
            <span className="text-sm font-bold text-cocoa">{food.name}</span>
            <span className="text-xs text-cocoa-soft">
              포만감 +{food.fullness} · 체력 +{food.energy}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
