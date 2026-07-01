"use client";

// 돌봄 행동 버튼 (쓰다듬기는 캐릭터 터치로, 사진은 제외)
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
  const walkLabel = pet.species === "dog" ? "산책" : "놀아주기";

  const items = [
    { key: "feed", emoji: "🍚", label: "밥 주기", onClick: onFeed, disabled: sleeping },
    { key: "snack", emoji: "🍪", label: "간식 주기", onClick: onSnack, disabled: sleeping },
    {
      key: "walk",
      emoji: pet.species === "dog" ? "🦮" : "🧶",
      label: walkLabel,
      onClick: onWalk,
      disabled: sleeping,
    },
    { key: "wash", emoji: "🫧", label: "씻기", onClick: onWash, disabled: sleeping },
    {
      key: "sleep",
      emoji: sleeping ? "☀️" : "🌙",
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
            className={`grid h-12 w-12 place-items-center rounded-2xl text-xl shadow-sm transition group-active:scale-90 ${
              "highlight" in it && it.highlight ? "bg-butter" : "bg-cream-deep"
            }`}
          >
            {it.emoji}
          </span>
          <span className="text-[10px] font-medium text-cocoa-soft">
            {it.label}
          </span>
        </button>
      ))}
    </div>
  );
}
