"use client";

// 하단 내비게이션 — 요즘 유행하는 플로팅 pill 스타일 (Lucide 아이콘).
import { House, Settings, type LucideIcon } from "lucide-react";

export type TabKey = "home" | "settings";

const TABS: { key: TabKey; label: string; Icon: LucideIcon }[] = [
  { key: "home", label: "홈", Icon: House },
  { key: "settings", label: "설정", Icon: Settings },
];

export default function BottomNavigation({
  active,
  onChange,
}: {
  active: TabKey;
  onChange: (tab: TabKey) => void;
}) {
  return (
    <nav
      aria-label="주요 메뉴"
      className="shrink-0 px-6 pt-1"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.6rem)" }}
    >
      <ul className="mx-auto flex max-w-[260px] items-center justify-center gap-1 rounded-full border border-white/60 bg-white/85 p-1.5 shadow-[0_10px_28px_-8px_rgba(92,68,51,0.45)] backdrop-blur-md">
        {TABS.map((tab) => {
          const isActive = tab.key === active;
          return (
            <li key={tab.key} className={isActive ? "flex-1" : ""}>
              <button
                type="button"
                aria-current={isActive ? "page" : undefined}
                onClick={() => onChange(tab.key)}
                className={`no-tap-highlight flex min-h-[44px] items-center justify-center gap-1.5 rounded-full transition active:scale-95 ${
                  isActive
                    ? "w-full bg-cocoa px-4 py-2 text-white shadow-sm"
                    : "h-11 w-11 text-cocoa-soft"
                }`}
              >
                <tab.Icon size={20} strokeWidth={2.2} aria-hidden />
                {isActive && (
                  <span className="text-sm font-bold">{tab.label}</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
