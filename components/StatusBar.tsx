"use client";

// 단일 상태 진행 바 (아이콘 + 라벨 + 값 + 등급 색상)
import { STAT_META } from "@/lib/constants";
import { GRADE_COLOR, gradeOf } from "@/lib/status";
import type { StatKey } from "@/lib/types";
import AnimatedNumber from "./AnimatedNumber";

export default function StatusBar({
  stat,
  value,
  compact = false,
}: {
  stat: StatKey;
  value: number;
  compact?: boolean;
}) {
  const meta = STAT_META[stat];
  const grade = gradeOf(value);
  const color = GRADE_COLOR[grade];

  return (
    <div className="w-full">
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 font-medium text-cocoa">
          <span aria-hidden className="text-base leading-none">
            {meta.emoji}
          </span>
          {meta.label}
        </span>
        <span className="tabular-nums font-bold text-cocoa-soft">
          <AnimatedNumber value={Math.round(value)} />
          <span className="text-xs font-medium text-cocoa-faint">/100</span>
        </span>
      </div>
      <div
        className="h-3 w-full overflow-hidden rounded-full bg-cream-deep"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(value)}
        aria-label={`${meta.label} ${Math.round(value)}점`}
      >
        <div
          className="h-full rounded-full transition-[width] duration-500 ease-out"
          style={{ width: `${Math.max(4, value)}%`, backgroundColor: color }}
        />
      </div>
      {!compact && (
        <p className="mt-1 text-xs text-cocoa-faint">{gradeText(grade)}</p>
      )}
    </div>
  );
}

function gradeText(grade: ReturnType<typeof gradeOf>): string {
  switch (grade) {
    case "great":
      return "매우 좋음";
    case "good":
      return "보통";
    case "warn":
      return "관리 필요";
    default:
      return "매우 부족";
  }
}
