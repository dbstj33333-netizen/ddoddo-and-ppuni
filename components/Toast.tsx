"use client";

// 화면 상단에 뜨는 토스트 알림. 스크린리더용 aria-live 포함.
import { useGame } from "@/context/GameContext";
import type { ToastTone } from "@/context/GameContext";

const toneStyle: Record<ToastTone, string> = {
  info: "bg-card border-cream-deep text-cocoa",
  success: "bg-sage/25 border-sage text-cocoa",
  warn: "bg-apricot/25 border-apricot-deep text-cocoa",
};

export default function Toast() {
  const { toasts, dismissToast } = useGame();

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex flex-col items-center gap-2 px-4 pt-3"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => dismissToast(t.id)}
          className={`pointer-events-auto flex w-full max-w-sm items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium shadow-[0_8px_24px_-8px_rgba(92,68,51,0.35)] animate-slide-up ${toneStyle[t.tone]}`}
        >
          {t.emoji && <span className="text-lg leading-none">{t.emoji}</span>}
          <span className="text-left leading-snug">{t.message}</span>
        </button>
      ))}
    </div>
  );
}
