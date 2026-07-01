"use client";

// 하단 고정 내비게이션 (앱 프레임 내부에 위치)
export type TabKey = "home" | "record" | "settings";

const TABS: { key: TabKey; label: string; emoji: string }[] = [
  { key: "home", label: "홈", emoji: "🏠" },
  { key: "record", label: "기록", emoji: "📖" },
  { key: "settings", label: "설정", emoji: "⚙️" },
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
      className="shrink-0 border-t border-cream-deep bg-card/95 backdrop-blur"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="flex items-stretch justify-around px-2">
        {TABS.map((tab) => {
          const isActive = tab.key === active;
          return (
            <li key={tab.key} className="flex-1">
              <button
                type="button"
                aria-current={isActive ? "page" : undefined}
                onClick={() => onChange(tab.key)}
                className="no-tap-highlight flex min-h-[58px] w-full flex-col items-center justify-center gap-0.5 py-2 transition active:scale-95"
              >
                <span
                  className={`grid h-8 w-14 place-items-center rounded-full text-lg transition ${
                    isActive ? "bg-butter" : "bg-transparent"
                  }`}
                >
                  {tab.emoji}
                </span>
                <span
                  className={`text-[11px] font-bold transition ${
                    isActive ? "text-cocoa" : "text-cocoa-faint"
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
