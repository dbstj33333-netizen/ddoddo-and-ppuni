"use client";

// 친밀도 카드 (레벨 이름 + 다음 레벨까지 남은 수치)
import { AFFECTION_LEVEL_NAMES } from "@/lib/constants";
import { affectionProgress, affectionToNext } from "@/lib/status";
import type { Pet } from "@/lib/types";

export default function AffectionLevelCard({ pet }: { pet: Pet }) {
  const level = pet.affectionLevel;
  const toNext = affectionToNext(pet.affection);
  const progress = affectionProgress(pet.affection);
  const isMax = level >= 5;
  const color = pet.id === "toto" ? "bg-toto" : "bg-ppuni";

  return (
    <div className="rounded-3xl border border-cream-deep bg-card p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-display text-base text-cocoa">
          <span
            className={`h-3 w-3 rounded-full ${color}`}
            aria-hidden
          />
          {pet.name}
        </h3>
        <span className="text-xs font-bold text-cocoa-soft">
          친밀도 {Math.round(pet.affection)}/100
        </span>
      </div>

      <p className="text-sm font-bold text-cocoa">
        Lv.{level} · {AFFECTION_LEVEL_NAMES[level - 1]}
      </p>

      <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-cream-deep">
        <div
          className={`h-full rounded-full ${color} transition-[width] duration-500`}
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>
      <p className="mt-1.5 text-xs text-cocoa-faint">
        {isMax
          ? "최고 친밀도에 도달했어요! 평생 가족 🥰"
          : `다음 레벨까지 ${toNext}만큼 남았어요.`}
      </p>
    </div>
  );
}
