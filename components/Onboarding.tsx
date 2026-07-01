"use client";

// 첫 접속 안내 카드
export default function Onboarding({ onStart }: { onStart: () => void }) {
  return (
    <div className="fixed inset-0 z-[65] flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-cocoa/40 animate-fade-in" aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="시작 안내"
        className="relative w-full max-w-sm rounded-3xl bg-card p-7 text-center shadow-2xl animate-pop"
      >
        <div className="mb-3 flex justify-center gap-2 text-5xl" aria-hidden>
          <span className="animate-bob">🐶</span>
          <span className="animate-bob" style={{ animationDelay: "0.4s" }}>
            🐱
          </span>
        </div>
        <h1 className="font-display text-2xl text-cocoa">또또와 쁘니를 만나보세요!</h1>
        <p className="mt-3 text-sm leading-relaxed text-cocoa-soft">
          동물을 눌러 선택한 뒤<br />
          쓰다듬거나 밥을 주고 함께 놀아주세요.
        </p>
        <button
          type="button"
          onClick={onStart}
          className="no-tap-highlight mt-6 w-full rounded-2xl bg-sage-deep py-3.5 text-base font-bold text-white transition active:scale-95"
        >
          시작하기
        </button>
      </div>
    </div>
  );
}
