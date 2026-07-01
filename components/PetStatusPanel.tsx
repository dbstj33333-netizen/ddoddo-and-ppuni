"use client";

// 선택된 동물의 5가지 상태를 슬림한 한 줄 스트립으로 표시 (Lucide 아이콘).
import {
  Droplets,
  Heart,
  Smile,
  Soup,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { HOME_STAT_ORDER, STAT_META } from "@/lib/constants";
import { GRADE_COLOR, gradeOf } from "@/lib/status";
import type { Pet, StatKey } from "@/lib/types";

const STAT_ICON: Record<StatKey, LucideIcon> = {
  fullness: Soup,
  happiness: Smile,
  energy: Zap,
  cleanliness: Droplets,
  affection: Heart,
};

export default function PetStatusPanel({ pet }: { pet: Pet }) {
  return (
    <section aria-label={`${pet.name}의 상태`}>
      <div className="grid grid-cols-5 gap-1.5">
        {HOME_STAT_ORDER.map((stat) => {
          const value = Math.round(pet[stat] as number);
          const color = GRADE_COLOR[gradeOf(value)];
          const meta = STAT_META[stat];
          const Icon = STAT_ICON[stat];
          return (
            <div
              key={stat}
              className="flex flex-col items-center gap-1"
              aria-label={`${meta.label} ${value}점`}
            >
              <Icon size={16} strokeWidth={2.2} color={meta.color} aria-hidden />
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-cream-deep">
                <div
                  className="h-full rounded-full transition-[width] duration-500"
                  style={{ width: `${Math.max(4, value)}%`, backgroundColor: color }}
                />
              </div>
              <span className="text-[10px] font-bold tabular-nums text-cocoa-soft">
                {value}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
