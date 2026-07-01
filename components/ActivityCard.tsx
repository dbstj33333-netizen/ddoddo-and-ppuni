"use client";

// 활동 카드 (아이콘/이름/설명/예상 변화/실행 버튼)
export default function ActivityCard({
  emoji,
  title,
  description,
  effect,
  actionLabel = "실행",
  disabled = false,
  disabledNote,
  onRun,
}: {
  emoji: string;
  title: string;
  description: string;
  effect: string;
  actionLabel?: string;
  disabled?: boolean;
  disabledNote?: string;
  onRun: () => void;
}) {
  return (
    <div
      className={`flex flex-col rounded-3xl border border-cream-deep bg-card p-4 shadow-sm transition ${
        disabled ? "opacity-55" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-cream-deep text-2xl">
          {emoji}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-base text-cocoa">{title}</h3>
          <p className="text-xs leading-snug text-cocoa-soft">{description}</p>
        </div>
      </div>
      <p className="mt-2 rounded-xl bg-cream px-2.5 py-1.5 text-xs font-medium text-cocoa">
        {effect}
      </p>
      <button
        type="button"
        onClick={onRun}
        disabled={disabled}
        className="no-tap-highlight mt-3 w-full rounded-2xl bg-sage-deep py-2.5 text-sm font-bold text-white transition active:scale-95 disabled:bg-cream-deep disabled:text-cocoa-faint"
      >
        {disabled && disabledNote ? disabledNote : actionLabel}
      </button>
    </div>
  );
}
