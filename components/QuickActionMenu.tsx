"use client";

// 돌봄 행동 버튼 (Lucide 아이콘). 쓰다듬기는 캐릭터 터치, 사진은 제외.
import {
  Cookie,
  Droplets,
  Footprints,
  Moon,
  Sparkles,
  Sun,
  Utensils,
  type LucideIcon,
} from "lucide-react";
import type { Pet } from "@/lib/types";

type Props = {
  pet: Pet;
  onFeed: () => void;
  onSnack: () => void;
  onWalk: () => void;
  onWash: () => void;
  onSleepToggle: () => void;
};

export default function QuickActionMenu({
  pet,
  onFeed,
  onSnack,
  onWalk,
  onWash,
  onSleepToggle,
}: Props) {
  const sleeping = pet.isSleeping;
  const isDog = pet.species === "dog";

  const items: {
    key: string;
    Icon: LucideIcon;
    label: string;
    onClick: () => void;
    disabled: boolean;
    highlight?: boolean;
  }[] = [
    { key: "feed", Icon: Utensils, label: "밥 주기", onClick: onFeed, disabled: sleeping },
    { key: "snack", Icon: Cookie, label: "간식 주기", onClick: onSnack, disabled: sleeping },
    {
      key: "walk",
      Icon: isDog ? Footprints : Sparkles,
      label: isDog ? "산책" : "놀아주기",
      onClick: onWalk,
      disabled: sleeping,
    },
    { key: "wash", Icon: Droplets, label: "씻기", onClick: onWash, disabled: sleeping },
    {
      key: "sleep",
      Icon: sleeping ? Sun : Moon,
      label: sleeping ? "깨우기" : "재우기",
      onClick: onSleepToggle,
      disabled: false,
      highlight: sleeping,
    },
  ];

  return (
    <div className="grid grid-cols-5 gap-1.5">
      {items.map((it) => (
        <button
          key={it.key}
          type="button"
          onClick={it.onClick}
          disabled={it.disabled}
          aria-label={it.label}
          className="no-tap-highlight group flex flex-col items-center gap-1 rounded-2xl py-1 transition active:scale-90 disabled:opacity-40"
        >
          <span
            className={`grid h-12 w-12 place-items-center rounded-2xl shadow-sm transition group-active:scale-90 ${
              it.highlight ? "bg-butter text-cocoa" : "bg-cream-deep text-cocoa"
            }`}
          >
            <it.Icon size={22} strokeWidth={2} aria-hidden />
          </span>
          <span className="text-[10px] font-medium text-cocoa-soft">
            {it.label}
          </span>
        </button>
      ))}
    </div>
  );
}
