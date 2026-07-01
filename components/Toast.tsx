"use client";

// 화면 상단 토스트 알림. 불투명 배경 + 세이프에어리어로 잘려 보이지 않게.
import { useGame } from "@/context/GameContext";
import type { ToastTone } from "@/context/GameContext";

const toneStyle: Record<ToastTone, string> = {
  info: "bg-white border-cream-deep text-cocoa",
  success: "bg-[#e7f5ec] border-sage-deep text-cocoa",
  warn: "bg-[#fdeadd] border-apricot-deep text-cocoa",
};

export default function Toast() {
  const { toasts, dismissToast } = useGame();

  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 z-[60] flex flex-col items-center gap-2 px-4"
      style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.75rem)" }}
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => dismissToast(t.id)}
          className={`pointer-events-auto flex w-full max-w-sm items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-[0_10px_28px_-8px_rgba(92,68,51,0.45)] animate-slide-up ${toneStyle[t.tone]}`}
        >
          {t.emoji && <span className="text-lg leading-none">{t.emoji}</span>}
          <span className="text-left leading-snug">{t.message}</span>
        </button>
      ))}
    </div>
  );
}
