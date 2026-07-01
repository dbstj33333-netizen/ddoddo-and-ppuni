"use client";

// 홈 하단 빠른 행동 버튼 (둥근 아이콘 + 한글 이름)
import type { Pet } from "@/lib/types";

type Props = {
  pet: Pet;
  onPet: () => void;
  onFeed: () => void;
  onSnack: () => void;
  onSleepToggle: () => void;
  onWalk: () => void;
};

export default function QuickActionMenu({
  pet,
  onPet,
  onFeed,
  onSnack,
  onSleepToggle,
  onWalk,
}: Props) {
  const sleeping = pet.isSleeping;
  const walkLabel = pet.species === "dog" ? "산책하기" : "놀아주기";

  const items = [
    { key: "pet", emoji: "🤲", label: "쓰다듬기", onClick: onPet, disabled: sleeping },
    { key: "feed", emoji: "🍚", label: "밥 주기", onClick: onFeed, disabled: sleeping },
    { key: "snack", emoji: "🍪", label: "간식 주기", onClick: onSnack, disabled: sleeping },
    {
      key: "sleep",
      emoji: sleeping ? "☀️" : "🌙",
      label: sleeping ? "깨우기" : "재우기",
      onClick: onSleepToggle,
      disabled: false,
    },
    { key: "walk", emoji: pet.species === "dog" ? "🦮" : "🧶", label: walkLabel, onClick: onWalk, disabled: sleeping },
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
          className="no-tap-highlight group flex flex-col items-center gap-1 rounded-2xl py-2 transition active:scale-90 disabled:opacity-40"
        >
          <span
            className={`grid h-12 w-12 place-items-center rounded-full text-xl shadow-sm transition group-active:scale-90 ${
              it.key === "sleep" && sleeping
                ? "bg-butter"
                : "bg-cream-deep"
            }`}
          >
            {it.emoji}
          </span>
          <span className="text-[11px] font-medium text-cocoa-soft">
            {it.label}
          </span>
        </button>
      ))}
    </div>
  );
}
