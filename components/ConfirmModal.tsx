"use client";

// 확인 모달 (데이터 초기화 등). 포커스 트랩 + ESC 닫기.
import { useEffect, useRef } from "react";

type Props = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "default";
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "확인",
  cancelLabel = "취소",
  tone = "default",
  onConfirm,
  onCancel,
}: Props) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => confirmRef.current?.focus(), 30);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-6">
      <div
        className="absolute inset-0 bg-cocoa/40 animate-fade-in"
        onClick={onCancel}
        aria-hidden="true"
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-xs rounded-3xl bg-card p-6 text-center shadow-2xl animate-pop"
      >
        <h2 className="font-display text-xl text-cocoa">{title}</h2>
        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-cocoa-soft">
          {message}
        </p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="no-tap-highlight flex-1 rounded-2xl bg-cream-deep py-3 text-sm font-bold text-cocoa-soft transition active:scale-95"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            className={`no-tap-highlight flex-1 rounded-2xl py-3 text-sm font-bold text-white transition active:scale-95 ${
              tone === "danger"
                ? "bg-apricot-deep"
                : "bg-sage-deep"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
