"use client";

// 간식 선택 (바텀시트 내부). 동물이 먹을 수 있는 간식은 강조, 아닌 건 비활성.
import { SNACKS } from "@/lib/constants";
import type { Pet } from "@/lib/types";

export default function SnackSelector({
  pet,
  snackCount,
  onPick,
}: {
  pet: Pet;
  snackCount: number;
  onPick: (snackId: string) => void;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between rounded-2xl bg-cream px-3 py-2 text-sm">
        <span className="text-cocoa-soft">보유 간식</span>
        <span className="font-bold text-cocoa">🍪 {snackCount}개</span>
      </div>
      <ul className="grid grid-cols-1 gap-2">
        {SNACKS.map((snack) => {
          const likes = snack.for.includes(pet.species);
          const canGive = likes && snackCount > 0;
          return (
            <li key={snack.id}>
              <button
                type="button"
                onClick={() => onPick(snack.id)}
                disabled={!likes}
                aria-disabled={!likes}
                className={`no-tap-highlight flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition active:scale-[0.98] ${
                  likes
                    ? "border-cream-deep bg-cream"
                    : "border-transparent bg-cream-deep/50 opacity-55"
                }`}
              >
                <span className="text-2xl">{snack.emoji}</span>
                <span className="flex-1">
                  <span className="block text-sm font-bold text-cocoa">
                    {snack.name}
                  </span>
                  <span className="block text-xs text-cocoa-soft">
                    {likes
                      ? `${pet.name}가 좋아하는 간식이에요`
                      : `${pet.name}는 먹을 수 없어요`}
                  </span>
                </span>
                {likes ? (
                  <span className="text-sm">{canGive ? "💛" : "📭"}</span>
                ) : (
                  <span className="text-sm">🚫</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-center text-xs text-cocoa-faint">
        간식을 주면 행복도와 친밀도가 올라가지만 포만감도 함께 올라가요.
      </p>
    </div>
  );
}
