"use client";

// 앱 셸: 탭 전환 + 하단 내비 + 토스트 + 온보딩. 로드 전엔 스플래시.
import { useState } from "react";
import { useGame } from "@/context/GameContext";
import BottomNavigation, { type TabKey } from "./BottomNavigation";
import Onboarding from "./Onboarding";
import Toast from "./Toast";
import HomeScreen from "./screens/HomeScreen";
import ActivityScreen from "./screens/ActivityScreen";
import RecordScreen from "./screens/RecordScreen";
import SettingsScreen from "./screens/SettingsScreen";

export default function AppShell() {
  const { ready, state, finishOnboarding } = useGame();
  const [tab, setTab] = useState<TabKey>("home");

  if (!ready) {
    return (
      <div className="grid min-h-dvh place-items-center bg-cream">
        <div className="flex flex-col items-center gap-3">
          <div className="flex gap-2 text-5xl">
            <span className="animate-bob">🐶</span>
            <span className="animate-bob" style={{ animationDelay: "0.35s" }}>
              🐱
            </span>
          </div>
          <p className="font-display text-lg text-cocoa">또또랑 쁘니</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-cream">
      <Toast />

      <main className="mx-auto w-full max-w-md px-4 pt-4 pb-28">
        {/* key 로 탭 전환 시 페이드 */}
        <div key={tab} className="animate-fade-in">
          {tab === "home" && <HomeScreen />}
          {tab === "activity" && <ActivityScreen />}
          {tab === "record" && <RecordScreen />}
          {tab === "settings" && <SettingsScreen />}
        </div>
      </main>

      <BottomNavigation active={tab} onChange={setTab} />

      {!state.onboarded && <Onboarding onStart={finishOnboarding} />}
    </div>
  );
}
