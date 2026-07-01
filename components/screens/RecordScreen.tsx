"use client";

// 기록: 오늘의 기록 / 최근 활동 / 친밀도 / 연속 돌봄
import { useGame } from "@/context/GameContext";
import { STREAK_MILESTONES } from "@/lib/constants";
import { formatDuration } from "@/lib/utils";
import ActivityLogList from "../ActivityLogList";
import AffectionLevelCard from "../AffectionLevelCard";

export default function RecordScreen() {
  const { state, todayStats } = useGame();
  const { streak } = state;

  const todayItems = [
    { emoji: "🍚", label: "밥", value: `${todayStats.meals}회` },
    { emoji: "🍪", label: "간식", value: `${todayStats.snacks}회` },
    { emoji: "🤲", label: "쓰다듬기", value: `${todayStats.pets}회` },
    {
      emoji: "🎾",
      label: "산책·놀이",
      value: `${todayStats.activityMinutes}분`,
    },
    { emoji: "🌙", label: "수면", value: `${todayStats.sleepMinutes}분` },
  ];

  return (
    <div className="h-full space-y-5 overflow-y-auto scroll-slim px-4 pt-4 pb-4">
      <header>
        <h1 className="font-display text-xl text-cocoa">기록</h1>
        <p className="text-xs text-cocoa-soft">
          또또와 쁘니와 함께한 하루를 모아봤어요.
        </p>
      </header>

      {/* 오늘의 기록 */}
      <section aria-label="오늘의 기록">
        <h2 className="mb-2 font-display text-base text-cocoa">오늘의 기록</h2>
        <div className="grid grid-cols-5 gap-2 rounded-3xl border border-cream-deep bg-card p-3 shadow-sm">
          {todayItems.map((it) => (
            <div key={it.label} className="flex flex-col items-center gap-1">
              <span className="text-xl">{it.emoji}</span>
              <span className="text-sm font-bold text-cocoa">{it.value}</span>
              <span className="text-[10px] text-cocoa-faint">{it.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 연속 돌봄 */}
      <section aria-label="연속 돌봄 기록">
        <h2 className="mb-2 font-display text-base text-cocoa">연속 돌봄</h2>
        <div className="rounded-3xl border border-cream-deep bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-butter/60 text-2xl">
              🔥
            </span>
            <div>
              <p className="font-display text-lg text-cocoa">
                {streak.count}일 연속
              </p>
              <p className="text-xs text-cocoa-soft">
                하루 한 번 이상 돌보면 출석으로 기록돼요.
              </p>
            </div>
          </div>
          <ul className="space-y-2">
            {STREAK_MILESTONES.map((m) => {
              const done = streak.claimedMilestones.includes(m.days);
              const reached = streak.count >= m.days;
              return (
                <li
                  key={m.days}
                  className={`flex items-center justify-between rounded-2xl px-3 py-2 text-sm ${
                    reached ? "bg-sage/20" : "bg-cream"
                  }`}
                >
                  <span className="font-medium text-cocoa">
                    {m.days}일 연속 · 간식 {m.snacks} / 코인 {m.coins}
                  </span>
                  <span className="text-xs font-bold text-cocoa-soft">
                    {done ? "받음 ✓" : reached ? "달성" : `D-${m.days - streak.count}`}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* 친밀도 */}
      <section aria-label="친밀도">
        <h2 className="mb-2 font-display text-base text-cocoa">친밀도</h2>
        <div className="space-y-3">
          <AffectionLevelCard pet={state.pets.toto} />
          <AffectionLevelCard pet={state.pets.ppuni} />
        </div>
      </section>

      {/* 최근 활동 */}
      <section aria-label="최근 활동">
        <h2 className="mb-2 font-display text-base text-cocoa">최근 활동</h2>
        <ActivityLogList logs={state.logs} />
      </section>
    </div>
  );
}
